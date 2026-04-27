import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Secret key for external/AI posting — set FEED_POST_SECRET in Vercel env vars
const FEED_POST_SECRET = process.env.FEED_POST_SECRET
const ADMIN_USER_ID = process.env.ADMIN_USER_ID // agentbilly007's Supabase user ID

export async function POST(req: Request) {
  const { secret, content, author } = await req.json()

  if (!FEED_POST_SECRET || secret !== FEED_POST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  // Use service role key to bypass RLS for system posts
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = ADMIN_USER_ID || 'system'

  const { data, error } = await supabase
    .from('posts')
    .insert({ content: `[${author || 'AI'}] ${content}`, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, post: data })
}
