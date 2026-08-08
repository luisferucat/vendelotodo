import { useEffect, useState } from 'react'
import { AlertTriangle, Boxes, ClipboardList, Clock3, Star, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { dataService } from '../../services/dataService'
import { formatDate } from '../../utils/formatters'

function stockAlertLabel(product) {
  if (product.stock_quantity === 0) return 'Agotado'
  if (product.stock_quantity < product.minimum_stock) return 'Debajo del mínimo'
  return 'En el mínimo'
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([
      dataService.getProducts({ includeInactive: true }),
      dataService.getOrders(),
      dataService.getPayments(),
      dataService.getReviews({ includeAll: true }),
    ]).then(([products, orders, payments, reviews]) => setData({ products, orders, payments, reviews }))
  }, [])

  if (!data) return <LoadingScreen />

  const lowStock = data.products.filter((item) =>
    item.status === 'Active' &&
    item.availability_type === 'InStock' &&
    item.stock_quantity <= item.minimum_stock,
  )
  const pendingOrders = data.orders.filter((item) => item.status === 'Pending')
  const pendingPayments = data.payments.filter((item) => item.status === 'Pending')
  const pendingReviews = data.reviews.filter((item) => item.moderation_status === 'Pending')

  return (
    <>
      <PageHeader
        eyebrow="Panel administrativo"
        title="Resumen operativo"
        description="Seleccione una tarjeta para abrir directamente los registros que requieren atención."
      />

      <section className="metric-grid">
        <Link className="metric-card" to="/admin/ordenes?status=Pending" aria-label="Ver órdenes pendientes">
          <span><ClipboardList /></span>
          <div><small>Órdenes pendientes</small><strong>{pendingOrders.length}</strong><b>Ver órdenes →</b></div>
        </Link>
        <Link className="metric-card" to="/admin/inventario?filter=low" aria-label="Ver artículos con stock bajo">
          <span><Boxes /></span>
          <div><small>Artículos con stock bajo</small><strong>{lowStock.length}</strong><b>Ver inventario →</b></div>
        </Link>
        <Link className="metric-card" to="/admin/pagos?status=Pending" aria-label="Ver pagos pendientes de revisión">
          <span><WalletCards /></span>
          <div><small>Pagos por revisar</small><strong>{pendingPayments.length}</strong><b>Ver pagos →</b></div>
        </Link>
        <Link className="metric-card" to="/admin/resenas?status=Pending" aria-label="Ver reseñas pendientes de moderación">
          <span><Star /></span>
          <div><small>Reseñas por moderar</small><strong>{pendingReviews.length}</strong><b>Ver reseñas →</b></div>
        </Link>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <header>
            <div><p className="eyebrow">Atención requerida</p><h2>Órdenes recientes</h2></div>
            <Link to="/admin/ordenes">Ver todas</Link>
          </header>
          <div className="compact-list">
            {data.orders.slice(0, 5).map((order) => (
              <article key={order.id}>
                <span className="list-icon"><Clock3 /></span>
                <div><strong>{order.order_number}</strong><small>{order.customer_name} · {order.service_name}</small></div>
                <div><StatusBadge status={order.status} /><small>{formatDate(order.created_at)}</small></div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <header>
            <div><p className="eyebrow">Control de stock</p><h2>Artículos con stock bajo</h2></div>
            <Link to="/admin/inventario?filter=low">Abrir inventario</Link>
          </header>
          <div className="compact-list">
            {lowStock.length ? lowStock.slice(0, 5).map((product) => (
              <article key={product.id}>
                <span className="list-icon warning"><AlertTriangle /></span>
                <div><strong>{product.name}</strong><small>{product.sku} · Mínimo {product.minimum_stock}</small></div>
                <div><strong>{product.stock_quantity} unidades</strong><small className="stock-alert-text">{stockAlertLabel(product)}</small></div>
              </article>
            )) : <p className="empty-inline">No hay artículos activos con stock bajo.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
