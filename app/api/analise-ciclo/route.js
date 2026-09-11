import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { QUESTIONS } from '@/lib/questions'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function limpar(texto) {
  if (!texto) return ''
  return String(texto)
    .replace(/"/g, "'")
    .replace(/\\/g, '/')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
}

export async function POST(req) {
  try {
    const { respondente_id, devolutiva_anterior_id } = await req.json()

    const supabase = await createClient()

    // Busca respondente
    const { data: respondente } = await supabase
      .from('olhar_respondentes')
      .select('*')
      .eq('id', respondente_id)
      .single()

    if (!respondente) return Response.json({ error: 'Respondente não encontrado' }, { status: 404 })

    // Busca análise inicial (ciclo 1)
    const { data: analiseInicial } = await supabase
      .from('olhar_devolutivas')
      .select('analise_ia, tags_ia, situacoes_puladas, enunciado_final, ciclo')
      .eq('respondente_id', respondente_id)
      .eq('ciclo', 1)
      .neq('status', 'rascunho')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Busca devolutiva anterior respondida
    const { data: devAnterior } = await supabase
      .from('olhar_devolutivas')
      .select('*')
      .eq('id', devolutiva_anterior_id)
      .single()

    if (!devAnterior) return Response.json({ error: 'Devolutiva não encontrada' }, { status: 404 })

    // Próximo ciclo
    const proximoCiclo = (devAnterior.ciclo || 1) + 1

        // Monta ações com status
    const acoesComStatus = devAnterior.acoes?.map((acao, i) => {
      const resp = devAnterior.acoes_respondidas?.[i]
      const status = resp?.opcao || 'nao_respondeu'
      const obs = limpar(resp?.observacao || '')
      return `${acao.tipo}: ${limpar(acao.texto)} | Status: ${status}${obs ? ` | Observacao: ${obs}` : ''}`
    }).join('\n') || 'Nenhuma acao registrada'

    // Monta pendentes diretamente no código — não deixa para a IA decidir
   const acoesPendentesCalculadas = devAnterior.acoes
      ?.filter((_, i) => {
        const opcao = devAnterior.acoes_respondidas?.[i]?.opcao
        return opcao !== 'fiz'
      })
      .map(a => ({ tipo: a.tipo, texto: a.texto })) || []

       // Monta respostas das situações retomadas do ciclo anterior
    const situacoesRetomadas = devAnterior.situacoes_retomadas || []
    const respostasSituacoes = devAnterior.respostas_situacoes_retomadas || []
    const materialSituacoesRetomadas = situacoesRetomadas.length > 0
      ? situacoesRetomadas.map((s, i) => {
          const resp = respostasSituacoes[i]
          const resposta = resp === '__PULAR__' ? 'Preferiu nao responder desta vez'
            : resp ? limpar(resp)
            : 'Nao respondeu'
          return `Pergunta retomada: ${s.pergunta || s.situacao}\nResposta: ${resposta}`
        }).join('\n\n')
      : null

        // Situações puladas do questionário
    const { data: respostas } = await supabase
      .from('olhar_respostas')
      .select('*')
      .eq('respondente_id', respondente_id)
      .eq('ciclo', 1)
      .eq('pulada', true)

    // Quais já foram respondidas em ciclos anteriores
    const { data: todasDevolutivas } = await supabase
      .from('olhar_devolutivas')
      .select('situacoes_retomadas, respostas_situacoes_retomadas')
      .eq('respondente_id', respondente_id)
      .neq('status', 'rascunho')

    const jaRespondidas = new Set()
    todasDevolutivas?.forEach(d => {
      d.situacoes_retomadas?.forEach((s, i) => {
        const resp = d.respostas_situacoes_retomadas?.[i]
        if (resp && resp !== '__PULAR__' && resp !== '') {
          const match = s.situacao?.match(/\d+/)
          if (match) jaRespondidas.add(parseInt(match[0]) - 1)
        }
      })
    })

    // Filtra só as que ainda não foram respondidas
    const puladasFiltradas = respostas?.filter(r => !jaRespondidas.has(r.situacao_index)) || []

    const puladas = puladasFiltradas.map(r => {
      const q = QUESTIONS[r.situacao_index]
      return `Situacao ${r.situacao_index + 1} [${r.bloco}]: ${q?.text}`
    }).join('\n') || ''

        // Indexado por situacao_index para match correto
        const puladasMap = {}
    puladasFiltradas.forEach(r => {
      const q = QUESTIONS[r.situacao_index]
      puladasMap[r.situacao_index] = { situacao_index: r.situacao_index, bloco: r.bloco, pergunta: q?.text || '' }
    })

    const prompt = `Voce e um assistente clinico de um psicanalista brasileiro. Sua funcao e preparar material para o analista revisar antes de enviar ao paciente. Nunca envie diretamente.

Publico: adultos brasileiros de meia-idade (50-60 anos). Enquadramento: autodesenvolvimento - nao psicoterapia.

ANALISE INICIAL DO QUESTIONARIO (referencia permanente):
${limpar(analiseInicial?.analise_ia || 'Nao disponivel')}
Tags identificadas: ${analiseInicial?.tags_ia?.join(', ') || '—'}

DEVOLUTIVA ANTERIOR ENVIADA:
${limpar(devAnterior.enunciado_final || '')}

COMO ISSO SOOU PARA O PACIENTE:
${limpar(devAnterior.resposta_paciente || 'Nao respondeu')}

OBSERVACOES GERAIS DO PACIENTE:
${limpar(devAnterior.observacoes_paciente || 'Nenhuma')}

ACOES ENVIADAS E O QUE O PACIENTE FEZ:
${acoesComStatus}

${materialSituacoesRetomadas ? `SITUACOES RETOMADAS E COMO O PACIENTE RESPONDEU AGORA:
${materialSituacoesRetomadas}

` : ''}${puladas ? `SITUACOES DO QUESTIONARIO QUE O PACIENTE NAO RESPONDEU:${puladas}
` : ''}
Com base em tudo isso, gere SOMENTE um JSON valido, sem markdown. Use apenas aspas simples dentro dos valores, nunca aspas duplas:
{"analise_interna":"Analise tecnica em 3 paragrafos. Considere: (1) o que a resposta do paciente revela em relacao a analise inicial, (2) o que as acoes feitas ou nao feitas dizem sobre o momento atual, (3) o que ainda nao foi tocado e merece atencao.","situacoes_puladas":[{"situacao":"Situacao N - tema","hipotese":"Hipotese clinica sobre o silencio."}],"acoes_pendentes":[{"tipo":"Reflexao","texto":"APENAS acoes do ciclo anterior com status nao_consegui ou nao_tentei ou nao_respondeu. Se todas foram feitas, retorne array vazio []."}],"tags":["tag1","tag2","tag3"],"opcoes_enunciado":["Enunciado 1: 2-3 frases acolhedoras. Tom humano, sem diagnostico. Termina aberto.","Enunciado 2: angulo diferente.","Enunciado 3: mais suave."],"acoes":[{"tipo":"Reflexao","texto":"Acao NOVA para este ciclo — diferente das acoes_pendentes, nao repita o que esta la."},{"tipo":"Observacao","texto":"Segunda acao nova."},{"tipo":"Convite","texto":"Terceira acao nova — mais suave."}],"nota_supervisor":"Uma frase de alerta para o supervisor."}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content[0].text.trim()
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (e) {
      console.log('[analise-ciclo] JSON cru:', clean.substring(1500, 1650))
      // Tenta limpar aspas duplas dentro de valores string
      const sanitized = clean.replace(
        /"([^"]*(?:\\.[^"]*)*)"/g,
        (match) => {
          const inner = match.slice(1, -1)
            .replace(/(?<!\\)"/g, "'")
          return `"${inner}"`
        }
      )
      try {
        parsed = JSON.parse(sanitized)
      } catch (e2) {
        const m = sanitized.match(/\{[\s\S]*\}/)
        if (!m) throw new Error('IA nao retornou JSON valido: ' + clean.substring(0, 200))
        parsed = JSON.parse(m[0])
      }
    }

    // Salva novo rascunho
    const { data: novaDevolutiva, error: devErr } = await supabase
      .from('olhar_devolutivas')
      .insert({
        respondente_id,
        ciclo: proximoCiclo,
        analista_id: respondente.analista_id,
        analise_ia: parsed.analise_interna,
        tags_ia: parsed.tags,
        opcoes_enunciado: parsed.opcoes_enunciado,
        acoes: parsed.acoes,
        acoes_pendentes: acoesPendentesCalculadas,
        nota_supervisor: parsed.nota_supervisor,
                situacoes_puladas: parsed.situacoes_puladas?.map(s => {
          // Tenta achar pelo número da situação no texto
          const match = s.situacao?.match(/\d+/)
          const idx = match ? parseInt(match[0]) - 1 : null
          const perguntaReal = idx !== null && puladasMap[idx]
            ? puladasMap[idx].pergunta
            : null
          return { ...s, pergunta: perguntaReal || s.pergunta || s.situacao }
        }),
        status: 'rascunho',
      })
      .select('id')
      .single()

    if (devErr) throw devErr

    // Atualiza ciclo do respondente
    await supabase
      .from('olhar_respondentes')
      .update({ ciclo_atual: proximoCiclo })
      .eq('id', respondente_id)

    return Response.json({ devolutiva_id: novaDevolutiva.id, ...parsed })
  } catch (err) {
    console.error('[analise-ciclo]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}