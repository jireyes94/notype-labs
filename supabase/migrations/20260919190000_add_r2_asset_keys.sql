alter table public.beat_assets
  add column if not exists r2_mp3_key text,
  add column if not exists r2_wav_key text,
  add column if not exists r2_unlimited_key text;

comment on column public.beat_assets.r2_mp3_key is
  'Private Cloudflare R2 object key for the licensed MP3 file.';
comment on column public.beat_assets.r2_wav_key is
  'Private Cloudflare R2 object key for the licensed WAV file.';
comment on column public.beat_assets.r2_unlimited_key is
  'Private Cloudflare R2 object key for the Unlimited ZIP package.';
