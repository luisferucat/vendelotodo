import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const PROJECT_NAME = 'VendeloTodo'
const PROJECT_EMAIL = 'vedelotodoucat@gmail.com'

class InputError extends Error {}

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const cleanText = (value, maxLength = 500) => String(value ?? '').trim().slice(0, maxLength)

const cleanNumber = (value, { min = 0, max = 1000000000 } = {}) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) throw new InputError('Uno de los montos no es válido.')
  return number
}

const formatCurrency = (value) => new Intl.NumberFormat('es-CR', {
  style: 'currency', currency: 'CRC', maximumFractionDigits: 0,
}).format(value || 0)

const formatDate = (value) => {
  const text = cleanText(value, 30)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return 'No indicada'
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'long', timeZone: 'America/Costa_Rica' })
    .format(new Date(`${text}T12:00:00-06:00`))
}

function validateCommon(data) {
  const customerName = cleanText(data?.customer_name, 120)
  const customerEmail = cleanText(data?.customer_email, 254).toLowerCase()
  if (customerName.length < 2) throw new InputError('El nombre del cliente no es válido.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new InputError('El correo del cliente no es válido.')
  return {
    customerName,
    customerEmail,
    phone: cleanText(data?.customer_phone, 20),
    zone: cleanText(data?.zone, 80),
  }
}

function emailFrame(content) {
  return `
    <div style="margin:0;padding:24px;background:#f4f1e8;font-family:Arial,sans-serif;color:#153b31;line-height:1.55">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-top:6px solid #b6d53c;padding:30px">
        <p style="margin:0 0 6px;color:#557066;font-size:13px;letter-spacing:2px;text-transform:uppercase">${PROJECT_NAME}</p>
        ${content}
        <p style="margin-top:28px;padding-top:18px;border-top:1px solid #dce4df;color:#66756f;font-size:12px">
          Este correo corresponde a un proyecto académico. Si no realizó esta solicitud, puede ignorarlo.
        </p>
      </div>
    </div>`
}

function buildQuoteEmail(data) {
  const common = validateCommon(data)
  const quoteNumber = cleanText(data?.quote_number, 50)
  if (!quoteNumber) throw new InputError('Falta el número de cotización.')
  if (!Array.isArray(data?.items) || data.items.length === 0 || data.items.length > 30) {
    throw new InputError('El detalle de la cotización no es válido.')
  }

  const items = data.items.map((item) => {
    const description = cleanText(item?.description, 160)
    const quantity = cleanNumber(item?.quantity, { min: 1, max: 999 })
    const unitPrice = cleanNumber(item?.unit_price)
    if (!description) throw new InputError('Uno de los elementos no tiene descripción.')
    return { description, quantity, unitPrice, total: quantity * unitPrice }
  })
  const subtotal = cleanNumber(data?.subtotal)
  const additionalCosts = cleanNumber(data?.additional_costs || 0)
  const total = cleanNumber(data?.total)
  const notes = cleanText(data?.notes, 500)

  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e3e9e5">${escapeHtml(item.description)}</td>
      <td style="padding:10px;text-align:center;border-bottom:1px solid #e3e9e5">${item.quantity}</td>
      <td style="padding:10px;text-align:right;border-bottom:1px solid #e3e9e5">${escapeHtml(formatCurrency(item.total))}</td>
    </tr>`).join('')

  const html = emailFrame(`
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px">Cotización recibida</h1>
    <p>Hola ${escapeHtml(common.customerName)}, registramos correctamente su solicitud de cotización.</p>
    <div style="margin:20px 0;padding:18px;background:#eef4e7;border-radius:8px">
      <p style="margin:0 0 6px"><strong>Número:</strong> ${escapeHtml(quoteNumber)}</p>
      <p style="margin:0 0 6px"><strong>Válida hasta:</strong> ${escapeHtml(formatDate(data?.valid_until))}</p>
      <p style="margin:0"><strong>Zona:</strong> ${escapeHtml(common.zone || 'No indicada')}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:18px 0">
      <thead><tr style="background:#153b31;color:#ffffff">
        <th style="padding:10px;text-align:left">Elemento</th>
        <th style="padding:10px;text-align:center">Cantidad</th>
        <th style="padding:10px;text-align:right">Subtotal</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-left:auto;max-width:310px">
      <p style="display:flex;justify-content:space-between"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal))}</strong></p>
      <p style="display:flex;justify-content:space-between"><span>Costos adicionales</span><strong>${escapeHtml(formatCurrency(additionalCosts))}</strong></p>
      <p style="display:flex;justify-content:space-between;font-size:20px"><span>Total estimado</span><strong>${escapeHtml(formatCurrency(total))}</strong></p>
    </div>
    ${notes ? `<p><strong>Notas:</strong><br>${escapeHtml(notes).replaceAll('\n', '<br>')}</p>` : ''}
    <p>Esta estimación no constituye un cobro ni una reserva automática.</p>`)

  const text = [
    `${PROJECT_NAME} - Cotización recibida`, `Hola ${common.customerName}.`,
    `Número: ${quoteNumber}`, `Válida hasta: ${formatDate(data?.valid_until)}`,
    ...items.map((item) => `${item.description} x ${item.quantity}: ${formatCurrency(item.total)}`),
    `Total estimado: ${formatCurrency(total)}`,
    'Esta estimación no constituye un cobro ni una reserva automática.',
  ].join('\n')

  return { to: common.customerEmail, subject: `Cotización recibida - ${quoteNumber}`, html, text }
}

function buildOrderEmail(data) {
  const common = validateCommon(data)
  const orderNumber = cleanText(data?.order_number, 50)
  const serviceName = cleanText(data?.service_name, 160)
  const address = cleanText(data?.address, 300)
  const description = cleanText(data?.description, 1000)
  if (!orderNumber || !serviceName || address.length < 10 || description.length < 10) {
    throw new InputError('Faltan datos obligatorios de la orden.')
  }

  const html = emailFrame(`
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px">Solicitud de servicio recibida</h1>
    <p>Hola ${escapeHtml(common.customerName)}, guardamos correctamente su solicitud.</p>
    <div style="margin:20px 0;padding:18px;background:#eef4e7;border-radius:8px">
      <p style="margin:0 0 6px"><strong>Número:</strong> ${escapeHtml(orderNumber)}</p>
      <p style="margin:0 0 6px"><strong>Estado:</strong> Pendiente</p>
      <p style="margin:0 0 6px"><strong>Servicio:</strong> ${escapeHtml(serviceName)}</p>
      <p style="margin:0 0 6px"><strong>Fecha preferida:</strong> ${escapeHtml(formatDate(data?.preferred_date))}</p>
      <p style="margin:0"><strong>Zona:</strong> ${escapeHtml(common.zone || 'No indicada')}</p>
    </div>
    <p><strong>Dirección:</strong><br>${escapeHtml(address).replaceAll('\n', '<br>')}</p>
    <p><strong>Descripción:</strong><br>${escapeHtml(description).replaceAll('\n', '<br>')}</p>
    <p>VendeloTodo coordinará la visita usando el teléfono ${escapeHtml(common.phone || 'indicado')}.</p>`)

  const text = [
    `${PROJECT_NAME} - Solicitud de servicio recibida`, `Hola ${common.customerName}.`,
    `Número: ${orderNumber}`, 'Estado: Pendiente', `Servicio: ${serviceName}`,
    `Fecha preferida: ${formatDate(data?.preferred_date)}`, `Zona: ${common.zone}`,
    `Dirección: ${address}`, `Descripción: ${description}`,
    `VendeloTodo coordinará la visita usando el teléfono ${common.phone}.`,
  ].join('\n')

  return { to: common.customerEmail, subject: `Solicitud recibida - ${orderNumber}`, html, text }
}

function isSameOrigin(request) {
  const origin = request.headers.origin
  const host = request.headers.host
  if (!origin || !host) return true
  try { return new URL(origin).host === host } catch { return false }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método no permitido.' })
  if (!isSameOrigin(request)) return response.status(403).json({ error: 'Origen no permitido.' })
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return response.status(503).json({ error: 'El servicio de correo aún no está configurado.' })
  }

  try {
    const type = request.body?.type
    const email = type === 'quote'
      ? buildQuoteEmail(request.body?.data)
      : type === 'order'
        ? buildOrderEmail(request.body?.data)
        : null
    if (!email) throw new InputError('Tipo de confirmación no válido.')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
    await transporter.sendMail({
      from: `"${PROJECT_NAME}" <${GMAIL_USER}>`,
      replyTo: PROJECT_EMAIL,
      ...email,
    })
    return response.status(200).json({ ok: true })
  } catch (error) {
    if (error instanceof InputError) return response.status(400).json({ error: error.message })
    console.error('Error enviando confirmación:', error)
    return response.status(500).json({ error: 'No fue posible enviar el correo de confirmación.' })
  }
}
