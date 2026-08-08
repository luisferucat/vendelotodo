import { statusLabel } from '../utils/formatters'

export default function StatusBadge({ status }) {
  return <span className={`status status--${String(status).toLowerCase()}`}>{statusLabel(status)}</span>
}
