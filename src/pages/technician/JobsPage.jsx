import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { formatDate } from '../../utils/formatters'

export default function JobsPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')
  useEffect(() => { dataService.getOrders({ technicianId: profile.id }).then(setOrders) }, [profile.id])
  const filtered = useMemo(() => (orders || []).filter((item) => `${item.order_number} ${item.customer_name} ${item.service_name}`.toLowerCase().includes(search.toLowerCase()) && (status === 'all' || (status === 'active' && !['Completed','Cancelled'].includes(item.status)) || item.status === status)), [orders, search, status])
  if (!orders) return <LoadingScreen />
  return <><PageHeader eyebrow="Agenda personal" title="Mis trabajos" description="Solo se muestran órdenes asignadas a su cuenta." /><div className="table-tools"><label className="search-box"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar orden o cliente" /></label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Activos</option><option value="all">Todos</option><option value="Assigned">Asignados</option><option value="OnTheWay">En camino</option><option value="InProgress">En progreso</option><option value="Completed">Completados</option></select></div>{filtered.length ? <div className="mobile-job-grid">{filtered.map((order) => <article key={order.id}><header><span>{order.order_number}</span><StatusBadge status={order.status} /></header><h2>{order.service_name}</h2><p>{order.description}</p><dl><div><dt>Cliente</dt><dd>{order.customer_name}</dd></div><div><dt>Ubicación</dt><dd><MapPin /> {order.zone}</dd></div><div><dt>Visita</dt><dd>{order.scheduled_at ? formatDate(order.scheduled_at, true) : 'Sin programar'}</dd></div></dl><Link className="button button--primary button--full" to={`/tecnico/trabajos/${order.id}`}>Abrir trabajo <ArrowRight /></Link></article>)}</div> : <EmptyState text="No tiene trabajos que coincidan con este filtro." />}</>
}
