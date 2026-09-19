import "server-only";

import { createHash, createHmac, randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const DOWNLOAD_VALIDITY_DAYS = 7;
const MAX_DOWNLOADS = 5;

function downloadSecret(): string {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DOWNLOAD_TOKEN_SECRET must contain at least 32 characters");
  }
  return secret;
}

function tokenFor(entitlementId: string): string {
  const signature = createHmac("sha256", downloadSecret())
    .update(entitlementId)
    .digest("base64url");
  return `${entitlementId}.${signature}`;
}

export function hashDownloadToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type OrderDownload = {
  beatTitle: string;
  licenseName: string;
  downloadUrl: string;
};

export async function ensureOrderDownloads(orderId: string): Promise<OrderDownload[]> {
  const admin = getSupabaseAdmin();
  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("id, beat_title, license_name")
    .eq("order_id", orderId);
  if (itemsError) throw itemsError;
  if (!items?.length) throw new Error("Paid order has no items");

  const expiresAt = new Date(Date.now() + DOWNLOAD_VALIDITY_DAYS * 86_400_000).toISOString();
  const candidates = items.map((item) => {
    const id = randomUUID();
    return {
      id,
      order_item_id: item.id,
      token_hash: hashDownloadToken(tokenFor(id)),
      max_downloads: MAX_DOWNLOADS,
      expires_at: expiresAt,
    };
  });

  const { error: insertError } = await admin
    .from("download_entitlements")
    .upsert(candidates, { onConflict: "order_item_id", ignoreDuplicates: true });
  if (insertError) throw insertError;

  const itemIds = items.map(({ id }) => id);
  const { data: entitlements, error: entitlementsError } = await admin
    .from("download_entitlements")
    .select("id, order_item_id")
    .in("order_item_id", itemIds);
  if (entitlementsError) throw entitlementsError;

  const entitlementByItem = new Map(
    (entitlements ?? []).map((entitlement) => [entitlement.order_item_id, entitlement.id]),
  );

  return items.map((item) => {
    const entitlementId = entitlementByItem.get(item.id);
    if (!entitlementId) throw new Error("Could not provision download entitlement");
    return {
      beatTitle: item.beat_title,
      licenseName: item.license_name,
      downloadUrl: `/api/download?token=${encodeURIComponent(tokenFor(entitlementId))}`,
    };
  });
}
