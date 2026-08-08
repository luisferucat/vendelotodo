import { useEffect, useState } from 'react'
import { ToggleLeft, UserCog } from 'lucide-react'
import LoadingScreen from '../../components/LoadingScreen'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { dataService } from '../../services/dataService'

export default function UsersPage() {
  const [profiles, setProfiles] = useState(null)
  const { profile: current } = useAuth()
  const { show } = useToast()
  const load = () => dataService.getProfiles().then(setProfiles)
  useEffect(() => { load() }, [])
  const toggle = async (profile) => { if (profile.id === current.id) return show('No puede desactivar su propia cuenta.', 'error'); const status = profile.status === 'Active' ? 'Inactive' : 'Active'; if (!window.confirm(`¿Desea cambiar el usuario a ${status === 'Active' ? 'Activo' : 'Inactivo'}?`)) return; try { await dataService.updateProfile(profile.id, { status }); show('Estado del usuario actualizado.'); await load() } catch (error) { show(error.message, 'error') } }
  if (!profiles) return <LoadingScreen />
  return <><PageHeader eyebrow="Accesos internos" title="Usuarios y técnicos" description="Los usuarios se crean en Supabase Auth; aquí se controla su rol y estado operativo." /><div className="user-grid">{profiles.map((profile) => <article key={profile.id}><span className="large-avatar"><UserCog /></span><div><h3>{profile.full_name}</h3><p>{profile.email}</p></div><div className="profile-badges"><span>{profile.role === 'Administrator' ? 'Administrador' : 'Técnico'}</span><StatusBadge status={profile.status} /></div><button className="button button--outline button--small" disabled={profile.id === current.id} onClick={() => toggle(profile)}><ToggleLeft /> {profile.status === 'Active' ? 'Desactivar' : 'Reactivar'}</button></article>)}</div></>
}
