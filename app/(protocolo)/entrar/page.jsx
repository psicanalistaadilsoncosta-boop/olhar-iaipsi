'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function EntrarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const tokenUrl = searchParams.get('t')

  useEffect(() => {
    if (tokenUrl) {
      validarToken(tokenUrl)
    }
  }, [tokenUrl])

  async function validarToken(token) {
    setLoading(true)
    setErro('')
    try {
      const { data, error } = await supabase
        .from('olhar_respondentes')
        .select('id, nome, token, status')
        .eq('token', token)
        .single()

      if (error || !data) {
        setErro('Link inválido. Verifique o link enviado pelo seu analista.')
        setLoading(false)
        return
      }

      sessionStorage.setItem('olhar_token', token)
      sessionStorage.setItem('olhar_respondente_id', data.id)

      if (data.status === 'aguardando') {
        router.replace('/aguardando')
      } else if (data.status === 'devolutiva' || data.status === 'ativo') {
        router.replace('/devolutiva')
      } else {
        // Redireciona para boas-vindas com dados
        router.replace(`/boasvindas?t=${token}`)
      }
    } catch (err) {
      setErro('Erro ao validar o link.')
      setLoading(false)
    }
  }

  function handleEntrar() {
    // Extrai o token do link colado
    try {
      let token = link.trim()
      if (token.includes('?t=')) {
        token = token.split('?t=')[1].split('&')[0]
      } else if (token.includes('/entrar?')) {
        token = token.split('?t=')[1]
      }
      if (!token) {
        setErro('Cole o link completo enviado pelo seu analista.')
        return
      }
      validarToken(token)
    } catch {
      setErro('Link inválido.')
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.07 }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4"
            style={{ borderColor: 'rgba(196,115,42,0.4)', background: 'rgba(196,115,42,0.1)' }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#C4732A" strokeWidth="1.5" />
              <path d="M10 16 Q16 8 22 16 Q16 24 10 16Z" fill="none" stroke="#C4732A" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="2.5" fill="#C4732A" opacity="0.7" />
            </svg>
          </div>
          <h1
            className="text-2xl text-stone-100 mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Olhar
          </h1>
          <p className="text-sm text-stone-100/40 font-light">
            Cole o link enviado pelo seu analista
          </p>
        </div>

        {/* campo de link */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={link}
            onChange={e => { setLink(e.target.value); setErro('') }}
            onKeyDown={e => e.key === 'Enter' && handleEntrar()}
            placeholder="https://olhar.iaipsi.com/?t=..."
            className="w-full px-4 py-3.5 rounded-xl text-sm font-light outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#F8F3EC',
            }}
          />

          {erro && (
            <p className="text-xs text-red-400 font-light">{erro}</p>
          )}

          <button
            onClick={handleEntrar}
            disabled={loading || !link.trim()}
            className="w-full py-3.5 rounded-xl text-sm font-medium text-stone-100 transition-all disabled:opacity-40 disabled:cursor-default"
            style={{ background: '#C4732A' }}
          >
            {loading ? 'Verificando...' : 'Entrar →'}
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-stone-100/25 font-light leading-relaxed">
            Não tem um link? Entre em contato com seu analista.<br />
            
              <a href="https://wa.me/5511945098763"
              target="_blank"
              rel="noopener noreferrer"
              className="underline mt-1 inline-block transition-colors"
              style={{ color: 'rgba(196,115,42,0.6)' }}
            >
              Falar pelo WhatsApp
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#1A2E25' }} />}>
      <EntrarContent />
    </Suspense>
  )
}