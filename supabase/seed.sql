-- Datos reproducibles orientados a QA.
-- Orden recomendado: schema.sql -> policies.sql -> npm run create:test-users -> seed.sql

insert into public.categories (id, name, slug, status) values
('10000000-0000-0000-0000-000000000001','Ferretería','ferreteria','Active'),
('10000000-0000-0000-0000-000000000002','Electrodomésticos','electrodomesticos','Active'),
('10000000-0000-0000-0000-000000000003','Repuestos','repuestos','Active'),
('10000000-0000-0000-0000-000000000004','Aire acondicionado','aire-acondicionado','Active')
on conflict (id) do update set name=excluded.name, slug=excluded.slug, status=excluded.status;

insert into public.products (id, sku, name, category_id, product_type, description, sale_price, cost_price, stock_quantity, minimum_stock, availability_type, brand, btu, status) values
('20000000-0000-0000-0000-000000000001','FER-TAL-001','Taladro inalámbrico 20V','10000000-0000-0000-0000-000000000001','Tool','Taladro compacto con batería y cargador.',45900,32000,10,3,'InStock',null,null,'Active'),
('20000000-0000-0000-0000-000000000002','FER-PVC-012','Tubo PVC 1/2 pulgada','10000000-0000-0000-0000-000000000001','Product','Tubo PVC para instalaciones domésticas.',2850,1600,3,3,'InStock',null,null,'Active'),
('20000000-0000-0000-0000-000000000003','FER-LLA-008','Llave ajustable 8 pulgadas','10000000-0000-0000-0000-000000000001','Tool','Llave de acero cromado.',8900,5200,0,2,'InStock',null,null,'Active'),
('20000000-0000-0000-0000-000000000004','REP-CAP-035','Capacitor para AC 35µF','10000000-0000-0000-0000-000000000003','SparePart','Repuesto disponible por encargo.',12500,7500,0,1,'OnRequest',null,null,'Active'),
('20000000-0000-0000-0000-000000000005','ELE-ARR-006','Olla arrocera 6 tazas','10000000-0000-0000-0000-000000000002','Appliance','Olla arrocera compacta con función de mantener caliente.',24900,17500,7,2,'InStock','HomeCook',null,'Active'),
('20000000-0000-0000-0000-000000000006','ELE-AIR-042','Freidora de aire 4.2 L','10000000-0000-0000-0000-000000000002','Appliance','Control digital y canasta antiadherente.',49900,36500,2,2,'InStock','HomeCook',null,'Active'),
('20000000-0000-0000-0000-000000000007','AC-INV-012','AC inverter 12.000 BTU','10000000-0000-0000-0000-000000000004','AirConditioner','Equipo inverter de alta eficiencia para espacios pequeños.',285000,225000,4,1,'InStock','EcoBreeze',12000,'Active'),
('20000000-0000-0000-0000-000000000008','AC-INV-018','AC inverter 18.000 BTU','10000000-0000-0000-0000-000000000004','AirConditioner','Climatización eficiente para salas y oficinas.',389000,312000,0,1,'OnRequest','EcoBreeze',18000,'Active'),
('20000000-0000-0000-0000-000000000009','QA-INACTIVE-001','Producto antiguo QA','10000000-0000-0000-0000-000000000001','Product','Registro inactivo que no debe mostrarse públicamente.',5000,3000,5,2,'InStock',null,null,'Inactive')
on conflict (id) do update set sku=excluded.sku, name=excluded.name, category_id=excluded.category_id, product_type=excluded.product_type, description=excluded.description, sale_price=excluded.sale_price, cost_price=excluded.cost_price, stock_quantity=excluded.stock_quantity, minimum_stock=excluded.minimum_stock, availability_type=excluded.availability_type, brand=excluded.brand, btu=excluded.btu, status=excluded.status;

insert into public.suppliers (id, name, contact_name, phone, email, status) values
('30000000-0000-0000-0000-000000000001','Distribuidora Norte QA','Andrea Salas','88880001','norte@example.test','Active'),
('30000000-0000-0000-0000-000000000002','Repuestos Tropicales QA','Miguel Rojas','88880002','tropicales@example.test','Active'),
('30000000-0000-0000-0000-000000000003','Proveedor Inactivo QA','Registro de límite','88880003','inactivo@example.test','Inactive')
on conflict (id) do update set name=excluded.name, contact_name=excluded.contact_name, phone=excluded.phone, email=excluded.email, status=excluded.status;

insert into public.product_suppliers (product_id, supplier_id, supplier_sku, supplier_cost, is_available, lead_time_days) values
('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','DN-TAL-20',32000,true,2),
('20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','RT-CAP-35',7500,true,5),
('20000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001','DN-AC-18',312000,false,10)
on conflict (product_id, supplier_id) do update set supplier_sku=excluded.supplier_sku, supplier_cost=excluded.supplier_cost, is_available=excluded.is_available, lead_time_days=excluded.lead_time_days;

insert into public.services (id, name, service_type, description, base_price, status) values
('40000000-0000-0000-0000-000000000001','Fontanería residencial','Handyman','Reparación de fugas, grifería y tuberías.',18000,'Active'),
('40000000-0000-0000-0000-000000000002','Electricidad básica','Handyman','Tomas, luminarias y diagnóstico eléctrico.',22000,'Active'),
('40000000-0000-0000-0000-000000000003','Instalación rápida','Handyman','Instalación de repisas, televisores y accesorios.',15000,'Active'),
('40000000-0000-0000-0000-000000000004','Instalación de aire acondicionado','ACInstallation','Instalación estándar de equipo split.',85000,'Active'),
('40000000-0000-0000-0000-000000000005','Reparación de aire acondicionado','ACRepair','Visita diagnóstica y reparación cotizada.',25000,'Active'),
('40000000-0000-0000-0000-000000000006','Reparación de electrodoméstico','ApplianceRepair','Diagnóstico de pequeño electrodoméstico.',12000,'Active')
on conflict (id) do update set name=excluded.name, service_type=excluded.service_type, description=excluded.description, base_price=excluded.base_price, status=excluded.status;

-- Crea perfiles para usuarios que ya existan en Supabase Auth.
insert into public.profiles (id, full_name, email, role, status)
select id,
  case email when 'admin@vendelotodo.test' then 'Administrador QA' when 'tecnico1@vendelotodo.test' then 'Técnico Uno' else 'Técnico Dos' end,
  email,
  case when email = 'admin@vendelotodo.test' then 'Administrator' else 'Technician' end,
  'Active'
from auth.users where email in ('admin@vendelotodo.test','tecnico1@vendelotodo.test','tecnico2@vendelotodo.test')
on conflict (id) do update set full_name=excluded.full_name, email=excluded.email, role=excluded.role, status=excluded.status;

insert into public.service_orders (id, order_number, service_id, customer_name, customer_phone, customer_email, zone, address, description, preferred_date, technician_id, scheduled_at, status, completed_at, created_at) values
('50000000-0000-0000-0000-000000000001','OT-2026-0001','40000000-0000-0000-0000-000000000001','Ana Rodríguez','88881111','ana@example.test','San Carlos','Barrio El Carmen, casa azul','Fuga debajo del fregadero',current_date + 2,null,null,'Pending',null,now()-interval '6 days'),
('50000000-0000-0000-0000-000000000002','OT-2026-0002','40000000-0000-0000-0000-000000000004','José Vargas','87772222','jose@example.test','Río Cuarto','Frente a la escuela central','Instalar aire de doce mil BTU',current_date + 3,(select id from public.profiles where email='tecnico1@vendelotodo.test'),now()+interval '3 days','Assigned',null,now()-interval '5 days'),
('50000000-0000-0000-0000-000000000003','OT-2026-0003','40000000-0000-0000-0000-000000000002','Laura Jiménez','86663333','laura@example.test','Santa Rosa','Doscientos metros norte del salón comunal','Revisar tomacorriente que produce chispas',current_date,(select id from public.profiles where email='tecnico2@vendelotodo.test'),now()+interval '2 hours','OnTheWay',null,now()-interval '4 days'),
('50000000-0000-0000-0000-000000000004','OT-2026-0004','40000000-0000-0000-0000-000000000005','Pedro Mora','85554444','pedro@example.test','La Virgen de Sarapiquí','Contiguo al supermercado principal','El aire acondicionado enciende pero no enfría',current_date,(select id from public.profiles where email='tecnico1@vendelotodo.test'),now()-interval '1 hour','InProgress',null,now()-interval '3 days'),
('50000000-0000-0000-0000-000000000005','OT-2026-0005','40000000-0000-0000-0000-000000000003','Sofía Solís','84445555','sofia@example.test','San Carlos','Urbanización La Arboleda, casa nueve','Instalación segura de una repisa grande',current_date-3,(select id from public.profiles where email='tecnico2@vendelotodo.test'),now()-interval '3 days','Completed',now()-interval '3 days',now()-interval '7 days')
on conflict (order_number) do update set technician_id=excluded.technician_id, scheduled_at=excluded.scheduled_at;

insert into public.quotes (id, quote_number, customer_name, customer_phone, customer_email, zone, notes, subtotal, additional_costs, valid_until, status, created_at) values
('60000000-0000-0000-0000-000000000001','COT-2026-0001','Mario Segura','83331111','mario@example.test','San Carlos','Incluye visita local.',32250,5000,current_date+10,'Sent',now()-interval '2 days'),
('60000000-0000-0000-0000-000000000002','COT-2026-0002','Elena Campos','82221111','elena@example.test','Río Cuarto','Equipo e instalación.',285000,85000,current_date+12,'Draft',now()-interval '1 day')
on conflict (quote_number) do nothing;

insert into public.quote_items (id, quote_id, item_type, product_id, service_id, description, quantity, unit_price) values
('61000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Product','20000000-0000-0000-0000-000000000002',null,'Tubo PVC 1/2 pulgada',5,2850),
('61000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','Service',null,'40000000-0000-0000-0000-000000000001','Fontanería residencial',1,18000),
('61000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000002','Product','20000000-0000-0000-0000-000000000007',null,'AC inverter 12.000 BTU',1,285000)
on conflict (id) do nothing;

insert into public.payments (id, payer_name, payer_phone, reference_number, amount, proof_path, notes, status, rejection_reason, created_at) values
('70000000-0000-0000-0000-000000000001','Ana Rodríguez','88881111','SINPE-QA-001',18000,'qa/comprobante-pendiente.png','Caso QA pendiente.','Pending',null,now()-interval '1 day'),
('70000000-0000-0000-0000-000000000002','José Vargas','87772222','SINPE-QA-002',85000,'qa/comprobante-confirmado.png','Caso QA confirmado.','Confirmed',null,now()-interval '2 days'),
('70000000-0000-0000-0000-000000000003','Caso Rechazado','86663333','SINPE-QA-003',25000,'qa/comprobante-rechazado.pdf','Caso QA rechazado.','Rejected','El comprobante no coincide con el monto indicado.',now()-interval '3 days')
on conflict (reference_number) do nothing;

insert into public.reviews (id, service_id, customer_name, rating, comment, moderation_status, created_at) values
('80000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','María G.',5,'Llegaron puntuales y resolvieron la fuga el mismo día.','Approved',now()-interval '20 days'),
('80000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000004','Carlos R.',4,'La instalación quedó muy ordenada y el equipo funciona perfecto.','Approved',now()-interval '15 days'),
('80000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','Reseña pendiente QA',3,'Esta reseña no debe aparecer en el sitio público.','Pending',now()-interval '2 days')
on conflict (id) do nothing;

select setval('public.order_number_seq', 100, true);
select setval('public.quote_number_seq', 100, true);
