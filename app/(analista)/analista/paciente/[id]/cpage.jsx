'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RespostasBlocos from '@/components/analista/RespostasBlocos'
import EditorDevolutiva from '@/components/analista/EditorDevolutiva'

export default function PacientePage() {
  const { id } = useParams()
  const supabase = createClient()

  const [respondente, setRespondente] = useState(null)
  const [respostas, setRespostas] = useState([])
  const [devolutiva, setDevolutiva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [gerandoCiclo, setGerandoCiclo] = useState(false)
  const [tab, setTab] = useState('devolutiva')
  const [devolutivaRespondida, setDevolutivaRespondida] = useState(null)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    try {
          const [{ data: r }, { data: res }] = await Promise.all([
      supabase.from('olhar_respondentes').select('*').eq('id', id).single(),
      supabase.from('olhar_respostas').select('*').eq('respondente_id', id).order('situacao_index'),
    ])

    // Busca rascunho mais recente (para o editor)
    const { data: rascunho } = await supabase
      .from('olhar_devolutivas')
      .select('*')
      .eq('respondente_id', id)
      .eq('status', 'rascunho')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Busca última respondida (para a aba de resposta do paciente)
    const { data: respondida } = await supabase
      .from('olhar_devolutivas')
      .select('*')
      .eq('respondente_id', id)
      .eq('status', 'respondida')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setRespondente(r)
    setRespostas(res || [])
    setDevolutiva(rascunho || respondida)
    setDevolutivaRespondida(respondida)
    } finally {
      setLoading(false)
    }
  }

    async function gerarCiclo() {
    if (!devolutiva?.id) return
    setGerandoCiclo(true)
    try {
      const res = await fetch('/api/analise-ciclo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondente_id: id,
          devolutiva_anterior_id: devolutiva.id,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await load()
      setTab('devolutiva')
    } catch (err) {
      alert('Erro ao gerar próximo ciclo: ' + err.message)
    } finally {
      setGerandoCiclo(false)
    }
  }

  async function gerarAnalise() {
    setGerando(true)
    try {
      const res = await fetch('/api/analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondente_id: id, ciclo: respondente?.ciclo_atual || 1 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await load()
    } catch (err) {
      alert('Erro ao gerar análise: ' + err.message)
    } finally {
      setGerando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm font-light">
        Carregando...
      </div>
    )
  }

  if (!respondente) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm font-light">
        Paciente não encontrado.
      </div>
    )
  }

  const respondidas = respostas.filter(r => !r.pulada).length
  const puladas = respostas.filter(r => r.pulada).length

  return (
    <div className="p-6">
      {/* topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            style={{ background: 'rgba(196,115,42,0.12)', color: '#C4732A' }}
          >
            {respondente.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
          </div>
          <div>
            <h1
              className="text-lg text-stone-800"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              {respondente.nome || 'Sem nome'}
            </h1>
            <p className="text-xs text-stone-400 font-light">
              {respondente.email} · Ciclo {respondente.ciclo_atual} · {respondidas} respondidas · {puladas} em pausa
            </p>
          </div>
        </div>

        {!devolutiva && respostas.length > 0 && (
          <button
            onClick={gerarAnalise}
            disabled={gerando}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: '#C4732A' }}
          >
            {gerando ? 'Gerando análise...' : 'Gerar análise com IA →'}
          </button>
        )}

        {devolutiva?.status === 'enviada' && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            ✓ Devolutiva enviada
          </span>
        )}
      </div>

           {/* tabs */}
      <div className="flex gap-0 border-b border-stone-200 mb-5">
        <button
          onClick={() => setTab('devolutiva')}
          className={`text-sm px-4 py-2.5 border-b-2 transition-colors ${tab === 'devolutiva' ? 'border-amber-600 text-stone-800 font-medium' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
        >
          Devolutiva
        </button>
          {devolutivaRespondida && (
          <button
            onClick={() => setTab('resposta')}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors ${tab === 'resposta' ? 'border-amber-600 text-stone-800 font-medium' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            Resposta do paciente
            <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Novo</span>
          </button>
        )}
      </div>

      {/* conteúdo em duas colunas */}
      <div className="flex gap-5">

               {/* aba resposta do paciente */}
        {tab === 'resposta' && devolutivaRespondida && (
          <div className="w-full flex flex-col gap-4">

            {/* como isso soou */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                <span className="text-xs font-medium text-stone-700">Como isso soou para o paciente</span>
              </div>
              <div className="px-4 py-4 text-sm text-stone-700 font-light leading-relaxed"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {devolutivaRespondida.resposta_paciente || '—'}
              </div>
            </div>

            {/* ações respondidas */}
            {devolutivaRespondida.acoes_respondidas?.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                  <span className="text-xs font-medium text-stone-700">Ações — o que o paciente fez</span>
                </div>
                {devolutivaRespondida.acoes?.map((acao, i) => {
                  const resp = devolutivaRespondida.acoes_respondidas[i]
                  const CORES = { fiz: '#2D6A4F', tentei: '#C4732A', nao_consegui: '#B04A4A', nao_tentei: '#9A8E82' }
                  const LABELS = { fiz: '✓ Fiz', tentei: '~ Tentei', nao_consegui: '✗ Não consegui', nao_tentei: '○ Ainda não tentei' }
                                    return (
                    <div key={i} className="px-4 py-3 border-b border-stone-50 last:border-0">
                      <div className="text-[10px] font-medium tracking-widest uppercase mb-1" style={{ color: '#C4732A' }}>
                        {acao.tipo}
                      </div>
                      <p className="text-xs text-stone-500 font-light mb-2">{acao.texto}</p>
                      {resp?.opcao && (
                        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full mb-2 font-medium"
                          style={{ background: CORES[resp.opcao] + '18', color: CORES[resp.opcao] }}>
                          {LABELS[resp.opcao]}
                        </span>
                      )}
                      {resp?.observacao && (
                        <p className="text-xs text-stone-600 font-light leading-relaxed bg-stone-50 rounded-lg px-3 py-2">
                          {resp.observacao}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* observações gerais */}
            {devolutivaRespondida.observacoes_paciente && (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                  <span className="text-xs font-medium text-stone-700">Observações gerais</span>
                </div>
                <div className="px-4 py-4 text-sm text-stone-600 font-light leading-relaxed">
                  {devolutivaRespondida.observacoes_paciente}
                </div>
              </div>
            )}

            {/* botão próximo ciclo — só aparece se não há rascunho em andamento */}
            {!devolutiva || devolutiva.status === 'respondida' ? (
              <button
                onClick={gerarCiclo}
                disabled={gerandoCiclo}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: '#C4732A' }}
              >
                {gerandoCiclo ? 'Preparando próximo ciclo...' : 'Preparar próxima devolutiva com IA →'}
              </button>
            ) : (
              <div className="text-center text-xs text-stone-400 font-light py-2">
                Rascunho do próximo ciclo já está em preparação — veja a aba Devolutiva.
              </div>
            )}

            {/* observações gerais */}
            {devolutiva.observacoes_paciente && (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                  <span className="text-xs font-medium text-stone-700">Observações gerais</span>
                </div>
                <div className="px-4 py-4 text-sm text-stone-600 font-light leading-relaxed">
                  {devolutiva.observacoes_paciente}
                </div>
              </div>
            )}

          </div>
        )}

        {tab === 'devolutiva' && (
        <>
        {/* col esquerda — respostas */}
        <div className="w-5/12 flex-shrink-0">
          <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
            Respostas do questionário
          </h2>
          {respostas.length > 0
            ? <RespostasBlocos respostas={respostas} />
            : <p className="text-sm text-stone-400 font-light">Nenhuma resposta ainda.</p>
          }
        </div>

        {/* col direita — editor */}
        <div className="flex-1">
          {devolutiva ? (
            <>
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
                {devolutiva.status === 'rascunho' ? 'Devolutiva — revisar e enviar' : 'Devolutiva enviada'}
              </h2>
                <EditorDevolutiva
                devolutivaId={devolutiva.id}
                analiseIa={devolutiva.analise_ia}
                tags={devolutiva.tags_ia}
                opcoesEnunciado={devolutiva.opcoes_enunciado}
                acoesIniciais={devolutiva.acoes}
                notaSupervisor={devolutiva.nota_supervisor}
                situacoesPuladas={devolutiva.situacoes_puladas}
                acoesPendentes={devolutiva.acoes_pendentes}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-3xl mb-4">✦</div>
              <p className="text-sm text-stone-400 font-light max-w-xs leading-relaxed">
                {respostas.length > 0
                  ? 'Clique em "Gerar análise com IA" para preparar a devolutiva.'
                  : 'Aguardando o questionário ser concluído.'}
              </p>
            </div>
          )}
               </div>
        </>
        )}
      </div>
    </div>
  )
}


