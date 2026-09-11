'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RespostasBlocos from '@/components/analista/RespostasBlocos'
import EditorDevolutiva from '@/components/analista/EditorDevolutiva'

const CORES = { fiz: '#2D6A4F', tentei: '#C4732A', nao_consegui: '#B04A4A', nao_tentei: '#9A8E82' }
const LABELS = { fiz: '✓ Fiz', tentei: '~ Tentei', nao_consegui: '✗ Não consegui', nao_tentei: '○ Ainda não tentei' }

export default function PacientePage() {
  const { id } = useParams()
  const supabase = createClient()

  const [respondente, setRespondente] = useState(null)
  const [respostas, setRespostas] = useState([])
  const [devolutivas, setDevolutivas] = useState([]) // todos os ciclos
  const [cicloAtivo, setCicloAtivo] = useState(null) // número do ciclo selecionado na aba
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [gerandoCiclo, setGerandoCiclo] = useState(false)
  const [confirmEnvio, setConfirmEnvio] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const [{ data: r }, { data: res }, { data: devs }] = await Promise.all([
        supabase.from('olhar_respondentes').select('*').eq('id', id).single(),
        supabase.from('olhar_respostas').select('*').eq('respondente_id', id).order('situacao_index'),
        supabase.from('olhar_devolutivas').select('*').eq('respondente_id', id)
          .neq('status', 'rascunho') // ciclos completos
          .order('ciclo', { ascending: true }),
      ])

      // Busca rascunho separado
      const { data: rascunho } = await supabase
        .from('olhar_devolutivas').select('*')
        .eq('respondente_id', id).eq('status', 'rascunho')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()

      setRespondente(r)
      setRespostas(res || [])

      // Monta lista de ciclos: completos + rascunho no final se existir
      const lista = [...(devs || [])]
      if (rascunho) lista.push(rascunho)
      setDevolutivas(lista)

      // Ativa o ciclo mais recente
      if (lista.length > 0) {
        setCicloAtivo(lista[lista.length - 1].ciclo)
      } else {
        setCicloAtivo(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function gerarAnalise() {
    setGerando(true)
    try {
      const res = await fetch('/api/analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondente_id: id, ciclo: 1 }),
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

  async function gerarCiclo(devAnteriorId) {
    setGerandoCiclo(true)
    try {
      const res = await fetch('/api/analise-ciclo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondente_id: id, devolutiva_anterior_id: devAnteriorId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await load()
    } catch (err) {
      alert('Erro ao gerar próximo ciclo: ' + err.message)
    } finally {
      setGerandoCiclo(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-stone-400 text-sm font-light">Carregando...</div>
  )

  if (!respondente) return (
    <div className="flex items-center justify-center h-64 text-stone-400 text-sm font-light">Paciente não encontrado.</div>
  )

  const respondidas = respostas.filter(r => !r.pulada).length
  const puladas = respostas.filter(r => r.pulada).length
  const devAtiva = devolutivas.find(d => d.ciclo === cicloAtivo)
  const temRascunho = devolutivas.some(d => d.status === 'rascunho')
  const ultimaRespondida = [...devolutivas].reverse().find(d => d.status === 'respondida')

  return (
    <div className="p-6 max-w-6xl">

      {/* topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
            style={{ background: 'rgba(196,115,42,0.12)', color: '#C4732A' }}>
            {respondente.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-lg text-stone-800" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              {respondente.nome || 'Sem nome'}
            </h1>
                        <p className="text-xs text-stone-400 font-light">
              {respondente.email} · Ciclo {respondente.ciclo_atual} · {respondidas} respondidas · {puladas} em pausa
            </p>
            {respondente.token && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-stone-300 font-light truncate max-w-xs">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/questionario?t=${respondente.token}`}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(
                    `${window.location.origin}/?t=${respondente.token}`
                  )}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors flex-shrink-0"
                >
                  Copiar link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* botão gerar análise inicial */}
        {devolutivas.length === 0 && respostas.length > 0 && (
          <button onClick={gerarAnalise} disabled={gerando}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: '#C4732A' }}>
            {gerando ? 'Gerando análise...' : 'Gerar análise inicial com IA →'}
          </button>
        )}
      </div>

      {/* abas de ciclos */}
      {devolutivas.length > 0 && (
        <div className="flex gap-0 border-b border-stone-200 mb-6 overflow-x-auto">
          {devolutivas.map(d => (
            <button key={d.ciclo} onClick={() => setCicloAtivo(d.ciclo)}
              className={`text-sm px-5 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2
                ${cicloAtivo === d.ciclo
                  ? 'border-amber-600 text-stone-800 font-medium'
                  : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
              Ciclo {d.ciclo}
              {d.status === 'rascunho' && (
                <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">rascunho</span>
              )}
              {d.status === 'respondida' && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">respondido</span>
              )}
              {d.status === 'enviada' && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">enviado</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* conteúdo do ciclo ativo */}
      {devAtiva ? (
             <div className="max-w-3xl flex flex-col gap-6">

          {/* respostas do questionário */}
          <div>
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
              Respostas do questionário
            </h2>
            <RespostasBlocos respostas={respostas} />

            {/* resposta do paciente ao enunciado — se houver */}
            {devAtiva.resposta_paciente && (
              <div className="mt-4">
                <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
                  Resposta do paciente
                </h2>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                    <span className="text-xs font-medium text-stone-700">Como isso soou</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-stone-700 font-light leading-relaxed"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {devAtiva.resposta_paciente}
                  </div>
                </div>

                {/* ações respondidas */}
                {devAtiva.acoes_respondidas?.length > 0 && (
                  <div className="mt-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                      <span className="text-xs font-medium text-stone-700">O que o paciente fez</span>
                    </div>
                    {devAtiva.acoes?.map((acao, i) => {
                      const resp = devAtiva.acoes_respondidas[i]
                      return (
                        <div key={i} className="px-4 py-3 border-b border-stone-50 last:border-0">
                          <div className="text-[10px] font-medium tracking-widest uppercase mb-1" style={{ color: '#C4732A' }}>
                            {acao.tipo}
                          </div>
                          <p className="text-xs text-stone-500 font-light mb-2">{acao.texto}</p>
                          {resp?.opcao && (
                            <span className="inline-block text-[11px] px-2.5 py-1 rounded-full mb-1 font-medium"
                              style={{ background: CORES[resp.opcao] + '18', color: CORES[resp.opcao] }}>
                              {LABELS[resp.opcao]}
                            </span>
                          )}
                          {resp?.observacao && (
                            <p className="text-xs text-stone-600 font-light leading-relaxed bg-stone-50 rounded-lg px-3 py-2 mt-1">
                              {resp.observacao}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* observações gerais */}
                {devAtiva.observacoes_paciente && (
                  <div className="mt-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                      <span className="text-xs font-medium text-stone-700">Observações gerais</span>
                    </div>
                    <div className="px-4 py-3 text-sm text-stone-600 font-light leading-relaxed">
                      {devAtiva.observacoes_paciente}
                    </div>
                  </div>
                )}

                {/* botão próximo ciclo */}
                {devAtiva.status === 'respondida' && !temRascunho && (
                  <button onClick={() => gerarCiclo(devAtiva.id)} disabled={gerandoCiclo}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: '#C4732A' }}>
                    {gerandoCiclo ? 'Preparando próximo ciclo...' : 'Preparar próxima devolutiva com IA →'}
                  </button>
                )}
                {temRascunho && devAtiva.status === 'respondida' && (
                  <p className="text-center text-xs text-stone-400 font-light mt-4 py-2">
                    Rascunho do próximo ciclo em preparação — veja a aba ao lado.
                  </p>
                )}
              </div>
            )}
          </div>

                    {/* editor de devolutiva */}
          <div>
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
              {devAtiva.status === 'rascunho' ? 'Devolutiva — revisar e enviar' : `Devolutiva do ciclo ${devAtiva.ciclo}`}
            </h2>
            <EditorDevolutiva
              devolutivaId={devAtiva.id}
              analiseIa={devAtiva.analise_ia}
              tags={devAtiva.tags_ia}
              opcoesEnunciado={devAtiva.opcoes_enunciado}
              acoesIniciais={devAtiva.acoes}
              notaSupervisor={devAtiva.nota_supervisor}
              situacoesPuladas={devAtiva.situacoes_puladas}
              acoesPendentes={devAtiva.acoes_pendentes}
              readonly={devAtiva.status !== 'rascunho'}
              onEnviado={load}
            />
          </div>

        </div>
      ) : (
        /* sem devolutiva ainda */
             <div className="max-w-3xl flex flex-col gap-6">
          <div>
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
              Respostas do questionário
            </h2>
            {respostas.length > 0
              ? <RespostasBlocos respostas={respostas} />
              : <p className="text-sm text-stone-400 font-light">Aguardando o questionário ser concluído.</p>}
          </div>
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <div className="text-3xl mb-4">✦</div>
              <p className="text-sm text-stone-400 font-light max-w-xs leading-relaxed">
                {respostas.length > 0
                  ? 'Clique em "Gerar análise inicial com IA" para preparar a devolutiva.'
                  : 'Aguardando o questionário ser concluído.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
