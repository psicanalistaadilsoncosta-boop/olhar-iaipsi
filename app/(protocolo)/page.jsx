
import Link from 'next/link'

export const metadata = {
  title: 'Olhar — Autodesenvolvimento psicanalítico',
  description: 'Um espaço de autodesenvolvimento guiado por psicanalista. Reflexões, devolutivas e acompanhamento assíncrono.',
}

export default function PaginaInicial() {
  return (
    <main className="min-h-screen bg-stone-50">

      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 50%, #1E3A4A 100%)' }}
      >
        <div className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: '#C4732A', opacity: 0.07 }} />
        <div className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: '#4A9E7A', opacity: 0.06 }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* logo */}
          <div
            className="w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-8"
            style={{ borderColor: 'rgba(196,115,42,0.4)', background: 'rgba(196,115,42,0.1)' }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#C4732A" strokeWidth="1.5" />
              <path d="M10 16 Q16 8 22 16 Q16 24 10 16Z" fill="none" stroke="#C4732A" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="2.5" fill="#C4732A" opacity="0.7" />
            </svg>
          </div>

          <h1
            className="text-5xl text-stone-100 leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Um espaço só seu<br />para olhar para dentro
          </h1>

          <p className="text-lg text-stone-100/55 font-light leading-relaxed mb-10 max-w-md mx-auto">
            Autodesenvolvimento psicanalítico guiado. No seu tempo, com um profissional presente.
          </p>

         <div className="flex gap-4 justify-center flex-wrap mb-20">
            
              <a href="https://wa.me/5511945098763?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Olhar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-stone-100 font-medium text-base transition-all hover:-translate-y-1"
              style={{ background: '#C4732A' }}
            >
              Quero saber mais →
            </a>
            <Link
              href="/entrar"
              className="px-8 py-4 rounded-full font-medium text-base transition-all hover:-translate-y-1 border"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(248,243,236,0.7)' }}
            >
              Já tenho um link
            </Link>
          </div>
        </div>

            {/* scroll hint → FAQ */}
        
          <a href="#faq"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
          <span className="text-xs text-stone-100 font-light tracking-widest uppercase">F.A.Q</span>
          <div className="w-px h-10 bg-stone-100/50 animate-pulse" /></a>
        
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 px-8 max-w-4xl mx-auto">
        <h2
          className="text-3xl text-stone-800 text-center mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Como funciona
        </h2>
        <p className="text-stone-400 text-center font-light mb-16 max-w-md mx-auto">
          Um processo assíncrono, no seu ritmo, com acompanhamento real de um psicanalista.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              titulo: 'Você responde',
              texto: 'Um questionário de 30 situações de reflexão — dissertativo, no seu tempo. Não é um teste. Não há respostas certas.',
            },
            {
              num: '02',
              titulo: 'Seu analista observa',
              texto: 'O analista lê com cuidado e prepara uma devolutiva personalizada — uma observação e reflexões para a semana.',
            },
            {
              num: '03',
              titulo: 'O ciclo se aprofunda',
              texto: 'Você responde, o processo evolui. A cada 3 interações, uma sessão online ao vivo para aprofundar.',
            },
          ].map(item => (
            <div key={item.num} className="text-center">
              <div
                className="text-4xl mb-4 mx-auto w-fit"
                style={{ fontFamily: "'Playfair Display', serif", color: '#C4732A', fontWeight: 600 }}
              >
                {item.num}
              </div>
              <h3
                className="text-lg text-stone-800 mb-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                {item.titulo}
              </h3>
              <p className="text-sm text-stone-500 font-light leading-relaxed">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-24 px-8" style={{ background: '#1A2E25' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl text-stone-100 mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Para quem é o Olhar
          </h2>
          <p className="text-stone-100/50 font-light mb-12 max-w-md mx-auto">
            Para adultos que querem se entender melhor — sem a pressão de um consultório tradicional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              'Quem sente que repete os mesmos padrões sem entender por quê',
              'Quem quer se conhecer melhor mas não está em crise',
              'Quem tem pouco tempo mas quer um processo sério',
              'Quem mora longe ou prefere o formato assíncrono',
              'Quem quer um espaço de reflexão com suporte profissional',
              'Quem já fez terapia e quer continuar um processo de autoconhecimento',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span style={{ color: '#C4732A' }} className="flex-shrink-0 mt-0.5">—</span>
                <p className="text-sm text-stone-100/65 font-light leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NÃO É TERAPIA */}
      <section className="py-16 px-8 max-w-2xl mx-auto text-center">
        <div
          className="rounded-2xl px-8 py-10 border"
          style={{ background: '#FEF3E8', borderColor: 'rgba(196,115,42,0.2)' }}
        >
          <h3
            className="text-xl text-stone-800 mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Importante saber
          </h3>
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            O Olhar é um serviço de <strong className="font-medium">autodesenvolvimento psicanalítico</strong> — não é psicoterapia, não realiza diagnósticos e não substitui acompanhamento clínico. Em situações de crise, procure atendimento presencial ou ligue para o CVV (188).
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-24 px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #1A2E25 0%, #2D4A35 100%)' }}
      >
        <h2
          className="text-3xl text-stone-100 mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Pronto para olhar para dentro?
        </h2>
        <p className="text-stone-100/50 font-light mb-8 max-w-sm mx-auto">
          Fale pelo WhatsApp para conhecer melhor e dar o primeiro passo.
        </p>
        
          <a href="https://wa.me/5511945098763?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Olhar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-stone-100 font-medium text-base transition-all hover:-translate-y-1"
          style={{ background: '#25D366' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar pelo WhatsApp
        </a>
      </section>

            {/* FAQ */}
      <section id="faq" className="py-24 px-8 max-w-3xl mx-auto">
        <h2
          className="text-3xl text-stone-800 text-center mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Perguntas frequentes
        </h2>
        <p className="text-stone-400 text-center font-light mb-12">
          Dúvidas sobre o Olhar? Aqui estão as mais comuns.
        </p>

        <div className="flex flex-col gap-4">
          {[
            {
              p: 'O que é o Olhar?',
              r: 'O Olhar é um serviço de autodesenvolvimento psicanalítico assíncrono. Você responde a um questionário de reflexão, seu analista lê com cuidado e prepara uma devolutiva personalizada — observações e ações para a semana. O processo acontece no seu tempo, pelo celular ou computador.',
            },
            {
              p: 'É o mesmo que terapia?',
              r: 'Não. O Olhar é um espaço de autodesenvolvimento — não realiza diagnósticos, não prescreve tratamentos e não substitui psicoterapia ou acompanhamento psiquiátrico. É indicado para adultos que querem se conhecer melhor, não para pessoas em crise aguda ou com diagnóstico de transtorno mental grave.',
            },
            {
              p: 'Como funciona o processo?',
              r: 'Você começa respondendo 30 situações de reflexão organizadas em 6 temas. Seu analista lê tudo, prepara uma devolutiva e a envia. Você tem 7 dias para responder e registrar o que vivenciou. O analista então prepara o próximo ciclo. A cada 3 ciclos, há uma sessão online ao vivo de aproximadamente 50 minutos para aprofundar o processo.',
            },
                        {
              p: 'Quanto tempo leva cada ciclo?',
              r: 'Em média 9 a 10 dias por ciclo. Você tem 7 dias para responder e registrar o que vivenciou com as ações propostas — no seu tempo, sem pressão. Após receber sua resposta, seu analista tem até 48 horas para preparar e enviar o próximo ciclo.',
            },
            {
              p: 'Como é a sessão online?',
              r: 'A sessão online acontece a cada 3 ciclos completos, por videochamada, com duração aproximada de 50 minutos. É um momento para aprofundar o que surgiu nos ciclos, ajustar o processo e manter o vínculo com seu analista.',
            },
            {
              p: 'E se eu precisar de suporte urgente?',
              r: 'O Olhar não oferece suporte em tempo real. Em situações de crise emocional, procure atendimento presencial ou ligue para o CVV (188), disponível 24 horas. Se perceber que precisa de acompanhamento mais intensivo, seu analista pode orientar sobre os próximos passos.',
            },
            {
              p: 'Como entro em contato?',
              r: 'Pelo WhatsApp — clique no botão abaixo. Respondemos em até 24 horas.',
            },
          ].map((item, i) => (
            <details
              key={i}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden group"
            >
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-stone-50 transition-colors">
                <span
                  className="text-sm font-medium text-stone-800"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.p}
                </span>
                <span className="text-stone-300 text-lg ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-sm text-stone-500 font-light leading-relaxed">{item.r}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-12">
          
            <a href="https://wa.me/5511945098763?text=Olá,%20tenho%20uma%20dúvida%20sobre%20o%20Olhar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-sm transition-all hover:-translate-y-0.5"
            style={{ background: '#25D366' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar pelo WhatsApp
          </a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="py-8 px-8 border-t border-stone-200 bg-stone-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div
            className="text-sm text-stone-400"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Olhar — iaipsi.com
          </div>
          <div className="flex gap-6 text-xs text-stone-400 font-light">
            <Link href="/termos" className="hover:text-stone-600 transition-colors">
              Termos de uso e privacidade
            </Link>
            <Link href="/entrar" className="hover:text-stone-600 transition-colors">
              Acessar minha conta
            </Link>
            <Link href="" className="hover:text-stone-600 transition-colors">
              Área do analista
            </Link>
          </div>
        </div>
      </footer>

    </main>
  )
}