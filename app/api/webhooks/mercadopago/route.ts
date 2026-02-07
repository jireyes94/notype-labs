// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-signature");
    if (!signature) {
      return new NextResponse("No signature", { status: 401 });
    }

    const body = await request.json();
    const type = body.type;

    if (type === "payment") {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return new NextResponse("No payment id", { status: 200 });
      }

      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === "approved") {
        console.log(
          `✅ Pago aprobado: ${paymentId} | Beat: ${payment.metadata?.beat_id}`
        );

        // ENTREGAR PRODUCTO
      }
    }

    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
