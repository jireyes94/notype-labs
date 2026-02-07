import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

export async function POST(request: Request) {
  try {
    const { beat, licenseType } = await request.json();

    // Lógica de precios redondeada para evitar errores en MP
    let finalPrice = Math.round(beat.price);
    if (licenseType === "WAV Premium") finalPrice = Math.round(beat.price * 1.5);
    if (licenseType === "Unlimited") finalPrice = Math.round(beat.price * 4);

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: beat.id.toString(),
            title: `${beat.title} - ${licenseType}`,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: "ARS",
          }
        ],
        metadata: {
          beat_id: beat.id,
          license_type: licenseType,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_URL}/`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ id: preference.id });
  } catch (error) {
    console.error("Error MP Checkout:", error);
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 });
  }
}