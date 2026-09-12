'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BannerPlano({ respondente, sessoes, onUpdate }) {
  const supabase = createClient()
  const [editando, setEditando] = useState(false)
  const [plano, setPlano] = useState(respondente?.plano_interacoes || 3)
  const [salvando, setSalvando] = useState(false)

  const concluidas = respondente?.interacoes_concluidas || 0
  const total = respondente?.plano_interacoes || 3
  const faltam = Math.max(0, total - concluidas)
  const pct = Math.min(100, Math.round((concluidas / total) * 100))
  const planoCompleto = faltam === 0

  const proximaSessao = sessoes?.find(s => s.status === 'agendada')
  const sessaoRealizada = sessoes?.filter(s => s.status === 'realizada').length || 0

  const PLANOS = [
    { val: 3,  label: 'Base — 3 interações' },
    { val: 6,  label: 'Plus — 6 interações' },
    { val: 12, label: 'Premium — 12 interações' },
  ]

  async function salvarPlano() {
    setSalvando(true)
    await supabase
      .from('olhar_respondentes')
      .update({ plano_interacoes: plano })
      .eq('id', respondente.id)
    setSalvando(false)
    setEditando(false)
    if (onUpdate) onUpdate()
  }

  const corBarra = planoCompleto ? '#C4732A' : '#2D6A4F'
  const bgCard = planoCompleto ? 'rgba(196,115,42,0.06)' : 'rgba(45,106,79,0.06)'
  const bordaCard = planoCompleto ? 'rgba(196,115,42,0.2)' : 'rgba(45,106,79,0.15)'

  return (
    <div
      className="rounded-xl px-5 py-4 mb-4 border"
      style={{ background: bgCard, borderColor: bordaCard }}
    >
      <div className="flex items-start justify-between gap-4">

        {/* info do plano */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">

            {/* plano */}
            {editando ? (
              <div className="flex items-center gap-2">
                <select
                  value={plano}
                  onChange={e => setPlano(Number(e.target.value))}
                  className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white outline-none"
                >
                  {PLANOS.map(p => (
                    <option key={p.val} value={p.val}>{p.label}</option>
                  ))}
                </select>
                <button onClick={salvarPlano} disabled={salvando}
                  className="text-xs px-3 py-1 rounded-full text-white font-medium disabled:opacity-50"
                  style={{ background: '#2D6A4F' }}>
                  {salvando ? '...' : 'Salvar'}
                </button>
                <button onClick={() => setEditando(false)}
                  className="text-xs text-stone-400 hover:text-stone-600">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: corBarra + '18', color: corBarra }}
                >
                  {PLANOS.find(p => p.val === total)?.label || `${total} interações`}
                </span>
                <button onClick={() => setEditando(true)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">
                  alterar
                </button>
              </div>
            )}

            {/* termos */}
            {respondente?.termos_aceitos_at && (
              <span className="text-[10px] text-green-600">
                ✓ Termos aceitos {new Date(respondente.termos_aceitos_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>

          {/* progresso de interações */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-all"
                  style={{
                    background: i < concluidas ? corBarra : 'white',
                    borderColor: i < concluidas ? corBarra : '#E8E4DE',
                    color: i < concluidas ? 'white' : '#C0B8B0',
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="text-xs font-light" style={{ color: planoCompleto ? '#C4732A' : '#2D6A4F' }}>
              {planoCompleto
                ? '✓ Plano concluído — sessão online obrigatória'
                : `${concluidas} de ${total} · faltam ${faltam}`}
            </div>
          </div>

          {/* barra de progresso */}
          <div className="h-1 rounded-full overflow-hidden bg-white border border-stone-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: corBarra }}
            />
          </div>
        </div>

        {/* sessão */}
        <div className="flex-shrink-0 text-right">
          <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">
            Sessão online
          </div>
          {proximaSessao ? (
            <div>
              <div className="text-xs font-medium" style={{ color: '#4A72B0' }}>
                📅 {new Date(proximaSessao.data_sessao).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short'
                })}
              </div>
              <div className="text-[10px] text-stone-400 font-light">
                {new Date(proximaSessao.data_sessao).toLocaleTimeString('pt-BR', {
                  hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
                })} Brasília
              </div>
            </div>
          ) : planoCompleto ? (
            <div className="text-xs font-medium" style={{ color: '#C4732A' }}>
              ⚠ Agendar sessão
            </div>
          ) : (
            <div className="text-[10px] text-stone-300 font-light">
              Após {faltam} interação{faltam !== 1 ? 'ões' : ''}
            </div>
          )}
          {sessaoRealizada > 0 && (
            <div className="text-[10px] text-stone-400 font-light mt-1">
              {sessaoRealizada} realizada{sessaoRealizada !== 1 ? 's' : ''}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}