import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Envio final do questionário pelo paciente.
// O paciente é identificado pelo token do link; um id enviado pela página é ignorado.
export async function POST(req) {
  try {
    const { token, respostas } = await req.json()

    if (!token || typeof token !== 'string') {
      return Response.json({ error: 'Token obrigatório' }, { status: 400 })
    }
    if (!Array.isArray(respostas)) {
      return Response.json({ error: 'Respostas ausentes' }, { status: 400 })
    }

    const { data: resp } = await supabase
      .from('olhar_respondentes')
      .select('id')
      .eq('token', token)
      .maybeSingle()
    if (!resp) return Response.json({ error: 'Token inválido' }, { status: 403 })

    // Remove respostas anteriores do ciclo 1 para evitar duplicatas
    const { error: erroDelete } = await supabase
      .from('olhar_respostas')
      .delete()
      .eq('respondente_id', resp.id)
      .eq('ciclo', 1)
    if (erroDelete) throw erroDelete

    // Insere só os campos de cada resposta; o paciente vem do token
    const rows = respostas.map(r => ({
      respondente_id: resp.id,
      ciclo: 1,
      situacao_index: r.situacao_index,
      bloco: r.bloco,
      tipo_resposta: r.tipo_resposta,
      resposta_texto: r.resposta_texto ?? null,
      resposta_opcao: r.resposta_opcao ?? null,
      pulada: !!r.pulada,
    }))
    const { error } = await supabase.from('olhar_respostas').insert(rows)
    if (error) throw error

    // Só muda o status depois que as respostas foram gravadas
    await supabase
      .from('olhar_respondentes')
      .update({ status: 'aguardando' })
      .eq('id', resp.id)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[salvar-questionario]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}