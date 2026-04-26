'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages([...updated, { role: 'assistant', content: data.reply }])
      } else if (data.error) {
        setMessages([...updated, { role: 'assistant', content: `Error: ${data.error}` }])
      }
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-lg font-semibold tracking-widest text-yellow-400">AI LUXURY NETWORK</Link>
        <Link href="/dashboard/feed" className="text-white/70 text-sm hover:text-white">Feed</Link>
      </nav>

      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-white/30 mt-20">
            <p className="text-2xl mb-2">Your AI is ready.</p>
            <p className="text-sm">Ask anything. It knows your network.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-xl text-sm ${
              m.role === 'user'
                ? 'bg-yellow-400 text-black'
                : 'bg-white/10 text-white'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-3 rounded-xl text-white/50 text-sm">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="border-t border-white/10 px-4 py-4 flex gap-3 max-w-2xl w-full mx-auto">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message your AI..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </main>
  )
}
