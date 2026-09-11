export default function ProgressRing({ current, total }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const pct = (current + 1) / total
  const offset = circumference - circumference * pct

  return (
    <div className="relative w-11 h-11">
      <svg
        width="44" height="44" viewBox="0 0 44 44"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2.5"
        />
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="#C4732A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] text-stone-100/60 font-light tabular-nums">
          {current + 1}/{total}
        </span>
      </div>
    </div>
  )
}