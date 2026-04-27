import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

const ADMIN_EMAIL = 'agentbilly007@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: rawPosts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]))
  const posts = (rawPosts || []).map(p => ({ ...p, author_name: profileMap[p.user_id] || 'Member' }))

  return (
    <AdminClient
      profiles={profiles || []}
      subscriptions={subscriptions || []}
      posts={posts}
    />
  )
}
