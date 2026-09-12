import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { QUESTIONS } from '@/lib/questions'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ABORDAGENS_DESC = {
  lacaniana:     'Lacaniana — significantes, objeto a, transferência, posição do sujeito, gozo, fantasia',
  winnicottiana: 'Winnicottiana — holding, falso self, espaço potencial, objetos transicionais, ambiente facilitador',
  bioniana:      'Bioniana — elementos alfa/beta, contenção, rêverie, vínculos K/L/H, grupos, PS↔D',
  freudiana:     'Freudiana — associação livre, recalque, pulsão, transferência, repetição, elaboração',
  geral:         'Geral / Integrativa — eixos temáticos transversais, impasses, hipóteses abertas sem amarração a uma escola',
}

function montarTextoCaso(respondente, devolutivas, respostas, sessoes) {
  const puladas = respostas.filter(r => r.pulada)
  const linhas = []

  linhas.push(`PACIENTE: ${respondente.nome || 'Sem nome'}`)
  linhas.push(`CICLOS REALIZADOS: ${devolutivas.length}`)
  linhas.push(`INÍCIO: ${new Date(respondente.created_at).toLocaleDateString('pt-BR')}`)
  linhas.push('')

  // Situações puladas
  if (puladas.length > 0) {
    linhas.push('── SITUAÇÕES QUE O PACIENTE PREFERIU NÃO RESPONDER ──')
    puladas.forEach(r => {
      const q = QUESTIONS[r.situacao_index]
      linhas.push(`• Situação ${r.situacao_index + 1} [${r.bloco}]: ${q?.text || ''}`)
    })
    linhas.push('')
  }

  // Ciclos
  devolutivas.forEach(d => {
    linhas.push(`══ CICLO ${d.ciclo} ══`)

    if (d.analise_ia) {
      linhas.push('ANÁLISE DO CICLO:')
      linhas.push(d.analise_ia)
      linhas.push('')
    }

    if (d.tags_ia?.length) {
      linhas.push(`EIXOS IDENTIFICADOS: ${d.tags_ia.join(' · ')}`)
      linhas.push('')
    }

    if (d.enunciado_final) {
      linhas.push('DEVOLUTIVA ENVIADA:')
      linhas.push(`"${d.enunciado_final}"`)
      linhas.push('')
    }

    if (d.resposta_paciente) {
      linhas.push('COMO SOOU PARA O PACIENTE:')
      linhas.push(`"${d.resposta_paciente}"`)
      linhas.push('')
    }

    if (d.observacoes_paciente) {
      linhas.push('OBSERVAÇÕES DO PACIENTE:')
      linhas.push(d.observacoes_paciente)
      linhas.push('')
    }

    if (d.acoes?.length) {
      linhas.push('AÇÕES E O QUE FEZ:')
      d.acoes.forEach((acao, i) => {
        const resp = d.acoes_respondidas?.[i]
        const status = resp?.opcao === 'fiz' ? 'FEZ' :
          resp?.opcao === 'tentei' ? 'TENTOU' :
          resp?.opcao === 'nao_consegui' ? 'NÃO CONSEGUIU' :
          resp?.opcao === 'nao_tentei' ? 'NÃO TENTOU' : 'SEM RESPOSTA'
        linhas.push(`  ${acao.tipo}: ${acao.texto} → [${status}]`)
        if (resp?.observacao) linhas.push(`    Observação: ${resp.observacao}`)
      })
      linhas.push('')
    }

    if (d.situacoes_retomadas?.length) {
      linhas.push('SITUAÇÕES RETOMADAS:')
      d.situacoes_retomadas.forEach((s, i) => {
        const resp = d.respostas_situacoes_retomadas?.[i]
        linhas.push(`  ${s.pergunta || s.situacao}`)
        if (resp && resp !== '__PULAR__') linhas.push(`  → Resposta: "${resp}"`)
        else linhas.push('  → Preferiu não comentar novamente')
      })
      linhas.push('')
    }

    if (d.nota_supervisor) {
      linhas.push(`NOTA DO ANALISTA: ${d.nota_supervisor}`)
      linhas.push('')
    }

    // Sessão neste ciclo
    const sessoesNoCiclo = sessoes.filter(s =>
      s.status === 'realizada' &&
      new Date(s.data_sessao) <= new Date(d.enviada_at || Date.now())
    )
    if (sessoesNoCiclo.length) {
      linhas.push('SESSÕES REALIZADAS:')
      sessoesNoCiclo.forEach(s => {
        linhas.push(`  ${new Date(s.data_sessao).toLocaleDateString('pt-BR')} (${s.tipo})`)
        if (s.notas) linhas.push(`  Notas: ${s.notas}`)
      })
      linhas.push('')
    }
  })

  return linhas.join('\n')
}

function montarPrompt(escolasTexto, texto_caso, analise_anterior) {
  const blocoAnterior = analise_anterior ? `
ANÁLISE DE SUPERVISÃO ANTERIOR (para referência e continuidade):
${analise_anterior}

---
` : ''

  const instrucaoAnterior = analise_anterior ? `
ATENÇÃO — ANÁLISE EM CONTINUIDADE:
Esta é uma supervisão subsequente do mesmo caso. Identifique explicitamente:
- Mudanças de comportamento ou posição subjetiva em relação à supervisão anterior
- Novas situações ou cenas que não apareciam antes
- O que permanece igual, se aprofundou ou regrediu
- Eventuais deslocamentos nas hipóteses clínicas

Marque com [MUDANÇA], [NOVO] ou [PERMANECE] onde pertinente.
` : ''

  return `Você é um psicanalista supervisor experiente. Receberá o material clínico de um caso acompanhado de forma assíncrona e deverá produzir uma análise clínica aprofundada.

ABORDAGENS TEÓRICAS A UTILIZAR:
${escolasTexto}
${instrucaoAnterior}
${blocoAnterior}MATERIAL CLÍNICO (ciclos de acompanhamento assíncrono):
${texto_caso}

---

Produza uma análise clínica completa e rigorosa, estruturada nos seguintes eixos. Escreva em português, com precisão teórica, sem simplificações.${analise_anterior ? ' Onde houver análise anterior, faça a leitura comparativa de forma integrada.' : ''}

ESTRUTURA DA ANÁLISE:

1. SÍNTESE DO SUJEITO E DA DEMANDA
Quem é esse sujeito? O que ele traz como queixa e o que comparece como demanda? Qual a posição do analista diante disso?${analise_anterior ? ' Compare com a supervisão anterior: o que mudou?' : ''}

2. CENAS MARCANTES E REPETIÇÕES
Que cenas, frases ou padrões se repetem ao longo dos ciclos? O que essa repetição sinaliza clinicamente? Que formações do inconsciente podem estar em jogo?

3. MAPEAMENTO DO IMPASSE
Onde o processo travou? O que o impasse revela sobre a estrutura do caso? Qual a relação entre o impasse e a posição do analista?${analise_anterior ? ' O impasse anterior foi tocado ou persiste sob outra forma?' : ''}

4. ARTICULAÇÃO TEÓRICA
Articule o caso com os conceitos das abordagens indicadas. Seja preciso — mostre como iluminam este caso específico.

5. HIPÓTESES CLÍNICAS
Quais hipóteses estruturais e dinâmicas se sustentam a partir do material? Apresente mais de uma quando pertinente.${analise_anterior ? ' As hipóteses anteriores se sustentam, refinam ou precisam ser revistas?' : ''}

6. PERGUNTAS AO ANALISTA
Formule de 4 a 6 perguntas precisas e desestabilizadoras que o analista deve se fazer a partir deste material. Perguntas que abram o caso, não que o fechem.

7. SUGESTÃO DE TEXTO PARA O RETORNO AO PACIENTE
Redija uma sugestão de devolutiva para o próximo ciclo — como se o supervisor estivesse escrevendo diretamente ao paciente. Tom acolhedor, humano, sem jargão. Este texto será editado pelo analista antes de ser enviado.

Responda APENAS com o texto da análise estruturado conforme acima. Sem introduções, sem meta-comentários.`
}

export async function POST(req) {
  try {
    const { respondente_id, abordagens, supervisao_anterior_id } = await req.json()

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

    // Busca dados do caso
    const [{ data: respondente }, { data: devolutivas }, { data: respostas }, { data: sessoes }] = await Promise.all([
      supabase.from('olhar_respondentes').select('*').eq('id', respondente_id).single(),
      supabase.from('olhar_devolutivas').select('*').eq('respondente_id', respondente_id)
        .neq('status', 'rascunho').order('ciclo'),
      supabase.from('olhar_respostas').select('*').eq('respondente_id', respondente_id).order('situacao_index'),
      supabase.from('olhar_sessoes').select('*').eq('respondente_id', respondente_id).order('data_sessao'),
    ])

    if (!respondente) return Response.json({ error: 'Paciente não encontrado' }, { status: 404 })

    // Busca análise anterior se houver
    let analise_anterior = null
    if (supervisao_anterior_id) {
      const { data: sup } = await supabase
        .from('olhar_supervisoes')
        .select('analise_bruta')
        .eq('id', supervisao_anterior_id)
        .single()
      analise_anterior = sup?.analise_bruta || null
    }

    const texto_caso = montarTextoCaso(respondente, devolutivas || [], respostas || [], sessoes || [])
    const escolasTexto = (abordagens || ['geral']).map(a => `• ${ABORDAGENS_DESC[a] || a}`).join('\n')
    const prompt = montarPrompt(escolasTexto, texto_caso, analise_anterior)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const analise = response.content[0]?.text || ''

    // Salva no banco
    const { data: sup, error: supErr } = await supabase
      .from('olhar_supervisoes')
      .insert({
        respondente_id,
        analista_id: user.id,
        abordagens: abordagens || ['geral'],
        texto_caso,
        analise_bruta: analise,
        status: 'rascunho',
      })
      .select('id')
      .single()

    if (supErr) throw supErr

    return Response.json({ id: sup.id, analise, texto_caso })
  } catch (err) {
    console.error('[supervisao-caso]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const { id, analise_editada, status } = await req.json()
    const supabase = await createClient()

    const { error } = await supabase
      .from('olhar_supervisoes')
      .update({ analise_editada, status: status || 'finalizada' })
      .eq('id', id)

    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}