begin;

create extension if not exists pgcrypto;

create table public.orders (
  id uuid primary key,
  external_reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (char_length(customer_email) between 5 and 320),
  status text not null default 'created'
    check (status in (
      'created',
      'payment_pending',
      'processed',
      'paid',
      'rejected',
      'cancelled',
      'refunded',
      'payment_error'
    )),
  currency text not null default 'ARS' check (currency = 'ARS'),
  subtotal_cents bigint not null check (subtotal_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  payment_provider text not null default 'uala' check (payment_provider = 'uala'),
  provider_order_id text unique,
  provider_status text,
  checkout_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_cents = subtotal_cents)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  beat_id bigint not null references public.beats(id) on delete restrict,
  beat_title text not null,
  beat_slug text not null,
  license_id text not null check (license_id in ('mp3', 'wav', 'unlimited')),
  license_name text not null,
  license_terms_version text not null default 'v1',
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, beat_id)
);

create table public.download_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique
    references public.order_items(id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  max_downloads integer not null default 5 check (max_downloads > 0),
  download_count integer not null default 0
    check (download_count >= 0 and download_count <= max_downloads),
  expires_at timestamptz not null,
  last_downloaded_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payment_events (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders(id) on delete set null,
  payment_provider text not null default 'uala' check (payment_provider = 'uala'),
  provider_order_id text,
  external_reference text,
  provider_status text not null,
  event_fingerprint text not null unique check (char_length(event_fingerprint) = 64),
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index orders_customer_email_idx
  on public.orders (lower(customer_email));

create index order_items_order_id_idx
  on public.order_items (order_id);

create index order_items_beat_id_idx
  on public.order_items (beat_id);

create index download_entitlements_expires_at_idx
  on public.download_entitlements (expires_at)
  where revoked_at is null;

create index payment_events_order_id_idx
  on public.payment_events (order_id);

create index payment_events_provider_order_id_idx
  on public.payment_events (provider_order_id);

create or replace function public.set_notype_order_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_notype_order_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.download_entitlements enable row level security;
alter table public.payment_events enable row level security;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.download_entitlements from anon, authenticated;
revoke all on table public.payment_events from anon, authenticated;
revoke all on sequence public.payment_events_id_seq from anon, authenticated;

comment on table public.orders is
  'Server-only purchase orders. Monetary values are stored in ARS cents.';

comment on table public.order_items is
  'Immutable purchase snapshots. Prices and license labels must be calculated by the server.';

comment on table public.download_entitlements is
  'Hashed, expiring download permissions created only after a verified approved payment.';

comment on table public.payment_events is
  'Raw payment webhook audit log with SHA-256 idempotency fingerprints.';

commit;
