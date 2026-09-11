'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AguardandoPage() {
  const supabase = createClient()
  const [sessao, setSessao] = useState(null)

  useEffect(() => {
    async function loadSessao() {
      const respondente_id = sessionStorage.getItem('olhar_respondente_id')
      if (!respondente_id) return

      const { data } = await supabase
        .from('olhar_sessoes')
        .select('*')
        .eq('respondente_id', respondente_id)
        .eq('status', 'agendada')
        .order('data_sessao', { ascending: true })
        .limit(1)
        .maybeSingle()

      setSessao(data)
    }
    loadSessao()
  }, [])

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-16 text-center"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.06 }}
      />

      <div className="text-4xl mb-6">🌙</div>

      <h1
        className="text-2xl text-stone-100 leading-snug mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
      >
        Suas reflexões foram recebidas
      </h1>

      <p className="text-sm text-stone-100/50 font-light leading-relaxed max-w-xs mb-8">
        Seu analista está lendo com cuidado tudo que você compartilhou.<br /><br />
        Em breve você receberá uma devolutiva. Não há nada mais a fazer por agora — descanse.
      </p>

      <div
        className="px-5 py-2 rounded-full border text-sm mb-6"
        style={{ borderColor: 'rgba(196,115,42,0.3)', background: 'rgba(196,115,42,0.1)', color: 'rgba(196,115,42,0.9)' }}
      >
        Retorno em até 48h
      </div>

      {/* Sessão agendada */}
      {sessao && (
        <div
          className="mt-4 max-w-xs w-full rounded-2xl px-5 py-4 text-left"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📅</span>
            <span
              className="text-[11px] font-medium tracking-widest uppercase"
              style={{ color: 'rgba(196,115,42,0.8)' }}
            >
              Sessão agendada
            </span>
          </div>
          <p className="text-sm text-stone-100/80 font-light mb-1">
            {new Date(sessao.data_sessao).toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: 'long'
            })}
          </p>
                    <p className="text-xs text-stone-100/50 font-light mb-4">
            {new Date(sessao.data_sessao).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
              timeZone: sessao.fuso_paciente || 'America/Sao_Paulo'
            })} · {sessao.tipo === 'online' ? 'Online' : 'Presencial'}
          </p>
                    {sessao.confirmacao === 'confirmada' && (
            <div className="text-center text-xs py-2" style={{ color: 'rgba(74,158,122,0.9)' }}>
              ✓ Presença confirmada
            </div>
          )}
          {sessao.confirmacao === 'reagendar' && (
            <div className="text-center text-xs py-2" style={{ color: 'rgba(196,115,42,0.8)' }}>
              Seu analista entrará em contato para reagendar.
            </div>
          )}
          {!sessao.confirmacao && (
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 rounded-xl text-xs font-medium text-white transition-colors"
              style={{ background: '#2D6A4F' }}
                            onClick={async () => {
                await supabase.from('olhar_sessoes').update({ confirmacao: 'confirmada' }).eq('id', sessao.id)
                setSessao(s => ({ ...s, confirmacao: 'confirmada' }))
              }}
            >
              ✓ Confirmar presença
            </button>
            <button
              className="flex-1 py-2 rounded-xl text-xs font-medium border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(248,243,236,0.5)' }}
                            onClick={async () => {
                await supabase.from('olhar_sessoes').update({ confirmacao: 'reagendar' }).eq('id', sessao.id)
                setSessao(s => ({ ...s, confirmacao: 'reagendar' }))
              }}
            >
              Preciso reagendar
                      </button>
          </div>
          )}
        </div>
      )}
    </main>
  )
}