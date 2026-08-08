-- Ejecute después de schema.sql. Todas las tablas usan Row Level Security.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.product_suppliers enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.services enable row level security;
alter table public.service_orders enable row level security;
alter table public.order_evidence enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

-- Se eliminan antes para que el script pueda ejecutarse nuevamente.
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_public_select" on public.categories;
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_public_select" on public.categories for select to anon, authenticated using (status = 'Active' or public.is_admin());
create policy "categories_admin_all" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_public_select" on public.products;
drop policy if exists "products_admin_all" on public.products;
create policy "products_public_select" on public.products for select to anon, authenticated using (status = 'Active' or public.is_admin());
create policy "products_admin_all" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "suppliers_admin_all" on public.suppliers;
create policy "suppliers_admin_all" on public.suppliers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "product_suppliers_admin_all" on public.product_suppliers;
create policy "product_suppliers_admin_all" on public.product_suppliers for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "movements_admin_all" on public.inventory_movements;
create policy "movements_admin_all" on public.inventory_movements for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "services_public_select" on public.services;
drop policy if exists "services_admin_all" on public.services;
create policy "services_public_select" on public.services for select to anon, authenticated using (status = 'Active' or public.is_admin());
create policy "services_admin_all" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_all" on public.service_orders;
drop policy if exists "orders_technician_select" on public.service_orders;
drop policy if exists "orders_technician_update" on public.service_orders;
create policy "orders_admin_all" on public.service_orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders_technician_select" on public.service_orders for select to authenticated using (public.is_technician() and technician_id = auth.uid());
create policy "orders_technician_update" on public.service_orders for update to authenticated using (public.is_technician() and technician_id = auth.uid()) with check (public.is_technician() and technician_id = auth.uid());

drop policy if exists "evidence_admin_all" on public.order_evidence;
drop policy if exists "evidence_technician_select" on public.order_evidence;
drop policy if exists "evidence_technician_insert" on public.order_evidence;
create policy "evidence_admin_all" on public.order_evidence for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "evidence_technician_select" on public.order_evidence for select to authenticated using (
  public.is_technician() and exists(select 1 from public.service_orders o where o.id = order_id and o.technician_id = auth.uid())
);
create policy "evidence_technician_insert" on public.order_evidence for insert to authenticated with check (
  public.is_technician() and uploaded_by = auth.uid() and exists(select 1 from public.service_orders o where o.id = order_id and o.technician_id = auth.uid())
);

drop policy if exists "quotes_admin_all" on public.quotes;
drop policy if exists "quote_items_admin_all" on public.quote_items;
create policy "quotes_admin_all" on public.quotes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "quote_items_admin_all" on public.quote_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_public_approved" on public.reviews;
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_public_approved" on public.reviews for select to anon, authenticated using (moderation_status = 'Approved' or public.is_admin());
create policy "reviews_admin_all" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: el visitante solo sube comprobantes; únicamente administración puede leerlos.
drop policy if exists "payment_proofs_public_upload" on storage.objects;
drop policy if exists "payment_proofs_admin_read" on storage.objects;
create policy "payment_proofs_public_upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = 'public');
create policy "payment_proofs_admin_read" on storage.objects for select to authenticated using (bucket_id = 'payment-proofs' and public.is_admin());

-- Evidencias: la carpeta raíz debe ser el UUID de una orden asignada al técnico autenticado.
drop policy if exists "order_evidence_technician_upload" on storage.objects;
drop policy if exists "order_evidence_staff_read" on storage.objects;
create policy "order_evidence_technician_upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'order-evidence' and public.is_technician() and exists (
    select 1 from public.service_orders o where o.id::text = (storage.foldername(name))[1] and o.technician_id = auth.uid()
  )
);
create policy "order_evidence_staff_read" on storage.objects for select to authenticated using (
  bucket_id = 'order-evidence' and (public.is_admin() or exists (
    select 1 from public.service_orders o where o.id::text = (storage.foldername(name))[1] and o.technician_id = auth.uid()
  ))
);

grant usage on schema public to anon, authenticated;
grant select on public.public_catalog to anon, authenticated;
grant select on public.categories, public.products, public.services, public.reviews to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.record_inventory_movement(uuid, text, integer, text) to authenticated;

-- Las funciones públicas SECURITY DEFINER son la única vía anónima para crear datos de clientes.
revoke insert, update, delete on public.service_orders, public.quotes, public.quote_items, public.payments, public.reviews from anon;
