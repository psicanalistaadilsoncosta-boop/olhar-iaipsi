'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NovoPacientePage() {
  const supabase = createClient()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [plano, setPlano] = useState('base')
  const [saving, setSaving] = useState(false)
  const [criado, setCriado] = useState(null)

  async function handleCriar(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('olhar_respondentes')
        .insert({
          nome,
          email,
          telefone,
          plano,
          analista_id: user.id,
          status: 'questionario',
        })
        .select('id, token, nome')
        .single()

      if (error) throw error
      setCriado(data)
    } catch (err) {
      alert('Erro ao criar paciente: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const link = criado
    ? `${window.location.origin}/?t=${criado.token}`
    : null

  if (criado) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-center mb-6">
            <div className="text-3xl mb-3">✓</div>
            <h2
              className="text-xl text-stone-800 mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              {criado.nome} cadastrado
            </h2>
            <p className="text-sm text-stone-400 font-light">
              Envie o link abaixo para o paciente iniciar o questionário
            </p>
          </div>

          {/* link */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
            <div className="text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-2">
              Link do questionário
            </div>
            <div className="text-sm text-stone-700 font-light break-all mb-3">
              {link}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(link)}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: '#1A2E25' }}
            >
              Copiar link
            </button>
          </div>

          <p className="text-[11px] text-stone-400 text-center font-light mb-4">
            O link pode ser reenviado a qualquer momento pela página do paciente.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/analista/paciente/${criado.id}`)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Ver paciente
            </button>
            <button
              onClick={() => router.push('/analista/dashboard')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: '#C4732A' }}
            >
              Ir para dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl text-stone-800 mb-1"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Novo paciente
        </h1>
        <p className="text-sm text-stone-400 font-light">
          Após cadastrar, você receberá um link para enviar ao paciente.
        </p>
      </div>

      <form onSubmit={handleCriar} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            placeholder="Nome do paciente"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="email@exemplo.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Telefone <span className="text-stone-300">(opcional)</span></label>
          <input
            type="tel"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Plano</label>
          <select
            value={plano}
            onChange={e => setPlano(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 transition-colors font-light bg-white"
          >
            <option value="base">Base — 1 interação/semana</option>
            <option value="plus">Plus — 2 interações/semana</option>
            <option value="premium">Premium — sessão quinzenal</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60 mt-2"
          style={{ background: '#1A2E25' }}
        >
          {saving ? 'Criando...' : 'Criar paciente e gerar link →'}
        </button>
      </form>
    </div>
  )
}