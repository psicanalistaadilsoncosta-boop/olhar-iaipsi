'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function EvolucaoContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const respondente_id = searchParams.get('id')

  const [respondente, setRespondente] = useState(null)
  const [devolutivas, setDevolutivas] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [respostas, setRespostas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (respondente_id) load() }, [respondente_id])

  async function load() {
    setLoading(true)
    const [{ data: r }, { data: devs }, { data: sess }, { data: res }] = await Promise.all([
      supabase.from('olhar_respondentes').select('*').eq('id', respondente_id).single(),
      supabase.from('olhar_devolutivas').select('*').eq('respondente_id', respondente_id)
        .neq('status', 'rascunho').order('ciclo'),
      supabase.from('olhar_sessoes').select('*').eq('respondente_id', respondente_id)
        .order('data_sessao'),
      supabase.from('olhar_respostas').select('*').eq('respondente_id', respondente_id),
    ])
    setRespondente(r)
    setDevolutivas(devs || [])
    setSessoes(sess || [])
    setRespostas(res || [])
    setLoading(false)
  }

  if (!respondente_id) return (
    <div className="p-6 text-stone-400 text-sm font-light">
      Selecione um paciente no dashboard para ver sua evolução.
    </div>
  )

  if (loading) return (
    <div className="p-6 text-stone-400 text-sm font-light">Carregando...</div>
  )

  if (!respondente) return (
    <div className="p-6 text-stone-400 text-sm font-light">Paciente não encontrado.</div>
  )

  const puladas = respostas.filter(r => r.pulada)
  const respondidas = respostas.filter(r => !r.pulada)
  const totalCiclos = devolutivas.length

  // Coleta todas as tags únicas
  const todasTags = {}
  devolutivas.forEach(d => {
    d.tags_ia?.forEach(tag => {
      todasTags[tag] = (todasTags[tag] || 0) + 1
    })
  })
  const tagsOrdenadas = Object.entries(todasTags).sort((a, b) => b[1] - a[1])

  // Calcula ações por ciclo
  const acosPorCiclo = devolutivas.map(d => {
    const total = d.acoes?.length || 0
    const feitas = d.acoes_respondidas?.filter(r => r?.opcao === 'fiz').length || 0
    const tentadas = d.acoes_respondidas?.filter(r => r?.opcao === 'tentei').length || 0
    const naoFeitas = d.acoes_respondidas?.filter(r =>
      r?.opcao === 'nao_consegui' || r?.opcao === 'nao_tentei'
    ).length || 0
    return { ciclo: d.ciclo, total, feitas, tentadas, naoFeitas }
  })

  return (
    <div className="p-6 max-w-4xl">

      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            {respondente.nome}
          </h1>
          <p className="text-xs text-stone-400 font-light">
            {respondente.email} · {totalCiclos} ciclos · desde {new Date(respondente.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button
          onClick={() => alert('Relatório Word — em breve')}
          className="px-5 py-2.5 rounded-full text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors flex items-center gap-2"
        >
          📄 Gerar relatório Word
        </button>
      </div>

      {/* cards resumo */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { val: totalCiclos, lbl: 'Ciclos', cor: '#C4732A' },
          { val: respondidas.length, lbl: 'Respondidas', cor: '#2D6A4F' },
          { val: puladas.length, lbl: 'Em pausa', cor: '#8A4A8A' },
          { val: sessoes.filter(s => s.status === 'realizada').length, lbl: 'Sessões', cor: '#4A72B0' },
        ].map(({ val, lbl, cor }) => (
          <div key={lbl} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-3xl font-light mb-1" style={{ fontFamily: "'Playfair Display', serif", color: cor }}>
              {val}
            </div>
            <div className="text-[11px] text-stone-400 font-light uppercase tracking-wide">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        <div className="flex-1 flex flex-col gap-5">

          {/* linha do tempo */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                Linha do tempo
              </h2>
            </div>
            <div className="px-5 py-4">
              {devolutivas.length === 0 ? (
                <p className="text-sm text-stone-400 font-light">Nenhum ciclo ainda.</p>
              ) : (
                <div className="relative">
                  {/* linha vertical */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-stone-100" />

                  {devolutivas.map((d, i) => (
                    <div key={d.id} className="relative pl-10 pb-6 last:pb-0">
                      {/* ponto */}
                      <div className="absolute left-0 w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium"
                        style={{ background: d.status === 'respondida' ? '#C4732A' : '#2D6A4F', color: '#fff' }}>
                        {d.ciclo}
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* enunciado */}
                          <p className="text-sm text-stone-700 font-light leading-relaxed mb-2 line-clamp-2"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            {d.enunciado_final || 'Rascunho'}
                          </p>

                          {/* tags */}
                          {d.tags_ia?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {d.tags_ia.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ background: '#EAF4EE', color: '#2D6A4F' }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* resposta do paciente */}
                          {d.resposta_paciente && (
                            <p className="text-xs text-stone-500 font-light italic line-clamp-1">
                              "{d.resposta_paciente}"
                            </p>
                          )}
                        </div>

                        {/* ações mini */}
                        {acosPorCiclo[i]?.total > 0 && (
                          <div className="flex-shrink-0 text-right">
                            <div className="flex gap-1 justify-end mb-0.5">
                              {acosPorCiclo[i].feitas > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">✓ {acosPorCiclo[i].feitas}</span>
                              )}
                              {acosPorCiclo[i].tentadas > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">~ {acosPorCiclo[i].tentadas}</span>
                              )}
                              {acosPorCiclo[i].naoFeitas > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">✗ {acosPorCiclo[i].naoFeitas}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-300">ações</div>
                          </div>
                        )}
                      </div>

                      {/* sessão neste ciclo */}
                      {sessoes.filter(s =>
                        s.status === 'realizada' &&
                        new Date(s.data_sessao) > new Date(devolutivas[i - 1]?.enviada_at || 0) &&
                        new Date(s.data_sessao) <= new Date(d.enviada_at || Date.now())
                      ).map(s => (
                        <div key={s.id} className="mt-2 ml-0 flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            📅 Sessão {new Date(s.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            {s.notas && ` — ${s.notas.substring(0, 40)}...`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* situações ainda em pausa */}
          {puladas.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-100">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-700">
                  Situações ainda em pausa ({puladas.length})
                </h2>
              </div>
              <div className="px-5 py-3 flex flex-col gap-2">
                {puladas.map((r, i) => {
                  // Verifica se foi retomada em algum ciclo
                  const foiRetomada = devolutivas.some(d =>
                    d.situacoes_retomadas?.some(s => s.situacao_index === r.situacao_index)
                  )
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-200 text-amber-600 bg-white">
                        {r.bloco}
                      </span>
                      <span className="text-xs text-amber-800 font-light">
                        Situação {r.situacao_index + 1}
                      </span>
                      {foiRetomada && (
                        <span className="text-[10px] text-amber-500">↩ retomada</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* coluna direita */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-5">

          {/* padrões recorrentes */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                Padrões recorrentes
              </h2>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              {tagsOrdenadas.length === 0 ? (
                <p className="text-xs text-stone-400 font-light">Nenhum ciclo ainda.</p>
              ) : tagsOrdenadas.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-600 font-light">{tag}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 rounded-full" style={{
                      width: `${(count / totalCiclos) * 48}px`,
                      background: count === totalCiclos ? '#C4732A' : '#D8D2CA',
                      minWidth: 8
                    }} />
                    <span className="text-[10px] text-stone-400">{count}×</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* sessões */}
          {sessoes.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                  Sessões
                </h2>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                {sessoes.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-xs text-stone-600 font-light">
                      {new Date(s.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      s.status === 'realizada' ? 'bg-green-50 text-green-700' :
                      s.status === 'cancelada' ? 'bg-stone-50 text-stone-400' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {s.status === 'realizada' ? 'Realizada' : s.status === 'cancelada' ? 'Cancelada' : 'Agendada'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function EvolucaoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400 text-sm">Carregando...</div>}>
      <EvolucaoContent />
    </Suspense>
  )
}