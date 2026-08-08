import { Link } from 'react-router-dom'
export default function NotFoundPage() { return <main className="standalone-state"><b>404</b><h1>Página no encontrada</h1><p>La dirección solicitada no existe.</p><Link className="button button--primary" to="/">Volver al inicio</Link></main> }
