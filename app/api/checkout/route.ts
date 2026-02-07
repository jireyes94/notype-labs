import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Caso A: El Brick solicita un preferenceId para inicializarse (para mostrar MP)
    if (body.action === "create_preference") {
      const { beatId, licenseType } = body;

      const { data: beat } = await supabase
        .from('beats')
        .select('*')
        .eq('id', beatId)
        .single();

      if (!beat) return NextResponse.json({ error: "Beat no encontrado" }, { status: 404 });

      let finalPrice = Math.round(beat.price);
      if (licenseType === "WAV Premium") finalPrice = Math.round(beat.price * 1.5);
      if (licenseType === "Unlimited") finalPrice = Math.round(beat.price * 4);

      const preference = await new Preference(client).create({
        body: {
          items: [{
            id: beatId.toString(),
            title: `${beat.title} - ${licenseType}`,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: "ARS",
          }],
          // REDIRECCIONES OBLIGATORIAS PARA EL FLUJO DE BILLETERA (WALLET)
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_URL}/success`,
            failure: `${process.env.NEXT_PUBLIC_URL}/`,
            pending: `${process.env.NEXT_PUBLIC_URL}/`,
          },
          auto_return: "approved",
          metadata: {
            beat_id: beatId.toString(),
            license_type: licenseType,
          },
        },
      });

      return NextResponse.json({ id: preference.id });
    }

    // Caso B: El Brick envía los datos del formulario para procesar el pago (Tarjeta)
    const { formData, beatId, licenseType } = body;

    // VALIDACIÓN DE SEGURIDAD: Evita el error 'token of null' si el flujo no es de tarjeta
    if (!formData || !formData.token) {
      return NextResponse.json({ error: "Datos de tarjeta incompletos" }, { status: 400 });
    }

    const { data: beat } = await supabase
      .from('beats')
      .select('*')
      .eq('id', beatId)
      .single();

    let finalPrice = Math.round(beat.price);
    if (licenseType === "WAV Premium") finalPrice = Math.round(beat.price * 1.5);
    if (licenseType === "Unlimited") finalPrice = Math.round(beat.price * 4);

    const payment = await new Payment(client).create({
      body: {
        transaction_amount: finalPrice,
        token: formData.token,
        description: `${beat.title} - ${licenseType}`,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: formData.payer.email,
        },
        metadata: {
          beat_id: beatId.toString(),
          license_type: licenseType,
        },
      },
    });

    return NextResponse.json(payment);

  } catch (error) {
    console.error("Error MP:", error);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}