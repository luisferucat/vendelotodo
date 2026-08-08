import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Search, UserRoundCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import LoadingScreen from '../../components/LoadingScreen'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatDate, statusLabel } from '../../utils/formatters'

const orderStatuses = ['Pending', 'Assigned', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled']

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [search, setSearch] = useState('')
  const requestedStatus = searchParams.get('status') || 'all'
  const [status, setStatus] = useState(orderStatuses.includes(requestedStatus) ? requestedStatus : 'all')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ technician_id: '', scheduled_at: '' })
  const [error, setError] = useState('')
  const { show } = useToast()
  const load = () => Promise.all([dataService.getOrders(), dataService.getProfiles()]).then(([o, p]) => { setOrders(o); setTechnicians(p.filter((item) => item.role === 'Technician' && item.status === 'Active')) })
  useEffect(() => { load() }, [])
  useEffect(() => { setStatus(orderStatuses.includes(requestedStatus) ? requestedStatus : 'all') }, [requestedStatus])
  const filtered = useMemo(() => (orders || []).filter((item) => (status === 'all' || item.status === status) && `${item.order_number} ${item.customer_name} ${item.service_name}`.toLowerCase().includes(search.toLowerCase())), [orders, search, status])
  const changeStatus = (value) => { setStatus(value); setSearchParams(value === 'all' ? {} : { status: value }, { replace: true }) }
  const open = (order) => { setSelected(order); setForm({ technician_id: order.technician?.id || '', scheduled_at: order.scheduled_at ? new Date(order.scheduled_at).toISOString().slice(0, 16) : '' }); setError('') }
  const assign = async (event) => { event.preventDefault(); if (!form.technician_id) return setError('Seleccione un técnico activo.'); if (!form.scheduled_at) return setError('Seleccione la fecha y hora de visita.'); if (new Date(form.scheduled_at) < new Date()) return setError('La visita no puede programarse en el pasado.'); try { await dataService.updateOrder(selected.id, { technician_id: form.technician_id, scheduled_at: new Date(form.scheduled_at).toISOString(), status: selected.status === 'Pending' ? 'Assigned' : selected.status }); show('Orden asignada correctamente.'); setSelected(null); await load() } catch (err) { setError(err.message) } }
  if (!orders) return <LoadingScreen />
  return <><PageHeader eyebrow="Operación de campo" title="Órdenes de servicio" description="Asigne técnicos activos y programe las visitas pendientes." /><div className="table-tools"><label className="search-box"><Search /><input placeholder="Buscar orden o cliente" value={search} onChange={(e) => setSearch(e.target.value)} /></label><select value={status} onChange={(e) => changeStatus(e.target.value)}><option value="all">Todos los estados</option>{orderStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Orden</th><th>Cliente y ubicación</th><th>Servicio</th><th>Técnico</th><th>Visita</th><th>Estado</th><th></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><strong>{order.order_number}</strong><small>{formatDate(order.created_at)}</small></td><td><strong>{order.customer_name}</strong><small><MapPin /> {order.zone}</small></td><td>{order.service_name}</td><td>{order.technician?.full_name || 'Sin asignar'}</td><td>{order.scheduled_at ? formatDate(order.scheduled_at, true) : 'Sin programar'}</td><td><StatusBadge status={order.status} /></td><td><button className="table-action" onClick={() => open(order)} disabled={['Completed','Cancelled'].includes(order.status)}><UserRoundCheck /> {order.technician ? 'Reasignar' : 'Asignar'}</button></td></tr>)}</tbody></table></div> : <EmptyState text="No hay órdenes que coincidan con los filtros." />}<Modal open={Boolean(selected)} title={`Asignar ${selected?.order_number || ''}`} onClose={() => setSelected(null)}>{error && <div className="form-alert">{error}</div>}<form onSubmit={assign}><div className="order-summary"><strong>{selected?.service_name}</strong><span>{selected?.customer_name} · {selected?.zone}</span><p>{selected?.description}</p></div><FormField label="Técnico activo" required><select value={form.technician_id} onChange={(e) => setForm({ ...form, technician_id: e.target.value })}><option value="">Seleccione</option>{technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}</select></FormField><FormField label="Fecha y hora" required><div className="input-with-icon"><CalendarDays /><input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div></FormField><div className="modal-actions"><button type="button" className="button button--outline" onClick={() => setSelected(null)}>Cancelar</button><button className="button button--primary">Guardar asignación</button></div></form></Modal></>
}
