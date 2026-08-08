import { useState } from 'react'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { session, profile, signIn, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  if (session && profile) return <Navigate to={profile.role === 'Administrator' ? '/admin' : '/tecnico'} replace />
  const submit = async (event) => { event.preventDefault(); setError(''); if (!email || !password) return setError('Ingrese el correo y la contraseña.'); setLoading(true); try { const user = await signIn(email, password); const destination = location.state?.from?.pathname || (user?.role === 'Administrator' ? '/admin' : user?.role === 'Technician' ? '/tecnico' : '/'); navigate(destination, { replace: true }) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  const fill = (role) => { if (role === 'admin') { setEmail('admin@vendelotodo.test'); setPassword('AdminQA2026!') } else { setEmail('tecnico1@vendelotodo.test'); setPassword('TecnicoQA2026!') } }
  return <main className="auth-page"><section className="auth-brand"><Link to="/" className="back-link light"><ArrowLeft /> Volver al sitio</Link><div><span className="auth-logo">V</span><p className="eyebrow eyebrow--light">Portal interno</p><h1>El trabajo del día, organizado en un solo lugar.</h1><p>Acceso exclusivo para administración y personal técnico de VendeloTodo.</p></div><small><ShieldCheck /> Autenticación protegida por Supabase</small></section><section className="auth-form"><form onSubmit={submit} noValidate><span className="auth-icon"><LockKeyhole /></span><p className="eyebrow">Bienvenido</p><h2>Ingrese a su cuenta</h2><p>Use las credenciales asignadas por el administrador.</p>{error && <div className="form-alert" role="alert">{error}</div>}<FormField label="Correo electrónico" required><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField><FormField label="Contraseña" required><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><Link className="forgot-link" to="/olvide-clave">Olvidé mi contraseña</Link><button className="button button--primary button--full" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>{isDemo && <div className="demo-credentials"><strong>Accesos rápidos — modo demostración</strong><button type="button" onClick={() => fill('admin')}>Usar administrador QA</button><button type="button" onClick={() => fill('tech')}>Usar técnico QA</button></div>}</form></section></main>
}
