import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from './FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch profiles separately and merge
  const userIds = [...new Set((posts || []).map(p => p.user_id))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]))
  const postsWithNames = (posts || []).map(p => ({ ...p, author_name: profileMap[p.user_id] || 'Member' }))

  return <FeedClient initialPosts={postsWithNames} userId={user.id} />
}
