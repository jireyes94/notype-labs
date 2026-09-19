import { HeadBucketCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const execute = process.argv.includes("--execute");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name}`);
  return value;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit < 2 ? 0 : 2)} ${units[unit]}`;
}

function safeFileName(value) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseGoogleCredentials() {
  return JSON.parse(requireEnv("GOOGLE_SERVICE_ACCOUNT_JSON").trim().replace(/^'|'$/g, ""));
}

async function inspectObject(client, bucket, key) {
  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { exists: true, bytes: Number(result.ContentLength) };
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") {
      return { exists: false, bytes: null };
    }
    throw error;
  }
}

const accountId = requireEnv("R2_ACCOUNT_ID");
const bucket = requireEnv("R2_BUCKET_NAME");
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_MIGRATION_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_MIGRATION_SECRET_ACCESS_KEY"),
  },
});
await r2.send(new HeadBucketCommand({ Bucket: bucket }));

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const auth = new google.auth.GoogleAuth({
  credentials: parseGoogleCredentials(),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

const { data: assets, error: assetsError } = await supabase
  .from("beat_assets")
  .select("beat_id, drive_mp3_id, drive_wav_id, drive_unlimited_id");
if (assetsError) throw assetsError;

const beatIds = (assets ?? []).map(({ beat_id }) => beat_id);
const { data: beats, error: beatsError } = await supabase
  .from("beats")
  .select("id, title")
  .in("id", beatIds);
if (beatsError) throw beatsError;
const titleById = new Map((beats ?? []).map((beat) => [beat.id, beat.title]));

const plans = [];
for (const asset of assets ?? []) {
  const title = titleById.get(asset.beat_id) ?? `Beat ${asset.beat_id}`;
  for (const definition of [
    { license: "mp3", driveId: asset.drive_mp3_id, extension: "mp3", contentType: "audio/mpeg" },
    { license: "wav", driveId: asset.drive_wav_id, extension: "wav", contentType: "audio/wav" },
    { license: "unlimited", driveId: asset.drive_unlimited_id, extension: "zip", contentType: "application/zip" },
  ]) {
    if (!definition.driveId) continue;
    const metadata = await drive.files.get({
      fileId: definition.driveId,
      fields: "name,size,mimeType",
    });
    const bytes = Number(metadata.data.size);
    if (!Number.isFinite(bytes) || bytes <= 0) throw new Error(`Tamaño inválido en ${title} ${definition.license}`);
    const key = `beats/${asset.beat_id}/${definition.license}.${definition.extension}`;
    const current = await inspectObject(r2, bucket, key);
    const state = !current.exists ? "pendiente" : current.bytes === bytes ? "verificado" : "conflicto";
    plans.push({
      beatId: asset.beat_id,
      beat: title,
      driveId: definition.driveId,
      license: definition.license,
      extension: definition.extension,
      contentType: definition.contentType,
      bytes,
      key,
      state,
    });
  }
}

console.table(plans.map(({ beat, license, bytes, state, key }) => ({
  beat,
  license,
  size: formatBytes(bytes),
  state,
  key,
})));

const conflicts = plans.filter(({ state }) => state === "conflicto");
const pending = plans.filter(({ state }) => state === "pendiente");
console.log(`R2 conectado: ${bucket}`);
console.log(`Archivos planificados: ${plans.length}`);
console.log(`Ya verificados: ${plans.length - pending.length - conflicts.length}`);
console.log(`Pendientes: ${pending.length} (${formatBytes(pending.reduce((sum, file) => sum + file.bytes, 0))})`);
console.log(`Conflictos: ${conflicts.length}`);

if (conflicts.length) throw new Error("Hay objetos en R2 con tamaño diferente; no se realizará la migración");
if (!execute) {
  console.log("Auditoría terminada sin subir archivos ni modificar Supabase.");
  console.log("Para ejecutar la migración: npm run migrate:assets:r2 -- --execute");
  process.exit(0);
}

for (const plan of pending) {
  console.log(`Subiendo ${plan.beat} ${plan.license} (${formatBytes(plan.bytes)})...`);
  const response = await drive.files.get(
    { fileId: plan.driveId, alt: "media" },
    { responseType: "stream" },
  );
  const fileName = `${safeFileName(plan.beat) || "beat"}_${plan.license}.${plan.extension}`;
  const upload = new Upload({
    client: r2,
    params: {
      Bucket: bucket,
      Key: plan.key,
      Body: response.data,
      ContentLength: plan.bytes,
      ContentType: plan.contentType,
      ContentDisposition: `attachment; filename="${fileName}"`,
    },
    queueSize: 2,
    partSize: 10 * 1024 * 1024,
    leavePartsOnError: false,
  });
  await upload.done();
  const uploaded = await inspectObject(r2, bucket, plan.key);
  if (!uploaded.exists || uploaded.bytes !== plan.bytes) {
    throw new Error(`Falló la verificación de ${plan.key}`);
  }
}

const keysByBeat = new Map();
for (const plan of plans) {
  const keys = keysByBeat.get(plan.beatId) ?? {};
  keys[`r2_${plan.license}_key`] = plan.key;
  keysByBeat.set(plan.beatId, keys);
}
for (const [beatId, keys] of keysByBeat) {
  const { error } = await supabase.from("beat_assets").update(keys).eq("beat_id", beatId);
  if (error) throw error;
}

console.log(`Migración completa: ${plans.length} archivos verificados y ${keysByBeat.size} filas actualizadas.`);
