'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STATUS_COR = {
  questionario: '#C4732A',
  aguardando:   '#C4732A',
  devolutiva:   '#4A72B0',
  ativo:        '#2D6A4F',
  encerrado:    '#9A8E82',
}

export default function Sidebar({ pacientes = [] }) {
  const path = usePathname()

  const navItems = [
    { href: '/analista/dashboard', label: 'Devolutivas', icon: 'ti-inbox',    badge: pacientes.filter(p => p.status === 'aguardando').length },
    { href: '/analista/sessoes',   label: 'Sessões',     icon: 'ti-calendar', badge: 0 },
    { href: '/analista/evolucao',  label: 'Evolução',    icon: 'ti-chart-bar',badge: 0 },
  ]

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col" style={{ background: '#1A2E25' }}>
      {/* logo */}
      <div className="px-5 py-5 border-b border-white/7">
        <div
          className="text-sm text-stone-100"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Olhar
        </div>
        <div className="text-[10px] text-stone-100/30 font-light mt-0.5">
          Painel do analista
        </div>
      </div>

      {/* nav */}
      <nav className="mt-4">
        <div className="text-[9px] font-semibold tracking-widest text-stone-100/25 uppercase px-5 mb-1.5">
          Fila
        </div>
        {navItems.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 text-sm font-light transition-colors
                ${active
                  ? 'bg-amber-600/15 text-stone-100/90 border-r-2 border-amber-600'
                  : 'text-stone-100/50 hover:bg-white/5 hover:text-stone-100/80'}
              `}
            >
              <i className={`ti ${item.icon} text-base opacity-70`} aria-hidden="true" />
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-amber-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* pacientes */}
      {pacientes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/7">
          <div className="text-[9px] font-semibold tracking-widest text-stone-100/25 uppercase px-5 mb-2">
            Pacientes ativos
          </div>
          {pacientes.map(p => {
            const initials = p.nome
              ? p.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
              : '?'
            const cor = STATUS_COR[p.status] || '#9A8E82'
            const active = path.includes(p.id)
            return (
              <Link
                key={p.id}
                href={`/analista/paciente/${p.id}`}
                className={`
                  flex items-center gap-2.5 px-5 py-2 transition-colors
                  ${active ? 'bg-white/7' : 'hover:bg-white/4'}
                `}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                  style={{ background: cor + '28', color: cor }}
                >
                  {initials}
                </div>
                <span className="text-xs text-stone-100/60 font-light truncate">
                  {p.nome || 'Sem nome'}
                </span>
                {p.status === 'aguardando' && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: cor }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </aside>
  )
}
