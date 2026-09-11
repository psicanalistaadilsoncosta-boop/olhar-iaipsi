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
    const { respondente_id, ciclo = 1 } = await req.json()

    const supabase = await createClient()

    const { data: respondente, error: rErr } = await supabase
      .from('olhar_respondentes')
      .select('*')
      .eq('id', respondente_id)
      .single()

    if (rErr || !respondente) {
      return Response.json({ error: 'Respondente não encontrado' }, { status: 404 })
    }

    const { data: respostas, error: resErr } = await supabase
      .from('olhar_respostas')
      .select('*')
      .eq('respondente_id', respondente_id)
      .eq('ciclo', ciclo)
      .order('situacao_index')

    if (resErr) throw resErr

    const puladas = respostas.filter(r => r.pulada)

    const material = respostas
      .map(r => {
        const q = QUESTIONS[r.situacao_index]
        if (!q || r.pulada) return null

        let resposta = ''
        if (r.resposta_texto) {
          resposta = limpar(r.resposta_texto)
        } else if (r.resposta_opcao !== null) {
          if (q.type === 'images') resposta = q.options[r.resposta_opcao]?.label || ''
          if (q.type === 'select') resposta = q.options[r.resposta_opcao] || ''
          if (q.type === 'scale') resposta = q.labels[r.resposta_opcao] || ''
        }

        return `[${r.bloco}] Situacao ${r.situacao_index + 1}: ${q.text}\nResposta: ${resposta}\n(${q.meta.escola} - ${q.meta.conceito})`
      })
      .filter(Boolean)
      .join('\n\n')

    const materialPuladas = puladas.length > 0
      ? puladas.map(r => {
          const q = QUESTIONS[r.situacao_index]
          return `Situacao ${r.situacao_index + 1} [${r.bloco}]: ${q?.text}`
        }).join('\n')
      : null

    const prompt = `Voce e um assistente clinico de um psicanalista brasileiro. Sua funcao e ler as respostas de um protocolo de autodesenvolvimento e preparar material para o analista revisar antes de enviar ao paciente.

Publico: adultos brasileiros de meia-idade (50-60 anos). Enquadramento: autodesenvolvimento - nao psicoterapia. A linguagem dos enunciados e acoes deve ser humana, acolhedora, sem jargao tecnico.

RESPOSTAS DO PROTOCOLO:
${material}
${materialPuladas ? `\nSITUACOES QUE O PACIENTE PREFERIU NAO RESPONDER:\n${materialPuladas}\n` : ''}
Gere SOMENTE um JSON valido, sem markdown, sem texto fora do JSON. Nao use aspas duplas dentro dos valores - use aspas simples se precisar citar algo:
{"analise_interna":"Analise tecnica em 3 paragrafos para o analista. Pode usar termos psicanaliticos. Identifique os eixos centrais, padroes, contradicoes e o que merece atencao especial na sessao ao vivo.","situacoes_puladas":[{"situacao":"Situacao N - tema","hipotese":"Hipotese clinica breve sobre o silencio neste tema."}],"tags":["tag1","tag2","tag3","tag4"],"opcoes_enunciado":["Enunciado 1: texto acolhedor de 2-3 frases que devolve uma observacao central ao paciente. Tom humano, sem diagnostico, sem jargao. Termina aberto.","Enunciado 2: angulo diferente do enunciado 1. Mesma delicadeza.","Enunciado 3: terceiro angulo, diferente dos dois anteriores."],"acoes":[{"tipo":"Reflexao","texto":"Acao ou reflexao concreta para a semana. Simples, aplicavel, nao clinica."},{"tipo":"Observacao","texto":"Segunda acao."},{"tipo":"Convite","texto":"Terceira acao - mais suave, um convite."}],"nota_supervisor":"Uma frase de alerta para o supervisor sobre algo que merece atencao especial neste caso."}`

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
      const match = clean.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('IA nao retornou JSON valido: ' + clean.substring(0, 200))
      parsed = JSON.parse(match[0])
    }

    const { data: devolutiva, error: devErr } = await supabase
      .from('olhar_devolutivas')
      .insert({
        respondente_id,
        ciclo,
        analista_id: respondente.analista_id,
        analise_ia: parsed.analise_interna,
        tags_ia: parsed.tags,
        opcoes_enunciado: parsed.opcoes_enunciado,
        acoes: parsed.acoes,
        nota_supervisor: parsed.nota_supervisor,
        situacoes_puladas: parsed.situacoes_puladas,
        status: 'rascunho',
      })
      .select('id')
      .single()

    if (devErr) throw devErr

    return Response.json({ devolutiva_id: devolutiva.id, ...parsed })
  } catch (err) {
    console.error('[analise]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
