export default function AguardandoPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-16 text-center"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.07 }}
      />
      <div className="text-4xl mb-6">🌙</div>
      <h1
        className="text-2xl text-stone-100 mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
      >
        Suas reflexões foram recebidas
      </h1>
      <p className="text-sm text-stone-100/50 font-light leading-relaxed max-w-xs">
        Seu analista está lendo com cuidado tudo que você compartilhou.<br /><br />
        Em breve você receberá uma devolutiva. Não há nada mais a fazer por agora — descanse.
      </p>
      <div
        className="mt-8 px-5 py-2 rounded-full border text-sm"
        style={{ borderColor: 'rgba(196,115,42,0.3)', background: 'rgba(196,115,42,0.1)', color: 'rgba(196,115,42,0.9)' }}
      >
        Retorno em até 48h
      </div>
    </main>
  )
}