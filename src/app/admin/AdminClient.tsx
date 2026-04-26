'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string
  created_at: string
}

interface Subscription {
  user_id: string
  status: string
  stripe_customer_id: string
  stripe_subscription_id: string
  created_at: string
}

interface Post {
  id: string
  user_id: string
  content: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles: any
}

export default function AdminClient({
  profiles,
  subscriptions,
  posts,
}: {
  profiles: Profile[]
  subscriptions: Subscription[]
  posts: Post[]
}) {
  const [tab, setTab] = useState<'members' | 'feed'>('members')
  const [subMap, setSubMap] = useState<Record<string, Subscription>>(
    Object.fromEntries(subscriptions.map(s => [s.user_id, s]))
  )
  const supabase = createClient()

  async function toggleStatus(userId: string) {
    const current = subMap[userId]?.status
    const next = current === 'active' ? 'inactive' : 'active'
    await supabase.from('subscriptions').upsert({ user_id: userId, status: next })
    setSubMap(prev => ({ ...prev, [userId]: { ...prev[userId], user_id: userId, status: next } }))
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'today'
    if (d === 1) return 'yesterday'
    return `${d}d ago`
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-lg font-semibold tracking-widest text-yellow-400">AI LUXURY — ADMIN</span>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('members')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${tab === 'members' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-white'}`}
          >
            Members ({profiles.length})
          </button>
          <button
            onClick={() => setTab('feed')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${tab === 'feed' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-white'}`}
          >
            Feed ({posts.length})
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {tab === 'members' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Members</h2>
            <div className="flex flex-col gap-3">
              {profiles.length === 0 && <p className="text-white/30">No members yet.</p>}
              {profiles.map(p => {
                const sub = subMap[p.id]
                const active = sub?.status === 'active'
                return (
                  <div key={p.id} className="border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.full_name || 'Unnamed'}</p>
                      <p className="text-white/40 text-xs mt-0.5">Joined {timeAgo(p.created_at)}</p>
                      {sub?.stripe_customer_id && (
                        <p className="text-white/30 text-xs font-mono mt-0.5">{sub.stripe_customer_id}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                        {active ? 'Active' : sub ? 'Inactive' : 'No sub'}
                      </span>
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded transition"
                      >
                        {active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'feed' && (
          <div>
            <h2 className="text-xl font-bold mb-6">All Posts</h2>
            <div className="flex flex-col gap-3">
              {posts.length === 0 && <p className="text-white/30">No posts yet.</p>}
              {posts.map(post => {
                const name = Array.isArray(post.profiles)
                  ? post.profiles[0]?.full_name
                  : post.profiles?.full_name
                return (
                  <div key={post.id} className="border border-white/10 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 text-sm font-semibold">{name || 'Member'}</span>
                      <span className="text-white/30 text-xs">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-white/70 text-sm whitespace-pre-wrap">{post.content}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
