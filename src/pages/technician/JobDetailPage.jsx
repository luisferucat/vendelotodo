import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Camera, CheckCircle2, MapPin, Phone, UploadCloud } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatDate, statusLabel } from '../../utils/formatters'

const nextStatus = { Assigned: 'OnTheWay', OnTheWay: 'InProgress', InProgress: 'Completed' }
const nextAction = { Assigned: 'Marcar en camino', OnTheWay: 'Iniciar trabajo', InProgress: 'Completar trabajo' }
export default function JobDetailPage() {
  const { jobId } = useParams()
  const { profile } = useAuth()
  const { show } = useToast()
  const [order, setOrder] = useState(undefined)
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState('')
  const load = useCallback(() => dataService.getOrders({ technicianId: profile.id }).then((rows) => setOrder(rows.find((item) => item.id === jobId) || null)), [jobId, profile.id])
  useEffect(() => { load() }, [load])
  const upload = async () => { try { await dataService.uploadEvidence(order.id, file, notes); setFile(null); setNotes(''); show('Evidencia cargada correctamente.'); await load() } catch (error) { show(error.message, 'error') } }
  const advance = async () => { const target = nextStatus[order.status]; if (!target) return; if (target === 'Completed' && !(order.evidence?.length)) return show('Debe cargar al menos una evidencia antes de completar el trabajo.', 'error'); if (!window.confirm(`¿Desea cambiar la orden a “${statusLabel(target)}”?`)) return; try { await dataService.updateOrder(order.id, { status: target, ...(target === 'Completed' ? { completed_at: new Date().toISOString() } : {}) }); show('Estado actualizado correctamente.'); await load() } catch (error) { show(error.message, 'error') } }
  if (order === undefined) return <LoadingScreen />
  if (!order) return <main className="standalone-state embedded"><h1>Trabajo no disponible</h1><p>La orden no existe o no está asignada a su usuario.</p><Link className="button button--primary" to="/tecnico/trabajos">Volver</Link></main>
  return <><Link className="back-link" to="/tecnico/trabajos"><ArrowLeft /> Volver a mis trabajos</Link><PageHeader eyebrow={order.order_number} title={order.service_name} description={order.description} actions={<StatusBadge status={order.status} />} /><div className="job-detail-grid"><section className="detail-panel"><h2>Información de la visita</h2><dl className="detail-list"><div><dt>Cliente</dt><dd>{order.customer_name}</dd></div><div><dt>Teléfono</dt><dd><a href={`tel:${order.customer_phone}`}><Phone /> {order.customer_phone}</a></dd></div><div><dt>Zona</dt><dd>{order.zone}</dd></div><div><dt>Dirección</dt><dd><MapPin /> {order.address}</dd></div><div><dt>Fecha programada</dt><dd>{formatDate(order.scheduled_at, true)}</dd></div></dl>{nextStatus[order.status] && <button className="button button--accent button--full" onClick={advance}>{nextAction[order.status]}</button>}{order.status === 'Completed' && <div className="inline-success"><CheckCircle2 /><strong>Trabajo completado</strong><p>Esta orden ya no permite avanzar a otro estado.</p></div>}</section><section className="detail-panel"><h2><Camera /> Evidencia del trabajo</h2><p>Las fotografías deben ser JPG, PNG o WEBP y pesar menos de 8 MB.</p><label className="file-drop"><UploadCloud /><span>{file ? file.name : 'Seleccionar fotografía'}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><textarea rows="3" maxLength={300} placeholder="Nota opcional sobre la evidencia" value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="button button--outline button--full" type="button" disabled={!file} onClick={upload}>Cargar evidencia</button><div className="evidence-list">{order.evidence?.length ? order.evidence.map((item) => <article key={item.id}><Camera /><div><strong>{item.file_path.split('/').pop()}</strong><small>{item.notes || 'Sin nota'} · {formatDate(item.created_at, true)}</small></div></article>) : <p>No se han cargado evidencias.</p>}</div></section></div></>
}
