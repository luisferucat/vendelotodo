import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import ProductCard from '../../components/ProductCard'
import { dataService } from '../../services/dataService'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [loading, setLoading] = useState(true)
  useEffect(() => { Promise.all([dataService.getProducts(), dataService.getCategories()]).then(([p, c]) => { setProducts(p); setCategories(c); setLoading(false) }) }, [])
  const filtered = useMemo(() => products.filter((item) => {
    const term = search.toLowerCase().trim()
    const matchesSearch = !term || `${item.name} ${item.description} ${item.sku}`.toLowerCase().includes(term)
    const matchesCategory = category === 'all' || item.category_id === category
    const matchesAvailability = availability === 'all' || (availability === 'available' && item.availability_type === 'InStock' && item.stock_quantity > 0) || (availability === 'request' && item.availability_type === 'OnRequest') || (availability === 'out' && item.availability_type === 'InStock' && item.stock_quantity === 0)
    return matchesSearch && matchesCategory && matchesAvailability
  }), [products, search, category, availability])

  return (
    <section className="page-section">
      <div className="page-hero compact"><p className="eyebrow">Catálogo público</p><h1>Encuentre justo lo que necesita</h1><p>Consulte precios y disponibilidad actual. Los artículos inactivos se mantienen fuera del catálogo.</p></div>
      <div className="catalog-tools">
        <label className="search-box"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, código o descripción" /></label>
        <label><SlidersHorizontal size={17} /><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Todas las categorías</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label><select value={availability} onChange={(e) => setAvailability(e.target.value)}><option value="all">Cualquier disponibilidad</option><option value="available">Disponible</option><option value="request">Bajo pedido</option><option value="out">Agotado</option></select></label>
      </div>
      <div className="result-count">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</div>
      {loading ? <LoadingScreen /> : filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState text="No hay productos que coincidan con la búsqueda y los filtros seleccionados." />}
    </section>
  )
}
