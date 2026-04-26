'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setApiKey(user.user_metadata?.ai_api_key || '')
    })
  }, [])

  async function saveKey(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.auth.updateUser({ data: { ai_api_key: apiKey } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-lg font-semibold tracking-widest text-yellow-400">AI LUXURY NETWORK</Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <form onSubmit={saveKey} className="flex flex-col gap-4 mb-10">
          <label className="text-white/60 text-sm">Your AI API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-... or anthropic key"
            className="bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 font-mono text-sm"
          />
          <p className="text-white/30 text-xs">Supports OpenAI, Anthropic, or any compatible API key. Stored securely.</p>
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 text-black py-3 rounded font-bold hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save API Key'}
          </button>
        </form>

        <button
          onClick={signOut}
          className="text-white/40 text-sm hover:text-white transition"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
