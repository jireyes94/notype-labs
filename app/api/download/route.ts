// app/api/download/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabase } from "@/lib/supabase";
import { Readable } from "stream"; // Importante para el casteo de stream

const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) return new NextResponse("No autorizado", { status: 401 });

  try {
    // 1. Validar pago REAL con Mercado Pago
    const payment = await new Payment(mpClient).get({ id: paymentId });
    
    if (payment.status !== "approved") {
      return new NextResponse("El pago no ha sido aprobado", { status: 403 });
    }

    const beatId = payment.metadata?.beat_id;
    const licenseType = payment.metadata?.license_type;

    if (!beatId || !licenseType) {
      return new NextResponse("Información de licencia faltante", { status: 400 });
    }

    // 2. Buscar en Supabase
    const { data: assets, error } = await supabase
      .from('beat_assets')
      .select('*')
      .eq('beat_id', beatId)
      .single();

    if (error || !assets) return new NextResponse("Beat no encontrado en archivos", { status: 404 });

    // 3. Determinar ID de Drive
    let fileId = assets.drive_mp3_id;
    if (licenseType === "WAV Premium") fileId = assets.drive_wav_id;
    if (licenseType === "Unlimited") fileId = assets.drive_unlimited_id;

    if (!fileId) return new NextResponse("Archivo no configurado en la base de datos", { status: 404 });

    // 4. Conexión con Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 5. Obtener el archivo
    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    // Convertimos el stream de Node a un ReadableStream web para Next.js
    const nodeStream = fileResponse.data as Readable;
    
    // El constructor de NextResponse acepta el stream de Node en entornos de servidor (Vercel)
    // pero para evitar errores de tipos en TS usamos 'any' con precaución aquí.
    return new NextResponse(nodeStream as any, {
      headers: {
        "Content-Disposition": `attachment; filename="Beat_${beatId}_${licenseType.toString().replace(/\s+/g, '_')}.zip"`,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, max-age=0", // Evitar que el navegador cachee la descarga
      },
    });

  } catch (error: any) {
    console.error("Error en descarga segura:", error);
    // Si el error viene de Google API, suele traer un código
    const status = error.code === 404 ? 404 : 500;
    return new NextResponse("Error procesando la descarga", { status });
  }
}