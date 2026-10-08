-- Additional functions
create or replace function public.get_booking_status(p_code text, p_token text)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'code', b.code,
    'status', b.status,
    'total_amount', b.total_amount,
    'dp_amount', b.dp_amount,
    'dp_unique_code', b.dp_unique_code,
    'hold_expires_at', b.hold_expires_at
  ) into result
  from public.bookings b
  where b.code = p_code and b.public_token = p_token;
  
  if result is null then
    return json_build_object('error', 'Booking tidak ditemukan atau token tidak valid');
  end if;
  return result;
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.get_invoice(p_code text, p_token text)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'invoice_number', i.invoice_number,
    'status', i.status,
    'due_date', i.due_date,
    'customer_name', b.customer_name,
    'event_name', b.event_name,
    'start_at', b.start_at,
    'venue', b.venue,
    'total_amount', b.total_amount,
    'dp_amount', b.dp_amount
  ) into result
  from public.bookings b
  join public.invoices i on i.booking_id = b.id
  where b.code = p_code and b.public_token = p_token;
  
  if result is null then
    return json_build_object('error', 'Invoice tidak ditemukan atau token tidak valid');
  end if;
  return result;
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users where id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.admin_dashboard()
returns json as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  select json_build_object(
    'booking_hari_ini', (select count(*) from public.bookings where date_trunc('day', start_at) = date_trunc('day', now()) and status = 'dp_diterima'),
    'booking_bulan_ini', (select count(*) from public.bookings where date_trunc('month', start_at) = date_trunc('month', now()) and status in ('menunggu_dp', 'dp_diterima', 'selesai')),
    'menunggu_dp', (select count(*) from public.bookings where status = 'menunggu_dp'),
    'pemasukan_bulan_ini', coalesce((select sum(amount) from public.payments where date_trunc('month', confirmed_at) = date_trunc('month', now())), 0),
    'potensi_pendapatan', coalesce((select sum(total_amount - dp_amount) from public.bookings where status = 'dp_diterima'), 0)
  ) into result;

  return result;
end;
$$ language plpgsql security definer set search_path = '';
