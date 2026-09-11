'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TermosPage() {
  const router = useRouter()
  const bottomRef = useRef(null)
  const [chegouFinal, setChegouFinal] = useState(false)
  const [concordou, setConcordou] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setChegouFinal(true) },
      { threshold: 0.5 }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [])

  function handleConcordar() {
    sessionStorage.setItem('olhar_termos_aceitos', 'true')
    router.back()
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div
          className="text-2xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#1A2E25', fontWeight: 400 }}
        >
          Termos de Uso e Política de Privacidade
        </div>
        <p className="text-xs text-stone-400 font-light mb-8">olhar.iaipsi.com</p>

        <div className="prose prose-stone max-w-none text-sm font-light leading-relaxed text-stone-700 space-y-6">

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">1. O que é o Olhar</h2>
            <p>O Olhar é um serviço de autodesenvolvimento psicanalítico assistido por profissional habilitado. Não se trata de psicoterapia, tratamento psicológico ou psiquiátrico, nem substitui acompanhamento clínico presencial.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">2. A quem se destina</h2>
            <p>Este serviço é indicado para adultos em processo de autoconhecimento. Pessoas em crise aguda, com diagnóstico de transtorno mental grave ou em risco imediato não devem utilizar este serviço sem acompanhamento clínico adequado.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">3. Como funciona</h2>
            <p>O processo se inicia com um questionário de reflexão composto por 30 situações organizadas em 6 temas. Suas respostas são lidas pelo analista responsável, que prepara uma devolutiva personalizada — um texto de observação acompanhado de reflexões e ações para a semana.</p>
            <p className="mt-3">O ciclo de acompanhamento funciona da seguinte forma:</p>
            <ul className="mt-2 space-y-1 list-none pl-0">
              {[
                'Após receber sua devolutiva, você terá 7 dias para responder e registrar o que vivenciou com as ações propostas.',
                'O analista terá até 48 horas após receber sua resposta para preparar e enviar o próximo ciclo.',
                'A cada 3 ciclos, haverá uma sessão online ao vivo com o analista para aprofundamento e ajuste do processo.',
                'O processo é assíncrono — não há atendimento em tempo real exceto nas sessões agendadas.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: '#C4732A' }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">4. Interações</h2>
            <p>O plano contratado define a frequência das interações. No plano base, há 1 interação por semana. O analista enviará no máximo o número de ações compatível com o seu plano e o tempo disponível entre os ciclos.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">5. Seus dados</h2>
            <p>Suas respostas são confidenciais e acessadas exclusivamente pelo analista responsável pelo seu acompanhamento. Não compartilhamos seus dados com terceiros. Os dados são armazenados de forma segura e podem ser excluídos mediante solicitação.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">6. Responsabilidades</h2>
            <p>O analista se compromete a responder em até 48 horas após receber sua devolutiva. Você se compromete a utilizar o serviço com honestidade e a comunicar ao analista caso perceba necessidade de suporte adicional ou crise emocional que exija atenção clínica especializada.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">7. Limitações do serviço</h2>
            <p>O Olhar não realiza diagnósticos, não prescreve tratamentos e não substitui psicoterapia ou acompanhamento psiquiátrico. Em situações de crise, o usuário deve buscar atendimento presencial ou ligar para o CVV (188).</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">8. Encerramento</h2>
            <p>O serviço pode ser encerrado a qualquer momento por qualquer das partes. Em caso de encerramento, seus dados permanecerão armazenados pelo prazo legal e poderão ser excluídos mediante solicitação formal.</p>
          </section>

          <section>
            <h2 className="text-base font-medium text-stone-800 mb-2">9. Contato</h2>
            <p>Dúvidas ou solicitações: <a href="mailto:suporte@sistema4d.com.br" className="underline" style={{ color: '#C4732A' }}>suporte@sistema4d.com.br</a></p>
          </section>

        </div>

        {/* âncora do final */}
        <div ref={bottomRef} className="h-1 mt-8" />

        {/* botão concordar — só aparece quando chegou ao final */}
        <div className={`mt-8 transition-opacity duration-500 ${chegouFinal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="border border-stone-200 rounded-2xl p-6 bg-white">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={concordou}
                onChange={e => setConcordou(e.target.checked)}
                className="mt-0.5 accent-amber-600 w-4 h-4 flex-shrink-0"
              />
              <span className="text-sm text-stone-600 font-light leading-relaxed">
                Li e compreendi os Termos de Uso e a Política de Privacidade do Olhar. Estou ciente de que este serviço não substitui psicoterapia ou acompanhamento psiquiátrico.
              </span>
            </label>
            <button
              onClick={handleConcordar}
              disabled={!concordou}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-30 disabled:cursor-default"
              style={{ background: '#1A2E25' }}
            >
              Concordo e voltar
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}