// app/api/download/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabase } from "@/lib/supabase";
import { Readable } from "stream";

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) return new NextResponse("No autorizado", { status: 401 });

  try {
    const payment = await new Payment(mpClient).get({ id: paymentId });
    
    if (payment.status !== "approved") {
      return new NextResponse("El pago no ha sido aprobado", { status: 403 });
    }

    // CONVERSIÓN CRUCIAL: De String de MP a Number para Supabase
    const beatId = Number(payment.metadata?.beat_id);
    const licenseType = payment.metadata?.license_type;

    if (!beatId || isNaN(beatId) || !licenseType) {
      console.error("Metadata inválida:", payment.metadata);
      return new NextResponse("Información de licencia o Beat ID faltante", { status: 400 });
    }

    console.log("DEBUG DESCARGA:");
    console.log("- ID recibido de MP:", payment.metadata?.beat_id);
    console.log("- ID convertido a Number:", beatId);
    console.log("- Tipo de dato del ID:", typeof beatId);

    // Consulta con el ID ya como número
    const { data: assets, error } = await supabase
      .from('beat_assets')
      .select('*')
      .eq('beat_id', beatId) // Ahora coincidirá con el int4
      .single();

    if (error || !assets) {
      console.error("Supabase Error:", error);
      return new NextResponse("Beat no encontrado en archivos", { status: 404 });
    }

    let fileId = assets.drive_mp3_id;
    if (licenseType === "WAV Premium") fileId = assets.drive_wav_id;
    if (licenseType === "Unlimited") fileId = assets.drive_unlimited_id;

    if (!fileId) return new NextResponse("Archivo no configurado", { status: 404 });

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    const nodeStream = fileResponse.data as Readable;
    
    return new NextResponse(nodeStream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="Beat_${beatId}_${licenseType.toString().replace(/\s+/g, '_')}.zip"`,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error: any) {
    console.error("Error en descarga segura:", error);
    return new NextResponse("Error procesando la descarga", { status: 500 });
  }
}