const localHosts = new Set(['localhost', '127.0.0.1'])

async function send(type, data) {
  if (localHosts.has(window.location.hostname)) return { ok: true, skipped: true }

  const response = await fetch('/api/send-confirmation-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'No fue posible enviar el correo de confirmación.')
  return result
}

export const emailService = {
  sendQuoteConfirmation: (quote) => send('quote', quote),
  sendOrderConfirmation: (order) => send('order', order),
}
