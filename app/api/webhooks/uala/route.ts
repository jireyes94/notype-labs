import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { reconcileUalaOrder } from "@/lib/uala-orders";

type UalaNotification = {
  uuid?: unknown;
  external_reference?: unknown;
  status?: unknown;
  created_date?: unknown;
  api_version?: unknown;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const fingerprint = createHash("sha256").update(rawBody).digest("hex");
  let payload: UalaNotification;

  try {
    payload = JSON.parse(rawBody) as UalaNotification;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const providerOrderId = typeof payload.uuid === "string" ? payload.uuid : "";
  const orderId = typeof payload.external_reference === "string" ? payload.external_reference : "";
  const providerStatus = typeof payload.status === "string" ? payload.status : "UNKNOWN";
  if (!providerOrderId || !orderId) {
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error: eventError } = await admin.from("payment_events").insert({
    order_id: orderId,
    provider_order_id: providerOrderId,
    external_reference: orderId,
    provider_status: providerStatus,
    event_fingerprint: fingerprint,
    payload,
  });

  if (eventError?.code === "23505") return NextResponse.json({ received: true });
  if (eventError) {
    console.error("Could not persist Ualá webhook", eventError);
    return NextResponse.json({ error: "Persistence error" }, { status: 500 });
  }

  try {
    await reconcileUalaOrder(orderId, providerOrderId);
    await admin
      .from("payment_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_fingerprint", fingerprint);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reconciliation error";
    console.error("Ualá webhook reconciliation failed", error);
    await admin
      .from("payment_events")
      .update({ processing_error: message.slice(0, 500) })
      .eq("event_fingerprint", fingerprint);
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}
