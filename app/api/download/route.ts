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
    // 1. Validar pago con Mercado Pago
    const payment = await new Payment(mpClient).get({ id: paymentId });
    
    if (payment.status !== "approved") {
      return new NextResponse("El pago no ha sido aprobado", { status: 403 });
    }

    // 2. Extraer Metadata y convertir ID a Number para Supabase (int4)
    const beatId = Number(payment.metadata?.beat_id);
    const licenseType = payment.metadata?.license_type;

    if (!beatId || isNaN(beatId) || !licenseType) {
      console.error("Metadata inválida de MP:", payment.metadata);
      return new NextResponse("Información de licencia o Beat ID faltante", { status: 400 });
    }

    console.log("DEBUG DESCARGA:");
    console.log("- ID recibido de MP:", payment.metadata?.beat_id);
    console.log("- ID convertido a Number:", beatId);
    console.log("- Tipo de dato del ID:", typeof beatId);

    // 3. Buscar assets en Supabase
    const { data: assets, error } = await supabase
      .from('beat_assets')
      .select('*')
      .eq('beat_id', beatId)
      .single();

    if (error || !assets) {
      console.error("Supabase Error:", error);
      return new NextResponse("Beat no encontrado en archivos", { status: 404 });
    }

    // 4. Determinar qué archivo bajar según la licencia
    let fileId = assets.drive_mp3_id;
    if (licenseType === "WAV Premium") fileId = assets.drive_wav_id;
    if (licenseType === "Unlimited") fileId = assets.drive_unlimited_id;

    if (!fileId) return new NextResponse("Archivo no configurado en la base de datos", { status: 404 });

    // 5. Configurar Google Drive con limpieza de JSON para Vercel
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!credentialsRaw) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON no está definida en Vercel");
    }

    // Limpiamos posibles comillas simples al inicio/final que rompen el parseo
    const cleanCredentials = JSON.parse(credentialsRaw.trim().replace(/^'|'$/g, ''));

    const auth = new google.auth.GoogleAuth({
      credentials: cleanCredentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 6. Obtener el archivo de Drive como stream
    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    const nodeStream = fileResponse.data as Readable;
    
    // 7. Retornar el archivo para descarga directa
    return new NextResponse(nodeStream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="Beat_${beatId}_${licenseType.toString().replace(/\s+/g, '_')}.zip"`,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error: any) {
    console.error("Error en descarga segura:", error);
    // Manejo de error específico de JSON.parse o credenciales
    if (error instanceof SyntaxError) {
      return new NextResponse("Error en formato de credenciales de Google", { status: 500 });
    }
    return new NextResponse("Error procesando la descarga", { status: 500 });
  }
}