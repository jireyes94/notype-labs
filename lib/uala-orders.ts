import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getUalaOrder, type UalaOrderStatus } from "@/lib/uala";

const LOCAL_STATUS: Record<UalaOrderStatus, string> = {
  PENDING: "payment_pending",
  PROCESSED: "processed",
  APPROVED: "paid",
  REJECTED: "rejected",
  REFUNDED: "refunded",
};

export async function reconcileUalaOrder(orderId: string, providerOrderId?: string) {
  const admin = getSupabaseAdmin();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, external_reference, provider_order_id, total_cents, status")
    .eq("id", orderId)
    .single();

  if (error || !order) throw new Error("Local order not found");
  const ualaId = providerOrderId ?? order.provider_order_id;
  if (!ualaId || (order.provider_order_id && order.provider_order_id !== ualaId)) {
    throw new Error("Provider order mismatch");
  }

  const providerOrder = await getUalaOrder(ualaId);
  if (
    providerOrder.external_reference !== order.external_reference ||
    providerOrder.amount !== Number(order.total_cents) / 100
  ) {
    throw new Error("Provider order integrity check failed");
  }

  const status = LOCAL_STATUS[providerOrder.status];
  const update: Record<string, string> = {
    status,
    provider_status: providerOrder.status,
    provider_order_id: providerOrder.uuid,
  };
  if (status === "paid" && order.status !== "paid") {
    update.paid_at = new Date().toISOString();
  }

  const { error: updateError } = await admin.from("orders").update(update).eq("id", order.id);
  if (updateError) throw updateError;

  return { id: order.id as string, status, providerStatus: providerOrder.status };
}
