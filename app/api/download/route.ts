import { NextResponse } from "next/server";
import { google } from "googleapis";
import { hashDownloadToken } from "@/lib/download-entitlements";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ConsumedDownload = {
  order_item_id: string;
  beat_id: number;
  beat_title: string;
  license_id: "mp3" | "wav" | "unlimited";
};

function safeFileName(value: string): string {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || token.length > 200) {
    return new NextResponse("Enlace de descarga inválido", { status: 401 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc("consume_download_entitlement", {
      p_token_hash: hashDownloadToken(token),
    });
    const consumed = (data?.[0] ?? null) as ConsumedDownload | null;
    if (error) throw error;
    if (!consumed) {
      return new NextResponse("El enlace venció o alcanzó su límite de descargas", { status: 403 });
    }

    const { data: assets, error: assetsError } = await admin
      .from("beat_assets")
      .select("drive_mp3_id, drive_wav_id, drive_unlimited_id")
      .eq("beat_id", consumed.beat_id)
      .single();
    if (assetsError || !assets) {
      return new NextResponse("Archivo no configurado", { status: 404 });
    }

    const asset = {
      mp3: { id: assets.drive_mp3_id, extension: "mp3", contentType: "audio/mpeg" },
      wav: { id: assets.drive_wav_id, extension: "wav", contentType: "audio/wav" },
      unlimited: { id: assets.drive_unlimited_id, extension: "zip", contentType: "application/zip" },
    }[consumed.license_id];
    if (!asset?.id) return new NextResponse("Archivo no configurado", { status: 404 });

    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!credentialsRaw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
    const credentials = JSON.parse(credentialsRaw.trim().replace(/^'|'$/g, ""));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.get(
      { fileId: asset.id, alt: "media" },
      { responseType: "arraybuffer" },
    );
    const buffer = Buffer.from(response.data as ArrayBuffer);
    const fileName = `${safeFileName(consumed.beat_title) || "beat"}_${consumed.license_id}.${asset.extension}`;

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "Content-Type": asset.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Secure download failed", error);
    return new NextResponse("No pudimos preparar la descarga", { status: 500 });
  }
}
