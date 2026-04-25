'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  content: string
  image_url?: string
  created_at: string
  profiles: { name: string }
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase.from('profiles').select('*').eq('id', data.user.id).single()
        .then(({ data: p }) => setProfile(p))
    })
    loadFeed()
  }, [])

  async function loadFeed() {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setPosts(data)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    const userMsg = message
    setMessage('')

    const newHistory = [...chatHistory, { role: 'user', content: userMsg }]
    setChatHistory(newHistory)

    // Get recent feed posts as context
    const feedContext = posts.slice(0, 10).map(p => `${p.profiles?.name}: ${p.content}`).join('\n')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newHistory,
        apiKey: profile?.anthropic_api_key,
        feedContext,
        userName: profile?.name,
      }),
    })
    const { reply, shouldPost, postContent } = await res.json()
    setAiResponse(reply)
    setChatHistory([...newHistory, { role: 'assistant', content: reply }])

    // If AI decided to post, publish to feed
    if (shouldPost && postContent) {
      let imageUrl = null
      if (image) {
        const fileName = `${user.id}/${Date.now()}`
        await supabase.storage.from('post-images').upload(fileName, image)
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
        setImage(null)
      }
      await supabase.from('posts').insert({
        user_id: user.id,
        content: postContent,
        image_url: imageUrl,
      })
      loadFeed()
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-[#C9A84C] font-bold tracking-widest">AI LUXURY</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{profile?.name}</span>
          <button onClick={signOut} className="text-gray-600 text-sm hover:text-white">Sign out</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Feed — left side */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-gray-800">
          <h2 className="text-[#C9A84C] text-sm tracking-widest mb-6">COMMUNITY FEED</h2>
          <div className="space-y-6 max-w-lg">
            {posts.map(post => (
              <div key={post.id} className="border border-gray-800 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-sm font-bold">
                    {post.profiles?.name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium">{post.profiles?.name}</span>
                  <span className="text-xs text-gray-600 ml-auto">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-full rounded mb-3 max-h-64 object-cover" />
                )}
                <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-gray-600 text-sm">No posts yet. Be the first — tell your AI what to post.</p>
            )}
          </div>
        </div>

        {/* AI Chat — right side */}
        <div className="w-96 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-[#C9A84C] text-sm tracking-widest">YOUR AI</h2>
            <p className="text-gray-600 text-xs mt-1">Tell it to post, ask it anything, send a photo</p>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <p className="text-gray-600 text-sm">Say: "Post about what I accomplished today" or send a photo to post it.</p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded px-3 py-2 text-sm ${
                  msg.role === 'user' ? 'bg-[#C9A84C] text-black' : 'bg-gray-800 text-gray-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded px-3 py-2 text-gray-400 text-sm">Thinking...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
            {image && (
              <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                <span>📎 {image.name}</span>
                <button type="button" onClick={() => setImage(null)} className="text-red-400">×</button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="cursor-pointer text-gray-500 hover:text-[#C9A84C] flex items-center">
                <input type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] || null)} />
                📷
              </label>
              <input
                type="text" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Tell your AI what to post..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-[#C9A84C] outline-none"
              />
              <button type="submit" disabled={loading}
                className="bg-[#C9A84C] text-black px-4 py-2 rounded text-sm font-bold disabled:opacity-50">
                →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
