import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, MapPin, Route, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { formatDate } from '../../utils/formatters'

export default function TechnicianDashboardPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState(null)
  useEffect(() => { dataService.getOrders({ technicianId: profile.id }).then(setOrders) }, [profile.id])
  if (!orders) return <LoadingScreen />
  const active = orders.filter((item) => !['Completed','Cancelled'].includes(item.status))
  const completed = orders.filter((item) => item.status === 'Completed')
  const today = new Date().toDateString()
  const todayJobs = active.filter((item) => item.scheduled_at && new Date(item.scheduled_at).toDateString() === today)
  return <><PageHeader eyebrow="Portal técnico" title={`Hola, ${profile.full_name.split(' ')[0]}`} description="Consulte las visitas asignadas y actualice el progreso desde el campo." /><section className="metric-grid tech"><article><span><Wrench /></span><div><small>Trabajos activos</small><strong>{active.length}</strong></div></article><article><span><Clock3 /></span><div><small>Visitas para hoy</small><strong>{todayJobs.length}</strong></div></article><article><span><CheckCircle2 /></span><div><small>Completados</small><strong>{completed.length}</strong></div></article></section><section className="dashboard-panel"><header><div><p className="eyebrow">Próximos trabajos</p><h2>Mi agenda</h2></div><Link to="/tecnico/trabajos">Ver todos</Link></header><div className="job-list">{active.length ? active.slice(0, 5).map((order) => <Link to={`/tecnico/trabajos/${order.id}`} key={order.id}><span className="list-icon"><Route /></span><div><strong>{order.service_name}</strong><small>{order.order_number} · {order.customer_name}</small><small><MapPin /> {order.zone}</small></div><div><StatusBadge status={order.status} /><small>{order.scheduled_at ? formatDate(order.scheduled_at, true) : 'Sin fecha'}</small></div></Link>) : <p className="empty-inline">No tiene trabajos activos asignados.</p>}</div></section></>
}
