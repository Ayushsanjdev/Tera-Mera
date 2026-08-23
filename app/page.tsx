import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreateGroupForm from './CreateGroupForm'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', user.id)

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tera Mera</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500">Sign out</button>
        </form>
      </div>

      <div className="mb-6 rounded-lg bg-gray-100 p-3 text-sm">
        <p className="text-gray-500">Your user ID (share this to get added to a group):</p>
        <p className="break-all font-mono">{user.id}</p>
      </div>

      <CreateGroupForm userId={user.id} />

      <h2 className="mb-2 mt-6 font-medium">Your groups</h2>
      <div className="space-y-2">
        {memberships?.map((m) => (
          <Link
            key={m.groups.id}
            href={`/groups/${m.groups.id}`}
            className="block rounded-lg border p-3 hover:bg-gray-50"
          >
            {m.groups.name}
          </Link>
        ))}
        {!memberships?.length && (
          <p className="text-sm text-gray-400">No groups yet — create one above.</p>
        )}
      </div>
    </div>
  )
}