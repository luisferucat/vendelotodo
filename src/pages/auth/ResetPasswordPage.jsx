import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isCheckingLink, setIsCheckingLink] = useState(true)
  const [linkError, setLinkError] = useState('')
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const prepareRecoverySession = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code')

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
          window.history.replaceState({}, document.title, '/restablecer-clave')
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!data.session) throw new Error('No recovery session')
      } catch {
        if (mounted) setLinkError('El enlace expiró, ya fue utilizado o no es válido. Solicite uno nuevo.')
      } finally {
        if (mounted) setIsCheckingLink(false)
      }
    }

    prepareRecoverySession()
    return () => { mounted = false }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')

    try {
      await updatePassword(password)
      await supabase.auth.signOut()
      navigate('/ingresar', { replace: true })
    } catch {
      setError('No fue posible actualizar la contraseña. Solicite un enlace nuevo.')
    }
  }

  return <main className="simple-auth"><section><KeyRound /><p className="eyebrow">Nueva contraseña</p><h1>Proteja su cuenta</h1>{isCheckingLink ? <p>Validando el enlace de recuperación…</p> : linkError ? <div className="form-alert">{linkError}</div> : <form onSubmit={submit}>{error && <div className="form-alert">{error}</div>}<FormField label="Nueva contraseña" required><input type="password" minLength="8" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><FormField label="Confirmar contraseña" required><input type="password" minLength="8" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></FormField><button className="button button--primary button--full">Guardar contraseña</button></form>}</section></main>
}
