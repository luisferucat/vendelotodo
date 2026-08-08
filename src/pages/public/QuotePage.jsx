import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Minus, Plus, ReceiptText, Trash2 } from 'lucide-react'
import FormField from '../../components/FormField'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { emailService } from '../../services/emailService'
import { formatCurrency } from '../../utils/formatters'
import { validateCustomer, zones } from '../../utils/validators'

const validDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 15)
  return date.toISOString().slice(0, 10)
}

const emptyForm = () => ({
  customer_name: '', customer_phone: '', customer_email: '', zone: '', notes: '',
  additional_costs: 0, valid_until: validDate(),
})

export default function QuotePage() {
  const [catalog, setCatalog] = useState([])
  const [services, setServices] = useState([])
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [sending, setSending] = useState(false)
  const { show } = useToast()

  useEffect(() => {
    Promise.all([dataService.getProducts(), dataService.getServices()])
      .then(([products, availableServices]) => {
        setCatalog(products)
        setServices(availableServices)
      })
  }, [])

  const options = useMemo(() => [
    ...catalog.map((item) => ({ id: item.id, name: item.name, price: item.sale_price, item_type: 'Product' })),
    ...services.map((item) => ({ id: item.id, name: item.name, price: item.base_price, item_type: 'Service' })),
  ], [catalog, services])

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const total = subtotal + Number(form.additional_costs || 0)

  const add = (value) => {
    const option = options.find((item) => `${item.item_type}:${item.id}` === value)
    if (!option) return
    setItems((current) => {
      const existing = current.find((item) => item.reference_id === option.id && item.item_type === option.item_type)
      return existing
        ? current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, {
          reference_id: option.id, item_type: option.item_type, description: option.name,
          quantity: 1, unit_price: option.price,
        }]
    })
  }

  const quantity = (index, next) => {
    if (next < 1) return
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: next } : item))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateCustomer(form, { requireEmail: true })
    if (!items.length) nextErrors.items = 'Agregue al menos un producto o servicio.'
    if (Number(form.additional_costs) < 0) nextErrors.additional_costs = 'El costo adicional no puede ser negativo.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return show('Revise los datos de la cotización.', 'error')

    setSending(true)
    try {
      const quote = await dataService.createQuote(form, items)
      const confirmation = {
        ...form,
        ...quote,
        subtotal: Number(quote.subtotal ?? subtotal),
        total: Number(quote.total ?? total),
        items,
      }
      let emailStatus = 'sent'
      try {
        const emailResult = await emailService.sendQuoteConfirmation(confirmation)
        if (emailResult.skipped) emailStatus = 'skipped'
      } catch (emailError) {
        console.error('No fue posible enviar la confirmación de cotización:', emailError)
        emailStatus = 'failed'
      }

      setResult({ ...confirmation, email_status: emailStatus, confirmation_email: form.customer_email })
      if (emailStatus === 'sent') show('Cotización generada y confirmación enviada.')
      else if (emailStatus === 'failed') show('La cotización se guardó, pero el correo no pudo enviarse.', 'error')
      else show('Cotización generada correctamente en modo local.')
    } catch (error) {
      show(error.message, 'error')
    } finally {
      setSending(false)
    }
  }

  if (result) {
    return (
      <section className="page-section narrow">
        <div className="success-panel">
          <CheckCircle2 />
          <p className="eyebrow">Cotización generada</p>
          <h1>{result.quote_number}</h1>
          <p>Total estimado</p>
          <strong className="detail-price">{formatCurrency(result.total)}</strong>
          {result.email_status === 'sent' && <p>Enviamos la confirmación a <strong>{result.confirmation_email}</strong>.</p>}
          {result.email_status === 'failed' && <p><strong>La cotización quedó registrada, pero el correo no pudo enviarse.</strong> Puede conservar este número como comprobante.</p>}
          {result.email_status === 'skipped' && <p>En modo local no se envían correos. El envío se realizará desde el sitio publicado.</p>}
          <p>Válida hasta el {new Date(`${result.valid_until}T12:00:00`).toLocaleDateString('es-CR')}. Esta estimación no constituye un cobro ni una reserva automática.</p>
          <button className="button button--primary" type="button" onClick={() => {
            setResult(null)
            setItems([])
            setForm(emptyForm())
          }}>Crear otra cotización</button>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="page-hero compact">
        <p className="eyebrow">Estimación en línea</p>
        <h1>Arme su cotización</h1>
        <p>Combine artículos y servicios. Los precios no pueden modificarse manualmente y el total se recalcula al instante.</p>
      </div>
      <form className="quote-layout" onSubmit={submit} noValidate>
        <div className="quote-builder">
          <section className="form-card">
            <h2>1. Agregue elementos</h2>
            <select defaultValue="" onChange={(event) => { add(event.target.value); event.target.value = '' }}>
              <option value="" disabled>Seleccione producto o servicio</option>
              <optgroup label="Productos">
                {options.filter((item) => item.item_type === 'Product').map((item) => <option key={`p-${item.id}`} value={`Product:${item.id}`}>{item.name} — {formatCurrency(item.price)}</option>)}
              </optgroup>
              <optgroup label="Servicios">
                {options.filter((item) => item.item_type === 'Service').map((item) => <option key={`s-${item.id}`} value={`Service:${item.id}`}>{item.name} — {formatCurrency(item.price)}</option>)}
              </optgroup>
            </select>
            {errors.items && <p className="field-error">{errors.items}</p>}
            <div className="quote-items">
              {items.length === 0
                ? <div className="quote-empty"><ReceiptText /><span>La cotización está vacía.</span></div>
                : items.map((item, index) => (
                  <div className="quote-item" key={`${item.item_type}-${item.reference_id}`}>
                    <div><strong>{item.description}</strong><small>{item.item_type === 'Product' ? 'Producto' : 'Servicio'} · {formatCurrency(item.unit_price)} c/u</small></div>
                    <div className="quantity-control">
                      <button type="button" onClick={() => quantity(index, item.quantity - 1)} aria-label={`Reducir cantidad de ${item.description}`}><Minus /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => quantity(index, item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.description}`}><Plus /></button>
                    </div>
                    <strong>{formatCurrency(item.quantity * item.unit_price)}</strong>
                    <button className="danger-icon" type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Eliminar ${item.description}`}><Trash2 /></button>
                  </div>
                ))}
            </div>
          </section>

          <section className="form-card">
            <h2>2. Sus datos</h2>
            <div className="form-grid">
              <FormField label="Nombre completo" required error={errors.customer_name}><input value={form.customer_name} maxLength={120} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></FormField>
              <FormField label="Teléfono" required error={errors.customer_phone}><input inputMode="numeric" value={form.customer_phone} onChange={(event) => setForm({ ...form, customer_phone: event.target.value.replace(/\D/g, '').slice(0, 8) })} /></FormField>
              <FormField label="Correo" required error={errors.customer_email} hint="Aquí recibirá la confirmación"><input type="email" value={form.customer_email} maxLength={254} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} /></FormField>
              <FormField label="Zona" required error={errors.zone}><select value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })}><option value="">Seleccione</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></FormField>
              <FormField label="Notas"><textarea rows="3" value={form.notes} maxLength={500} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></FormField>
            </div>
          </section>
        </div>

        <aside className="quote-summary">
          <p className="eyebrow">Resumen</p>
          <h2>Total estimado</h2>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal)}</dd></div>
            <div><dt>Costos adicionales</dt><dd>{formatCurrency(form.additional_costs)}</dd></div>
            <div><dt>Total</dt><dd>{formatCurrency(total)}</dd></div>
          </dl>
          <FormField label="Costo adicional" error={errors.additional_costs} hint="Traslado u otro costo conocido"><input type="number" min="0" step="1" value={form.additional_costs} onChange={(event) => setForm({ ...form, additional_costs: event.target.value })} /></FormField>
          <FormField label="Vigencia"><input type="date" value={form.valid_until} readOnly /></FormField>
          <button className="button button--accent button--full" disabled={sending}>{sending ? 'Generando…' : 'Generar cotización'}</button>
          <small>La confirmación se enviará al correo indicado. WhatsApp está fuera del alcance del Release 1.</small>
        </aside>
      </form>
    </section>
  )
}
