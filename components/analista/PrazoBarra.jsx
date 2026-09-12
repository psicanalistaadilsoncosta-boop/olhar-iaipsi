'use client'

export default function PrazoBarra({ devolutiva, respondente }) {
  if (!devolutiva) return null

  const agora = new Date()
  const prazoPacienteDias = respondente?.prazo_paciente_dias || 7
  const prazoAnalistaHoras = respondente?.prazo_analista_horas || 48

  let modo = null
  let inicio = null
  let prazoMs = null
  let label = ''
  let sublabel = ''

  // Analista precisa responder
  if (devolutiva.status === 'respondida' && devolutiva.resposta_paciente_at) {
    modo = 'analista'
    inicio = new Date(devolutiva.resposta_paciente_at)
    prazoMs = prazoAnalistaHoras * 60 * 60 * 1000
    const deadline = new Date(inicio.getTime() + prazoMs)
    const restante = deadline - agora
    const horasRestantes = Math.max(0, Math.floor(restante / (1000 * 60 * 60)))
    const diasRestantes = Math.floor(horasRestantes / 24)
    const vencido = restante <= 0

    label = vencido
      ? `⚠ Prazo vencido — paciente respondeu há ${Math.floor((agora - inicio) / (1000 * 60 * 60 * 24))} dias`
      : `Paciente respondeu · você tem ${horasRestantes < 24 ? `${horasRestantes}h` : `${diasRestantes}d ${horasRestantes % 24}h`} para enviar o próximo ciclo`
    sublabel = `Prazo: ${new Date(inicio.getTime() + prazoMs).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às ${new Date(inicio.getTime() + prazoMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  // Paciente precisa responder
  if (devolutiva.status === 'enviada' && devolutiva.enviada_at) {
    modo = 'paciente'
    inicio = new Date(devolutiva.enviada_at)
    prazoMs = prazoPacienteDias * 24 * 60 * 60 * 1000
    const deadline = new Date(inicio.getTime() + prazoMs)
    const restante = deadline - agora
    const diasRestantes = Math.max(0, Math.floor(restante / (1000 * 60 * 60 * 24)))
    const vencido = restante <= 0

    label = vencido
      ? `⚠ Prazo vencido — devolutiva enviada há ${Math.floor((agora - inicio) / (1000 * 60 * 60 * 24))} dias`
      : `Devolutiva enviada · paciente tem ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} para responder`
    sublabel = `Prazo: ${deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
  }

  if (!modo) return null

  // Calcula porcentagem
  const decorrido = agora - inicio
  const pct = Math.min(100, Math.round((decorrido / prazoMs) * 100))
  const vencido = pct >= 100

  const corBarra = vencido ? '#B04A4A' : pct > 75 ? '#C4732A' : '#2D6A4F'
  const corFundo = vencido ? '#FEF2F2' : pct > 75 ? '#FEF3E8' : '#EAF4EE'
  const corBorda = vencido ? '#FCA5A5' : pct > 75 ? '#F9C784' : '#B8D9C5'
  const corTexto = vencido ? '#B04A4A' : pct > 75 ? '#8A4A1A' : '#2D4A35'

  return (
    <div
      className="rounded-xl px-4 py-3 mb-4 border"
      style={{ background: corFundo, borderColor: corBorda }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: corTexto }}>
          {label}
        </span>
        <span className="text-[10px] font-light" style={{ color: corTexto, opacity: 0.7 }}>
          {sublabel}
        </span>
      </div>

      {/* barra de progresso */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: corBorda }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: corBarra }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-light" style={{ color: corTexto, opacity: 0.6 }}>
          {modo === 'analista' ? 'Sua vez' : 'Vez do paciente'}
        </span>
        <span className="text-[10px] font-medium" style={{ color: corTexto }}>
          {pct}% do prazo
        </span>
      </div>
    </div>
  )
}