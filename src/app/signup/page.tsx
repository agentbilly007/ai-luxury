'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, ai_api_key: apiKey } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create Stripe checkout session
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
      else router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Join AI Luxury Network</h1>
        <p className="text-white/50 text-sm text-center mb-8">$1 first month · Then $9/month — cancel anytime</p>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
          />
          <div>
            <input
              type="text"
              placeholder="Your AI API key (OpenAI, Anthropic, etc.)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400"
            />
            <p className="text-white/30 text-xs mt-1">You can add this later in settings</p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-black py-3 rounded font-bold hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Continue to Payment'}
          </button>
        </form>
        <p className="text-white/40 text-sm text-center mt-6">
          Already a member?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
