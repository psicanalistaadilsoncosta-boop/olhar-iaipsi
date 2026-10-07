import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
        const token = searchParams.get('t')
    if (!token) return Response.json({ error: 'Token obrigatório' }, { status: 400 })

    // Descobre o paciente pelo token do link
    const { data: resp } = await supabase
      .from('olhar_respondentes')
      .select('id')
      .eq('token', token)
      .maybeSingle()
    if (!resp) return Response.json({ error: 'Token inválido' }, { status: 403 })
    const id = resp.id

    const { data, error } = await supabase
      .from('olhar_respostas')
      .select('*')
      .eq('respondente_id', id)
      .eq('ciclo', 1)
      .order('situacao_index')

    if (error) throw error
    return Response.json({ respostas: data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}