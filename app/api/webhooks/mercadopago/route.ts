import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const paymentId = body.data?.id || body.id;

    if (paymentId) {
      try {
        const payment = await new Payment(client).get({ id: paymentId });
        
        // Verificación segura de metadata
        if (payment.status === "approved" && payment.metadata?.beat_id) {
          console.log(`✅ Pago exitoso para beat: ${payment.metadata.beat_id}`);
          // Aquí dispararías el mail al cliente o actualizarías Supabase
        }
      } catch (e) {
        console.warn("ID de pago no encontrado o error en consulta de pago");
      }
    }
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error crítico en Webhook:", error);
    return new NextResponse("OK", { status: 200 });
  }
}