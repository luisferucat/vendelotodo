import { SearchX } from 'lucide-react'

export default function EmptyState({ title = 'No encontramos resultados', text = 'Pruebe con otros filtros o vuelva más tarde.' }) {
  return <div className="empty-state"><SearchX size={34} /><h3>{title}</h3><p>{text}</p></div>
}
