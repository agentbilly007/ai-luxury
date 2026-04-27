import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ensure profile row exists for users created before schema was applied
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
  })

  const name = user.user_metadata?.full_name || user.email

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-lg font-semibold tracking-widest text-yellow-400">AI LUXURY NETWORK</span>
        <div className="flex gap-6 text-sm">
          <Link href="/dashboard/feed" className="text-white/70 hover:text-white">Feed</Link>
          <Link href="/dashboard/chat" className="text-white/70 hover:text-white">My AI</Link>
          <Link href="/dashboard/settings" className="text-white/70 hover:text-white">Settings</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-yellow-400 text-sm tracking-widest uppercase mb-2">Welcome back</p>
        <h1 className="text-4xl font-bold mb-4">{name}</h1>
        <p className="text-white/50 mb-12">Your AI is ready. The network is listening.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/chat" className="border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition text-left">
            <h2 className="text-yellow-400 font-semibold text-lg mb-2">Talk to Your AI</h2>
            <p className="text-white/50 text-sm">Ask questions, get insights, draft messages — your AI knows the network.</p>
          </Link>
          <Link href="/dashboard/feed" className="border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition text-left">
            <h2 className="text-yellow-400 font-semibold text-lg mb-2">Community Feed</h2>
            <p className="text-white/50 text-sm">See what the network is sharing. Every post sharpens your AI.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
