import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Boxes, Building2, ClipboardList, FileText, Gauge, LogOut, Menu, PackageSearch, ShieldCheck, Star,
  Users, WalletCards, Wrench, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const adminLinks = [
  ['/admin', 'Resumen', Gauge, true], ['/admin/productos', 'Productos', PackageSearch], ['/admin/inventario', 'Inventario', Boxes],
  ['/admin/proveedores', 'Proveedores', Building2],
  ['/admin/ordenes', 'Órdenes', ClipboardList], ['/admin/cotizaciones', 'Cotizaciones', FileText],
  ['/admin/pagos', 'Pagos SINPE', WalletCards], ['/admin/resenas', 'Reseñas', Star], ['/admin/usuarios', 'Usuarios', Users],
]
const techLinks = [['/tecnico', 'Mi resumen', Gauge, true], ['/tecnico/trabajos', 'Mis trabajos', Wrench]]

export default function PortalLayout({ role }) {
  const [open, setOpen] = useState(false)
  const { profile, signOut, isDemo } = useAuth()
  const navigate = useNavigate()
  const links = role === 'Administrator' ? adminLinks : techLinks
  const logout = async () => { await signOut(); navigate('/ingresar') }

  return (
    <div className="portal-shell">
      <aside className={open ? 'sidebar is-open' : 'sidebar'}>
        <div className="sidebar-top">
          <NavLink to="/" className="brand brand--light"><span>V</span><div>VendeloTodo<small>{role === 'Administrator' ? 'Administración' : 'Portal técnico'}</small></div></NavLink>
          <button className="sidebar-close" type="button" onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav>{links.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
        <div className="sidebar-user">
          <span className="avatar">{profile?.full_name?.charAt(0) || 'U'}</span>
          <div><strong>{profile?.full_name}</strong><small>{role === 'Administrator' ? 'Administrador' : 'Técnico'}</small></div>
          <button type="button" onClick={logout} aria-label="Cerrar sesión"><LogOut size={18} /></button>
        </div>
      </aside>
      <section className="portal-main">
        <header className="portal-header">
          <button className="menu-toggle portal-menu" type="button" onClick={() => setOpen(true)}><Menu /></button>
          <div><ShieldCheck size={18} /><span>Sesión protegida</span>{isDemo && <b>Modo demostración</b>}</div>
          <span>{profile?.email}</span>
        </header>
        <main className="portal-content"><Outlet /></main>
      </section>
      {open && <button className="sidebar-overlay" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
    </div>
  )
}
