import { useEffect, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import LoadingScreen from '../../components/LoadingScreen'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status') || 'all'
  const [payments, setPayments] = useState(null)
  const [status, setStatus] = useState(['Pending', 'Confirmed', 'Rejected'].includes(requestedStatus) ? requestedStatus : 'all')
  const [search, setSearch] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const { show } = useToast()
  const load = () => dataService.getPayments().then(setPayments)
  useEffect(() => { load() }, [])
  useEffect(() => { setStatus(['Pending', 'Confirmed', 'Rejected'].includes(requestedStatus) ? requestedStatus : 'all') }, [requestedStatus])
  const filtered = useMemo(() => (payments || []).filter((item) => (status === 'all' || item.status === status) && `${item.reference_number} ${item.payer_name}`.toLowerCase().includes(search.toLowerCase())), [payments, search, status])
  const changeStatus = (value) => { setStatus(value); setSearchParams(value === 'all' ? {} : { status: value }, { replace: true }) }
  const update = async (payment, next, rejectionReason = null) => { try { await dataService.updatePayment(payment.id, next, rejectionReason); show(next === 'Confirmed' ? 'Pago confirmado correctamente.' : 'Pago rechazado correctamente.'); setRejecting(null); setReason(''); await load() } catch (error) { show(error.message, 'error') } }
  if (!payments) return <LoadingScreen />
  return <><PageHeader eyebrow="Comprobantes SINPE" title="Pagos" description="Confirme o rechace cada comprobante. Rechazar exige un motivo visible." /><div className="table-tools"><label className="search-box"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar referencia o pagador" /></label><select value={status} onChange={(e) => changeStatus(e.target.value)}><option value="all">Todos</option><option value="Pending">Pendientes</option><option value="Confirmed">Confirmados</option><option value="Rejected">Rechazados</option></select></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Referencia</th><th>Pagador</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map((payment) => <tr key={payment.id}><td><strong>{payment.reference_number}</strong><small>{payment.proof_url ? `Archivo: ${payment.proof_url.split('/').pop()}` : 'Comprobante registrado'}</small></td><td>{payment.payer_name}</td><td><strong>{formatCurrency(payment.amount)}</strong></td><td>{formatDate(payment.created_at, true)}</td><td><StatusBadge status={payment.status} />{payment.rejection_reason && <small>{payment.rejection_reason}</small>}</td><td>{payment.status === 'Pending' && <div className="row-actions labeled"><button className="approve" onClick={() => update(payment, 'Confirmed')}><Check /> Confirmar</button><button className="reject" onClick={() => setRejecting(payment)}><X /> Rechazar</button></div>}</td></tr>)}</tbody></table></div> : <EmptyState text="No existen pagos para este filtro." />}<Modal open={Boolean(rejecting)} title="Rechazar comprobante" onClose={() => setRejecting(null)}><p>Indique por qué se rechaza <strong>{rejecting?.reference_number}</strong>.</p><FormField label="Motivo del rechazo" required><textarea rows="4" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></FormField><div className="modal-actions"><button className="button button--outline" onClick={() => setRejecting(null)}>Cancelar</button><button className="button button--danger" onClick={() => update(rejecting, 'Rejected', reason)}>Rechazar pago</button></div></Modal></>
}
