import { useEffect, useMemo, useState } from 'react'
import { Building2, Edit3, Eye, Plus, Search, ToggleLeft } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import LoadingScreen from '../../components/LoadingScreen'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'
import { formatCurrency } from '../../utils/formatters'
import { validateEmail, validatePhone } from '../../utils/validators'

const blank = { name: '', contact_name: '', phone: '', email: '', status: 'Active' }
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const { show } = useToast()
  const load = () => dataService.getSuppliers().then(setSuppliers)
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => (suppliers || []).filter((item) => `${item.name} ${item.contact_name} ${item.email}`.toLowerCase().includes(search.toLowerCase())), [suppliers, search])
  const open = (supplier = null) => { setEditing(supplier); setForm(supplier ? { ...supplier } : { ...blank }); setErrors({}); setModalOpen(true) }
  const close = () => { setEditing(null); setForm({ ...blank }); setModalOpen(false) }
  const save = async (event) => { event.preventDefault(); const next = {}; if (form.name.trim().length < 2) next.name = 'El nombre debe tener al menos 2 caracteres.'; if (form.contact_name && form.contact_name.trim().length < 2) next.contact_name = 'Ingrese un contacto válido.'; if (form.phone && !validatePhone(form.phone)) next.phone = 'El teléfono debe tener 8 dígitos.'; if (!validateEmail(form.email)) next.email = 'Ingrese un correo válido.'; setErrors(next); if (Object.keys(next).length) return show('Revise los campos marcados.', 'error'); try { await dataService.saveSupplier({ ...form, id: editing?.id }); show(editing ? 'Proveedor actualizado correctamente.' : 'Proveedor registrado correctamente.'); close(); await load() } catch (error) { show(error.message.includes('duplicate') ? 'Ya existe un proveedor con ese nombre.' : error.message, 'error') } }
  const toggle = async (supplier) => { const status = supplier.status === 'Active' ? 'Inactive' : 'Active'; if (!window.confirm(`¿Desea ${status === 'Active' ? 'reactivar' : 'desactivar'} este proveedor?`)) return; try { await dataService.setSupplierStatus(supplier.id, status); show('Estado del proveedor actualizado.'); await load() } catch (error) { show(error.message, 'error') } }
  if (!suppliers) return <LoadingScreen />
  return <><PageHeader eyebrow="Abastecimiento interno" title="Proveedores" description="Consulte contactos, disponibilidad y costos. Esta información nunca se expone al cliente." actions={<button className="button button--primary" onClick={() => open()}><Plus /> Registrar proveedor</button>} /><div className="table-tools"><label className="search-box"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proveedor o contacto" /></label></div>{filtered.length ? <div className="table-wrap"><table><thead><tr><th>Proveedor</th><th>Contacto</th><th>Teléfono</th><th>Artículos asociados</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map((supplier) => <tr key={supplier.id}><td><strong>{supplier.name}</strong><small>{supplier.email || 'Sin correo'}</small></td><td>{supplier.contact_name || 'Sin contacto'}</td><td>{supplier.phone || 'Sin teléfono'}</td><td>{supplier.offers?.length || 0}</td><td><StatusBadge status={supplier.status} /></td><td><div className="row-actions"><button title="Ver costos" onClick={() => setDetail(supplier)}><Eye /></button><button title="Editar" onClick={() => open(supplier)}><Edit3 /></button><button title={supplier.status === 'Active' ? 'Desactivar' : 'Reactivar'} onClick={() => toggle(supplier)}><ToggleLeft /></button></div></td></tr>)}</tbody></table></div> : <EmptyState text="No existen proveedores que coincidan con la búsqueda." />}<Modal open={modalOpen} title={editing ? 'Actualizar proveedor' : 'Registrar proveedor'} onClose={close}><form onSubmit={save} noValidate><FormField label="Nombre del proveedor" required error={errors.name}><input maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField><FormField label="Persona de contacto" error={errors.contact_name}><input maxLength={120} value={form.contact_name || ''} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></FormField><FormField label="Teléfono" error={errors.phone}><input inputMode="numeric" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 8) })} /></FormField><FormField label="Correo" error={errors.email}><input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField><div className="modal-actions"><button type="button" className="button button--outline" onClick={close}>Cancelar</button><button className="button button--primary">Guardar proveedor</button></div></form></Modal><Modal open={Boolean(detail)} title={`Costos · ${detail?.name || ''}`} onClose={() => setDetail(null)}>{detail?.offers?.length ? <div className="supplier-offers">{detail.offers.map((offer, index) => <article key={offer.id || index}><span><Building2 /><div><strong>{offer.product?.name}</strong><small>{offer.product?.sku}</small></div></span><dl><div><dt>Costo</dt><dd>{formatCurrency(offer.supplier_cost)}</dd></div><div><dt>Disponibilidad</dt><dd>{offer.is_available ? 'Disponible' : 'No disponible'}</dd></div><div><dt>Entrega estimada</dt><dd>{offer.lead_time_days ?? 0} días</dd></div></dl></article>)}</div> : <EmptyState title="Sin artículos asociados" text="Este proveedor todavía no tiene costos registrados en product_suppliers." />}</Modal></>
}
