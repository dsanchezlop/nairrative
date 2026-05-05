import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import GenerationEditor from './GenerationEditor'

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: generation } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!generation) notFound()

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <GenerationEditor generation={generation} />
      </main>
    </div>
  )
}
