'use client'

import { useState } from 'react'
import { QUESTIONS } from '@/lib/questions'

const BLOCOS_CORES = {
  'Presença':              '#C4732A',
  'Vínculos':              '#4A72B0',
  'Trabalho e realizações':'#2D6A4F',
  'Repetição':             '#8A4A8A',
  'Self e identidade':     '#B04A4A',
  'Desejo e tempo':        '#4A8A8A',
}

function formatResposta(resposta) {
  const q = QUESTIONS[resposta.situacao_index]
  if (!q) return null

  if (resposta.pulada) return { texto: null, pulada: true }

  let texto = ''
  if (resposta.resposta_texto) {
    texto = resposta.resposta_texto
  } else if (resposta.resposta_opcao !== null) {
    if (q.type === 'images') texto = q.options[resposta.resposta_opcao]?.label || ''
    if (q.type === 'select') texto = q.options[resposta.resposta_opcao] || ''
    if (q.type === 'scale')  texto = q.labels[resposta.resposta_opcao] || ''
  }
  return { texto, pulada: false, meta: q.meta }
}

function BlocoCard({ bloco, respostas }) {
  const [open, setOpen] = useState(bloco === 'Presença')
  const cor = BLOCOS_CORES[bloco] || '#C4732A'
  const respondidas = respostas.filter(r => !r.pulada).length

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cor }} />
          <span className="text-sm font-medium text-stone-800">{bloco}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">{respondidas}/{respostas.length}</span>
          <span className={`text-stone-300 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {respostas.map((r, i) => {
            const q = QUESTIONS[r.situacao_index]
            const fmt = formatResposta(r)
            if (!q || !fmt) return null

            return (
              <div
                key={r.id || i}
                className="px-4 py-3 border-b border-stone-50 last:border-0"
              >
                <p className="text-[11px] text-stone-400 mb-1 leading-snug">{q.text}</p>
                {fmt.pulada ? (
                  <p className="text-xs text-stone-300 italic">Preferiu não comentar</p>
                ) : (
                  <>
                    <p className="text-sm text-stone-700 font-light leading-relaxed">
                      {fmt.texto || '—'}
                    </p>
                    {fmt.meta && (
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {fmt.meta.escola} — {fmt.meta.conceito}
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function RespostasBlocos({ respostas }) {
  // Agrupa por bloco mantendo a ordem
  const blocos = {}
  respostas.forEach(r => {
    if (!blocos[r.bloco]) blocos[r.bloco] = []
    blocos[r.bloco].push(r)
  })

  const ordem = [
    'Presença', 'Vínculos', 'Trabalho e realizações',
    'Repetição', 'Self e identidade', 'Desejo e tempo',
  ]

  return (
    <div className="flex flex-col gap-2.5">
      {ordem.map(bloco =>
        blocos[bloco] ? (
          <BlocoCard key={bloco} bloco={bloco} respostas={blocos[bloco]} />
        ) : null
      )}
    </div>
  )
}
