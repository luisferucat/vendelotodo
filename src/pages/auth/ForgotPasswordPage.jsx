import { useState } from 'react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { requestPasswordReset, isDemo } = useAuth()
  const submit = async (event) => { event.preventDefault(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Ingrese un correo electrónico válido.'); try { await requestPasswordReset(email); setSent(true) } catch { setError('No fue posible enviar el correo. Intente nuevamente.') } }
  return <main className="simple-auth"><Link to="/ingresar" className="back-link"><ArrowLeft /> Volver</Link><section><MailCheck /><p className="eyebrow">Recuperar acceso</p><h1>Restablezca su contraseña</h1>{sent ? <div className="inline-success"><strong>Revise su correo electrónico.</strong><p>Si existe una cuenta asociada, recibirá un enlace para crear una nueva contraseña.{isDemo && ' En modo demostración no se envía un correo real.'}</p></div> : <form onSubmit={submit}><p>Indique el correo de su cuenta interna.</p>{error && <div className="form-alert">{error}</div>}<FormField label="Correo electrónico" required><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField><button className="button button--primary button--full">Enviar enlace</button></form>}</section></main>
}
