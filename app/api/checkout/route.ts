import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { calculateLicensePrice, getLicense, type LicenseId } from "@/lib/licenses";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createUalaCheckout } from "@/lib/uala";

type CheckoutItem = { slug?: unknown; licenseId?: unknown };

function siteUrl(request: Request): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  return new URL(request.url).origin;
}

function isLicenseId(value: unknown): value is LicenseId {
  return value === "mp3" || value === "wav" || value === "unlimited";
}

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  let orderId: string | null = null;

  try {
    const body = (await request.json()) as {
      customer?: { name?: unknown; email?: unknown };
      items?: CheckoutItem[];
    };
    const name = typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
    const email = typeof body.customer?.email === "string" ? body.customer.email.trim().toLowerCase() : "";
    const items = Array.isArray(body.items) ? body.items : [];

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ error: "Ingresá un nombre válido." }, { status: 400 });
    }
    if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ingresá un correo electrónico válido." }, { status: 400 });
    }
    if (items.length === 0 || items.length > 20) {
      return NextResponse.json({ error: "El carrito no es válido." }, { status: 400 });
    }

    const normalized = items.map((item) => ({
      slug: typeof item.slug === "string" ? item.slug.trim() : "",
      licenseId: item.licenseId,
    }));
    if (
      normalized.some(({ slug, licenseId }) => !slug || !isLicenseId(licenseId)) ||
      new Set(normalized.map(({ slug }) => slug)).size !== normalized.length
    ) {
      return NextResponse.json({ error: "El carrito contiene productos inválidos." }, { status: 400 });
    }

    const slugs = normalized.map(({ slug }) => slug);
    const { data: beats, error: beatsError } = await admin
      .from("beats")
      .select("id, slug, title, price, is_sold")
      .in("slug", slugs);
    if (beatsError) throw beatsError;
    if (!beats || beats.length !== normalized.length) {
      return NextResponse.json({ error: "Uno o más beats ya no están disponibles." }, { status: 409 });
    }

    const beatsBySlug = new Map(beats.map((beat) => [beat.slug, beat]));
    const snapshots = normalized.map(({ slug, licenseId }) => {
      const beat = beatsBySlug.get(slug);
      if (!beat || beat.is_sold) throw new Error(`Beat unavailable: ${slug}`);
      const license = getLicense(licenseId as LicenseId);
      const unitPrice = calculateLicensePrice(Number(beat.price), license.id);
      if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0) throw new Error(`Invalid price: ${slug}`);
      return { beat, license, unitPriceCents: unitPrice * 100 };
    });

    const totalCents = snapshots.reduce((total, item) => total + item.unitPriceCents, 0);
    orderId = randomUUID();

    const { error: orderError } = await admin.from("orders").insert({
      id: orderId,
      external_reference: orderId,
      customer_name: name,
      customer_email: email,
      subtotal_cents: totalCents,
      total_cents: totalCents,
      status: "created",
    });
    if (orderError) throw orderError;

    const { error: itemsError } = await admin.from("order_items").insert(
      snapshots.map(({ beat, license, unitPriceCents }) => ({
        order_id: orderId,
        beat_id: beat.id,
        beat_title: beat.title,
        beat_slug: beat.slug,
        license_id: license.id,
        license_name: license.name,
        unit_price_cents: unitPriceCents,
      })),
    );
    if (itemsError) throw itemsError;

    const baseUrl = siteUrl(request);
    const checkout = await createUalaCheckout({
      amountCents: totalCents,
      description: `${snapshots.length} licencia${snapshots.length === 1 ? "" : "s"} de beat - NOTYPE.LABS`,
      notificationUrl: `${baseUrl}/api/webhooks/uala`,
      callbackFail: `${baseUrl}/checkout?payment=failed&order=${orderId}`,
      callbackSuccess: `${baseUrl}/success?order=${orderId}`,
      externalReference: orderId,
    });

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "payment_pending",
        provider_order_id: checkout.uuid,
        provider_status: checkout.status,
        checkout_url: checkout.links.checkout_link,
      })
      .eq("id", orderId);
    if (updateError) throw updateError;

    return NextResponse.json({ checkoutUrl: checkout.links.checkout_link, orderId });
  } catch (error) {
    console.error("Ualá checkout creation failed", error);
    if (orderId) await admin.from("orders").update({ status: "payment_error" }).eq("id", orderId);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intentá nuevamente." },
      { status: 500 },
    );
  }
}
