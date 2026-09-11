import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — Olhar' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/analista-login')

  // Pacientes aguardando devolutiva
  const { data: pendentes } = await supabase
    .from('olhar_respondentes')
    .select('id, nome, email, ciclo_atual, created_at, status')
    .eq('analista_id', user.id)
    .eq('status', 'aguardando')
    .order('created_at', { ascending: true })

  // Todos os ativos
  const { data: ativos } = await supabase
    .from('olhar_respondentes')
    .select('id, nome, status, ciclo_atual, proxima_sessao')
    .eq('analista_id', user.id)
    .neq('status', 'encerrado')
    .order('created_at', { ascending: false })

  const STATUS_LABEL = {
    questionario: 'Respondendo',
    aguardando:   'Aguarda devolutiva',
    devolutiva:   'Devolutiva enviada',
    ativo:        'Ativo',
  }
  const STATUS_COR = {
    questionario: 'bg-amber-50 text-amber-700 border-amber-200',
    aguardando:   'bg-orange-50 text-orange-700 border-orange-200',
    devolutiva:   'bg-blue-50 text-blue-700 border-blue-200',
    ativo:        'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* header */}
           <div className="flex items-center justify-between mb-6">
        <div>
        <h1
          className="text-2xl text-stone-800 mb-1"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Bom dia
        </h1>
        <p className="text-sm text-stone-400 font-light">
                    {pendentes?.length
            ? `${pendentes.length} devolutiva${pendentes.length > 1 ? 's' : ''} aguardando sua revisão`
            : 'Nenhuma devolutiva pendente'}
        </p>
        </div>
        <Link
          href="/analista/paciente/novo"
          className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{ background: '#C4732A' }}
        >
          + Novo paciente
        </Link>
      </div>

      {/* fila de pendentes */}
      {pendentes?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3">
            Aguardando devolutiva
          </h2>
          <div className="flex flex-col gap-2">
            {pendentes.map(p => (
              <Link
                key={p.id}
                href={`/analista/paciente/${p.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-stone-200 px-5 py-4 hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ background: 'rgba(196,115,42,0.12)', color: '#C4732A' }}
                  >
                    {p.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-stone-800">{p.nome || 'Sem nome'}</div>
                    <div className="text-xs text-stone-400 font-light">Ciclo {p.ciclo_atual}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
                    Aguarda devolutiva
                  </span>
                  <span className="text-stone-300 group-hover:text-amber-600 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* todos os pacientes */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3">
          Todos os pacientes
        </h2>
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {ativos?.length === 0 && (
            <p className="text-sm text-stone-400 font-light px-5 py-8 text-center">
              Nenhum paciente ainda.
            </p>
          )}
          {ativos?.map((p, i) => (
            <Link
              key={p.id}
              href={`/analista/paciente/${p.id}`}
              className={`
                flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors
                ${i < ativos.length - 1 ? 'border-b border-stone-100' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  style={{ background: 'rgba(45,106,79,0.1)', color: '#2D6A4F' }}
                >
                  {p.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-sm text-stone-700">{p.nome || 'Sem nome'}</div>
                  <div className="text-xs text-stone-400 font-light">Ciclo {p.ciclo_atual}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.proxima_sessao && (
                  <span className="text-[11px] text-stone-400">
                    Sessão {new Date(p.proxima_sessao).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <span className={`text-[10px] px-2.5 py-1 rounded-full border ${STATUS_COR[p.status] || ''}`}>
                  {STATUS_LABEL[p.status] || p.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
