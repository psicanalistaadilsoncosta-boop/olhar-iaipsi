'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, TOTAL } from '@/lib/questions'
import QuestionCard from '@/components/protocolo/QuestionCard'
import ProgressRing from '@/components/protocolo/ProgressRing'

const BLOCOS_CORES = {
  'Presença':               '#C4732A',
  'Vínculos':               '#4A72B0',
  'Trabalho e realizações': '#2D6A4F',
  'Repetição':              '#8A4A8A',
  'Self e identidade':      '#B04A4A',
  'Desejo e tempo':         '#4A8A8A',
}

export default function QuestionarioPage() {
  const router = useRouter()

    const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState(Array(TOTAL).fill(null))
  const [skipped, setSkipped]     = useState(Array(TOTAL).fill(false))
  const [saving, setSaving]       = useState(false)
  const [respondentId, setRespondentId] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('olhar_respondente_id')
    if (stored) {
      setRespondentId(stored)
    } else {
      criarRespondente()
    }
  }, [])

  async function criarRespondente() {
    try {
      const res = await fetch('/api/salvar-questionario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apenas_criar: true }),
      })
      const data = await res.json()
      if (data.id) {
        sessionStorage.setItem('olhar_respondente_id', data.id)
        setRespondentId(data.id)
      }
    } catch (err) {
      console.error('Erro ao criar respondente:', err)
    }
  }

  const question   = QUESTIONS[current]
  const blocoColor = BLOCOS_CORES[question.bloco] || '#C4732A'

  function handleAnswer(value) {
    const next = [...answers]
    next[current] = value
    setAnswers(next)
  }

  function handleSkip() {
    const nextSkipped = [...skipped]
    nextSkipped[current] = !nextSkipped[current]
    if (!skipped[current]) {
      const nextAnswers = [...answers]
      nextAnswers[current] = null
      setAnswers(nextAnswers)
    }
    setSkipped(nextSkipped)
  }

     async function handleNext() {
    const answered = answers[current] !== null && answers[current] !== ''
    const isSkipped = skipped[current]

    if (!answered && !isSkipped) {
      alert('Responda a situação ou clique em "Prefiro não comentar isso agora" para continuar.')
      return
    }

    // Salva a resposta atual automaticamente
    await saveResposta(current)

    if (current < TOTAL - 1) {
      setCurrent(c => c + 1)
      return
    }
    await saveAll()
  }

  async function saveResposta(index) {
    const respondente_id = sessionStorage.getItem('olhar_respondente_id')
    if (!respondente_id) return
    const q = QUESTIONS[index]
    const row = {
      respondente_id,
      ciclo: 1,
      situacao_index: index,
      bloco: q.bloco,
      tipo_resposta: skipped[index] ? 'skip' : q.type,
      resposta_texto: q.type === 'text' && !skipped[index] ? answers[index] : null,
      resposta_opcao: ['images', 'select', 'scale'].includes(q.type) && !skipped[index] ? answers[index] : null,
      pulada: skipped[index],
    }
    await fetch('/api/salvar-resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })
  }

  function handleBack() {
    if (current > 0) setCurrent(c => c - 1)
  }

    async function saveAll() {
    setSaving(true)
    try {
      const respondente_id = sessionStorage.getItem('olhar_respondente_id')
      if (!respondente_id) throw new Error('Sessão expirada. Acesse novamente pelo link.')

      const rows = QUESTIONS.map((q, i) => ({
        ciclo: 1,
        situacao_index: i,
        bloco: q.bloco,
        tipo_resposta: skipped[i] ? 'skip' : q.type,
        resposta_texto: q.type === 'text' && !skipped[i] ? answers[i] : null,
        resposta_opcao: ['images', 'select', 'scale'].includes(q.type) && !skipped[i]
          ? answers[i]
          : null,
        pulada: skipped[i],
      }))

      const res = await fetch('/api/salvar-questionario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondente_id, respostas: rows }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      router.push('/enviado')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Ocorreu um erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function renderDots() {
    const visible = 7
    const start = Math.max(0, Math.min(current - 3, TOTAL - visible))
    return Array.from({ length: Math.min(visible, TOTAL) }, (_, i) => {
      const idx = start + i
      const isCurrent = idx === current
      const isDone    = idx < current
      return (
        <div
          key={idx}
          className={`
            h-1 rounded-full transition-all duration-300
            ${isCurrent ? 'w-4 bg-amber-600' : isDone ? 'w-1 bg-amber-600/50' : 'w-1 bg-white/20'}
          `}
        />
      )
    })
  }

  return (
    <main
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: blocoColor, opacity: 0.07, transition: 'background 0.5s' }}
      />
      <div
        className="absolute -bottom-12 -left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: '#4A9E7A', opacity: 0.06 }}
      />

      <header className="relative z-10 flex items-center justify-between px-7 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ background: blocoColor }}
          />
          <span
            className="text-[11px] font-medium tracking-widest uppercase transition-colors duration-500"
            style={{ color: blocoColor }}
          >
            {question.bloco}
          </span>
        </div>
        <ProgressRing current={current} total={TOTAL} />
      </header>

      <section className="relative z-10 flex-1 flex flex-col px-7 pb-4">
        <p
          className="text-[13px] italic mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(248,243,236,0.35)' }}
        >
          Situação {current + 1}
        </p>
        <QuestionCard
          question={question}
          answer={answers[current]}
          skipped={skipped[current]}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </section>

      <footer className="relative z-10 flex items-center justify-between px-7 py-4">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="px-5 py-2.5 rounded-full border border-white/12 bg-white/7 text-stone-100/60 text-sm font-light disabled:opacity-20 disabled:cursor-default hover:bg-white/12 transition-colors"
        >
          ← Voltar
        </button>

        <div className="flex items-center gap-1.5">
          {renderDots()}
        </div>

        <button
          onClick={handleNext}
          disabled={saving}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-stone-100 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: blocoColor }}
        >
          {saving ? 'Salvando...' : current === TOTAL - 1 ? 'Concluir →' : 'Continuar →'}
        </button>
      </footer>
    </main>
  )
}