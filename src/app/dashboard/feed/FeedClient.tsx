'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: { full_name: string } | null
}

export default function FeedClient({ initialPosts, userId }: { initialPosts: Post[], userId: string }) {
  const [posts, setPosts] = useState(initialPosts)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const supabase = createClient()

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || posting) return
    setPosting(true)
    setPostError('')

    const { data, error } = await supabase
      .from('posts')
      .insert({ content: text, user_id: userId })
      .select('*, profiles(full_name)')
      .single()

    if (error) {
      setPostError(error.message)
    } else if (data) {
      setPosts([data, ...posts])
      setText('')
    }
    setPosting(false)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-lg font-semibold tracking-widest text-yellow-400">AI LUXURY NETWORK</Link>
        <Link href="/dashboard/chat" className="text-white/70 text-sm hover:text-white">My AI</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={submitPost} className="mb-8">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share an insight with the network..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            {postError && <p className="text-red-400 text-xs">{postError}</p>}
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="ml-auto bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition disabled:opacity-40 text-sm"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          {posts.length === 0 && (
            <p className="text-white/30 text-center py-12">No posts yet. Be the first to share.</p>
          )}
          {posts.map(post => (
            <div key={post.id} className="border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-400 text-sm font-semibold">
                  {post.profiles?.full_name || 'Member'}
                </span>
                <span className="text-white/30 text-xs">{timeAgo(post.created_at)}</span>
              </div>
              <p className="text-white/80 text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
