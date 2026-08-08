import { useEffect, useState } from 'react'
import { ArrowRight, Drill, PlugZap, Snowflake, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingScreen from '../../components/LoadingScreen'
import { dataService } from '../../services/dataService'
import { formatCurrency } from '../../utils/formatters'

const icons = { Handyman: Wrench, ACInstallation: Snowflake, ACRepair: Snowflake, ApplianceRepair: Drill }
export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { dataService.getServices().then((rows) => { setServices(rows); setLoading(false) }) }, [])
  return <section className="page-section"><div className="page-hero compact"><p className="eyebrow">Servicios técnicos</p><h1>Trabajo bien hecho, desde la primera visita</h1><p>Solicite atención en cualquiera de nuestras zonas de cobertura. El precio mostrado es una base estimada.</p></div>{loading ? <LoadingScreen /> : <div className="service-grid">{services.map((service) => { const Icon = icons[service.service_type] || PlugZap; return <article key={service.id} className="service-card"><span><Icon /></span><h2>{service.name}</h2><p>{service.description}</p><small>Precio base desde</small><strong>{formatCurrency(service.base_price)}</strong><Link className="text-link" to={`/solicitar-servicio?service=${service.id}`}>Solicitar este servicio <ArrowRight size={16} /></Link></article> })}</div>}</section>
}
