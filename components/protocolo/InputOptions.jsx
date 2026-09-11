'use client'

// ── InputCards — seleção visual com emoji ──────────────────
export function InputCards({ options, value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange(i)}
          className={`
            flex flex-col items-center justify-center gap-1
            h-20 rounded-xl border-2 transition-all
            ${disabled ? 'opacity-40' : ''}
            ${value === i
              ? 'border-amber-600 bg-amber-600/15'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:-translate-y-0.5'
            }
          `}
        >
          <span className="text-2xl leading-none">{opt.emoji}</span>
          <span className="text-[10px] text-stone-100/50 font-light">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── InputSelect — pílulas de opção ────────────────────────
export function InputSelect({ options, value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange(i)}
          className={`
            px-4 py-2 rounded-full border text-sm font-light transition-all
            ${disabled ? 'opacity-40' : ''}
            ${value === i
              ? 'border-amber-600/50 bg-amber-600/18 text-stone-100'
              : 'border-white/12 bg-white/5 text-stone-100/65 hover:bg-white/10 hover:text-stone-100'
            }
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── InputScale — escala de intensidade ────────────────────
export function InputScale({ labels, value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange(i)}
          className={`
            flex-1 h-14 rounded-xl border text-xs font-light leading-tight
            px-2 transition-all
            ${disabled ? 'opacity-40' : ''}
            ${value === i
              ? 'border-amber-600/50 bg-amber-600/18 text-stone-100'
              : 'border-white/10 bg-white/5 text-stone-100/50 hover:bg-white/10 hover:text-stone-100'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
