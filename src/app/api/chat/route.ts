import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = user.user_metadata?.ai_api_key
  if (!apiKey) return NextResponse.json({ error: 'No API key set. Add one in Settings.' }, { status: 400 })

  const { messages } = await req.json()

  // Fetch recent feed posts as context
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('content, user_id')
    .order('created_at', { ascending: false })
    .limit(20)

  const feedContext = (rawPosts || []).length > 0
    ? 'Recent community insights:\n' + (rawPosts || []).map(p => `- ${p.content}`).join('\n')
    : ''

  const systemPrompt = `You are a personal AI assistant for a member of AI Luxury Network — an exclusive community for luxury professionals.
${feedContext ? '\n' + feedContext : ''}
Be sharp, direct, and professional. You help with business strategy, client relationships, market insights, and anything the member needs.`

  try {
    // Detect provider from key prefix
    if (apiKey.startsWith('sk-ant-')) {
      // Anthropic
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      return NextResponse.json({ reply: data.content?.[0]?.text || 'No response.' })
    } else {
      // OpenAI compatible
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        }),
      })
      const data = await res.json()
      return NextResponse.json({ reply: data.choices?.[0]?.message?.content || 'No response.' })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'AI request failed.' }, { status: 500 })
  }
}
