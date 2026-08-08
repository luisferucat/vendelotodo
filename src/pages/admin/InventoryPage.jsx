import { useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import FormField from '../../components/FormField'
import LoadingScreen from '../../components/LoadingScreen'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'

const allowedFilters = ['all', 'low', 'below', 'minimum', 'zero', 'request']

function isTracked(product) {
  return product.status === 'Active' && product.availability_type === 'InStock'
}

function stockLevel(product) {
  if (product.status !== 'Active') return { key: 'inactive', label: 'Artículo inactivo' }
  if (product.availability_type === 'OnRequest') return { key: 'request', label: 'Bajo pedido' }
  if (product.stock_quantity === 0) return { key: 'zero', label: 'Agotado' }
  if (product.stock_quantity < product.minimum_stock) return { key: 'below', label: 'Debajo del mínimo' }
  if (product.stock_quantity === product.minimum_stock) return { key: 'minimum', label: 'En el mínimo' }
  return { key: 'healthy', label: 'Stock saludable' }
}

export default function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedFilter = searchParams.get('filter') || 'all'
  const [products, setProducts] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(allowedFilters.includes(requestedFilter) ? requestedFilter : 'all')
  const [movement, setMovement] = useState(null)
  const [form, setForm] = useState({ quantity: 1, reason: '' })
  const [error, setError] = useState('')
  const { show } = useToast()

  const load = () => dataService.getProducts({ includeInactive: true }).then(setProducts)
  useEffect(() => { load() }, [])
  useEffect(() => { setFilter(allowedFilters.includes(requestedFilter) ? requestedFilter : 'all') }, [requestedFilter])

  const changeFilter = (value) => {
    setFilter(value)
    setSearchParams(value === 'all' ? {} : { filter: value }, { replace: true })
  }

  const filtered = useMemo(() => (products || []).filter((item) => {
    const matchesSearch = `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'all') return true
    if (filter === 'request') return item.status === 'Active' && item.availability_type === 'OnRequest'
    if (!isTracked(item)) return false
    if (filter === 'low') return item.stock_quantity <= item.minimum_stock
    if (filter === 'below') return item.stock_quantity > 0 && item.stock_quantity < item.minimum_stock
    if (filter === 'minimum') return item.stock_quantity > 0 && item.stock_quantity === item.minimum_stock
    if (filter === 'zero') return item.stock_quantity === 0
    return true
  }), [products, search, filter])

  const save = async (event) => {
    event.preventDefault()
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) return setError('La cantidad debe ser un número entero mayor que cero.')
    if (form.reason.trim().length < 3) return setError('Indique un motivo de al menos 3 caracteres.')
    try {
      await dataService.recordMovement({
        product_id: movement.product.id,
        movement_type: movement.type,
        quantity: Number(form.quantity),
        reason: form.reason,
      })
      show(movement.type === 'Input' ? 'Entrada registrada correctamente.' : 'Salida registrada correctamente.')
      setMovement(null)
      setForm({ quantity: 1, reason: '' })
      setError('')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!products) return <LoadingScreen />

  return (
    <>
      <PageHeader
        eyebrow="Control interno"
        title="Inventario"
        description="Identifique por separado artículos agotados, debajo del mínimo y exactamente en el mínimo."
      />
      <div className="table-tools">
        <label className="search-box"><Search /><input placeholder="Buscar artículo" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <select value={filter} onChange={(e) => changeFilter(e.target.value)}>
          <option value="all">Todos los artículos</option>
          <option value="low">Todos con stock bajo</option>
          <option value="zero">Agotados</option>
          <option value="below">Debajo del mínimo</option>
          <option value="minimum">Exactamente en el mínimo</option>
          <option value="request">Bajo pedido</option>
        </select>
      </div>

      {filtered.length ? (
        <div className="inventory-grid">
          {filtered.map((product) => {
            const level = stockLevel(product)
            const hasAlert = isTracked(product) && product.stock_quantity <= product.minimum_stock
            return (
              <article key={product.id} className={hasAlert ? 'inventory-card warning' : 'inventory-card'}>
                <header>
                  <div><p>{product.sku}</p><h3>{product.name}</h3></div>
                  <StatusBadge status={product.status} />
                </header>
                <div className="stock-number"><strong>{product.stock_quantity}</strong><span>unidades<br />Mínimo: {product.minimum_stock}</span></div>
                <div className="inventory-labels">
                  <StatusBadge status={product.availability_type} />
                  <span className={`stock-level stock-level--${level.key}`}>{level.label}</span>
                </div>
                <footer>
                  <button onClick={() => setMovement({ product, type: 'Input' })}><ArrowDownToLine /> Entrada</button>
                  <button onClick={() => setMovement({ product, type: 'Output' })} disabled={product.stock_quantity === 0}><ArrowUpFromLine /> Salida</button>
                </footer>
              </article>
            )
          })}
        </div>
      ) : <EmptyState text="No hay artículos para este nivel de stock." />}

      <Modal
        open={Boolean(movement)}
        title={`${movement?.type === 'Input' ? 'Registrar entrada' : 'Registrar salida'} · ${movement?.product.name || ''}`}
        onClose={() => { setMovement(null); setError('') }}
      >
        <form onSubmit={save}>
          {error && <div className="form-alert">{error}</div>}
          <div className="stock-preview">
            <span>Stock actual</span><strong>{movement?.product.stock_quantity}</strong>
            <span>Stock resultante</span><strong>{movement ? movement.product.stock_quantity + (movement.type === 'Input' ? Number(form.quantity || 0) : -Number(form.quantity || 0)) : 0}</strong>
          </div>
          <FormField label="Cantidad" required><input type="number" min="1" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></FormField>
          <FormField label="Motivo" required><textarea rows="3" maxLength={250} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></FormField>
          <div className="modal-actions"><button type="button" className="button button--outline" onClick={() => setMovement(null)}>Cancelar</button><button className="button button--primary">Confirmar movimiento</button></div>
        </form>
      </Modal>
    </>
  )
}
