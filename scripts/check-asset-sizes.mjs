import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name}`);
  return value;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "desconocido";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit < 2 ? 0 : 2)} ${units[unit]}`;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const credentials = JSON.parse(
  requireEnv("GOOGLE_SERVICE_ACCOUNT_JSON").trim().replace(/^'|'$/g, ""),
);
const auth = new google.auth.GoogleAuth({
  credentials,
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

const rows = [];
for (const asset of assets ?? []) {
  for (const [license, fileId] of [
    ["MP3", asset.drive_mp3_id],
    ["WAV", asset.drive_wav_id],
    ["Unlimited", asset.drive_unlimited_id],
  ]) {
    if (!fileId) continue;
    const response = await drive.files.get({ fileId, fields: "name,size,mimeType" });
    const bytes = Number(response.data.size);
    rows.push({
      beat: titleById.get(asset.beat_id) ?? `Beat ${asset.beat_id}`,
      license,
      size: formatBytes(bytes),
      bytes,
      type: response.data.mimeType ?? "",
    });
  }
}

console.table(rows.map(({ beat, license, size, type }) => ({ beat, license, size, type })));
const knownSizes = rows.map(({ bytes }) => bytes).filter(Number.isFinite);
console.log(`Archivos medidos: ${knownSizes.length}`);
console.log(`Mayor archivo: ${formatBytes(Math.max(...knownSizes))}`);
console.log(`Total: ${formatBytes(knownSizes.reduce((sum, size) => sum + size, 0))}`);
