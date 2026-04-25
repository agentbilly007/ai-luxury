import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { messages, apiKey, feedContext, userName } = await req.json()

  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 400 })

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are ${userName}'s personal AI assistant inside the AI Luxury members community.

Your job:
1. Help ${userName} create posts for the community feed
2. Answer questions and provide insights
3. Learn from what others in the community have shared

When the user wants to post something, you MUST:
- Write a polished, engaging post in their voice
- Set shouldPost: true and include the post in postContent
- Keep posts concise and valuable

Recent community feed (what others have shared):
${feedContext || 'No posts yet — be the first!'}

IMPORTANT: Always respond in JSON format:
{
  "reply": "your conversational response to the user",
  "shouldPost": true/false,
  "postContent": "the formatted post for the feed (only if shouldPost is true)"
}`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ reply: raw, shouldPost: false, postContent: null })
  }
}
