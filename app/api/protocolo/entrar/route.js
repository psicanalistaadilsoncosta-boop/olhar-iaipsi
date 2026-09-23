import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Recebe o token do link e devolve só os dados daquele paciente
export async function POST(req) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return Response.json({ ok: false }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('olhar_respondentes')
      .select('id, nome, status')
      .eq('token', token)
      .maybeSingle()

    if (error) console.error('[protocolo/entrar] erro:', error)
    if (error || !data) {
      return Response.json({ ok: false }, { status: 404 })
    }

    return Response.json({ ok: true, respondente: data })
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 })
  }
}