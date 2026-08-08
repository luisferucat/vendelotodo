export const zones = ['San Carlos', 'Río Cuarto', 'La Virgen de Sarapiquí', 'Santa Rosa']

export const validatePhone = (value) => /^\d{8}$/.test(String(value).replace(/\D/g, ''))
export const validateEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export function validateCustomer(values, { requireEmail = false } = {}) {
  const errors = {}
  if (!values.customer_name?.trim() || values.customer_name.trim().length < 2) errors.customer_name = 'Ingrese un nombre de al menos 2 caracteres.'
  if (!validatePhone(values.customer_phone)) errors.customer_phone = 'El teléfono debe contener exactamente 8 dígitos.'
  if (requireEmail && !values.customer_email?.trim()) errors.customer_email = 'Ingrese el correo donde desea recibir la confirmación.'
  else if (!validateEmail(values.customer_email)) errors.customer_email = 'Ingrese un correo electrónico válido.'
  if (!values.zone || !zones.includes(values.zone)) errors.zone = 'Seleccione una zona de cobertura válida.'
  return errors
}
