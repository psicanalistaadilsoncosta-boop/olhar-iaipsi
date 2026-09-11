'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/analista/dashboard')
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#F5F2EE' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-2xl text-stone-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Olhar
          </h1>
          <p className="text-sm text-stone-400 font-light">Acesso do analista</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light"
          />

          {error && (
            <p className="text-xs text-red-500 font-light">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
            style={{ background: '#1A2E25' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
