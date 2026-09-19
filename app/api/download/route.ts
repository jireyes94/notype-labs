import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { hashDownloadToken } from "@/lib/download-entitlements";
import { getR2Bucket, getR2Client } from "@/lib/r2";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ConsumedDownload = {
  order_item_id: string;
  beat_id: number;
  beat_title: string;
  license_id: "mp3" | "wav" | "unlimited";
  r2_object_key: string;
};

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

    const downloadUrl = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({
        Bucket: getR2Bucket(),
        Key: consumed.r2_object_key,
      }),
      { expiresIn: 300 },
    );
    const response = NextResponse.redirect(downloadUrl, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("Secure download failed", error);
    return new NextResponse("No pudimos preparar la descarga", { status: 500 });
  }
}
