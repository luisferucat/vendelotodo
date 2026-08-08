import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  demoCategories, demoOrders, demoPayments, demoProducts, demoQuotes, demoReviews, demoServices,
} from '../data/demoData'

const demoKey = 'vendelotodo_demo_state'

const clone = (value) => JSON.parse(JSON.stringify(value))

function initialDemoState() {
  return {
    categories: clone(demoCategories), products: clone(demoProducts), services: clone(demoServices),
    reviews: clone(demoReviews), orders: clone(demoOrders), quotes: clone(demoQuotes), payments: clone(demoPayments),
    suppliers: [
      { id: 'sup-1', name: 'Distribuidora Norte QA', contact_name: 'Andrea Salas', phone: '88880001', email: 'norte@example.test', status: 'Active', offers: [{ id: 'off-1', supplier_cost: 32000, is_available: true, lead_time_days: 2, product: { id: 'prod-1', name: 'Taladro inalámbrico 20V', sku: 'FER-TAL-001' } }] },
      { id: 'sup-2', name: 'Repuestos Tropicales QA', contact_name: 'Miguel Rojas', phone: '88880002', email: 'tropicales@example.test', status: 'Active', offers: [{ id: 'off-2', supplier_cost: 7500, is_available: true, lead_time_days: 5, product: { id: 'prod-4', name: 'Capacitor para AC 35µF', sku: 'REP-CAP-035' } }] },
      { id: 'sup-3', name: 'Proveedor Inactivo QA', contact_name: 'Registro de límite', phone: '88880003', email: 'inactivo@example.test', status: 'Inactive', offers: [] },
    ],
    profiles: [
      { id: 'admin-1', full_name: 'Administrador QA', email: 'admin@vendelotodo.test', role: 'Administrator', status: 'Active' },
      { id: 'tech-1', full_name: 'Técnico Uno', email: 'tecnico1@vendelotodo.test', role: 'Technician', status: 'Active' },
      { id: 'tech-2', full_name: 'Técnico Dos', email: 'tecnico2@vendelotodo.test', role: 'Technician', status: 'Active' },
    ],
    movements: [],
  }
}

function getDemoState() {
  try {
    const saved = localStorage.getItem(demoKey)
    if (!saved) return initialDemoState()
    const defaults = initialDemoState()
    const parsed = JSON.parse(saved)
    const quotes = (parsed.quotes || defaults.quotes).map((quote) => {
      const base = defaults.quotes.find((item) => item.id === quote.id) || {}
      return { ...base, ...quote, quote_items: quote.quote_items || quote.items || base.quote_items || [] }
    })
    return { ...defaults, ...parsed, quotes }
  } catch {
    return initialDemoState()
  }
}

function saveDemoState(state) {
  localStorage.setItem(demoKey, JSON.stringify(state))
  return state
}

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const now = () => new Date().toISOString()

function unwrap(result) {
  if (result.error) throw result.error
  return result.data
}

export const dataService = {
  isDemo: !isSupabaseConfigured,

  resetDemo() {
    localStorage.removeItem(demoKey)
  },

  async getCategories() {
    if (!isSupabaseConfigured) return getDemoState().categories
    return unwrap(await supabase.from('categories').select('*').eq('status', 'Active').order('name'))
  },

  async getProducts({ includeInactive = false } = {}) {
    if (!isSupabaseConfigured) {
      const rows = getDemoState().products
      return includeInactive ? rows : rows.filter((item) => item.status === 'Active')
    }
    if (!includeInactive) {
      const rows = unwrap(await supabase.from('public_catalog').select('*').order('name'))
      return rows.map((row) => ({ ...row, category: { id: row.category_id, name: row.category_name, slug: row.category_slug } }))
    }
    return unwrap(await supabase.from('products').select('*, category:categories(id,name,slug)').order('name'))
  },

  async saveProduct(values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const category = state.categories.find((item) => item.id === values.category_id)
      if (values.id) {
        const index = state.products.findIndex((item) => item.id === values.id)
        state.products[index] = { ...state.products[index], ...values, category, updated_at: now() }
        saveDemoState(state)
        return state.products[index]
      }
      if (state.products.some((item) => item.sku.toLowerCase() === values.sku.toLowerCase())) throw new Error('El código del artículo ya se encuentra registrado.')
      const product = { ...values, id: uid('prod'), category, created_at: now() }
      state.products.push(product)
      saveDemoState(state)
      return product
    }
    const payload = { ...values }
    delete payload.id
    delete payload.category
    if (values.id) return unwrap(await supabase.from('products').update(payload).eq('id', values.id).select('*, category:categories(id,name,slug)').single())
    return unwrap(await supabase.from('products').insert(payload).select('*, category:categories(id,name,slug)').single())
  },

  async setProductStatus(id, status) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const product = state.products.find((item) => item.id === id)
      if (!product) throw new Error('Artículo no encontrado.')
      product.status = status
      saveDemoState(state)
      return product
    }
    return unwrap(await supabase.from('products').update({ status }).eq('id', id).select().single())
  },

  async recordMovement({ product_id, movement_type, quantity, reason }) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) throw new Error('La cantidad debe ser un número entero mayor que cero.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const product = state.products.find((item) => item.id === product_id)
      if (!product) throw new Error('Artículo no encontrado.')
      if (movement_type === 'Output' && Number(quantity) > product.stock_quantity) throw new Error('La salida no puede superar el stock disponible.')
      product.stock_quantity += movement_type === 'Input' ? Number(quantity) : -Number(quantity)
      state.movements.unshift({ id: uid('mov'), product_id, movement_type, quantity: Number(quantity), reason, created_at: now() })
      saveDemoState(state)
      return product
    }
    return unwrap(await supabase.rpc('record_inventory_movement', {
      p_product_id: product_id, p_movement_type: movement_type, p_quantity: Number(quantity), p_reason: reason,
    }))
  },

  async getServices() {
    if (!isSupabaseConfigured) return getDemoState().services.filter((item) => item.status === 'Active')
    return unwrap(await supabase.from('services').select('*').eq('status', 'Active').order('name'))
  },

  async createOrder(values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const service = state.services.find((item) => item.id === values.service_id)
      const order = {
        ...values, id: uid('ord'), order_number: `OT-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`,
        service_name: service?.name, service_type: service?.service_type, status: 'Pending', technician: null, created_at: now(),
      }
      state.orders.unshift(order)
      saveDemoState(state)
      return order
    }
    return unwrap(await supabase.rpc('create_public_order', { payload: values }))
  },

  async getOrders({ technicianId } = {}) {
    if (!isSupabaseConfigured) {
      const rows = getDemoState().orders
      return technicianId ? rows.filter((item) => item.technician?.id === technicianId) : rows
    }
    let query = supabase.from('service_orders').select('*, service:services(name,service_type), technician:profiles!service_orders_technician_id_fkey(id,full_name), evidence:order_evidence(id,file_path,notes,created_at)').order('created_at', { ascending: false })
    if (technicianId) query = query.eq('technician_id', technicianId)
    const rows = unwrap(await query)
    return rows.map((row) => ({ ...row, service_name: row.service?.name, service_type: row.service?.service_type }))
  },

  async updateOrder(id, values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const order = state.orders.find((item) => item.id === id)
      if (!order) throw new Error('Orden no encontrada.')
      const technician = values.technician_id ? state.profiles.find((item) => item.id === values.technician_id) : order.technician
      Object.assign(order, values, { technician: technician ? { id: technician.id, full_name: technician.full_name } : null, updated_at: now() })
      delete order.technician_id
      saveDemoState(state)
      return order
    }
    return unwrap(await supabase.from('service_orders').update(values).eq('id', id).select().single())
  },

  async uploadEvidence(orderId, file, notes = '') {
    if (!file) throw new Error('Seleccione una fotografía como evidencia.')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('La evidencia debe ser JPG, PNG o WEBP.')
    if (file.size > 8 * 1024 * 1024) throw new Error('La evidencia no puede superar 8 MB.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const order = state.orders.find((item) => item.id === orderId)
      if (!order) throw new Error('Orden no encontrada.')
      const evidence = { id: uid('evi'), file_path: file.name, notes, created_at: now() }
      order.evidence = [...(order.evidence || []), evidence]
      saveDemoState(state)
      return evidence
    }
    const path = `${orderId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    unwrap(await supabase.storage.from('order-evidence').upload(path, file))
    return unwrap(await supabase.from('order_evidence').insert({ order_id: orderId, file_path: path, notes }).select().single())
  },

  async getQuotes() {
    if (!isSupabaseConfigured) return getDemoState().quotes.map((quote) => ({ ...quote, quote_items: quote.quote_items || quote.items || [] }))
    return unwrap(await supabase.from('quotes').select('*, quote_items(*)').order('created_at', { ascending: false }))
  },

  async createQuote(values, items) {
    if (!items.length) throw new Error('La cotización debe contener al menos un elemento.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
      const quote = {
        ...values, id: uid('quo'), quote_number: `COT-${new Date().getFullYear()}-${String(state.quotes.length + 1).padStart(4, '0')}`,
        subtotal, total: subtotal + Number(values.additional_costs || 0), status: 'Sent',
        quote_items: items.map((item) => ({ ...item, id: uid('qitem'), product_id: item.item_type === 'Product' ? item.reference_id : null, service_id: item.item_type === 'Service' ? item.reference_id : null })),
        created_at: now(),
      }
      state.quotes.unshift(quote)
      saveDemoState(state)
      return quote
    }
    return unwrap(await supabase.rpc('create_public_quote', { payload: values, quote_items_payload: items }))
  },

  async updateQuote(id, values, items) {
    if (!items.length) throw new Error('La cotización debe contener al menos un elemento.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const quote = state.quotes.find((item) => item.id === id)
      if (!quote) throw new Error('Cotización no encontrada.')
      if (!['Draft', 'Sent'].includes(quote.status)) throw new Error('Solo se pueden editar cotizaciones en Borrador o Enviada.')
      const originalItems = quote.quote_items || quote.items || []
      const normalized = items.map((item) => {
        const existing = item.id ? originalItems.find((original) => original.id === item.id) : null
        if (existing) return { ...existing, quantity: Number(item.quantity) }
        const source = item.item_type === 'Product'
          ? state.products.find((product) => product.id === item.reference_id && product.status === 'Active')
          : state.services.find((service) => service.id === item.reference_id && service.status === 'Active')
        if (!source) throw new Error('Uno de los elementos ya no está disponible.')
        return {
          id: uid('qitem'), item_type: item.item_type,
          product_id: item.item_type === 'Product' ? source.id : null,
          service_id: item.item_type === 'Service' ? source.id : null,
          description: source.name, quantity: Number(item.quantity),
          unit_price: item.item_type === 'Product' ? source.sale_price : source.base_price,
        }
      })
      const subtotal = normalized.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
      Object.assign(quote, values, {
        additional_costs: Number(values.additional_costs || 0), subtotal,
        total: subtotal + Number(values.additional_costs || 0), quote_items: normalized, updated_at: now(),
      })
      delete quote.items
      saveDemoState(state)
      return quote
    }
    return unwrap(await supabase.rpc('update_quote', { p_quote_id: id, payload: values, quote_items_payload: items }))
  },

  async getReviews({ includeAll = false } = {}) {
    if (!isSupabaseConfigured) {
      const rows = getDemoState().reviews
      return includeAll ? rows : rows.filter((item) => item.moderation_status === 'Approved')
    }
    let query = supabase.from('reviews').select('*, service:services(name)').order('created_at', { ascending: false })
    if (!includeAll) query = query.eq('moderation_status', 'Approved')
    const rows = unwrap(await query)
    return rows.map((row) => ({ ...row, service_name: row.service?.name }))
  },

  async createReview(values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const service = state.services.find((item) => item.id === values.service_id)
      const review = { ...values, id: uid('rev'), service_name: service?.name, moderation_status: 'Pending', created_at: now() }
      state.reviews.unshift(review)
      saveDemoState(state)
      return review
    }
    return unwrap(await supabase.rpc('create_public_review', { payload: values }))
  },

  async moderateReview(id, moderation_status) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const review = state.reviews.find((item) => item.id === id)
      if (!review) throw new Error('Reseña no encontrada.')
      review.moderation_status = moderation_status
      saveDemoState(state)
      return review
    }
    return unwrap(await supabase.from('reviews').update({ moderation_status, moderated_at: now() }).eq('id', id).select().single())
  },

  async getPayments() {
    if (!isSupabaseConfigured) return getDemoState().payments
    return unwrap(await supabase.from('payments').select('*').order('created_at', { ascending: false }))
  },

  async createPayment(values, file) {
    if (!file) throw new Error('Adjunte el comprobante del pago.')
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(file.type)) throw new Error('El comprobante debe ser JPG, PNG o PDF.')
    if (file.size > 5 * 1024 * 1024) throw new Error('El comprobante no puede superar 5 MB.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const payment = { ...values, id: uid('pay'), status: 'Pending', proof_url: file.name, created_at: now() }
      state.payments.unshift(payment)
      saveDemoState(state)
      return payment
    }
    const path = `public/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    unwrap(await supabase.storage.from('payment-proofs').upload(path, file))
    return unwrap(await supabase.rpc('create_public_payment', { payload: { ...values, proof_path: path } }))
  },

  async updatePayment(id, status, rejection_reason = null) {
    if (status === 'Rejected' && !rejection_reason?.trim()) throw new Error('Debe indicar el motivo del rechazo.')
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const payment = state.payments.find((item) => item.id === id)
      if (!payment) throw new Error('Pago no encontrado.')
      Object.assign(payment, { status, rejection_reason })
      saveDemoState(state)
      return payment
    }
    return unwrap(await supabase.from('payments').update({ status, rejection_reason, reviewed_at: now() }).eq('id', id).select().single())
  },

  async getProfiles() {
    if (!isSupabaseConfigured) return getDemoState().profiles
    return unwrap(await supabase.from('profiles').select('*').order('full_name'))
  },

  async updateProfile(id, values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const profile = state.profiles.find((item) => item.id === id)
      Object.assign(profile, values)
      saveDemoState(state)
      return profile
    }
    return unwrap(await supabase.from('profiles').update(values).eq('id', id).select().single())
  },

  async getSuppliers() {
    if (!isSupabaseConfigured) return getDemoState().suppliers
    const rows = unwrap(await supabase.from('suppliers').select('*, offers:product_suppliers(supplier_cost,is_available,lead_time_days,product:products(id,name,sku))').order('name'))
    return rows
  },

  async saveSupplier(values) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      if (state.suppliers.some((item) => item.id !== values.id && item.name.toLowerCase() === values.name.toLowerCase())) throw new Error('Ya existe un proveedor con ese nombre.')
      if (values.id) {
        const supplier = state.suppliers.find((item) => item.id === values.id)
        Object.assign(supplier, values, { updated_at: now() })
        saveDemoState(state)
        return supplier
      }
      const supplier = { ...values, id: uid('sup'), status: 'Active', offers: [], created_at: now() }
      state.suppliers.push(supplier)
      saveDemoState(state)
      return supplier
    }
    const payload = { ...values }; delete payload.id; delete payload.offers
    if (values.id) return unwrap(await supabase.from('suppliers').update(payload).eq('id', values.id).select().single())
    return unwrap(await supabase.from('suppliers').insert(payload).select().single())
  },

  async setSupplierStatus(id, status) {
    if (!isSupabaseConfigured) {
      const state = getDemoState()
      const supplier = state.suppliers.find((item) => item.id === id)
      if (!supplier) throw new Error('Proveedor no encontrado.')
      supplier.status = status
      saveDemoState(state)
      return supplier
    }
    return unwrap(await supabase.from('suppliers').update({ status }).eq('id', id).select().single())
  },
}
