-- Function to check availability
create or replace function public.get_availability(check_month text)
returns json as $$
declare
  start_date timestamptz;
  end_date timestamptz;
  result json;
begin
  start_date := (check_month || '-01')::timestamptz;
  end_date := start_date + interval '1 month';
  
  select json_agg(
    json_build_object(
      'start_at', b.start_at,
      'end_at', b.end_at,
      'status', b.status
    )
  ) into result
  from public.bookings b
  where b.start_at >= start_date and b.start_at < end_date
  and b.status in ('menunggu_dp', 'dp_diterima', 'selesai');
  
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer set search_path = '';

-- Function to create booking
create or replace function public.create_booking(
  p_customer_name text,
  p_wa_number text,
  p_event_type text,
  p_event_name text,
  p_package_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_venue text,
  p_notes text
) returns json as $$
declare
  v_pkg public.packages%rowtype;
  v_total integer;
  v_dp integer;
  v_unique_code integer;
  v_buffer_minutes integer;
  v_block_start timestamptz;
  v_block_end timestamptz;
  v_booking_id uuid;
  v_booking_code text;
  v_invoice_num text;
  v_public_token text;
begin
  -- Validate Package
  select * into v_pkg from public.packages where id = p_package_id and is_active = true;
  if not found then
    raise exception 'Paket tidak ditemukan atau tidak aktif';
  end if;

  v_total := v_pkg.price;
  
  -- Calculate DP
  if v_pkg.dp_override is not null then
    v_dp := v_pkg.dp_override;
  else
    -- Assuming settings dp_config exists and is percent based
    v_dp := (v_total * 30) / 100;
  end if;
  
  v_unique_code := floor(random() * 999 + 1)::int;
  v_dp := v_dp + v_unique_code;

  -- Setup blocks
  v_buffer_minutes := 60;
  v_block_start := p_start_at - (v_buffer_minutes || ' minutes')::interval;
  v_block_end := p_end_at + (v_buffer_minutes || ' minutes')::interval;
  
  -- Check conflicts
  if exists (
    select 1 from public.bookings 
    where status in ('menunggu_dp', 'dp_diterima') 
    and tstzrange(block_start, block_end) && tstzrange(v_block_start, v_block_end)
  ) then
    raise exception 'Jadwal tidak tersedia (bertentangan dengan booking lain)';
  end if;

  -- Generate Code
  v_booking_code := 'FI-' || upper(substr(md5(random()::text), 1, 6));

  -- Insert Booking
  insert into public.bookings (
    code, customer_name, wa_number, event_type, event_name, package_id, 
    start_at, end_at, block_start, block_end, venue, notes, total_amount, dp_amount, dp_unique_code,
    hold_expires_at, tos_agreed_at
  ) values (
    v_booking_code, p_customer_name, p_wa_number, p_event_type, p_event_name, p_package_id,
    p_start_at, p_end_at, v_block_start, v_block_end, p_venue, p_notes, v_total, v_dp, v_unique_code,
    now() + interval '24 hours', now()
  ) returning id, public_token into v_booking_id, v_public_token;

  -- Generate Invoice
  v_invoice_num := 'INV/FI/' || to_char(now(), 'YYYY/MM/') || lpad(nextval('invoice_seq')::text, 4, '0');
  insert into public.invoices (booking_id, invoice_number, status, due_date)
  values (v_booking_id, v_invoice_num, 'belum_dibayar', now() + interval '24 hours');

  return json_build_object('code', v_booking_code, 'token', v_public_token);
end;
$$ language plpgsql security definer set search_path = '';

-- Realtime trigger function
create or replace function public.broadcast_booking_status()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    perform pg_notify(
      'booking_status',
      json_build_object('token', new.public_token, 'status', new.status)::text
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_booking_status_change
after update of status on public.bookings
for each row
execute function public.broadcast_booking_status();
