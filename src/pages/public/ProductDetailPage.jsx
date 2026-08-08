import { useEffect, useState } from 'react'
import { ArrowLeft, Box, CheckCircle2, PackageX, Wind } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import { dataService } from '../../services/dataService'
import { formatCurrency } from '../../utils/formatters'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(undefined)
  useEffect(() => { dataService.getProducts().then((rows) => setProduct(rows.find((item) => item.id === productId) || null)) }, [productId])
  if (product === undefined) return <LoadingScreen />
  if (!product) return <main className="standalone-state embedded"><PackageX size={42} /><h1>Producto no encontrado</h1><p>El producto no existe o ya no está activo.</p><Link className="button button--primary" to="/catalogo">Volver al catálogo</Link></main>
  const available = product.availability_type === 'OnRequest' || product.stock_quantity > 0
  return (
    <section className="page-section detail-page">
      <Link className="back-link" to="/catalogo"><ArrowLeft size={17} /> Volver al catálogo</Link>
      <div className="product-detail">
        <div className="product-detail-visual">{product.product_type === 'AirConditioner' ? <Wind size={96} /> : <Box size={96} />}</div>
        <div><p className="eyebrow">{product.category?.name} · {product.sku}</p><h1>{product.name}</h1><p className="lead">{product.description}</p><strong className="detail-price">{formatCurrency(product.sale_price)}</strong>
          <div className={`stock-callout ${available ? '' : 'stock-callout--out'}`}><CheckCircle2 /><div><strong>{product.availability_type === 'OnRequest' ? 'Disponible bajo pedido' : available ? 'Disponible para compra' : 'Temporalmente agotado'}</strong><span>{product.availability_type === 'OnRequest' ? 'El tiempo y disponibilidad se confirman al gestionar la solicitud.' : available ? 'Existencias verificadas en el catálogo.' : 'Puede consultar otras alternativas.'}</span></div></div>
          {product.btu && <dl className="specs"><div><dt>Marca</dt><dd>{product.brand}</dd></div><div><dt>Capacidad</dt><dd>{product.btu.toLocaleString('es-CR')} BTU</dd></div></dl>}
          <div className="button-row"><Link className="button button--primary" to="/cotizador">Agregar a una cotización</Link><Link className="button button--outline" to="/solicitar-servicio">Solicitar ayuda</Link></div>
        </div>
      </div>
    </section>
  )
}
