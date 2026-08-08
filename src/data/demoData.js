export const demoCategories = [
  { id: 'cat-1', name: 'Ferretería', slug: 'ferreteria' },
  { id: 'cat-2', name: 'Electrodomésticos', slug: 'electrodomesticos' },
  { id: 'cat-3', name: 'Repuestos', slug: 'repuestos' },
  { id: 'cat-4', name: 'Aire acondicionado', slug: 'aire-acondicionado' },
]

export const demoProducts = [
  { id: 'prod-1', sku: 'FER-TAL-001', name: 'Taladro inalámbrico 20V', category_id: 'cat-1', category: demoCategories[0], product_type: 'Tool', description: 'Taladro compacto con batería y cargador.', sale_price: 45900, cost_price: 32000, stock_quantity: 10, minimum_stock: 3, availability_type: 'InStock', status: 'Active', image_url: '' },
  { id: 'prod-2', sku: 'FER-PVC-012', name: 'Tubo PVC 1/2 pulgada', category_id: 'cat-1', category: demoCategories[0], product_type: 'Product', description: 'Tubo PVC para instalaciones domésticas.', sale_price: 2850, cost_price: 1600, stock_quantity: 3, minimum_stock: 3, availability_type: 'InStock', status: 'Active', image_url: '' },
  { id: 'prod-3', sku: 'FER-LLA-008', name: 'Llave ajustable 8 pulgadas', category_id: 'cat-1', category: demoCategories[0], product_type: 'Tool', description: 'Llave de acero cromado.', sale_price: 8900, cost_price: 5200, stock_quantity: 0, minimum_stock: 2, availability_type: 'InStock', status: 'Active', image_url: '' },
  { id: 'prod-4', sku: 'REP-CAP-035', name: 'Capacitor para AC 35µF', category_id: 'cat-3', category: demoCategories[2], product_type: 'SparePart', description: 'Repuesto disponible por encargo.', sale_price: 12500, cost_price: 7500, stock_quantity: 0, minimum_stock: 1, availability_type: 'OnRequest', status: 'Active', image_url: '' },
  { id: 'prod-5', sku: 'ELE-ARR-006', name: 'Olla arrocera 6 tazas', category_id: 'cat-2', category: demoCategories[1], product_type: 'Appliance', description: 'Olla arrocera compacta con función de mantener caliente.', sale_price: 24900, cost_price: 17500, stock_quantity: 7, minimum_stock: 2, availability_type: 'InStock', status: 'Active', image_url: '' },
  { id: 'prod-6', sku: 'ELE-AIR-042', name: 'Freidora de aire 4.2 L', category_id: 'cat-2', category: demoCategories[1], product_type: 'Appliance', description: 'Control digital y canasta antiadherente.', sale_price: 49900, cost_price: 36500, stock_quantity: 2, minimum_stock: 2, availability_type: 'InStock', status: 'Active', image_url: '' },
  { id: 'prod-7', sku: 'AC-INV-012', name: 'AC inverter 12.000 BTU', category_id: 'cat-4', category: demoCategories[3], product_type: 'AirConditioner', description: 'Equipo inverter de alta eficiencia para espacios pequeños.', sale_price: 285000, cost_price: 225000, stock_quantity: 4, minimum_stock: 1, availability_type: 'InStock', status: 'Active', btu: 12000, brand: 'EcoBreeze', image_url: '' },
  { id: 'prod-8', sku: 'AC-INV-018', name: 'AC inverter 18.000 BTU', category_id: 'cat-4', category: demoCategories[3], product_type: 'AirConditioner', description: 'Climatización eficiente para salas y oficinas.', sale_price: 389000, cost_price: 312000, stock_quantity: 0, minimum_stock: 1, availability_type: 'OnRequest', status: 'Active', btu: 18000, brand: 'EcoBreeze', image_url: '' },
  { id: 'prod-9', sku: 'QA-INACTIVE-001', name: 'Producto antiguo QA', category_id: 'cat-1', category: demoCategories[0], product_type: 'Product', description: 'Registro inactivo que no debe mostrarse públicamente.', sale_price: 5000, cost_price: 3000, stock_quantity: 5, minimum_stock: 2, availability_type: 'InStock', status: 'Inactive', image_url: '' },
]

export const demoServices = [
  { id: 'svc-1', name: 'Fontanería residencial', service_type: 'Handyman', description: 'Reparación de fugas, grifería y tuberías.', base_price: 18000, status: 'Active' },
  { id: 'svc-2', name: 'Electricidad básica', service_type: 'Handyman', description: 'Tomas, luminarias y diagnóstico eléctrico.', base_price: 22000, status: 'Active' },
  { id: 'svc-3', name: 'Instalación rápida', service_type: 'Handyman', description: 'Instalación de repisas, televisores y accesorios.', base_price: 15000, status: 'Active' },
  { id: 'svc-4', name: 'Instalación de aire acondicionado', service_type: 'ACInstallation', description: 'Instalación estándar de equipo split.', base_price: 85000, status: 'Active' },
  { id: 'svc-5', name: 'Reparación de aire acondicionado', service_type: 'ACRepair', description: 'Visita diagnóstica y reparación cotizada.', base_price: 25000, status: 'Active' },
  { id: 'svc-6', name: 'Reparación de electrodoméstico', service_type: 'ApplianceRepair', description: 'Diagnóstico de pequeño electrodoméstico.', base_price: 12000, status: 'Active' },
]

export const demoReviews = [
  { id: 'rev-1', customer_name: 'María G.', rating: 5, comment: 'Llegaron puntuales y resolvieron la fuga el mismo día.', service_name: 'Fontanería residencial', moderation_status: 'Approved', created_at: '2026-07-15T14:00:00Z' },
  { id: 'rev-2', customer_name: 'Carlos R.', rating: 4, comment: 'La instalación quedó muy ordenada y el equipo funciona perfecto.', service_name: 'Instalación de aire acondicionado', moderation_status: 'Approved', created_at: '2026-07-20T14:00:00Z' },
  { id: 'rev-3', customer_name: 'Reseña pendiente QA', rating: 3, comment: 'Esta reseña no debe aparecer en el sitio público.', service_name: 'Electricidad básica', moderation_status: 'Pending', created_at: '2026-08-01T14:00:00Z' },
]

export const demoOrders = [
  { id: 'ord-1', order_number: 'OT-2026-0001', customer_name: 'Ana Rodríguez', customer_phone: '88881111', zone: 'San Carlos', address: 'Barrio El Carmen, casa azul', description: 'Fuga debajo del fregadero', service_type: 'Handyman', service_name: 'Fontanería residencial', status: 'Pending', scheduled_at: null, technician: null, created_at: '2026-08-01T15:00:00Z' },
  { id: 'ord-2', order_number: 'OT-2026-0002', customer_name: 'José Vargas', customer_phone: '87772222', zone: 'Río Cuarto', address: 'Frente a la escuela', description: 'Instalar aire de 12.000 BTU', service_type: 'ACInstallation', service_name: 'Instalación de aire acondicionado', status: 'Assigned', scheduled_at: '2026-08-09T14:00:00Z', technician: { id: 'tech-1', full_name: 'Técnico Uno' }, created_at: '2026-08-02T15:00:00Z' },
  { id: 'ord-3', order_number: 'OT-2026-0003', customer_name: 'Laura Jiménez', customer_phone: '86663333', zone: 'Santa Rosa', address: '200 m norte del salón comunal', description: 'Revisar tomacorriente con chispa', service_type: 'Handyman', service_name: 'Electricidad básica', status: 'OnTheWay', scheduled_at: '2026-08-08T16:00:00Z', technician: { id: 'tech-2', full_name: 'Técnico Dos' }, created_at: '2026-08-03T15:00:00Z' },
  { id: 'ord-4', order_number: 'OT-2026-0004', customer_name: 'Pedro Mora', customer_phone: '85554444', zone: 'La Virgen de Sarapiquí', address: 'Contiguo al supermercado', description: 'AC no enfría', service_type: 'ACRepair', service_name: 'Reparación de aire acondicionado', status: 'InProgress', scheduled_at: '2026-08-08T13:00:00Z', technician: { id: 'tech-1', full_name: 'Técnico Uno' }, created_at: '2026-08-04T15:00:00Z' },
  { id: 'ord-5', order_number: 'OT-2026-0005', customer_name: 'Sofía Solís', customer_phone: '84445555', zone: 'San Carlos', address: 'Urbanización La Arboleda', description: 'Instalación de repisa', service_type: 'Handyman', service_name: 'Instalación rápida', status: 'Completed', scheduled_at: '2026-08-05T14:00:00Z', technician: { id: 'tech-2', full_name: 'Técnico Dos' }, created_at: '2026-08-04T10:00:00Z' },
]

export const demoQuotes = [
  { id: 'quo-1', quote_number: 'COT-2026-0001', customer_name: 'Mario Segura', customer_phone: '83331111', customer_email: 'mario@example.test', zone: 'San Carlos', notes: 'Incluye visita local.', status: 'Sent', subtotal: 32250, additional_costs: 5000, total: 37250, valid_until: '2026-08-20', created_at: '2026-08-05T10:00:00Z', quote_items: [
    { id: 'qitem-1', item_type: 'Product', product_id: 'prod-2', service_id: null, description: 'Tubo PVC 1/2 pulgada', quantity: 5, unit_price: 2850 },
    { id: 'qitem-2', item_type: 'Service', product_id: null, service_id: 'svc-1', description: 'Fontanería residencial', quantity: 1, unit_price: 18000 },
  ] },
  { id: 'quo-2', quote_number: 'COT-2026-0002', customer_name: 'Elena Campos', customer_phone: '82221111', customer_email: 'elena@example.test', zone: 'Río Cuarto', notes: 'Equipo e instalación.', status: 'Draft', subtotal: 285000, additional_costs: 85000, total: 370000, valid_until: '2026-08-22', created_at: '2026-08-06T10:00:00Z', quote_items: [
    { id: 'qitem-3', item_type: 'Product', product_id: 'prod-7', service_id: null, description: 'AC inverter 12.000 BTU', quantity: 1, unit_price: 285000 },
  ] },
]

export const demoPayments = [
  { id: 'pay-1', reference_number: 'SINPE-QA-001', payer_name: 'Ana Rodríguez', amount: 18000, status: 'Pending', proof_url: '', created_at: '2026-08-05T12:00:00Z' },
  { id: 'pay-2', reference_number: 'SINPE-QA-002', payer_name: 'José Vargas', amount: 85000, status: 'Confirmed', proof_url: '', created_at: '2026-08-04T12:00:00Z' },
  { id: 'pay-3', reference_number: 'SINPE-QA-003', payer_name: 'Caso rechazado QA', amount: 25000, status: 'Rejected', rejection_reason: 'El comprobante no coincide con el monto indicado.', proof_url: '', created_at: '2026-08-03T12:00:00Z' },
]
