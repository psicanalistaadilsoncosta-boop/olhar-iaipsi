import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function buscarRespondente(token) {
  if (!token || typeof token !== 'string') return null
  const { data } = await supabase
    .from('olhar_respondentes')
    .select('id')
    .eq('token', token)
    .maybeSingle()
  return data
}

// Leitura: devolve a última devolutiva enviada ao paciente dono do token
export async function POST(req) {
  try {
    const { token } = await req.json()
    const resp = await buscarRespondente(token)
    if (!resp) return Response.json({ ok: false }, { status: 404 })

    const { data, error } = await supabase
      .from('olhar_devolutivas')
      .select('*')
      .eq('respondente_id', resp.id)
      .eq('status', 'enviada')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) console.error('[protocolo/devolutiva] erro ao ler:', error)
    if (error || !data) return Response.json({ ok: false }, { status: 404 })

    return Response.json({ ok: true, devolutiva: data })
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 })
  }
}


// Gravação: registra a resposta do paciente à devolutiva
export async function PUT(req) {
  try {
    const {
      token,
      devolutiva_id,
      resposta_paciente,
      acoes_respondidas,
      respostas_situacoes_retomadas,
      observacoes_paciente,
    } = await req.json()

    const resp = await buscarRespondente(token)
    if (!resp) return Response.json({ ok: false }, { status: 404 })

    if (!devolutiva_id || typeof resposta_paciente !== 'string' || !resposta_paciente.trim()) {
      return Response.json({ ok: false }, { status: 400 })
    }

    // Só atualiza se a devolutiva for deste paciente e ainda estiver "enviada"
    const { data: atualizada, error } = await supabase
      .from('olhar_devolutivas')
      .update({
        resposta_paciente,
        resposta_paciente_at: new Date().toISOString(),
        acoes_respondidas,
        respostas_situacoes_retomadas,
        observacoes_paciente,
        status: 'respondida',
      })
      .eq('id', devolutiva_id)
      .eq('respondente_id', resp.id)
      .eq('status', 'enviada')
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('[protocolo/devolutiva] erro ao gravar:', error)
      return Response.json({ ok: false }, { status: 500 })
    }
    if (!atualizada) return Response.json({ ok: false }, { status: 404 })

    // Conta as devolutivas respondidas (já inclui esta)
    const { count } = await supabase
      .from('olhar_devolutivas')
      .select('*', { count: 'exact', head: true })
      .eq('respondente_id', resp.id)
      .eq('status', 'respondida')

    const { error: erroResp } = await supabase
      .from('olhar_respondentes')
      .update({ status: 'ativo', interacoes_concluidas: count || 0 })
      .eq('id', resp.id)

    if (erroResp) console.error('[protocolo/devolutiva] erro no respondente:', erroResp)

    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 })
  }
}