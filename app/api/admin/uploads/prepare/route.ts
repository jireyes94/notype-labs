import { randomUUID } from "node:crypto";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { type AdminAssetInput, type AdminAssetKind, safeExtension, validateAsset } from "@/lib/admin-assets";
import { getR2AdminClient, getR2Bucket } from "@/lib/r2";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const KINDS: AdminAssetKind[] = ["preview", "cover", "mp3", "wav", "unlimited"];

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { files?: Partial<Record<AdminAssetKind, AdminAssetInput>> };
    const files = body.files ?? {};
    for (const kind of KINDS) {
      const input = files[kind];
      const error = input ? validateAsset(kind, input) : `${kind}: archivo requerido`;
      if (error) return NextResponse.json({ error }, { status: 400 });
    }

    const uploadId = randomUUID();
    const preview = files.preview!;
    const cover = files.cover!;
    const publicAssets = {
      preview: `previews/${uploadId}.${safeExtension(preview, "mp3")}`,
      cover: `covers/${uploadId}.${safeExtension(cover, "jpg")}`,
    };
    const supabase = getSupabaseAdmin();
    const [previewUpload, coverUpload] = await Promise.all([
      supabase.storage.from("beats-assets").createSignedUploadUrl(publicAssets.preview),
      supabase.storage.from("beats-assets").createSignedUploadUrl(publicAssets.cover),
    ]);
    if (previewUpload.error) throw previewUpload.error;
    if (coverUpload.error) throw coverUpload.error;

    const r2Keys = {
      mp3: `beats/${uploadId}/mp3.mp3`,
      wav: `beats/${uploadId}/wav.wav`,
      unlimited: `beats/${uploadId}/unlimited.zip`,
    };
    const r2 = getR2AdminClient();
    const bucket = getR2Bucket();
    const privateUploads = await Promise.all(
      (["mp3", "wav", "unlimited"] as const).map(async (kind) => ({
        kind,
        key: r2Keys[kind],
        url: await getSignedUrl(
          r2,
          new PutObjectCommand({ Bucket: bucket, Key: r2Keys[kind], ContentType: files[kind]!.type }),
          { expiresIn: 15 * 60 },
        ),
      })),
    );

    return NextResponse.json({
      uploadId,
      public: {
        preview: { path: publicAssets.preview, token: previewUpload.data.token },
        cover: { path: publicAssets.cover, token: coverUpload.data.token },
      },
      private: Object.fromEntries(privateUploads.map(({ kind, ...upload }) => [kind, upload])),
    });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Could not prepare admin upload", error);
    return NextResponse.json({ error: "No pudimos preparar la subida." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { uploadId?: unknown; publicPaths?: unknown };
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uploadId)) {
      return NextResponse.json({ error: "Subida inválida." }, { status: 400 });
    }
    const publicPaths = Array.isArray(body.publicPaths)
      ? body.publicPaths.filter((path): path is string =>
          typeof path === "string" &&
          (path.startsWith(`previews/${uploadId}.`) || path.startsWith(`covers/${uploadId}.`)),
        )
      : [];
    await Promise.all([
      publicPaths.length
        ? getSupabaseAdmin().storage.from("beats-assets").remove(publicPaths)
        : Promise.resolve(),
      getR2AdminClient().send(new DeleteObjectsCommand({
        Bucket: getR2Bucket(),
        Delete: {
          Objects: ["mp3.mp3", "wav.wav", "unlimited.zip"].map((name) => ({
            Key: `beats/${uploadId}/${name}`,
          })),
          Quiet: true,
        },
      })),
    ]);
    return NextResponse.json({ cleaned: true });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Could not clean admin upload", error);
    return NextResponse.json({ error: "No pudimos limpiar la subida." }, { status: 500 });
  }
}
