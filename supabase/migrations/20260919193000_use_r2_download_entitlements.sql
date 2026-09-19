begin;

drop function if exists public.consume_download_entitlement(text);

create function public.consume_download_entitlement(p_token_hash text)
returns table (
  order_item_id uuid,
  beat_id bigint,
  beat_title text,
  license_id text,
  r2_object_key text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entitlement_id uuid;
  entitled_order_item_id uuid;
  object_key text;
begin
  select
    de.id,
    de.order_item_id,
    case oi.license_id
      when 'mp3' then ba.r2_mp3_key
      when 'wav' then ba.r2_wav_key
      when 'unlimited' then ba.r2_unlimited_key
    end
  into entitlement_id, entitled_order_item_id, object_key
  from public.download_entitlements de
  join public.order_items oi on oi.id = de.order_item_id
  join public.orders o on o.id = oi.order_id
  join public.beat_assets ba on ba.beat_id = oi.beat_id
  where de.token_hash = p_token_hash
    and o.status = 'paid'
    and de.revoked_at is null
    and de.expires_at > now()
    and de.download_count < de.max_downloads
    and case oi.license_id
      when 'mp3' then ba.r2_mp3_key
      when 'wav' then ba.r2_wav_key
      when 'unlimited' then ba.r2_unlimited_key
    end is not null
  for update of de;

  if not found then
    return;
  end if;

  update public.download_entitlements de
  set download_count = de.download_count + 1,
      last_downloaded_at = now()
  where de.id = entitlement_id;

  return query
  select oi.id, oi.beat_id, oi.beat_title, oi.license_id, object_key
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = entitled_order_item_id
    and o.status = 'paid';
end;
$$;

revoke all on function public.consume_download_entitlement(text) from public, anon, authenticated;
grant execute on function public.consume_download_entitlement(text) to service_role;

comment on function public.consume_download_entitlement(text) is
  'Atomically validates a paid order with an R2 asset and consumes one secure download attempt.';

commit;
