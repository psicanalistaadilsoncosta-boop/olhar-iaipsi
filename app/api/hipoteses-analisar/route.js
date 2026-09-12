import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { hipotese, contexto_caso } = await req.json()

    const prompt = `Você é um psicanalista supervisor experiente com domínio amplo das escolas psicanalíticas. Receberá uma hipótese clínica e deverá analisá-la em profundidade.

CONTEXTO DO CASO:
${contexto_caso || 'Não fornecido'}

HIPÓTESE CLÍNICA A ANALISAR:
${hipotese.texto}

Produza uma análise estruturada. Retorne SOMENTE um JSON válido, sem markdown:
{
  "escolas": [
    {
      "nome": "Nome da escola psicanalítica",
      "conceitos": ["conceito1", "conceito2"],
      "sustentacao": "Como essa escola sustenta esta hipótese específica — 2 a 3 frases precisas"
    }
  ],
  "cenarios": [
    {
      "numero": 1,
      "titulo": "Título do cenário (curto)",
      "descricao": "O que pode acontecer se esta hipótese estiver correta e o tratamento seguir por este caminho",
      "consequencias_positivas": ["consequência positiva 1", "consequência positiva 2"],
      "consequencias_negativas": ["risco ou limitação 1", "risco ou limitação 2"],
      "probabilidade": "alta | média | baixa"
    },
    {
      "numero": 2,
      "titulo": "Segundo cenário possível",
      "descricao": "Segundo caminho possível",
      "consequencias_positivas": ["..."],
      "consequencias_negativas": ["..."],
      "probabilidade": "alta | média | baixa"
    },
    {
      "numero": 3,
      "titulo": "Terceiro cenário possível",
      "descricao": "Terceiro caminho possível",
      "consequencias_positivas": ["..."],
      "consequencias_negativas": ["..."],
      "probabilidade": "alta | média | baixa"
    }
  ],
  "proximos_passos": [
    "Passo clínico concreto 1 — o que o analista pode fazer na próxima sessão",
    "Passo clínico concreto 2",
    "Passo clínico concreto 3"
  ],
  "pergunta_central": "Uma pergunta clínica central que esta hipótese levanta — desestabilizadora, que abre o caso"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

        let parsed
    let tentativas = 0
    while (tentativas < 3) {
      const tentativaResponse = tentativas === 0 ? response : await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: tentativas === 0 ? 2000 : 2000,
        messages: [{ role: 'user', content: prompt }],
      })
      const tentativaRaw = tentativaResponse.content[0].text.trim()
        .replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      try {
        parsed = JSON.parse(tentativaRaw)
        break
      } catch {
        tentativas++
        if (tentativas >= 3) throw new Error('Não foi possível gerar JSON válido após 3 tentativas.')
        console.log(`[json-retry] tentativa ${tentativas + 1}...`)
      }
    }
    return Response.json({ ...parsed, hipotese })
  } catch (err) {
    console.error('[hipoteses-analisar]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}