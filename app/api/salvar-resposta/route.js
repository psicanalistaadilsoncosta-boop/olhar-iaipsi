import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const row = await req.json()

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