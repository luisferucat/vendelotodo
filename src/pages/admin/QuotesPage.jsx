import { useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, Minus, Plus, Search, Trash2 } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import LoadingScreen from '../../components/LoadingScreen'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { validateCustomer, zones } from '../../utils/validators'

const editableStatuses = ['Draft', 'Sent']

function quoteItems(quote) {
  return quote?.quote_items || quote?.items || []
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState(null)
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { show } = useToast()

  const load = () => Promise.all([dataService.getQuotes(), dataService.getProducts(), dataService.getServices()])
    .then(([quoteRows, productRows, serviceRows]) => {
      setQuotes(quoteRows)
      setProducts(productRows)
      setServices(serviceRows)
    })

  useEffect(() => { load() }, [])

  const options = useMemo(() => [
    ...products.map((item) => ({ id: item.id, name: item.name, price: item.sale_price, item_type: 'Product' })),
    ...services.map((item) => ({ id: item.id, name: item.name, price: item.base_price, item_type: 'Service' })),
  ], [products, services])

  const filtered = useMemo(() => (quotes || []).filter((item) =>
    `${item.quote_number} ${item.customer_name} ${item.customer_phone}`.toLowerCase().includes(search.toLowerCase()),
  ), [quotes, search])

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0)
  const total = subtotal + Number(form?.additional_costs || 0)

  const startEdit = (quote) => {
    if (!editableStatuses.includes(quote.status)) return
    setEditing(quote)
    setForm({
      customer_name: quote.customer_name || '', customer_phone: quote.customer_phone || '',
      customer_email: quote.customer_email || '', zone: quote.zone || '', notes: quote.notes || '',
      additional_costs: quote.additional_costs || 0, valid_until: quote.valid_until || '', status: quote.status,
    })
    setItems(quoteItems(quote).map((item) => ({
      id: item.id, item_type: item.item_type,
      reference_id: item.item_type === 'Product' ? item.product_id : item.service_id,
      description: item.description, quantity: item.quantity, unit_price: item.unit_price,
    })))
    setErrors({})
  }

  const closeEdit = () => { setEditing(null); setForm(null); setItems([]); setErrors({}) }

  const addItem = (value) => {
    const option = options.find((item) => `${item.item_type}:${item.id}` === value)
    if (!option) return
    setItems((current) => {
      const existing = current.find((item) => item.item_type === option.item_type && item.reference_id === option.id)
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: Number(item.quantity) + 1 } : item)
      return [...current, {
        item_type: option.item_type, reference_id: option.id, description: option.name,
        quantity: 1, unit_price: option.price,
      }]
    })
  }

  const changeQuantity = (index, value) => {
    if (value < 1) return
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: value } : item))
  }

  const save = async (event) => {
    event.preventDefault()
    const nextErrors = validateCustomer(form)
    if (!items.length) nextErrors.items = 'La cotización debe contener al menos un elemento.'
    if (Number(form.additional_costs) < 0) nextErrors.additional_costs = 'El costo adicional no puede ser negativo.'
    if (!form.valid_until || new Date(`${form.valid_until}T23:59:59`) < new Date()) nextErrors.valid_until = 'La vigencia no puede quedar en el pasado.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return show('Revise los campos marcados en la cotización.', 'error')
    setSaving(true)
    try {
      await dataService.updateQuote(editing.id, form, items)
      show('Cotización actualizada y total recalculado correctamente.')
      closeEdit()
      await load()
    } catch (error) {
      show(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!quotes) return <LoadingScreen />

  return (
    <>
      <PageHeader
        eyebrow="Estimaciones"
        title="Cotizaciones"
        description="Edite borradores y cotizaciones enviadas. Las aprobadas, rechazadas o vencidas quedan como solo lectura."
      />
      <div className="table-tools">
        <label className="search-box"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar número o cliente" /></label>
      </div>

      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Creación</th><th>Vigencia</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{filtered.map((quote) => (
              <tr key={quote.id}>
                <td><strong>{quote.quote_number}</strong></td>
                <td><strong>{quote.customer_name}</strong><small>{quote.customer_phone}</small></td>
                <td>{formatDate(quote.created_at)}</td>
                <td>{formatDate(quote.valid_until)}</td>
                <td><strong>{formatCurrency(quote.total)}</strong></td>
                <td><StatusBadge status={quote.status} /></td>
                <td><div className="row-actions labeled">
                  <button className="edit-action" onClick={() => setSelected(quote)}><Eye /> Detalle</button>
                  <button className="edit-action" onClick={() => startEdit(quote)} disabled={!editableStatuses.includes(quote.status)} title={editableStatuses.includes(quote.status) ? 'Editar cotización' : 'Esta cotización es de solo lectura'}><Edit3 /> Editar</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState text="No hay cotizaciones que coincidan con la búsqueda." />}

      <Modal open={Boolean(selected)} title={selected?.quote_number || 'Cotización'} onClose={() => setSelected(null)}>
        <dl className="detail-list">
          <div><dt>Cliente</dt><dd>{selected?.customer_name}</dd></div>
          <div><dt>Teléfono</dt><dd>{selected?.customer_phone}</dd></div>
          <div><dt>Zona</dt><dd>{selected?.zone || 'Sin zona'}</dd></div>
          <div><dt>Subtotal</dt><dd>{formatCurrency(selected?.subtotal)}</dd></div>
          <div><dt>Costos adicionales</dt><dd>{formatCurrency(selected?.additional_costs)}</dd></div>
          <div className="total"><dt>Total</dt><dd>{formatCurrency(selected?.total)}</dd></div>
        </dl>
        {quoteItems(selected).length > 0 && <div className="modal-item-list">{quoteItems(selected).map((item) => <div key={item.id || item.reference_id}><span>{item.quantity} × {item.description}</span><strong>{formatCurrency(item.quantity * item.unit_price)}</strong></div>)}</div>}
      </Modal>

      <Modal open={Boolean(editing)} title={`Editar ${editing?.quote_number || ''}`} onClose={closeEdit} size="large">
        {form && <form onSubmit={save} noValidate className="edit-quote-form">
          <div className="edit-quote-main">
            <section>
              <h3>Datos del cliente</h3>
              <div className="form-grid">
                <FormField label="Nombre completo" required error={errors.customer_name}><input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></FormField>
                <FormField label="Teléfono" required error={errors.customer_phone}><input inputMode="numeric" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value.replace(/\D/g, '').slice(0, 8) })} /></FormField>
                <FormField label="Correo" error={errors.customer_email}><input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></FormField>
                <FormField label="Zona" required error={errors.zone}><select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}><option value="">Seleccione</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></FormField>
                <FormField label="Notas"><textarea rows="3" maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
              </div>
            </section>

            <section>
              <h3>Artículos y servicios</h3>
              <select className="quote-add-select" defaultValue="" onChange={(e) => { addItem(e.target.value); e.target.value = '' }}>
                <option value="" disabled>Agregar un producto o servicio</option>
                <optgroup label="Productos">{options.filter((item) => item.item_type === 'Product').map((item) => <option key={`p-${item.id}`} value={`Product:${item.id}`}>{item.name} — {formatCurrency(item.price)}</option>)}</optgroup>
                <optgroup label="Servicios">{options.filter((item) => item.item_type === 'Service').map((item) => <option key={`s-${item.id}`} value={`Service:${item.id}`}>{item.name} — {formatCurrency(item.price)}</option>)}</optgroup>
              </select>
              {errors.items && <p className="field-error">{errors.items}</p>}
              <div className="quote-items">
                {items.map((item, index) => (
                  <div className="quote-item" key={item.id || `${item.item_type}-${item.reference_id}`}>
                    <div><strong>{item.description}</strong><small>{item.id ? 'Precio histórico conservado' : 'Elemento nuevo con precio vigente'} · {formatCurrency(item.unit_price)} c/u</small></div>
                    <div className="quantity-control"><button type="button" onClick={() => changeQuantity(index, Number(item.quantity) - 1)}><Minus /></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(index, Number(item.quantity) + 1)}><Plus /></button></div>
                    <strong>{formatCurrency(item.quantity * item.unit_price)}</strong>
                    <button className="danger-icon" type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Eliminar ${item.description}`}><Trash2 /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="edit-quote-summary">
            <h3>Resumen y estado</h3>
            <dl><div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div><div><dt>Adicionales</dt><dd>{formatCurrency(form.additional_costs)}</dd></div><div><dt>Total</dt><dd>{formatCurrency(total)}</dd></div></dl>
            <FormField label="Costos adicionales" error={errors.additional_costs}><input type="number" min="0" step="1" value={form.additional_costs} onChange={(e) => setForm({ ...form, additional_costs: e.target.value })} /></FormField>
            <FormField label="Válida hasta" required error={errors.valid_until}><input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></FormField>
            <FormField label="Estado"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="Draft">Borrador</option><option value="Sent">Enviada</option><option value="Approved">Aprobada — final</option><option value="Rejected">Rechazada — final</option></select></FormField>
            {['Approved', 'Rejected'].includes(form.status) && <p className="final-status-warning">Al guardar este estado, la cotización quedará como solo lectura.</p>}
          </aside>

          <div className="modal-actions"><button type="button" className="button button--outline" onClick={closeEdit}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar y recalcular'}</button></div>
        </form>}
      </Modal>
    </>
  )
}
