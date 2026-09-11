import { createClient } from '@/lib/supabase/server'

export async function POST(req) {
  try {
 const {
      devolutiva_id,
      enunciado_final,
      acoes,
      nota_supervisor,
      situacoes_retomadas,
    } = await req.json()

    if (!devolutiva_id || !enunciado_final) {
      return Response.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

          const { error } = await supabase
        .from('olhar_devolutivas')
        .update({
          enunciado_final,
          acoes,
          nota_supervisor,
          situacoes_retomadas: situacoes_retomadas || [],
          status: 'enviada',
          enviada_at: new Date().toISOString(),
        })
        .eq('id', devolutiva_id)

    if (error) throw error

    // Atualiza status do respondente
    const { data: dev } = await supabase
      .from('olhar_devolutivas')
      .select('respondente_id')
      .eq('id', devolutiva_id)
      .single()

    if (dev?.respondente_id) {
      await supabase
        .from('olhar_respondentes')
        .update({ status: 'devolutiva' })
        .eq('id', dev.respondente_id)
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[devolutiva]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
