import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
        const body = await req.json()
    const { respondente_id, respostas, apenas_criar } = body

    if (apenas_criar) {
      const { data, error } = await supabase
        .from('olhar_respondentes')
        .insert({ status: 'questionario' })
        .select('id')
        .single()
      if (error) throw error
      return Response.json({ id: data.id })
    }

    if (!respondente_id) {
      return Response.json({ error: 'Token inválido' }, { status: 400 })
    }

    // Atualiza status
    await supabase
      .from('olhar_respondentes')
      .update({ status: 'aguardando' })
      .eq('id', respondente_id)

    // Remove respostas anteriores do mesmo ciclo para evitar duplicatas
    await supabase
      .from('olhar_respostas')
      .delete()
      .eq('respondente_id', respondente_id)
      .eq('ciclo', 1)

    // Insere as novas
    const rows = respostas.map(r => ({ ...r, respondente_id }))
    const { error } = await supabase
      .from('olhar_respostas')
      .insert(rows)

    if (error) throw error

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[salvar-questionario]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}