export default function FormField({ label, error, required, hint, children }) {
  return (
    <label className="field">
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && <small className="field-error" role="alert">{error}</small>}
    </label>
  )
}
