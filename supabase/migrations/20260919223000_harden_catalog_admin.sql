begin;

alter table public.beat_assets enable row level security;

drop policy if exists "Enable delete for authenticated users" on public.beats;
drop policy if exists "Enable insert for authenticated users only" on public.beats;
drop policy if exists "Enable update access for authenticated users only" on public.beats;

drop policy if exists "Enable insert access for authenticated users only 4xdmfn_0" on storage.objects;
drop policy if exists "Enable insert access for authenticated users only 4xdmfn_1" on storage.objects;
drop policy if exists "Enable insert access for authenticated users only 4xdmfn_3" on storage.objects;

-- Public catalog reads remain enabled. All catalog and storage mutations now
-- pass through server routes that validate the Supabase user against
-- ADMIN_USER_ID and use the service role only after authorization.

commit;
