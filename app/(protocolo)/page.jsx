'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [respondente, setRespondente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

   const token = searchParams.get('t')
  const [termosAceitos, setTermosAceitos] = useState(false)

  useEffect(() => {
    const aceito = sessionStorage.getItem('olhar_termos_aceitos')
    if (aceito === 'true') setTermosAceitos(true)
  }, [])

  useEffect(() => {
    async function load() {
      if (!token) {
        setErro(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('olhar_respondentes')
        .select('id, nome, token, status')
        .eq('token', token)
        .single()

      if (error || !data) {
        setErro(true)
        setLoading(false)
        return
      }

            // Salva token e id na sessão
      sessionStorage.setItem('olhar_token', token)
      sessionStorage.setItem('olhar_respondente_id', data.id)

      // Redireciona por status
      if (data.status === 'aguardando') {
        router.replace('/aguardando')
        return
      }
      if (data.status === 'devolutiva' || data.status === 'ativo') {
        router.replace('/devolutiva')
        return
      }

      setRespondente(data)
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <main
        className="relative min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
      >
        <div className="text-stone-100/40 text-sm font-light">Carregando...</div>
      </main>
    )
  }

  if (erro) {
    return (
      <main
        className="relative min-h-screen flex items-center justify-center px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
      >
        <div>
          <div className="text-3xl mb-4">🔒</div>
          <p
            className="text-xl text-stone-100 mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Link inválido
          </p>
          <p className="text-sm text-stone-100/40 font-light">
            Verifique o link enviado pelo seu analista.
          </p>
        </div>
      </main>
    )
  }

  const primeiroNome = respondente.nome?.split(' ')[0] || 'você'

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-16 text-center"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.07 }}
      />
      <div
        className="absolute -bottom-12 -left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: '#4A9E7A', opacity: 0.06 }}
      />

      {/* logo */}
      <div
        className="w-18 h-18 rounded-full border flex items-center justify-center mb-8"
        style={{
          width: 72, height: 72,
          borderColor: 'rgba(196,115,42,0.4)',
          background: 'rgba(196,115,42,0.1)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="#C4732A" strokeWidth="1.5" />
          <path d="M10 16 Q16 8 22 16 Q16 24 10 16Z" fill="none" stroke="#C4732A" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="2.5" fill="#C4732A" opacity="0.7" />
        </svg>
      </div>

      <p className="text-sm font-light mb-2" style={{ color: 'rgba(196,115,42,0.8)' }}>
        Olá, {primeiroNome}
      </p>

      <h1
        className="text-3xl text-stone-100 leading-snug mb-4 max-w-sm"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
      >
        Um espaço só seu para olhar para dentro
      </h1>

      <p className="text-sm text-stone-100/50 font-light leading-relaxed max-w-xs mb-6">
        Não é um teste. Não há respostas certas.<br />
        É um convite para que você se ouça — no seu tempo, com honestidade.
      </p>

      {/* métricas */}
      <div className="flex gap-4 mb-6">
        {[
          { val: '30', lbl: 'situações' },
          { val: '6', lbl: 'temas' },
          { val: '~25', lbl: 'minutos' },
        ].map(({ val, lbl }) => (
          <div
            key={lbl}
            className="w-24 text-center rounded-xl py-3 px-2 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="text-2xl"
              style={{ fontFamily: "'Playfair Display', serif", color: '#C4732A', fontWeight: 600 }}
            >
              {val}
            </div>
            <div className="text-[11px] text-stone-100/40 mt-0.5 font-light">{lbl}</div>
          </div>
        ))}
      </div>

      {/* aviso importante */}
      <div
        className="max-w-xs rounded-xl px-4 py-3 mb-8 text-left"
        style={{ background: 'rgba(196,115,42,0.08)', border: '1px solid rgba(196,115,42,0.2)' }}
      >
        <p className="text-[12px] text-stone-100/60 font-light leading-relaxed">
          <span className="text-amber-600/90 font-medium">Importante:</span> Se em alguma situação você preferir não comentar no momento, clique em <em>"Prefiro não comentar isso agora"</em>. Não deixe em branco — cada resposta, inclusive a de pausa, é parte do seu processo.
        </p>
      </div>

            {/* termos */}
      <div className="mb-6 max-w-xs w-full">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termosAceitos}
            onChange={e => {
              setTermosAceitos(e.target.checked)
              if (e.target.checked) sessionStorage.setItem('olhar_termos_aceitos', 'true')
              else sessionStorage.removeItem('olhar_termos_aceitos')
            }}
            className="mt-0.5 accent-amber-600 w-4 h-4 flex-shrink-0"
          />
          <span className="text-xs text-stone-100/50 font-light leading-relaxed text-left">
            Li e concordo com os{' '}
            
              <a href="/termos"
              className="underline"
              style={{ color: 'rgba(196,115,42,0.8)' }}>Termos de Uso e Política de Privacidade
            </a>
          </span>
        </label>
      </div>

      <button
        onClick={() => router.push('/questionario')}
        disabled={!termosAceitos}
        className="px-10 py-3.5 rounded-full text-stone-100 font-medium text-base transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-default disabled:hover:translate-y-0"
        style={{ background: '#C4732A' }}
      >
        Começar
      </button>

      <p className="text-[11px] text-stone-100/25 font-light mt-6 max-w-xs leading-relaxed">
        Suas respostas são confidenciais e serão lidas pelo seu analista.<br />
        Este espaço é de autodesenvolvimento — não de diagnóstico.
      </p>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}