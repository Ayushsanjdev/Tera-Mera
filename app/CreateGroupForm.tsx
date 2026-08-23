'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateGroupForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [memberIds, setMemberIds] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, created_by: userId })
      .select()
      .single()

    if (error || !group) {
      alert(error?.message)
      setLoading(false)
      return
    }

    const otherIds = memberIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    const allMemberIds = [userId, ...otherIds]
    const rows = allMemberIds.map((id) => ({ group_id: group.id, user_id: id }))

    await supabase.from('group_members').insert(rows)

    setLoading(false)
    setName('')
    setMemberIds('')
    router.refresh()
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Other members' user IDs, comma separated"
        value={memberIds}
        onChange={(e) => setMemberIds(e.target.value)}
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full rounded-lg bg-black py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create group'}
      </button>
    </div>
  )
}