import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim()
  }
}

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey || serviceKey.includes('PEGUE_AQUI')) {
  throw new Error('Configure VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env antes de ejecutar este script.')
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const users = [
  { email: 'admin@vendelotodo.test', password: 'AdminQA2026!', full_name: 'Administrador QA', role: 'Administrator' },
  { email: 'tecnico1@vendelotodo.test', password: 'TecnicoQA2026!', full_name: 'Técnico Uno', role: 'Technician' },
  { email: 'tecnico2@vendelotodo.test', password: 'TecnicoQA2026!', full_name: 'Técnico Dos', role: 'Technician' },
]

const { data: existing, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (listError) throw listError

for (const entry of users) {
  let authUser = existing.users.find((user) => user.email === entry.email)
  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({ email: entry.email, password: entry.password, email_confirm: true })
    if (error) throw error
    authUser = data.user
  }
  const { error: profileError } = await supabase.from('profiles').upsert({ id: authUser.id, email: entry.email, full_name: entry.full_name, role: entry.role, status: 'Active' })
  if (profileError) throw profileError
  process.stdout.write(`Preparado: ${entry.email} (${entry.role})\n`)
}

process.stdout.write('\nUsuarios QA creados. Proteja la service_role y no la configure en Vercel.\n')
