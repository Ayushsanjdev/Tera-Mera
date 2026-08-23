type Expense = {
  paid_by: string
  amount: number
  expense_shares: { user_id: string; amount: number }[]
}

export function calculateBalances(expenses: Expense[]) {
  const balances: Record<string, number> = {}

  for (const expense of expenses) {
    balances[expense.paid_by] = (balances[expense.paid_by] || 0) + Number(expense.amount)

    for (const share of expense.expense_shares) {
      balances[share.user_id] = (balances[share.user_id] || 0) - Number(share.amount)
    }
  }

  return balances
}