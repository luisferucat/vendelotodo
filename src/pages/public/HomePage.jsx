import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, CalendarCheck, MapPin, ShieldCheck, Star, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { dataService } from '../../services/dataService'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState([])
  useEffect(() => {
    dataService.getProducts().then((rows) => setProducts(rows.filter((item) => item.stock_quantity > 0).slice(0, 3)))
    dataService.getReviews().then((rows) => setReviews(rows.slice(0, 2)))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow eyebrow--light">Servicio local en la Zona Norte</p>
          <h1>Todo lo que su hogar necesita, <em>bien resuelto.</em></h1>
          <p>Ferretería, electrodomésticos, aire acondicionado y técnicos de confianza en un solo lugar.</p>
          <div className="button-row"><Link className="button button--accent" to="/catalogo">Explorar catálogo <ArrowRight size={18} /></Link><Link className="button button--ghost-light" to="/solicitar-servicio">Solicitar servicio</Link></div>
          <div className="hero-proof"><span><ShieldCheck /> Atención confiable</span><span><MapPin /> Cobertura local</span><span><CalendarCheck /> Visitas coordinadas</span></div>
        </div>
        <div className="hero-card">
          <div className="hero-card-icon"><Wrench /></div>
          <p>¿No sabe cuánto puede costar?</p><h2>Obtenga una estimación en minutos.</h2>
          <Link to="/cotizador">Abrir cotizador <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="section service-strip">
        <article><span>01</span><div><h3>Productos útiles</h3><p>Inventario para reparaciones y el hogar.</p></div></article>
        <article><span>02</span><div><h3>Técnicos de campo</h3><p>Fontanería, electricidad e instalaciones.</p></div></article>
        <article><span>03</span><div><h3>Aire acondicionado</h3><p>Venta, instalación y reparación.</p></div></article>
      </section>

      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">Selección disponible</p><h2>Productos destacados</h2></div><Link className="text-link" to="/catalogo">Ver catálogo completo <ArrowRight size={16} /></Link></div>
        <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="about-band">
        <div><p className="eyebrow eyebrow--light">Quiénes somos</p><h2>Un equipo pequeño que conoce la zona y responde.</h2></div>
        <div><p>VendeloTodo reúne soluciones prácticas para la casa con la atención cercana de un administrador y dos técnicos de campo.</p><ul><li><BadgeCheck /> Precios y disponibilidad claros</li><li><BadgeCheck /> Solicitudes sin registro obligatorio</li><li><BadgeCheck /> Seguimiento organizado de cada trabajo</li></ul></div>
      </section>

      <section className="section testimonials">
        <div className="section-heading"><div><p className="eyebrow">Experiencias reales</p><h2>Lo que dicen nuestros clientes</h2></div></div>
        <div className="testimonial-grid">{reviews.map((review) => <blockquote key={review.id}><div>{Array.from({ length: review.rating }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}</div><p>“{review.comment}”</p><footer><strong>{review.customer_name}</strong><span>{review.service_name}</span></footer></blockquote>)}</div>
      </section>
    </>
  )
}
