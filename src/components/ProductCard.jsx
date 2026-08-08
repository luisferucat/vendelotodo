import { ArrowRight, Box, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatters'

export default function ProductCard({ product }) {
  const unavailable = product.availability_type === 'InStock' && product.stock_quantity === 0
  const onRequest = product.availability_type === 'OnRequest'
  return (
    <article className="product-card">
      <div className="product-visual">
        {product.product_type === 'AirConditioner' ? <Wind size={42} /> : <Box size={42} />}
        <span className={`availability ${unavailable ? 'availability--out' : onRequest ? 'availability--request' : ''}`}>
          {unavailable ? 'Agotado' : onRequest ? 'Bajo pedido' : 'Disponible'}
        </span>
      </div>
      <div className="product-body">
        <p className="eyebrow">{product.category?.name || 'Producto'}</p>
        <h3>{product.name}</h3>
        <p className="line-clamp">{product.description}</p>
        <div className="product-meta"><strong>{formatCurrency(product.sale_price)}</strong>{product.btu && <span>{product.btu.toLocaleString('es-CR')} BTU</span>}</div>
        <Link to={`/catalogo/${product.id}`} className="text-link">Ver detalle <ArrowRight size={16} /></Link>
      </div>
    </article>
  )
}
