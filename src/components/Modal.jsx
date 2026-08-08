import { X } from 'lucide-react'

export default function Modal({ title, open, onClose, children, size = '' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${size ? `modal--${size}` : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}
