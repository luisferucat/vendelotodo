import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ allowedRole }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen label="Validando sesión…" />
  if (!session) return <Navigate to="/ingresar" replace state={{ from: location }} />
  if (!profile || profile.status !== 'Active' || profile.role !== allowedRole) return <Navigate to="/sin-permiso" replace />
  return <Outlet />
}
