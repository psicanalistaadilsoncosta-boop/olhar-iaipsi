import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/analista/Sidebar'

export default async function AnalistaLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/analista-login')

  const { data: pacientes } = await supabase
    .from('olhar_respondentes')
    .select('id, nome, status')
    .eq('analista_id', user.id)
    .neq('status', 'encerrado')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      <Sidebar pacientes={pacientes || []} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}