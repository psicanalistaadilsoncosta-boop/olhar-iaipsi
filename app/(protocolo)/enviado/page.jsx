export const metadata = {
  title: 'Obrigado — Olhar',
}

export default function EnviadoPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-16 text-center"
      style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 45%, #1E3A4A 100%)' }}
    >
      <div
        className="absolute -top-28 -right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#C4732A', opacity: 0.06 }}
      />
      <div
        className="absolute -bottom-12 -left-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: '#4A9E7A', opacity: 0.06 }}
      />

      <div
        className="w-20 h-20 rounded-full border flex items-center justify-center mb-8 text-4xl"
        style={{
          borderColor: 'rgba(74,158,122,0.35)',
          background: 'rgba(74,158,122,0.1)',
        }}
      >
        🌿
      </div>

      <h1
        className="text-3xl text-stone-100 leading-snug mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
      >
        Obrigado por se ouvir
      </h1>

      <p className="text-sm text-stone-100/50 font-light leading-relaxed max-w-xs mb-8">
        Suas reflexões foram recebidas. Seu analista vai ler com cuidado tudo que você compartilhou.
      </p>

      <div
        className="px-5 py-2 rounded-full border text-sm"
        style={{
          borderColor: 'rgba(196,115,42,0.3)',
          background: 'rgba(196,115,42,0.1)',
          color: 'rgba(196,115,42,0.9)',
        }}
      >
        Retorno em até 48h
      </div>

      <p className="text-[11px] text-stone-100/25 font-light mt-8 max-w-xs leading-relaxed">
        Você receberá uma mensagem quando houver algo novo para explorar.
        Não há nada mais a fazer por agora — descanse.
      </p>
    </main>
  )
}
