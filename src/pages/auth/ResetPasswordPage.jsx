import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const submit = async (event) => { event.preventDefault(); if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.'); if (password !== confirm) return setError('Las contraseñas no coinciden.'); try { await updatePassword(password); navigate('/ingresar') } catch { setError('El enlace expiró o no es válido. Solicite uno nuevo.') } }
  return <main className="simple-auth"><section><KeyRound /><p className="eyebrow">Nueva contraseña</p><h1>Proteja su cuenta</h1><form onSubmit={submit}>{error && <div className="form-alert">{error}</div>}<FormField label="Nueva contraseña" required><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><FormField label="Confirmar contraseña" required><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></FormField><button className="button button--primary button--full">Guardar contraseña</button></form></section></main>
}
