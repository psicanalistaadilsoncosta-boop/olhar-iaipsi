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
  const [abaSup, setAbaSup] = useState(false)
  const [abordagens, setAbordagens] = useState(['geral'])
  const [gerandoSup, setGerandoSup] = useState(false)
  const [supervisoes, setSupervisoes] = useState([])
  const [supAtiva, setSupAtiva] = useState(null)
  const [analiseEditada, setAnaliseEditada] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [hipoteses, setHipoteses] = useState([])
  const [extraindo, setExtraindo] = useState(false)
  const [hipoteseAtiva, setHipoteseAtiva] = useState(null)
  const [analisandoHip, setAnalisandoHip] = useState(false)
  const [analiseHip, setAnaliseHip] = useState(null)

  useEffect(() => { if (respondente_id) load() }, [respondente_id])

  async function load() {
    setLoading(true)
        const [{ data: r }, { data: devs }, { data: sess }, { data: res }, { data: sups }] = await Promise.all([
      supabase.from('olhar_respondentes').select('*').eq('id', respondente_id).single(),
      supabase.from('olhar_devolutivas').select('*').eq('respondente_id', respondente_id)
        .neq('status', 'rascunho').order('ciclo'),
      supabase.from('olhar_sessoes').select('*').eq('respondente_id', respondente_id)
        .order('data_sessao'),
      supabase.from('olhar_respostas').select('*').eq('respondente_id', respondente_id),
      supabase.from('olhar_supervisoes').select('*').eq('respondente_id', respondente_id)
        .order('created_at', { ascending: false }),
    ])
    setRespondente(r)
    setDevolutivas(devs || [])
    setSessoes(sess || [])
    setRespostas(res || [])
    setSupervisoes(sups || [])
    setLoading(false)
  }

     async function extrairHipoteses() {
    if (!supAtiva) return
    setExtraindo(true)
    setHipoteses([])
    setHipoteseAtiva(null)
    setAnaliseHip(null)
    try {
      const res = await fetch('/api/hipoteses-extrair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisao_id: supAtiva.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setHipoteses(data.hipoteses || [])
    } catch (err) {
      alert('Erro ao extrair hipóteses: ' + err.message)
    } finally {
      setExtraindo(false)
    }
  }

    async function analisarHipotese(hip) {
    setHipoteseAtiva(hip)
    setAnalisandoHip(true)
    setAnaliseHip(null)
    try {
      const res = await fetch('/api/hipoteses-analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hipotese: hip,
          contexto_caso: supAtiva?.texto_caso || '',
          supervisao_id: supAtiva?.id || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnaliseHip(data)
    } catch (err) {
      alert('Erro ao analisar hipótese: ' + err.message)
    } finally {
      setAnalisandoHip(false)
    }
  }

  async function gerarSupervisao() {
    setGerandoSup(true)
    try {
      const ultimaSup = supervisoes[0]
      const res = await fetch('/api/supervisao-caso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondente_id,
          abordagens,
          supervisao_anterior_id: ultimaSup?.id || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSupAtiva({ id: data.id, analise_bruta: data.analise, analise_editada: data.analise })
      setAnaliseEditada(data.analise)
      await load()
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setGerandoSup(false)
    }
  }

  async function salvarSupervisao() {
    if (!supAtiva) return
    setSalvando(true)
    try {
      const res = await fetch('/api/supervisao-caso', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supAtiva.id, analise_editada: analiseEditada, status: 'finalizada' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await load()
      alert('Supervisão salva.')
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setSalvando(false)
    }
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
               
          <a href={`/api/relatorio-word?id=${respondente_id}`}
          download
          className="px-5 py-2.5 rounded-full text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors flex items-center gap-2"
        >
          📄 Gerar relatório Word
        </a>
      </div>

            {/* tabs evolução / supervisão */}
      <div className="flex gap-0 border-b border-stone-200 mb-6">
        <button onClick={() => setAbaSup(false)}
          className={`text-sm px-5 py-2.5 border-b-2 transition-colors ${!abaSup ? 'border-amber-600 text-stone-800 font-medium' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
          Evolução
        </button>
        <button onClick={() => setAbaSup(true)}
          className={`text-sm px-5 py-2.5 border-b-2 transition-colors ${abaSup ? 'border-amber-600 text-stone-800 font-medium' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
          Supervisão
          {supervisoes.length > 0 && (
            <span className="ml-2 text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              {supervisoes.length}
            </span>
          )}
        </button>
      </div>

      {abaSup ? (
        <div className="max-w-4xl">
          {/* painel de supervisão */}
          <div className="flex gap-5">

            {/* col esquerda — gerar nova */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                    Nova análise de supervisão
                  </h2>
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                  <div className="text-xs text-stone-500 font-light">Abordagens teóricas:</div>
                  {Object.entries({
                    geral: 'Geral / Integrativa',
                    freudiana: 'Freudiana',
                    lacaniana: 'Lacaniana',
                    winnicottiana: 'Winnicottiana',
                    bioniana: 'Bioniana',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={abordagens.includes(key)}
                        onChange={e => setAbordagens(prev =>
                          e.target.checked ? [...prev, key] : prev.filter(a => a !== key)
                        )}
                        className="accent-amber-600"
                      />
                      <span className="text-xs text-stone-600 font-light">{label}</span>
                    </label>
                  ))}
                  <button onClick={gerarSupervisao} disabled={gerandoSup || abordagens.length === 0}
                    className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all"
                    style={{ background: '#1A2E25' }}>
                    {gerandoSup ? 'Gerando...' : 'Gerar supervisão →'}
                  </button>
                  {supervisoes.length > 0 && (
                    <p className="text-[10px] text-stone-400 text-center font-light">
                      Considera a supervisão anterior como referência
                    </p>
                  )}
                </div>
              </div>

              {/* histórico de supervisões */}
              {supervisoes.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                      Histórico
                    </h2>
                  </div>
                  {supervisoes.map((s, i) => (
                     <button key={s.id} onClick={() => {
                      setSupAtiva(s)
                      setAnaliseEditada(s.analise_editada || s.analise_bruta)
                      setHipoteses(s.hipoteses || [])
                      setAnaliseHip(null)
                      setHipoteseAtiva(null)
                    }}
                      className={`w-full text-left px-4 py-3 border-b border-stone-50 last:border-0 transition-colors hover:bg-stone-50
                        ${supAtiva?.id === s.id ? 'bg-amber-50' : ''}`}>
                      <div className="text-xs font-medium text-stone-700">
                        Supervisão {supervisoes.length - i}
                      </div>
                      <div className="text-[10px] text-stone-400 font-light">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')} · {s.abordagens?.join(', ')}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${s.status === 'finalizada' ? 'text-green-600' : 'text-amber-600'}`}>
                        {s.status === 'finalizada' ? '✓ Finalizada' : '● Rascunho'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* col direita — análise */}
            <div className="flex-1">
              {supAtiva ? (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                   <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
                    <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                      Análise de supervisão
                    </h2>
                    <div className="flex gap-2">
                      {supAtiva?.status === 'finalizada' && (
                        
                          <a href={`/api/supervisao-word?id=${supAtiva.id}`}
                          className="text-xs px-4 py-1.5 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
                          📄 Word
                        </a>
                      )}
                      <button onClick={salvarSupervisao} disabled={salvando}
                        className="text-xs px-4 py-1.5 rounded-full text-white font-medium disabled:opacity-50"
                        style={{ background: '#2D6A4F' }}>
                        {salvando ? 'Salvando...' : '✓ Salvar e finalizar'}
                      </button>
                    </div>
                  </div>
                                    <textarea
                    value={analiseEditada}
                    onChange={e => setAnaliseEditada(e.target.value)}
                    className="w-full px-5 py-4 text-sm text-stone-700 font-light leading-relaxed resize-none outline-none border-none"
                    style={{ minHeight: '400px' }}
                  />

                  {/* Mapa de hipóteses */}
                  <div className="border-t border-stone-100 px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                        Mapa de hipóteses
                      </h3>
                      <button onClick={extrairHipoteses} disabled={extraindo}
                        className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-50 transition-colors">
                        {extraindo ? 'Extraindo...' : hipoteses.length > 0 ? '↺ Reextrair' : '✦ Extrair hipóteses'}
                      </button>
                    </div>

                    {/* círculos das hipóteses */}
                    {hipoteses.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {hipoteses.map(h => (
                          <button
                            key={h.numero}
                            onClick={() => analisarHipotese(h)}
                            className={`
                              flex flex-col items-center gap-1.5 transition-all
                              ${hipoteseAtiva?.numero === h.numero ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                            `}
                          >
                            <div
                              className={`
                                w-14 h-14 rounded-full flex items-center justify-center text-lg font-light border-2 transition-all
                                ${hipoteseAtiva?.numero === h.numero
                                  ? 'border-amber-600 bg-amber-50 shadow-md scale-110'
                                  : 'border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50'}
                              `}
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {String(h.numero).padStart(2, '0')}
                            </div>
                            <span className="text-[10px] text-stone-500 font-light text-center max-w-[80px] leading-tight">
                              {h.titulo}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* painel da hipótese selecionada */}
                    {analisandoHip && (
                      <div className="text-center py-8 text-stone-400 text-sm font-light">
                        Analisando hipótese {hipoteseAtiva?.numero}...
                      </div>
                    )}

                    {analiseHip && !analisandoHip && (
                      <div className="flex flex-col gap-4">

                        {/* hipótese */}
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                          <div className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-2">
                            Hipótese {hipoteseAtiva?.numero}
                          </div>
                          <p className="text-sm text-stone-700 font-light leading-relaxed"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            {analiseHip.hipotese?.texto}
                          </p>
                          {analiseHip.pergunta_central && (
                            <p className="text-xs text-amber-700 italic mt-3 pt-3 border-t border-stone-200">
                              ✦ {analiseHip.pergunta_central}
                            </p>
                          )}
                        </div>

                        {/* escolas */}
                        {analiseHip.escolas?.length > 0 && (
                          <div>
                            <div className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-2">
                              Sustentação teórica
                            </div>
                            <div className="flex flex-col gap-2">
                              {analiseHip.escolas.map((e, i) => (
                                <div key={i} className="bg-white rounded-xl border border-stone-200 p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-medium text-stone-800">{e.nome}</span>
                                    <div className="flex gap-1">
                                      {e.conceitos?.map(c => (
                                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full"
                                          style={{ background: '#EAF4EE', color: '#2D6A4F' }}>
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs text-stone-500 font-light leading-relaxed">{e.sustentacao}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* cenários */}
                        {analiseHip.cenarios?.length > 0 && (
                          <div>
                            <div className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-2">
                              3 cenários possíveis
                            </div>
                            <div className="flex flex-col gap-3">
                              {analiseHip.cenarios.map(c => {
                                const corProb = c.probabilidade === 'alta' ? '#2D6A4F' :
                                  c.probabilidade === 'média' ? '#C4732A' : '#9A8E82'
                                return (
                                  <div key={c.numero} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-stone-100">
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                                        style={{ background: corProb }}>
                                        {c.numero}
                                      </div>
                                      <span className="text-sm font-medium text-stone-800">{c.titulo}</span>
                                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: corProb + '18', color: corProb }}>
                                        {c.probabilidade}
                                      </span>
                                    </div>
                                    <div className="px-4 py-3">
                                      <p className="text-xs text-stone-600 font-light leading-relaxed mb-3">{c.descricao}</p>
                                      <div className="flex gap-3">
                                        <div className="flex-1">
                                          <div className="text-[10px] font-medium text-green-700 mb-1">✓ Positivo</div>
                                          {c.consequencias_positivas?.map((cp, i) => (
                                            <p key={i} className="text-[11px] text-stone-500 font-light leading-snug mb-0.5">• {cp}</p>
                                          ))}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-[10px] font-medium text-red-600 mb-1">⚠ Risco</div>
                                          {c.consequencias_negativas?.map((cn, i) => (
                                            <p key={i} className="text-[11px] text-stone-500 font-light leading-snug mb-0.5">• {cn}</p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* próximos passos */}
                        {analiseHip.proximos_passos?.length > 0 && (
                          <div className="bg-white rounded-xl border border-stone-200 p-4">
                            <div className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
                              Próximos passos clínicos
                            </div>
                            {analiseHip.proximos_passos.map((p, i) => (
                              <div key={i} className="flex gap-2.5 mb-2 last:mb-0">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0 mt-0.5"
                                  style={{ background: '#1A2E25' }}>
                                  {i + 1}
                                </div>
                                <p className="text-xs text-stone-600 font-light leading-relaxed">{p}</p>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-stone-400 text-sm font-light text-center">
                  <div>
                    <div className="text-3xl mb-3">✦</div>
                    Gere uma nova análise de supervisão<br />ou selecione uma do histórico.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <>
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

                                                    {/* análise da IA — resumo */}
                          {d.analise_ia && (
                            <details className="mt-2">
                              <summary className="text-[11px] text-stone-400 cursor-pointer hover:text-stone-600 transition-colors select-none">
                                Ver análise da IA
                              </summary>
                              <p className="text-xs text-stone-500 font-light leading-relaxed mt-2 pl-2 border-l-2 border-stone-100">
                                                             {d.analise_ia}
                              </p>
                            </details>
                          )}

                          {/* resposta do paciente */}
                          {d.resposta_paciente && (
                            <details className="mt-2">
                              <summary className="text-[11px] text-stone-400 cursor-pointer hover:text-stone-600 transition-colors select-none">
                                Como soou para o paciente
                              </summary>
                              <p className="text-xs text-stone-500 font-light italic mt-2 pl-2 border-l-2 border-amber-100">
                                "{d.resposta_paciente}"
                              </p>
                            </details>
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

                    {/* situações em pausa */}
          {puladas.length > 0 && (() => {
            // Verifica quais foram respondidas em ciclos posteriores
            const respondidasPosteriormente = new Set()
                        devolutivas.forEach(d => {
              d.situacoes_retomadas?.forEach((s, i) => {
                const resp = d.respostas_situacoes_retomadas?.[i]
                if (resp && resp !== '__PULAR__' && resp !== '') {
                  const match = s.situacao?.match(/\d+/)
                  if (match) respondidasPosteriormente.add(parseInt(match[0]) - 1)
                }
              })
            })

            const aindaPuladas = puladas.filter(r => !respondidasPosteriormente.has(r.situacao_index))
            const respondidaDepois = puladas.filter(r => respondidasPosteriormente.has(r.situacao_index))

            return (
              <div className="flex flex-col gap-3">
                {aindaPuladas.length > 0 && (
                  <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-amber-100">
                      <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-700">
                        Situações ainda em pausa ({aindaPuladas.length})
                      </h2>
                    </div>
                    <div className="px-5 py-3 flex flex-col gap-2">
                      {aindaPuladas.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-200 text-amber-600 bg-white">
                            {r.bloco}
                          </span>
                          <span className="text-xs text-amber-800 font-light">
                            Situação {r.situacao_index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {respondidaDepois.length > 0 && (
                  <div className="bg-green-50 rounded-xl border border-green-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-green-100">
                      <h2 className="text-xs font-semibold tracking-widest uppercase text-green-700">
                        Respondidas em ciclos posteriores ({respondidaDepois.length})
                      </h2>
                    </div>
                    <div className="px-5 py-3 flex flex-col gap-2">
                      {respondidaDepois.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-200 text-green-600 bg-white">
                            {r.bloco}
                          </span>
                          <span className="text-xs text-green-800 font-light">
                            Situação {r.situacao_index + 1}
                          </span>
                          <span className="text-[10px] text-green-500">✓ respondida</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
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
          </>
      )}
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