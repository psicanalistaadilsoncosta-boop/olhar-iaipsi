import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { supervisao_id, texto_manual } = await req.json()

    const supabase = await createClient()

    let analise = texto_manual || ''

    if (supervisao_id && !texto_manual) {
      const { data: sup } = await supabase
        .from('olhar_supervisoes')
        .select('analise_editada, analise_bruta')
        .eq('id', supervisao_id)
        .single()
      analise = sup?.analise_editada || sup?.analise_bruta || ''
    }

    if (!analise) return Response.json({ error: 'Sem análise para extrair' }, { status: 400 })

    const prompt = `Você é um psicanalista supervisor. Leia a análise clínica abaixo e extraia as hipóteses clínicas presentes.

ANÁLISE:
${analise}

Retorne SOMENTE um JSON válido, sem markdown:
{
  "hipoteses": [
    {
      "numero": 1,
      "titulo": "Título curto da hipótese (máximo 6 palavras)",
      "texto": "Texto completo da hipótese como aparece na análise",
      "palavras_chave": ["palavra1", "palavra2", "palavra3"]
    }
  ]
}

Extraia todas as hipóteses presentes na seção de hipóteses clínicas. Se não houver seção específica, identifique as hipóteses principais presentes em todo o texto. Máximo 8 hipóteses.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
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
       // Salva no banco se veio de uma supervisão
    if (supervisao_id) {
      const supabase = await createClient()
      await supabase
        .from('olhar_supervisoes')
        .update({ hipoteses: parsed.hipoteses })
        .eq('id', supervisao_id)
    }

    return Response.json(parsed)
  } catch (err) {
    console.error('[hipoteses-extrair]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}