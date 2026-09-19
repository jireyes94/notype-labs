begin;

create or replace function public.consume_download_entitlement(p_token_hash text)
returns table (
  order_item_id uuid,
  beat_id bigint,
  beat_title text,
  license_id text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entitlement public.download_entitlements%rowtype;
begin
  select de.*
  into entitlement
  from public.download_entitlements de
  join public.order_items oi on oi.id = de.order_item_id
  join public.orders o on o.id = oi.order_id
  where de.token_hash = p_token_hash
    and o.status = 'paid'
    and de.revoked_at is null
    and de.expires_at > now()
    and de.download_count < de.max_downloads
  for update;

  if not found then
    return;
  end if;

  update public.download_entitlements de
  set download_count = de.download_count + 1,
      last_downloaded_at = now()
  where de.id = entitlement.id;

  return query
  select oi.id, oi.beat_id, oi.beat_title, oi.license_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = entitlement.order_item_id
    and o.status = 'paid';
end;
$$;

revoke all on function public.consume_download_entitlement(text) from public, anon, authenticated;
grant execute on function public.consume_download_entitlement(text) to service_role;

comment on function public.consume_download_entitlement(text) is
  'Atomically validates and consumes one secure download attempt for a paid order.';

commit;
