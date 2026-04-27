import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <span className="text-xl font-semibold tracking-widest text-yellow-400">AI LUXURY NETWORK</span>
        <div className="flex gap-6 text-sm">
          <Link href="/login" className="text-white/70 hover:text-white transition">Sign In</Link>
          <Link href="/signup" className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition">Join Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <p className="text-yellow-400 text-sm tracking-widest uppercase mb-4">Members Only</p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Your AI.<br />Your Network.<br />Your Edge.
        </h1>
        <p className="text-white/60 text-lg max-w-xl mb-10">
          AI Luxury Network is an exclusive community where your personal AI learns from every member —
          so the smarter the network gets, the smarter your AI gets.
        </p>
        <div className="flex flex-col items-center gap-2">
          <Link href="/signup" className="bg-yellow-400 text-black px-8 py-4 rounded text-lg font-bold hover:bg-yellow-300 transition">
            Get Access — $1 First Month
          </Link>
          <p className="text-white/30 text-sm">Limited time offer · Then $9/month</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { title: 'Your Personal AI', desc: 'Connect your own API key. Your AI is trained on your goals, your clients, your market.' },
          { title: 'Collective Intelligence', desc: 'Every post from every member feeds the network. Your AI gets smarter every day — automatically.' },
          { title: 'Private Community Feed', desc: 'Share insights, listings, and deals. Your AI curates what matters most to you.' },
        ].map((f) => (
          <div key={f.title} className="border border-white/10 rounded-xl p-6">
            <h3 className="text-yellow-400 font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-white/60 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-20 border-t border-white/10">
        <h2 className="text-3xl font-bold mb-4">Ready to join the network?</h2>
        <p className="text-white/60 mb-8">Spots are limited. First month is on us if you join this week.</p>
        <Link href="/signup" className="bg-yellow-400 text-black px-8 py-4 rounded text-lg font-bold hover:bg-yellow-300 transition">
          Start Your Membership
        </Link>
      </section>
    </main>
  )
}
