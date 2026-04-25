'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create auth account
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // 2. Save profile with API key
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        anthropic_api_key: apiKey,
        email,
      })
    }

    // 3. Redirect to Stripe checkout
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId: data.user?.id }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#C9A84C] mb-2 text-center">Join AI Luxury</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">$97/month — cancel anytime</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none"
              placeholder="William Crawford"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Anthropic API Key</label>
            <input
              type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} required
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none font-mono text-sm"
              placeholder="sk-ant-..."
            />
            <p className="text-xs text-gray-600 mt-1">Get this from platform.anthropic.com → API Keys</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#C9A84C] text-black font-bold py-4 rounded hover:bg-[#b8943d] transition disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Continue to Payment →'}
          </button>
        </form>
      </div>
    </main>
  )
}
