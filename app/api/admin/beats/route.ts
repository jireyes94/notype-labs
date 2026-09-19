import { DeleteObjectsCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { safeExtension, type AdminAssetInput, validateAsset } from "@/lib/admin-assets";
import { getR2AdminClient, getR2Bucket } from "@/lib/r2";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type CreateBody = {
  uploadId?: unknown;
  title?: unknown;
  slug?: unknown;
  bpm?: unknown;
  musicalKey?: unknown;
  mood?: unknown;
  price?: unknown;
  files?: Partial<Record<"preview" | "cover" | "mp3" | "wav" | "unlimited", AdminAssetInput>>;
};

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function publicStoragePath(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const marker = "/object/public/beats-assets/";
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

async function removeObjects(r2Keys: string[], storagePaths: string[]) {
  const admin = getSupabaseAdmin();
  if (storagePaths.length) {
    const { error } = await admin.storage.from("beats-assets").remove(storagePaths);
    if (error) console.error("Could not remove public beat assets", error);
  }
  if (r2Keys.length) {
    try {
      await getR2AdminClient().send(new DeleteObjectsCommand({
        Bucket: getR2Bucket(),
        Delete: { Objects: r2Keys.map((Key) => ({ Key })), Quiet: true },
      }));
    } catch (error) {
      console.error("Could not remove private beat assets", error);
    }
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const { data, error } = await getSupabaseAdmin()
      .from("beats")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ beats: data ?? [] });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Could not load admin catalog", error);
    return NextResponse.json({ error: "No pudimos cargar el catálogo." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let uploadedR2Keys: string[] = [];
  let uploadedStoragePaths: string[] = [];
  let createdBeatId: number | null = null;
  try {
    await requireAdmin(request);
    const body = (await request.json()) as CreateBody;
    const uploadId = cleanText(body.uploadId, 36);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uploadId)) {
      return NextResponse.json({ error: "La sesión de subida no es válida." }, { status: 400 });
    }

    const title = cleanText(body.title, 120);
    const slug = cleanText(body.slug, 140).toLowerCase();
    const musicalKey = cleanText(body.musicalKey, 30);
    const bpm = Number(body.bpm);
    const price = Number(body.price);
    const mood = Array.isArray(body.mood)
      ? body.mood.map((value) => cleanText(value, 50)).filter(Boolean).slice(0, 12)
      : [];
    if (title.length < 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Título o slug inválido." }, { status: 400 });
    }
    if (!Number.isSafeInteger(bpm) || bpm < 40 || bpm > 300 || !musicalKey) {
      return NextResponse.json({ error: "BPM o tonalidad inválidos." }, { status: 400 });
    }
    if (!Number.isSafeInteger(price) || price <= 0 || mood.length === 0) {
      return NextResponse.json({ error: "Precio o etiquetas inválidos." }, { status: 400 });
    }

    const files = body.files ?? {};
    for (const kind of ["preview", "cover", "mp3", "wav", "unlimited"] as const) {
      const error = files[kind] ? validateAsset(kind, files[kind]!) : `${kind}: archivo requerido`;
      if (error) return NextResponse.json({ error }, { status: 400 });
    }

    uploadedStoragePaths = [
      `previews/${uploadId}.${safeExtension(files.preview!, "mp3")}`,
      `covers/${uploadId}.${safeExtension(files.cover!, "jpg")}`,
    ];
    uploadedR2Keys = [
      `beats/${uploadId}/mp3.mp3`,
      `beats/${uploadId}/wav.wav`,
      `beats/${uploadId}/unlimited.zip`,
    ];

    const r2 = getR2AdminClient();
    const bucket = getR2Bucket();
    await Promise.all(uploadedR2Keys.map(async (Key, index) => {
      const kind = (["mp3", "wav", "unlimited"] as const)[index];
      const object = await r2.send(new HeadObjectCommand({ Bucket: bucket, Key }));
      if (Number(object.ContentLength) !== files[kind]!.size) {
        throw new Error(`R2_SIZE_MISMATCH:${kind}`);
      }
    }));

    const admin = getSupabaseAdmin();
    const [previewList, coverList] = await Promise.all([
      admin.storage.from("beats-assets").list("previews", { search: uploadId, limit: 2 }),
      admin.storage.from("beats-assets").list("covers", { search: uploadId, limit: 2 }),
    ]);
    if (previewList.error || coverList.error || previewList.data.length !== 1 || coverList.data.length !== 1) {
      throw new Error("PUBLIC_ASSET_MISSING");
    }

    const previewUrl = admin.storage.from("beats-assets").getPublicUrl(uploadedStoragePaths[0]).data.publicUrl;
    const coverUrl = admin.storage.from("beats-assets").getPublicUrl(uploadedStoragePaths[1]).data.publicUrl;
    const { data: beat, error: beatError } = await admin.from("beats").insert({
      title,
      slug,
      bpm,
      key: musicalKey,
      mood,
      price,
      mp3_url: previewUrl,
      cover_url: coverUrl,
      is_sold: false,
    }).select("id, title, slug").single();
    if (beatError) {
      if (beatError.code === "23505") {
        await removeObjects(uploadedR2Keys, uploadedStoragePaths);
        return NextResponse.json({ error: "Ya existe un beat con ese slug." }, { status: 409 });
      }
      throw beatError;
    }
    createdBeatId = Number(beat.id);

    const { error: assetsError } = await admin.from("beat_assets").insert({
      beat_id: createdBeatId,
      r2_mp3_key: uploadedR2Keys[0],
      r2_wav_key: uploadedR2Keys[1],
      r2_unlimited_key: uploadedR2Keys[2],
    });
    if (assetsError) throw assetsError;

    return NextResponse.json({ beat }, { status: 201 });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    if (createdBeatId !== null) {
      await getSupabaseAdmin().from("beats").delete().eq("id", createdBeatId);
    }
    await removeObjects(uploadedR2Keys, uploadedStoragePaths);
    console.error("Could not publish beat", error);
    return NextResponse.json({ error: "No pudimos publicar el beat. Los archivos subidos se limpiaron." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { id?: unknown; isSold?: unknown };
    const id = Number(body.id);
    if (!Number.isSafeInteger(id) || typeof body.isSold !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const { error } = await getSupabaseAdmin().from("beats").update({ is_sold: body.isSold }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ updated: true });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Could not update beat", error);
    return NextResponse.json({ error: "No pudimos actualizar el beat." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
    if (!ids.length || ids.some((id) => !Number.isSafeInteger(id))) {
      return NextResponse.json({ error: "Selección inválida." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const [{ data: beats, error: beatsError }, { data: assets, error: assetsError }] = await Promise.all([
      admin.from("beats").select("id, mp3_url, cover_url").in("id", ids),
      admin.from("beat_assets").select("beat_id, r2_mp3_key, r2_wav_key, r2_unlimited_key").in("beat_id", ids),
    ]);
    if (beatsError) throw beatsError;
    if (assetsError) throw assetsError;

    const { error: deleteError } = await admin.from("beats").delete().in("id", ids);
    if (deleteError) throw deleteError;

    const storagePaths = (beats ?? []).flatMap((beat) =>
      [publicStoragePath(beat.mp3_url), publicStoragePath(beat.cover_url)].filter((value): value is string => Boolean(value)),
    );
    const r2Keys = (assets ?? []).flatMap((asset) =>
      [asset.r2_mp3_key, asset.r2_wav_key, asset.r2_unlimited_key].filter((value): value is string => Boolean(value)),
    );
    await removeObjects(r2Keys, storagePaths);
    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    const authResponse = adminErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Could not delete beats", error);
    return NextResponse.json({ error: "No pudimos eliminar los beats." }, { status: 500 });
  }
}
