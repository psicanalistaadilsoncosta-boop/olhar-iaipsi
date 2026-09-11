'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const OPCOES_ACAO = [
  { value: 'fiz', label: 'Fiz', emoji: '✓', cor: '#2D6A4F' },
  { value: 'tentei', label: 'Tentei', emoji: '~', cor: '#C4732A' },
  { value: 'nao_consegui', label: 'Não consegui', emoji: '✗', cor: '#B04A4A' },
  { value: 'nao_tentei', label: 'Ainda não tentei', emoji: '○', cor: '#9A8E82' },
]

export default function DevolutivaPage() {
  const supabase = createClient()
  const router = useRouter()

  const [devolutiva, setDevolutiva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [respostaSoa, setRespostaSoa] = useState('')
  const [respostasAcoes, setRespostasAcoes] = useState([])
  const [respostasSituacoes, setRespostasSituacoes] = useState([])
  const [observacoes, setObservacoes] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const respondente_id = sessionStorage.getItem('olhar_respondente_id')
    if (!respondente_id) {
      router.replace('/')
      return
    }

    const { data, error } = await supabase
      .from('olhar_devolutivas')
      .select('*')
      .eq('respondente_id', respondente_id)
      .eq('status', 'enviada')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      router.replace('/aguardando')
      return
    }

       if (data.status === 'respondida') {
      setEnviado(true)
      setLoading(false)
      return
    }

        if (data.status === 'respondida') {
      setEnviado(true)
      setLoading(false)
      return
    }

   setDevolutiva(data)
    if (data.acoes) {
      setRespostasAcoes(data.acoes.map(() => ({ opcao: null, observacao: '' })))
    }
    if (data.situacoes_retomadas) {
      setRespostasSituacoes(data.situacoes_retomadas.map(() => ''))
    }
    setLoading(false)
  }

  function updateAcaoOpcao(i, value) {
    const next = [...respostasAcoes]
    next[i] = { ...next[i], opcao: value }
    setRespostasAcoes(next)
  }

  function updateAcaoObs(i, value) {
    const next = [...respostasAcoes]
    next[i] = { ...next[i], observacao: value }
    setRespostasAcoes(next)
  }

   async function handleEnviar() {
    if (!respostaSoa.trim()) {
      alert('Escreva como isso soa para você antes de enviar.')
      return
    }

    const acoeSemResposta = respostasAcoes.findIndex(r => !r.opcao)
    if (acoeSemResposta !== -1) {
      alert(`Selecione uma opção para a ação ${acoeSemResposta + 1} antes de enviar.`)
      return
    }
    setEnviando(true)
    try {
      const respondente_id = sessionStorage.getItem('olhar_respondente_id')

       const { error } = await supabase
        .from('olhar_devolutivas')
        .update({
          resposta_paciente: respostaSoa,
          resposta_paciente_at: new Date().toISOString(),
          acoes_respondidas: respostasAcoes,
          respostas_situacoes_retomadas: respostasSituacoes,
          observacoes_paciente: observacoes,
          status: 'respondida',
        })
        .eq('id', devolutiva.id)

      if (error) throw error

      // Atualiza status do respondente
      await supabase
        .from('olhar_respondentes')
        .update({ status: 'ativo' })
        .eq('id', respondente_id)

      setEnviado(true)
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
      >
        <div className="text-stone-100/40 text-sm font-light">Carregando...</div>
      </main>
    )
  }

  if (enviado) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
      >
        <div className="text-4xl mb-6">🌿</div>
        <h1
          className="text-2xl text-stone-100 mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Obrigado por compartilhar
        </h1>
        <p className="text-sm text-stone-100/50 font-light leading-relaxed max-w-xs">
          Seu analista receberá sua resposta e suas reflexões sobre as ações. Em breve haverá mais.
        </p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.07 }}
      />

      <div className="relative z-10 flex-1 px-6 py-8 max-w-lg mx-auto w-full flex flex-col gap-6">

        {/* enunciado */}
        <div>
          <div
            className="text-[11px] font-medium tracking-widest uppercase mb-3"
            style={{ color: 'rgba(196,115,42,0.8)' }}
          >
            Seu analista observou
          </div>
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div
              className="text-stone-100 leading-relaxed mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 17 }}
            >
              {devolutiva.enunciado_final}
            </div>
            <p
              className="text-stone-100/50 text-sm italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Como isso soa para você?
            </p>
          </div>
        </div>

        {/* resposta ao enunciado */}
        <div>
          <div
            className="text-[11px] font-medium tracking-widest uppercase mb-2"
            style={{ color: 'rgba(248,243,236,0.35)' }}
          >
            Sua resposta
          </div>
          <textarea
            value={respostaSoa}
            onChange={e => setRespostaSoa(e.target.value)}
            rows={4}
            placeholder="Escreva o que vier... sem pressa, sem censura."
            className="w-full rounded-2xl px-4 py-3 text-sm text-stone-100 font-light leading-relaxed resize-none outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F8F3EC',
            }}
          />
        </div>

                {/* situações retomadas — aparecem como perguntas */}
        {devolutiva.situacoes_retomadas?.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium tracking-widest uppercase mb-3"
              style={{ color: 'rgba(248,243,236,0.35)' }}
            >
              Gostaríamos de revisitar algumas situações
            </div>
            <div className="flex flex-col gap-3">
              {devolutiva.situacoes_retomadas.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p
                    className="text-sm text-stone-100/80 leading-relaxed mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {s.pergunta || s.situacao}
                  </p>
                  <textarea
                    value={respostasSituacoes[i] || ''}
                    onChange={e => {
                      const next = [...respostasSituacoes]
                      next[i] = e.target.value
                      setRespostasSituacoes(next)
                    }}
                    rows={3}
                    placeholder="Escreva o que quiser compartilhar agora..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-light leading-relaxed resize-none outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(248,243,236,0.8)',
                    }}
                  />
                  <button
                    onClick={() => {
                      const next = [...respostasSituacoes]
                      next[i] = '__PULAR__'
                      setRespostasSituacoes(next)
                    }}
                    className={`mt-2 text-xs transition-colors ${
                      respostasSituacoes[i] === '__PULAR__'
                        ? 'text-amber-600/80'
                        : 'text-stone-100/30 hover:text-stone-100/60'
                    }`}
                  >
                    {respostasSituacoes[i] === '__PULAR__'
                      ? '✓ Pulando por enquanto'
                      : 'Prefiro não comentar isso agora'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ações */}
        {devolutiva.acoes?.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium tracking-widest uppercase mb-3"
              style={{ color: 'rgba(248,243,236,0.35)' }}
            >
              Reflexões para esta semana
            </div>

            <div className="flex flex-col gap-3">
              {devolutiva.acoes.map((acao, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* tipo + texto */}
                  <div
                    className="text-[10px] font-medium tracking-widest uppercase mb-2"
                    style={{ color: 'rgba(196,115,42,0.7)' }}
                  >
                    {acao.tipo}
                  </div>
                  <p className="text-sm text-stone-100/80 font-light leading-relaxed mb-4">
                    {acao.texto}
                  </p>

                  {/* seleção */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {OPCOES_ACAO.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateAcaoOpcao(i, opt.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light border transition-all"
                        style={{
                          background: respostasAcoes[i]?.opcao === opt.value
                            ? opt.cor + '25'
                            : 'rgba(255,255,255,0.04)',
                          borderColor: respostasAcoes[i]?.opcao === opt.value
                            ? opt.cor + '80'
                            : 'rgba(255,255,255,0.1)',
                          color: respostasAcoes[i]?.opcao === opt.value
                            ? '#F8F3EC'
                            : 'rgba(248,243,236,0.45)',
                        }}
                      >
                        <span>{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* observação */}
                  <textarea
                    value={respostasAcoes[i]?.observacao || ''}
                    onChange={e => updateAcaoObs(i, e.target.value)}
                    rows={2}
                    placeholder="O que aconteceu? Como foi tentarou fazer isso?"
                    className="w-full rounded-xl px-3 py-2.5 text-xs font-light leading-relaxed resize-none outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(248,243,236,0.7)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* observações gerais */}
        <div>
          <div
            className="text-[11px] font-medium tracking-widest uppercase mb-2"
            style={{ color: 'rgba(248,243,236,0.35)' }}
          >
            Observações gerais <span style={{ color: 'rgba(248,243,236,0.2)' }}>(opcional)</span>
          </div>
          <textarea
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Algo mais que queira compartilhar com seu analista..."
            className="w-full rounded-2xl px-4 py-3 text-sm font-light leading-relaxed resize-none outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(248,243,236,0.6)',
            }}
          />
        </div>

        {/* enviar */}
        <button
          onClick={handleEnviar}
          disabled={enviando}
          className="w-full py-3.5 rounded-full text-sm font-medium text-stone-100 transition-all hover:-translate-y-0.5 disabled:opacity-60 mb-8"
          style={{ background: '#C4732A' }}
        >
          {enviando ? 'Enviando...' : 'Enviar →'}
        </button>
      </div>
    </main>
  )
}