export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(value || 0)

export const formatDate = (value, withTime = false) => {
  if (!value) return 'Sin fecha'
  const normalizedValue = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(normalizedValue))
}

export const statusLabels = {
  Active: 'Activo', Inactive: 'Inactivo', InStock: 'Disponible', OnRequest: 'Bajo pedido',
  Pending: 'Pendiente', Assigned: 'Asignada', OnTheWay: 'En camino', InProgress: 'En progreso',
  Completed: 'Completada', Cancelled: 'Cancelada', Confirmed: 'Confirmado', Rejected: 'Rechazado',
  Approved: 'Aprobada', Draft: 'Borrador', Sent: 'Enviada', Expired: 'Vencida',
}

export const statusLabel = (status) => statusLabels[status] || status

export const cn = (...classes) => classes.filter(Boolean).join(' ')
