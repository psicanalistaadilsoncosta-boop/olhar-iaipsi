// lib/analistaServidor.js
// Identifica o analista pelo login (cookie) e confere se o paciente é dele.
import { createClient as criarClienteSessao } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Devolve o id do analista logado, ou null
export async function analistaLogadoId() {
  const supabase = await criarClienteSessao()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

// Devolve o id do analista se o respondente for dele; senão, null
export async function analistaDoRespondente(respondenteId) {
  if (!respondenteId) return null
  const analistaId = await analistaLogadoId()
  if (!analistaId) return null

  const { data, error } = await admin
    .from('olhar_respondentes')
    .select('id')
    .eq('id', respondenteId)
    .eq('analista_id', analistaId)
    .maybeSingle()

  if (error) console.error('[analistaServidor] erro:', error)
  return data ? analistaId : null
}