import { Link } from 'react-router-dom'
export default function ForbiddenPage() { return <main className="standalone-state"><b>403</b><h1>Acceso no autorizado</h1><p>Su usuario no tiene permisos para ingresar a esta sección.</p><Link className="button button--primary" to="/ingresar">Volver a ingresar</Link></main> }
