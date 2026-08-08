import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LockKeyhole, Menu, X } from 'lucide-react'

const links = [
  ['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/servicios', 'Servicios'], ['/cotizador', 'Cotizador'],
  ['/solicitar-servicio', 'Solicitar servicio'], ['/resenas', 'Reseñas'], ['/pago-sinpe', 'Pago SINPE'],
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="site-shell">
      <header className="public-header">
        <Link className="brand" to="/" onClick={() => setOpen(false)}><span>V</span><div>VendeloTodo<small>Soluciones para su hogar</small></div></Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label="Abrir menú">{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'public-nav is-open' : 'public-nav'}>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <Link className="button button--small button--dark" to="/ingresar" onClick={() => setOpen(false)}><LockKeyhole size={15} /> Personal</Link>
        </nav>
      </header>
      <main><Outlet /></main>
      <footer className="public-footer">
        <div><Link className="brand brand--light" to="/"><span>V</span><div>VendeloTodo<small>Servicio local, atención cercana</small></div></Link><p>Productos y soluciones técnicas para hogares de la Zona Norte.</p></div>
        <div><h3>Cobertura</h3><p>San Carlos · Río Cuarto<br />La Virgen de Sarapiquí · Santa Rosa</p></div>
        <div><h3>Contacto</h3><a href="mailto:vedelotodoucat@gmail.com">vedelotodoucat@gmail.com</a><p>Lunes a sábado, 8:00 a.m. – 5:00 p.m.</p></div>
        <small>© 2026 VendeloTodo · Release 1 · WhatsApp no incluido en esta versión.</small>
      </footer>
    </div>
  )
}
