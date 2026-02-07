// app/api/download/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabase } from "@/lib/supabase";

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) return new NextResponse("No autorizado", { status: 401 });

  try {
    // 1. Validar pago
    const payment = await new Payment(mpClient).get({ id: paymentId });
    if (payment.status !== "approved") {
      return new NextResponse("El pago no ha sido aprobado", { status: 403 });
    }

    const beatId = Number(payment.metadata?.beat_id);
    const licenseType = payment.metadata?.license_type;

    if (!beatId || isNaN(beatId) || !licenseType) {
      return new NextResponse("Metadata faltante", { status: 400 });
    }

    // 2. Buscar en Supabase
    const { data: assets, error } = await supabase
      .from('beat_assets')
      .select('*')
      .eq('beat_id', beatId)
      .single();

    if (error || !assets) return new NextResponse("Beat no encontrado", { status: 404 });

    // 3. Determinar File ID y Extensión
    let fileId = assets.drive_mp3_id;
    let extension = "mp3";
    let contentType = "audio/mpeg";

    if (licenseType === "WAV Premium") {
      fileId = assets.drive_wav_id;
      extension = "wav";
      contentType = "audio/wav";
    } else if (licenseType === "Unlimited") {
      fileId = assets.drive_unlimited_id;
      extension = "zip";
      contentType = "application/zip";
    }

    if (!fileId) return new NextResponse("Archivo no configurado", { status: 404 });

    // 4. Google Drive
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const cleanCredentials = JSON.parse(credentialsRaw!.trim().replace(/^'|'$/g, ''));

    const auth = new google.auth.GoogleAuth({
      credentials: cleanCredentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 5. Descargar el archivo de Drive
    const response = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "arraybuffer" } // <--- CAMBIO CLAVE: Pedimos ArrayBuffer
    );

    // Convertimos a Buffer de Node.js
    const buffer = Buffer.from(response.data as ArrayBuffer);

    const fileName = `Beat_${beatId}_${licenseType.replace(/\s+/g, '_')}.${extension}`;

    // 6. Respuesta final
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("Error:", error);
    return new NextResponse("Error en el servidor", { status: 500 });
  }
}