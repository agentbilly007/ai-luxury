'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#C9A84C] mb-8 text-center">Sign In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none"
            placeholder="Email"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:border-[#C9A84C] outline-none"
            placeholder="Password"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#C9A84C] text-black font-bold py-4 rounded hover:bg-[#b8943d] transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          Not a member? <Link href="/signup" className="text-[#C9A84C]">Join now</Link>
        </p>
      </div>
    </main>
  )
}
