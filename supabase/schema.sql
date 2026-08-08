-- VendeloTodo Release 1
-- Ejecute primero este archivo en Supabase SQL Editor.

create extension if not exists pgcrypto;

create sequence if not exists public.order_number_seq start 1;
create sequence if not exists public.quote_number_seq start 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(120) not null check (char_length(trim(full_name)) between 2 and 120),
  email varchar(255) not null unique,
  phone varchar(20),
  role varchar(20) not null check (role in ('Administrator', 'Technician')),
  status varchar(20) not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  slug varchar(110) not null unique,
  status varchar(20) not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku varchar(50) not null unique,
  name varchar(150) not null check (char_length(trim(name)) between 2 and 150),
  category_id uuid not null references public.categories(id),
  product_type varchar(30) not null check (product_type in ('Product', 'SparePart', 'Tool', 'Appliance', 'AirConditioner')),
  description varchar(500),
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  availability_type varchar(20) not null default 'InStock' check (availability_type in ('InStock', 'OnRequest')),
  brand varchar(100),
  btu integer check (btu is null or btu > 0),
  image_url text,
  status varchar(20) not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null unique,
  contact_name varchar(120),
  phone varchar(20),
  email varchar(255),
  status varchar(20) not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_suppliers (
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  supplier_sku varchar(80),
  supplier_cost numeric(12,2) not null check (supplier_cost >= 0),
  is_available boolean not null default true,
  lead_time_days integer check (lead_time_days is null or lead_time_days >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, supplier_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  movement_type varchar(10) not null check (movement_type in ('Input', 'Output')),
  quantity integer not null check (quantity > 0),
  previous_stock integer not null check (previous_stock >= 0),
  resulting_stock integer not null check (resulting_stock >= 0),
  reason varchar(250) not null check (char_length(trim(reason)) >= 3),
  performed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null unique,
  service_type varchar(30) not null check (service_type in ('Handyman', 'ACInstallation', 'ACRepair', 'ApplianceRepair')),
  description varchar(500) not null,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  status varchar(20) not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  order_number varchar(30) not null unique default ('OT-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  service_id uuid not null references public.services(id),
  customer_name varchar(120) not null check (char_length(trim(customer_name)) >= 2),
  customer_phone varchar(8) not null check (customer_phone ~ '^[0-9]{8}$'),
  customer_email varchar(255),
  zone varchar(50) not null check (zone in ('San Carlos', 'Río Cuarto', 'La Virgen de Sarapiquí', 'Santa Rosa')),
  address varchar(300) not null check (char_length(trim(address)) >= 10),
  description varchar(1000) not null check (char_length(trim(description)) >= 10),
  preferred_date date,
  technician_id uuid references public.profiles(id),
  scheduled_at timestamptz,
  status varchar(20) not null default 'Pending' check (status in ('Pending', 'Assigned', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled')),
  completion_notes varchar(1000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_evidence (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders(id) on delete cascade,
  file_path text not null,
  notes varchar(300),
  uploaded_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number varchar(30) not null unique default ('COT-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 4, '0')),
  customer_name varchar(120) not null check (char_length(trim(customer_name)) >= 2),
  customer_phone varchar(8) not null check (customer_phone ~ '^[0-9]{8}$'),
  customer_email varchar(255),
  zone varchar(50) not null check (zone in ('San Carlos', 'Río Cuarto', 'La Virgen de Sarapiquí', 'Santa Rosa')),
  notes varchar(500),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  additional_costs numeric(12,2) not null default 0 check (additional_costs >= 0),
  total numeric(12,2) generated always as (subtotal + additional_costs) stored,
  valid_until date not null default (current_date + 15),
  status varchar(20) not null default 'Sent' check (status in ('Draft', 'Sent', 'Approved', 'Rejected', 'Expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type varchar(10) not null check (item_type in ('Product', 'Service')),
  product_id uuid references public.products(id),
  service_id uuid references public.services(id),
  description varchar(200) not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  check ((item_type = 'Product' and product_id is not null and service_id is null) or (item_type = 'Service' and service_id is not null and product_id is null))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.service_orders(id),
  quote_id uuid references public.quotes(id),
  payer_name varchar(120) not null check (char_length(trim(payer_name)) >= 2),
  payer_phone varchar(8) not null check (payer_phone ~ '^[0-9]{8}$'),
  reference_number varchar(80) not null unique,
  amount numeric(12,2) not null check (amount > 0),
  proof_path text not null,
  notes varchar(500),
  status varchar(20) not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Rejected')),
  rejection_reason varchar(500),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'Rejected' or char_length(trim(rejection_reason)) >= 3)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.service_orders(id),
  service_id uuid not null references public.services(id),
  customer_name varchar(120) not null check (char_length(trim(customer_name)) >= 2),
  rating integer not null check (rating between 1 and 5),
  comment varchar(800) not null check (char_length(trim(comment)) between 10 and 800),
  moderation_status varchar(20) not null default 'Pending' check (moderation_status in ('Pending', 'Approved', 'Rejected')),
  moderated_by uuid references public.profiles(id),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_status_idx on public.products(status);
create index if not exists movements_product_idx on public.inventory_movements(product_id, created_at desc);
create index if not exists orders_technician_idx on public.service_orders(technician_id, status);
create index if not exists orders_status_idx on public.service_orders(status, created_at desc);
create index if not exists reviews_status_idx on public.reviews(moderation_status, created_at desc);
create index if not exists payments_status_idx on public.payments(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','categories','products','suppliers','services','service_orders','quotes','payments','reviews']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'Administrator' and status = 'Active');
$$;

create or replace function public.is_technician()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'Technician' and status = 'Active');
$$;

create or replace function public.record_inventory_movement(p_product_id uuid, p_movement_type text, p_quantity integer, p_reason text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare current_stock integer; resulting integer; result_row public.products;
begin
  if not public.is_admin() then raise exception 'Acceso no autorizado.'; end if;
  if p_movement_type not in ('Input', 'Output') then raise exception 'Tipo de movimiento inválido.'; end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'La cantidad debe ser un número entero mayor que cero.'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then raise exception 'Debe indicar un motivo.'; end if;
  select stock_quantity into current_stock from public.products where id = p_product_id for update;
  if not found then raise exception 'Artículo no encontrado.'; end if;
  resulting := current_stock + case when p_movement_type = 'Input' then p_quantity else -p_quantity end;
  if resulting < 0 then raise exception 'La salida no puede superar el stock disponible.'; end if;
  update public.products set stock_quantity = resulting where id = p_product_id returning * into result_row;
  insert into public.inventory_movements(product_id, movement_type, quantity, previous_stock, resulting_stock, reason, performed_by)
  values (p_product_id, p_movement_type, p_quantity, current_stock, resulting, trim(p_reason), auth.uid());
  return to_jsonb(result_row);
end;
$$;

create or replace function public.validate_order_transition()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  if not ((old.status = 'Pending' and new.status in ('Assigned','Cancelled')) or
          (old.status = 'Assigned' and new.status in ('OnTheWay','Cancelled')) or
          (old.status = 'OnTheWay' and new.status in ('InProgress','Cancelled')) or
          (old.status = 'InProgress' and new.status in ('Completed','Cancelled'))) then
    raise exception 'Transición de estado inválida: % a %.', old.status, new.status;
  end if;
  if new.status = 'Assigned' and (new.technician_id is null or new.scheduled_at is null) then
    raise exception 'Para asignar una orden se requiere técnico y fecha programada.';
  end if;
  if new.status = 'Completed' and not exists(select 1 from public.order_evidence where order_id = new.id) then
    raise exception 'Debe cargar al menos una evidencia antes de completar el trabajo.';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_service_order_transition on public.service_orders;
create trigger validate_service_order_transition before update of status on public.service_orders for each row execute function public.validate_order_transition();

create or replace function public.protect_technician_order_fields()
returns trigger language plpgsql set search_path = public as $$
begin
  if public.is_technician() and (
    new.service_id is distinct from old.service_id or new.customer_name is distinct from old.customer_name or
    new.customer_phone is distinct from old.customer_phone or new.customer_email is distinct from old.customer_email or
    new.zone is distinct from old.zone or new.address is distinct from old.address or
    new.description is distinct from old.description or new.preferred_date is distinct from old.preferred_date or
    new.technician_id is distinct from old.technician_id or new.scheduled_at is distinct from old.scheduled_at
  ) then raise exception 'El técnico solo puede actualizar el progreso y las notas de su trabajo.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_technician_order_fields on public.service_orders;
create trigger protect_technician_order_fields before update on public.service_orders for each row execute function public.protect_technician_order_fields();

create or replace function public.create_public_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result_row public.service_orders; service_active boolean;
begin
  select status = 'Active' into service_active from public.services where id = (payload->>'service_id')::uuid;
  if coalesce(service_active, false) = false then raise exception 'El servicio seleccionado no está disponible.'; end if;
  if char_length(trim(coalesce(payload->>'customer_name',''))) < 2 then raise exception 'Ingrese un nombre válido.'; end if;
  if coalesce(payload->>'customer_phone','') !~ '^[0-9]{8}$' then raise exception 'El teléfono debe contener exactamente 8 dígitos.'; end if;
  if coalesce(payload->>'zone','') not in ('San Carlos','Río Cuarto','La Virgen de Sarapiquí','Santa Rosa') then raise exception 'Zona fuera de cobertura.'; end if;
  if char_length(trim(coalesce(payload->>'address',''))) < 10 then raise exception 'Ingrese una dirección clara.'; end if;
  if char_length(trim(coalesce(payload->>'description',''))) < 10 then raise exception 'Describa el trabajo requerido.'; end if;
  if nullif(payload->>'preferred_date','')::date < current_date then raise exception 'La fecha preferida no puede estar en el pasado.'; end if;
  insert into public.service_orders(service_id, customer_name, customer_phone, customer_email, zone, address, description, preferred_date)
  values ((payload->>'service_id')::uuid, trim(payload->>'customer_name'), payload->>'customer_phone', nullif(trim(payload->>'customer_email'),''), payload->>'zone', trim(payload->>'address'), trim(payload->>'description'), nullif(payload->>'preferred_date','')::date)
  returning * into result_row;
  return to_jsonb(result_row);
end;
$$;

create or replace function public.create_public_review(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result_row public.reviews;
begin
  if not exists(select 1 from public.services where id = (payload->>'service_id')::uuid and status = 'Active') then raise exception 'Servicio no disponible.'; end if;
  insert into public.reviews(service_id, customer_name, rating, comment)
  values ((payload->>'service_id')::uuid, trim(payload->>'customer_name'), (payload->>'rating')::integer, trim(payload->>'comment'))
  returning * into result_row;
  return to_jsonb(result_row);
end;
$$;

create or replace function public.create_public_payment(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result_row public.payments;
begin
  insert into public.payments(payer_name, payer_phone, reference_number, amount, proof_path, notes)
  values (trim(payload->>'payer_name'), payload->>'payer_phone', trim(payload->>'reference_number'), (payload->>'amount')::numeric, payload->>'proof_path', nullif(trim(payload->>'notes'),''))
  returning * into result_row;
  return to_jsonb(result_row);
exception when unique_violation then raise exception 'El número de referencia ya se encuentra registrado.';
end;
$$;

create or replace function public.create_public_quote(payload jsonb, quote_items_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare new_quote public.quotes; raw_item jsonb; item_price numeric; item_name text; running_subtotal numeric := 0; product_ref uuid; service_ref uuid;
begin
  if jsonb_typeof(quote_items_payload) <> 'array' or jsonb_array_length(quote_items_payload) = 0 then raise exception 'La cotización debe contener al menos un elemento.'; end if;
  if char_length(trim(coalesce(payload->>'customer_name',''))) < 2 then raise exception 'Ingrese un nombre válido.'; end if;
  if coalesce(payload->>'customer_phone','') !~ '^[0-9]{8}$' then raise exception 'El teléfono debe contener exactamente 8 dígitos.'; end if;
  if coalesce(payload->>'zone','') not in ('San Carlos','Río Cuarto','La Virgen de Sarapiquí','Santa Rosa') then raise exception 'Zona fuera de cobertura.'; end if;
  insert into public.quotes(customer_name, customer_phone, customer_email, zone, notes, additional_costs, valid_until, subtotal)
  values (trim(payload->>'customer_name'), payload->>'customer_phone', nullif(trim(payload->>'customer_email'),''), payload->>'zone', nullif(trim(payload->>'notes'),''), greatest(coalesce((payload->>'additional_costs')::numeric,0),0), coalesce(nullif(payload->>'valid_until','')::date,current_date+15), 0)
  returning * into new_quote;
  for raw_item in select * from jsonb_array_elements(quote_items_payload)
  loop
    if coalesce((raw_item->>'quantity')::integer,0) <= 0 then raise exception 'Todas las cantidades deben ser mayores que cero.'; end if;
    product_ref := null; service_ref := null;
    if raw_item->>'item_type' = 'Product' then
      product_ref := (raw_item->>'reference_id')::uuid;
      select name, sale_price into item_name, item_price from public.products where id = product_ref and status = 'Active';
    elsif raw_item->>'item_type' = 'Service' then
      service_ref := (raw_item->>'reference_id')::uuid;
      select name, base_price into item_name, item_price from public.services where id = service_ref and status = 'Active';
    else raise exception 'Tipo de elemento inválido.';
    end if;
    if item_name is null then raise exception 'Uno de los elementos ya no está disponible.'; end if;
    insert into public.quote_items(quote_id, item_type, product_id, service_id, description, quantity, unit_price)
    values (new_quote.id, raw_item->>'item_type', product_ref, service_ref, item_name, (raw_item->>'quantity')::integer, item_price);
    running_subtotal := running_subtotal + item_price * (raw_item->>'quantity')::integer;
  end loop;
  update public.quotes set subtotal = running_subtotal where id = new_quote.id returning * into new_quote;
  return to_jsonb(new_quote);
end;
$$;

create or replace function public.update_quote(p_quote_id uuid, payload jsonb, quote_items_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  current_quote public.quotes;
  result_quote public.quotes;
  existing_item public.quote_items;
  raw_item jsonb;
  normalized_item jsonb;
  normalized_items jsonb := '[]'::jsonb;
  item_price numeric;
  item_name text;
  item_quantity integer;
  running_subtotal numeric := 0;
  product_ref uuid;
  service_ref uuid;
  target_status text;
begin
  if not public.is_admin() then raise exception 'Acceso no autorizado.'; end if;
  select * into current_quote from public.quotes where id = p_quote_id for update;
  if not found then raise exception 'Cotización no encontrada.'; end if;
  if current_quote.status not in ('Draft', 'Sent') then raise exception 'Solo se pueden editar cotizaciones en Borrador o Enviada.'; end if;
  if jsonb_typeof(quote_items_payload) <> 'array' or jsonb_array_length(quote_items_payload) = 0 then raise exception 'La cotización debe contener al menos un elemento.'; end if;
  if char_length(trim(coalesce(payload->>'customer_name',''))) < 2 then raise exception 'Ingrese un nombre válido.'; end if;
  if coalesce(payload->>'customer_phone','') !~ '^[0-9]{8}$' then raise exception 'El teléfono debe contener exactamente 8 dígitos.'; end if;
  if coalesce(payload->>'zone','') not in ('San Carlos','Río Cuarto','La Virgen de Sarapiquí','Santa Rosa') then raise exception 'Zona fuera de cobertura.'; end if;
  if coalesce(nullif(payload->>'additional_costs','')::numeric, 0) < 0 then raise exception 'El costo adicional no puede ser negativo.'; end if;
  if nullif(payload->>'valid_until','')::date < current_date then raise exception 'La vigencia no puede quedar en el pasado.'; end if;
  target_status := coalesce(nullif(payload->>'status',''), current_quote.status);
  if target_status not in ('Draft','Sent','Approved','Rejected') then raise exception 'Estado de cotización inválido.'; end if;

  for raw_item in select * from jsonb_array_elements(quote_items_payload)
  loop
    item_quantity := coalesce((raw_item->>'quantity')::integer, 0);
    if item_quantity <= 0 then raise exception 'Todas las cantidades deben ser mayores que cero.'; end if;
    product_ref := null; service_ref := null; item_name := null; item_price := null;

    if nullif(raw_item->>'id','') is not null then
      select * into existing_item from public.quote_items
      where id = (raw_item->>'id')::uuid and quote_id = p_quote_id;
      if not found then raise exception 'Uno de los elementos originales no pertenece a la cotización.'; end if;
      item_name := existing_item.description;
      item_price := existing_item.unit_price;
      product_ref := existing_item.product_id;
      service_ref := existing_item.service_id;
      normalized_items := normalized_items || jsonb_build_array(jsonb_build_object(
        'item_type', existing_item.item_type, 'product_id', product_ref, 'service_id', service_ref,
        'description', item_name, 'quantity', item_quantity, 'unit_price', item_price
      ));
    else
      if raw_item->>'item_type' = 'Product' then
        product_ref := (raw_item->>'reference_id')::uuid;
        select name, sale_price into item_name, item_price from public.products where id = product_ref and status = 'Active';
      elsif raw_item->>'item_type' = 'Service' then
        service_ref := (raw_item->>'reference_id')::uuid;
        select name, base_price into item_name, item_price from public.services where id = service_ref and status = 'Active';
      else raise exception 'Tipo de elemento inválido.';
      end if;
      if item_name is null then raise exception 'Uno de los elementos nuevos ya no está disponible.'; end if;
      normalized_items := normalized_items || jsonb_build_array(jsonb_build_object(
        'item_type', raw_item->>'item_type', 'product_id', product_ref, 'service_id', service_ref,
        'description', item_name, 'quantity', item_quantity, 'unit_price', item_price
      ));
    end if;
  end loop;

  delete from public.quote_items where quote_id = p_quote_id;
  for normalized_item in select * from jsonb_array_elements(normalized_items)
  loop
    insert into public.quote_items(quote_id, item_type, product_id, service_id, description, quantity, unit_price)
    values (
      p_quote_id, normalized_item->>'item_type', nullif(normalized_item->>'product_id','')::uuid,
      nullif(normalized_item->>'service_id','')::uuid, normalized_item->>'description',
      (normalized_item->>'quantity')::integer, (normalized_item->>'unit_price')::numeric
    );
    running_subtotal := running_subtotal + (normalized_item->>'quantity')::integer * (normalized_item->>'unit_price')::numeric;
  end loop;

  update public.quotes set
    customer_name = trim(payload->>'customer_name'), customer_phone = payload->>'customer_phone',
    customer_email = nullif(trim(payload->>'customer_email'),''), zone = payload->>'zone',
    notes = nullif(trim(payload->>'notes'),''), subtotal = running_subtotal,
    additional_costs = coalesce(nullif(payload->>'additional_costs','')::numeric, 0),
    valid_until = coalesce(nullif(payload->>'valid_until','')::date, current_quote.valid_until), status = target_status
  where id = p_quote_id returning * into result_quote;
  return to_jsonb(result_quote);
end;
$$;

create or replace view public.public_catalog with (security_invoker = true) as
select p.id, p.sku, p.name, p.category_id, c.name as category_name, c.slug as category_slug,
       p.product_type, p.description, p.sale_price, p.stock_quantity, p.minimum_stock,
       p.availability_type, p.brand, p.btu, p.image_url, p.status
from public.products p join public.categories c on c.id = p.category_id
where p.status = 'Active' and c.status = 'Active';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('order-evidence', 'order-evidence', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

grant execute on function public.create_public_order(jsonb) to anon, authenticated;
grant execute on function public.create_public_quote(jsonb, jsonb) to anon, authenticated;
grant execute on function public.create_public_review(jsonb) to anon, authenticated;
grant execute on function public.create_public_payment(jsonb) to anon, authenticated;
grant execute on function public.update_quote(uuid, jsonb, jsonb) to authenticated;
