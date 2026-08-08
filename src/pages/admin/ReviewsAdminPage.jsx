import { useEffect, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatDate } from '../../utils/formatters'

export default function ReviewsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status') || 'all'
  const [reviews, setReviews] = useState(null)
  const [filter, setFilter] = useState(['Pending', 'Approved', 'Rejected'].includes(requestedStatus) ? requestedStatus : 'all')
  const { show } = useToast()
  const load = () => dataService.getReviews({ includeAll: true }).then(setReviews)
  useEffect(() => { load() }, [])
  useEffect(() => { setFilter(['Pending', 'Approved', 'Rejected'].includes(requestedStatus) ? requestedStatus : 'all') }, [requestedStatus])
  const moderate = async (review, status) => { try { await dataService.moderateReview(review.id, status); show(status === 'Approved' ? 'Reseña aprobada y publicada.' : 'Reseña rechazada.'); await load() } catch (error) { show(error.message, 'error') } }
  if (!reviews) return <LoadingScreen />
  const filtered = reviews.filter((item) => filter === 'all' || item.moderation_status === filter)
  const changeFilter = (value) => { setFilter(value); setSearchParams(value === 'all' ? {} : { status: value }, { replace: true }) }
  return <><PageHeader eyebrow="Contenido público" title="Moderación de reseñas" description="Las reseñas pendientes nunca aparecen en el sitio hasta ser aprobadas." actions={<select value={filter} onChange={(e) => changeFilter(e.target.value)}><option value="all">Todas</option><option value="Pending">Pendientes</option><option value="Approved">Aprobadas</option><option value="Rejected">Rechazadas</option></select>} />{filtered.length ? <div className="moderation-grid">{filtered.map((review) => <article key={review.id}><header><div className="stars">{Array.from({ length: review.rating }, (_, i) => <Star key={i} fill="currentColor" />)}</div><StatusBadge status={review.moderation_status} /></header><blockquote>“{review.comment}”</blockquote><div><strong>{review.customer_name}</strong><span>{review.service_name} · {formatDate(review.created_at)}</span></div>{review.moderation_status === 'Pending' && <footer><button className="approve" onClick={() => moderate(review, 'Approved')}><Check /> Aprobar</button><button className="reject" onClick={() => moderate(review, 'Rejected')}><X /> Rechazar</button></footer>}</article>)}</div> : <EmptyState text="No hay reseñas para este estado." />}</>
}
