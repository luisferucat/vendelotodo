import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { emailService } from '../../services/emailService'
import { validateCustomer, zones } from '../../utils/validators'

const initial = { service_id: '', customer_name: '', customer_phone: '', customer_email: '', zone: '', address: '', preferred_date: '', description: '' }

export default function ServiceRequestPage() {
  const [params] = useSearchParams()
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ ...initial, service_id: params.get('service') || '' })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [sending, setSending] = useState(false)
  const { show } = useToast()

  useEffect(() => { dataService.getServices().then(setServices) }, [])
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateCustomer(form, { requireEmail: true })
    if (!form.service_id) nextErrors.service_id = 'Seleccione el servicio requerido.'
    if (!form.address.trim() || form.address.trim().length < 10) nextErrors.address = 'Ingrese una dirección clara de al menos 10 caracteres.'
    if (!form.description.trim() || form.description.trim().length < 10) nextErrors.description = 'Describa el trabajo o problema con al menos 10 caracteres.'
    if (form.preferred_date && new Date(`${form.preferred_date}T23:59:59`) < new Date()) nextErrors.preferred_date = 'La fecha preferida no puede estar en el pasado.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return show('Revise los campos marcados en el formulario.', 'error')

    setSending(true)
    try {
      const selectedService = services.find((service) => service.id === form.service_id)
      const order = await dataService.createOrder(form)
      const confirmation = { ...form, ...order, service_name: selectedService?.name || order.service_name }
      let emailStatus = 'sent'
      try {
        const emailResult = await emailService.sendOrderConfirmation(confirmation)
        if (emailResult.skipped) emailStatus = 'skipped'
      } catch (emailError) {
        console.error('No fue posible enviar la confirmación de orden:', emailError)
        emailStatus = 'failed'
      }

      setResult({ ...confirmation, email_status: emailStatus, confirmation_email: form.customer_email })
      setForm(initial)
      if (emailStatus === 'sent') show('Solicitud registrada y confirmación enviada.')
      else if (emailStatus === 'failed') show('La solicitud se guardó, pero el correo no pudo enviarse.', 'error')
      else show('Solicitud registrada correctamente en modo local.')
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
          <p className="eyebrow">Solicitud recibida</p>
          <h1>{result.order_number}</h1>
          <p>Guardamos su solicitud con estado <strong>Pendiente</strong>. VendeloTodo coordinará la visita usando el teléfono indicado.</p>
          {result.email_status === 'sent' && <p>Enviamos la confirmación a <strong>{result.confirmation_email}</strong>.</p>}
          {result.email_status === 'failed' && <p><strong>La solicitud quedó registrada, pero el correo no pudo enviarse.</strong> Puede conservar este número como comprobante.</p>}
          {result.email_status === 'skipped' && <p>En modo local no se envían correos. El envío se realizará desde el sitio publicado.</p>}
          <button className="button button--primary" type="button" onClick={() => setResult(null)}>Registrar otra solicitud</button>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section form-page">
      <div className="form-intro">
        <span><ClipboardCheck /></span>
        <p className="eyebrow">Atención sin registro</p>
        <h1>Solicite una visita técnica</h1>
        <p>Cuéntenos qué necesita. Los campos marcados con * son obligatorios y su solicitud iniciará en estado Pendiente.</p>
        <aside><strong>Zonas disponibles</strong>{zones.map((zone) => <span key={zone}>{zone}</span>)}</aside>
      </div>
      <form className="panel-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <FormField label="Servicio" required error={errors.service_id}><select value={form.service_id} onChange={(event) => set('service_id', event.target.value)}><option value="">Seleccione una opción</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></FormField>
          <FormField label="Nombre completo" required error={errors.customer_name}><input value={form.customer_name} onChange={(event) => set('customer_name', event.target.value)} maxLength={120} /></FormField>
          <FormField label="Teléfono" required error={errors.customer_phone} hint="8 dígitos, sin espacios"><input inputMode="numeric" value={form.customer_phone} onChange={(event) => set('customer_phone', event.target.value.replace(/\D/g, '').slice(0, 8))} /></FormField>
          <FormField label="Correo electrónico" required error={errors.customer_email} hint="Aquí recibirá la confirmación"><input type="email" value={form.customer_email} maxLength={254} onChange={(event) => set('customer_email', event.target.value)} /></FormField>
          <FormField label="Zona" required error={errors.zone}><select value={form.zone} onChange={(event) => set('zone', event.target.value)}><option value="">Seleccione su zona</option>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></FormField>
          <FormField label="Fecha preferida" error={errors.preferred_date}><input type="date" value={form.preferred_date} onChange={(event) => set('preferred_date', event.target.value)} /></FormField>
          <FormField label="Dirección exacta" required error={errors.address}><textarea rows="3" value={form.address} onChange={(event) => set('address', event.target.value)} maxLength={300} /></FormField>
          <FormField label="Descripción del trabajo" required error={errors.description}><textarea rows="3" value={form.description} onChange={(event) => set('description', event.target.value)} maxLength={1000} /></FormField>
        </div>
        <button className="button button--primary button--full" disabled={sending}>{sending ? 'Registrando y enviando…' : 'Enviar solicitud de servicio'}</button>
        <small>La confirmación se enviará al correo indicado.</small>
      </form>
    </section>
  )
}
