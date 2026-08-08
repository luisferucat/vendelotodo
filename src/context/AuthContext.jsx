import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const demoSessionKey = 'vendelotodo_demo_session'

const demoUsers = {
  'admin@vendelotodo.test': { id: 'admin-1', full_name: 'Administrador QA', email: 'admin@vendelotodo.test', role: 'Administrator', status: 'Active', password: 'AdminQA2026!' },
  'tecnico1@vendelotodo.test': { id: 'tech-1', full_name: 'Técnico Uno', email: 'tecnico1@vendelotodo.test', role: 'Technician', status: 'Active', password: 'TecnicoQA2026!' },
  'tecnico2@vendelotodo.test': { id: 'tech-2', full_name: 'Técnico Dos', email: 'tecnico2@vendelotodo.test', role: 'Technician', status: 'Active', password: 'TecnicoQA2026!' },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const saved = sessionStorage.getItem(demoSessionKey)
      if (saved) {
        const user = JSON.parse(saved)
        setSession({ user: { id: user.id, email: user.email } })
        setProfile(user)
      }
      setLoading(false)
      return undefined
    }

    const loadProfile = async (currentSession) => {
      setSession(currentSession)
      if (!currentSession) {
        setProfile(null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single()
      setProfile(error ? null : data)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => loadProfile(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const user = demoUsers[email.toLowerCase()]
      if (!user || user.password !== password) throw new Error('Correo o contraseña incorrectos.')
      if (user.status !== 'Active') throw new Error('El usuario se encuentra inactivo.')
      const safe = { ...user }
      delete safe.password
      sessionStorage.setItem(demoSessionKey, JSON.stringify(safe))
      setSession({ user: { id: safe.id, email: safe.email } })
      setProfile(safe)
      return safe
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Correo o contraseña incorrectos.')
    return data
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    sessionStorage.removeItem(demoSessionKey)
    setSession(null)
    setProfile(null)
  }

  const requestPasswordReset = async (email) => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/restablecer-clave` })
    if (error) throw error
  }

  const updatePassword = async (password) => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const value = useMemo(() => ({ session, profile, loading, signIn, signOut, requestPasswordReset, updatePassword, isDemo: !isSupabaseConfigured }), [session, profile, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
