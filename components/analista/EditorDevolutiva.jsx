'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorDevolutiva({ devolutivaId, analiseIa, tags, opcoesEnunciado, acoesIniciais, notaSupervisor, situacoesPuladas, acoesPendentes, readonly = false, onEnviado }) {
  const router = useRouter()

  const [selectedOpt, setSelectedOpt] = useState(0)
  const [enunciado, setEnunciado] = useState(opcoesEnunciado?.[0] || '')
  const [acoes, setAcoes] = useState(acoesIniciais || [])
  const [nota, setNota] = useState(notaSupervisor || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [situacoesSelecionadas, setSituacoesSelecionadas] = useState([])

  function selectOpcao(i) {
    setSelectedOpt(i)
    setEnunciado(opcoesEnunciado[i])
  }

  function updateAcao(i, field, value) {
    const next = [...acoes]
    next[i] = { ...next[i], [field]: value }
    setAcoes(next)
  }

  function addAcao() {
    const tipos = ['Reflexão', 'Observação', 'Convite', 'Pergunta']
    setAcoes(prev => [...prev, { tipo: tipos[prev.length % tipos.length], texto: '' }])
  }

  function removeAcao(i) {
    setAcoes(prev => prev.filter((_, idx) => idx !== i))
  }

   async function handleEnviar() {
    if (!enunciado.trim()) return
    if (!window.confirm('Confirma o envio da devolutiva para o paciente?')) return
    setSending(true)
    try {
      const res = await fetch('/api/devolutiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devolutiva_id: devolutivaId,
          enunciado_final: enunciado,
          acoes,
          nota_supervisor: nota,
          situacoes_retomadas: situacoesSelecionadas.map(i => situacoesPuladas[i]),
        }),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setSent(true)
      if (onEnviado) setTimeout(onEnviado, 1200)
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

          {/* Situações puladas com seleção */}
      {situacoesPuladas?.length > 0 && (
        <div className="rounded-xl border border-amber-100 overflow-hidden bg-amber-50">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-100">
            <span className="text-base">○</span>
            <span className="text-xs font-medium text-amber-800">Situações que o paciente preferiu não comentar</span>
            {!readonly && (
              <span className="ml-auto text-[10px] text-amber-600 font-light">Selecione para incluir no ciclo</span>
            )}
          </div>
          {situacoesPuladas.map((s, i) => (
            <div
              key={i}
              className={`px-4 py-3 border-b border-amber-100 last:border-0 transition-colors
                ${!readonly && situacoesSelecionadas.includes(i) ? 'bg-amber-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                {!readonly && (
                  <input
                    type="checkbox"
                    checked={situacoesSelecionadas.includes(i)}
                    onChange={() => {
                      setSituacoesSelecionadas(prev =>
                        prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                      )
                    }}
                    className="mt-0.5 flex-shrink-0 accent-amber-600"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-800 mb-1">{s.situacao}</p>
                  <p className="text-xs text-amber-700 font-light leading-relaxed">{s.hipotese}</p>
                  {!readonly && situacoesSelecionadas.includes(i) && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1.5">
                      ✓ Será enviada como pergunta na devolutiva
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

            {/* Ações pendentes de ciclos anteriores */}
      {acoesPendentes?.length > 0 && (
        <div className="rounded-xl border border-blue-100 overflow-hidden bg-blue-50">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-blue-100">
            <span className="text-base">↩</span>
            <span className="text-xs font-medium text-blue-800">Ações anteriores ainda pendentes</span>
          </div>
          {acoesPendentes.map((a, i) => (
            <div key={i} className="px-4 py-3 border-b border-blue-100 last:border-0 flex items-start justify-between gap-3">
              <div className="flex-1">
                {a?.tipo && (
                  <div className="text-[10px] font-medium tracking-widest uppercase mb-1" style={{ color: '#4A72B0' }}>
                    {a.tipo}
                  </div>
                )}
                <div className="text-xs text-blue-700 font-light leading-relaxed">
                  {a?.texto || a}
                </div>
              </div>
              {!readonly && (
                <button
                  onClick={() => {
                    const tipos = ['Reflexão', 'Observação', 'Convite', 'Pergunta']
                    setAcoes(prev => [...prev, {
                      tipo: a?.tipo || tipos[prev.length % tipos.length],
                      texto: a?.texto || a
                    }])
                  }}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors"
                  style={{ borderColor: '#4A72B0', color: '#4A72B0', background: 'rgba(74,114,176,0.08)' }}
                >
                  ↓ Usar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Análise IA */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#1A2E25' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#4A9E7A" strokeWidth="1.2" />
              <path d="M4 6 Q6 3.5 8 6 Q6 8.5 4 6Z" fill="none" stroke="#4A9E7A" strokeWidth="0.9" />
            </svg>
          </div>
          <span className="text-xs font-medium text-stone-700">Análise da IA</span>
          <span className="ml-auto text-[11px] text-stone-400">Visível só para você</span>
        </div>
        <div className="px-4 py-3 text-sm text-stone-600 font-light leading-relaxed">
          {analiseIa}
        </div>
        {tags?.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 rounded-full border font-light"
                style={{ background: '#EAF4EE', color: '#2D6A4F', borderColor: '#B8D9C5' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Opções de enunciado */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <span className="text-xs font-medium text-stone-700">Enunciado — escolha ou edite</span>
          <span className="text-[11px] text-stone-400">3 opções geradas pela IA</span>
        </div>
        {opcoesEnunciado?.map((opt, i) => (
          <button
            key={i}
            onClick={() => selectOpcao(i)}
            className={`
              w-full flex gap-3 items-start px-4 py-3 text-left border-b border-stone-50 last:border-0
              transition-colors
              ${selectedOpt === i ? 'bg-amber-50' : 'hover:bg-stone-50'}
            `}
          >
            <div className={`
              w-4 h-4 rounded-full border-[1.5px] flex-shrink-0 mt-0.5 flex items-center justify-center
              transition-colors
              ${selectedOpt === i ? 'border-amber-600 bg-amber-600' : 'border-stone-300'}
            `}>
              {selectedOpt === i && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <p
              className="text-sm text-stone-700 leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {opt}
            </p>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <span className="text-xs font-medium text-stone-700">Editar antes de enviar</span>
          <span className="text-[11px] text-stone-400">"Como isso soa?" será adicionado automaticamente</span>
        </div>
        <textarea
          value={enunciado}
          onChange={e => setEnunciado(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 text-sm text-stone-800 font-light leading-relaxed resize-none outline-none border-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
        />
        <div className="px-4 py-2 border-t border-stone-100">
          <span className="text-[11px] text-stone-300">{enunciado.length} caracteres</span>
        </div>
      </div>

      {/* Ações */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <span className="text-xs font-medium text-stone-700">Ações e reflexões</span>
          <button
            onClick={addAcao}
            className="text-[11px] text-amber-700 font-medium hover:text-amber-800"
          >
            + adicionar
          </button>
        </div>
        {acoes.map((acao, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-stone-50 last:border-0 items-start">
            <span
              className="text-lg flex-shrink-0 pt-0.5 min-w-[20px]"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: 'rgba(196,115,42,0.4)',
                fontWeight: 600,
              }}
            >
              {i + 1}
            </span>
            <div className="flex-1">
              <div
                className="text-[10px] font-medium tracking-widest uppercase mb-1.5"
                style={{ color: '#C4732A' }}
              >
                {acao.tipo}
              </div>
              <textarea
                value={acao.texto}
                onChange={e => {
                  updateAcao(i, 'texto', e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                rows={4}
                className="w-full text-xs text-stone-700 font-light leading-relaxed resize-none outline-none border-b border-stone-100 focus:border-amber-400 pb-1 bg-transparent transition-colors overflow-hidden"
              />
            </div>
            <button
              onClick={() => removeAcao(i)}
              className="text-stone-300 hover:text-red-400 text-sm flex-shrink-0 mt-1 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Nota supervisor */}
      <div className="rounded-xl border border-green-100 overflow-hidden" style={{ background: '#EAF4EE' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-green-100">
          <span className="text-base">🌿</span>
          <span className="text-xs font-medium" style={{ color: '#2D4A35' }}>Nota para o supervisor (Adilson)</span>
        </div>
        <textarea
          value={nota}
          onChange={e => setNota(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 text-xs font-light leading-relaxed resize-none outline-none bg-transparent"
          style={{ color: '#2D4A35' }}
          placeholder="Algo que merece atenção especial neste caso..."
        />
      </div>

      {/* Botão enviar — só no rascunho */}
      {readonly ? (
        <div className="text-center text-xs text-stone-400 font-light py-3 bg-stone-50 rounded-xl border border-stone-200">
          Esta devolutiva já foi enviada — somente leitura
        </div>
      ) : (
      <button
        onClick={handleEnviar}
        disabled={sending || sent || !enunciado.trim()}
        className={`
          w-full py-3.5 rounded-xl text-sm font-medium transition-all
          ${sent
            ? 'bg-green-700 text-white cursor-default'
            : 'text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-default disabled:hover:translate-y-0'
          }
        `}
        style={{ background: sent ? undefined : '#1A2E25' }}
           >
        {sent ? '✓ Devolutiva enviada' : sending ? 'Enviando...' : 'Enviar devolutiva →'}
      </button>
      )}
    </div>
  )
}
