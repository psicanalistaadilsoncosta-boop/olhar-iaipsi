import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()

    // Descobre o paciente pelo token do link
    if (!body.token || typeof body.token !== 'string') {
      return Response.json({ error: 'Token obrigatório' }, { status: 400 })
    }
    const { data: resp } = await supabase
      .from('olhar_respondentes')
      .select('id')
      .eq('token', body.token)
      .maybeSingle()
    if (!resp) return Response.json({ error: 'Token inválido' }, { status: 403 })

    // Só os campos de uma resposta; o paciente vem do token
    const row = {
      respondente_id: resp.id,
      ciclo: Number(body.ciclo) || 1,
      situacao_index: body.situacao_index,
      bloco: body.bloco,
      tipo_resposta: body.tipo_resposta,
      resposta_texto: body.resposta_texto ?? null,
      resposta_opcao: body.resposta_opcao ?? null,
      pulada: !!body.pulada,
    }

    // Upsert — atualiza se já existe, cria se não existe
    const { error } = await supabase
      .from('olhar_respostas')
      .upsert(row, {
        onConflict: 'respondente_id,ciclo,situacao_index',
        ignoreDuplicates: false,
      })

    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[salvar-resposta]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}