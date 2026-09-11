import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 })

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