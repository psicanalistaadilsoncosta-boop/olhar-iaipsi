'use client'

import { useRef, useState, useEffect } from 'react'

export default function InputText({ value, onChange, placeholder, disabled }) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  function toggleMic() {
    if (!supported) return

    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.continuous = true
    rec.interimResults = false

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
      const current = value || ''
      onChange(current ? current + ' ' + transcript : transcript)
    }

    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)

    rec.start()
    recognitionRef.current = rec
    setRecording(true)
  }

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border transition-colors
        ${disabled ? 'opacity-40' : ''}
        ${recording
          ? 'border-red-400/60 bg-red-500/5'
          : 'border-white/10 bg-white/5 focus-within:border-amber-600/40'
        }
      `}
    >
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Escreva o que vier...'}
        disabled={disabled}
        rows={4}
        className="
          w-full bg-transparent border-none outline-none resize-none
          text-stone-100 placeholder-stone-100/25
          font-light text-sm leading-relaxed
          px-4 pt-4 pb-10
        "
      />

      {/* barra inferior */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 border-t border-white/7">
        <span className="text-[11px] text-stone-100/25 font-light">
          {recording
            ? 'Gravando... fale com calma.'
            : 'Sem pressa. Pode ser uma palavra ou uma página.'}
        </span>

        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={disabled}
            aria-label={recording ? 'Parar gravação' : 'Falar'}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center border transition-all
              ${recording
                ? 'border-red-400/50 bg-red-500/20 animate-pulse'
                : 'border-white/12 bg-white/7 hover:bg-amber-600/18 hover:border-amber-600/30'
              }
            `}
          >
            <MicIcon recording={recording} />
          </button>
        )}
      </div>
    </div>
  )
}

function MicIcon({ recording }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={recording ? 'text-red-300' : 'text-stone-100/60'}
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  )
}
