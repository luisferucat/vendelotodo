import { LoaderCircle } from 'lucide-react'

export default function LoadingScreen({ label = 'Cargando información…' }) {
  return <div className="loading"><LoaderCircle className="spin" size={30} /><span>{label}</span></div>
}
