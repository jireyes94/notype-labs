import { NextResponse } from "next/server";
import { reconcileUalaOrder } from "@/lib/uala-orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Orden inválida" }, { status: 400 });
  }

  try {
    const order = await reconcileUalaOrder(id);
    return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not reconcile checkout return", error);
    return NextResponse.json({ error: "No pudimos verificar el pago." }, { status: 502 });
  }
}
