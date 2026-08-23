import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddExpenseForm from './AddExpenseForm'
import { calculateBalances } from '@/lib/balances'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase.from('groups').select('*').eq('id', id).single()

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', id)

  const memberIds = members?.map((m) => m.user_id) ?? []

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, expense_shares(*)')
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  const balances = calculateBalances(expenses ?? [])

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">{group?.name}</h1>

      <div className="mb-6 rounded-lg border p-3">
        <h2 className="mb-2 text-sm font-medium text-gray-500">Balances</h2>
        {Object.entries(balances).map(([userId, amount]) => (
          <div key={userId} className="flex justify-between text-sm">
            <span className="font-mono text-xs">
              {userId === user.id ? 'You' : userId.slice(0, 8)}
            </span>
            <span className={amount >= 0 ? 'text-green-600' : 'text-red-600'}>
              {amount >= 0 ? '+' : ''}
              {amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <AddExpenseForm groupId={id} memberIds={memberIds} currentUserId={user.id} />

      <h2 className="mb-2 mt-6 text-sm font-medium text-gray-500">Activity</h2>
      <div className="space-y-2">
        {expenses?.map((e) => (
          <div key={e.id} className="rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span>{e.description}</span>
              <span className="font-medium">₹{e.amount}</span>
            </div>
            <p className="text-xs text-gray-400">
              paid by {e.paid_by === user.id ? 'you' : e.paid_by.slice(0, 8)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}