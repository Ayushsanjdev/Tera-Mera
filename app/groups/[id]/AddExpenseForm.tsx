'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddExpenseForm({
  groupId,
  memberIds,
  currentUserId,
}: {
  groupId: string
  memberIds: string[]
  currentUserId: string
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async () => {
    const amt = parseFloat(amount)
    if (!description.trim() || !amt || amt <= 0) return
    setLoading(true)

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        description,
        amount: amt,
        paid_by: currentUserId,
      })
      .select()
      .single()

    if (error || !expense) {
      alert(error?.message)
      setLoading(false)
      return
    }

    const share = amt / memberIds.length
    const shareRows = memberIds.map((userId) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: share,
    }))

    await supabase.from('expense_shares').insert(shareRows)

    setDescription('')
    setAmount('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="What was it for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="w-full rounded border p-2 text-sm"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full rounded-lg bg-black py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add expense (split equally)'}
      </button>
    </div>
  )
}