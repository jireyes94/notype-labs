import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    
    // Mercado Pago envía el ID de diferentes maneras según el evento
    const id = body.data?.id || body.id || url.searchParams.get("data.id");
    const type = body.type || url.searchParams.get("type");

    // Solo intentamos buscar si es un pago (payment)
    if (type === "payment" && id) {
      try {
        const payment = await new Payment(client).get({ id: id.toString() });
        
        if (payment.status === "approved") {
          console.log(`✅ PAGO APROBADO: ${id} para Beat: ${payment.metadata?.beat_id}`);
          // Aquí puedes agregar tu lógica de envío de emails
        }
      } catch (e) {
        console.error("❌ Error al consultar pago en MP:", e);
      }
    }

    // Siempre respondemos 200 para que MP no reintente infinitamente
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error crítico en Webhook:", error);
    return new NextResponse("OK", { status: 200 });
  }
}