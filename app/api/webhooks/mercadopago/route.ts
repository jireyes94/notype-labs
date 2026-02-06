// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Mercado Pago envía el tipo de evento en 'type' o 'action'
    const type = body.type || body.action;

    if (type === "payment" || type === "payment.created" || type === "payment.updated") {
      // El ID del pago puede venir en data.id o simplemente id
      const paymentId = body.data?.id || body.id;

      if (paymentId) {
        const payment = await new Payment(client).get({ id: paymentId });

        if (payment.status === "approved") {
           // LÓGICA DE ENTREGA AUTOMATIZADA
           console.log(`✅ Pago aprobado: ${paymentId} | Beat: ${payment.metadata?.beat_id}`);
           
           /* TIP: Aquí es el lugar ideal para disparar un email (ej. usando Resend)
             porque este proceso ocurre de fondo, sin que el usuario tenga que 
             esperar a que cargue la página de 'success'.
           */
        }
      }
    }

    // Siempre respondemos 200 rápido para que MP no reintente
    return new NextResponse("Webhook recibido", { status: 200 });

  } catch (error) {
    console.error("❌ Error en Webhook:", error);
    // Respondemos 200 igual para evitar el bucle de reintentos de MP si el error es de nuestra lógica
    return new NextResponse("Error procesado", { status: 200 });
  }
}