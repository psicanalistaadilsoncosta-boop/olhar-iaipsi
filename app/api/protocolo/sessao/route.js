import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Devolve a próxima sessão agendada do paciente dono do token.
// Se vier "acao" (confirmar ou reagendar), grava a resposta nessa sessão.
export async function POST(req) {
  try {
    const { token, acao } = await req.json()

    if (!token || typeof token !== 'string') {
      return Response.json({ ok: false }, { status: 400 })
    }

    const { data: resp } = await supabase
      .from('olhar_respondentes')
      .select('id')
      .eq('token', token)
      .maybeSingle()

    if (!resp) {
      return Response.json({ ok: false }, { status: 404 })
    }

    const { data: sessao, error } = await supabase
      .from('olhar_sessoes')
      .select('*')
      .eq('respondente_id', resp.id)
      .eq('status', 'agendada')
      .order('data_sessao', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) console.error('[protocolo/sessao] erro ao ler:', error)

    if (acao && sessao) {
      const mapa = { confirmar: 'confirmada', reagendar: 'reagendar' }
      const confirmacao = mapa[acao]
      if (!confirmacao) {
        return Response.json({ ok: false }, { status: 400 })
      }

      const { error: erroUpdate } = await supabase
        .from('olhar_sessoes')
        .update({ confirmacao })
        .eq('id', sessao.id)

      if (erroUpdate) {
        console.error('[protocolo/sessao] erro ao gravar:', erroUpdate)
        return Response.json({ ok: false }, { status: 500 })
      }
      sessao.confirmacao = confirmacao
    }

    return Response.json({ ok: true, sessao: sessao || null })
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 })
  }
}