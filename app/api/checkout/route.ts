// app/api/checkout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

export async function POST(request: Request) {
  try {
    const { beat, licenseType, payerEmail } = await request.json();

    // Lógica de precios
    let finalPrice = Math.round(beat.price);
    if (licenseType === "WAV Premium") finalPrice = Math.round(beat.price * 1.5);
    if (licenseType === "Unlimited") finalPrice = Math.round(beat.price * 4);

    const payment = await new Payment(client).create({
      body: {
        transaction_amount: finalPrice,
        description: `${beat.title} - ${licenseType}`,
        payer: {
          email: payerEmail || "test@test.com"
        },
        metadata: {
          beat_id: beat.id,
          license_type: licenseType
        }
      }
    });

    return NextResponse.json({
      paymentId: payment.id
    });

  } catch (error: any) {
    console.error("MP ERROR RAW:", error);
    console.error("MP ERROR KEYS:", Object.keys(error || {}));
    console.error("MP ERROR STRING:", error?.message);
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 });
  }
}
