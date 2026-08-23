type Expense = {
  paid_by: string;
  amount: number;
  expense_shares: { user_id: string; amount: number }[];
};

type Settlement = {
  from_user_id: string;
  to_user_id: string;
  amount: number;
};

export function calculateBalances(
  expenses: Expense[],
  settlements: Settlement[] = [],
) {
  const balances: Record<string, number> = {};

  for (const expense of expenses) {
    balances[expense.paid_by] =
      (balances[expense.paid_by] || 0) + Number(expense.amount);
    for (const share of expense.expense_shares) {
      balances[share.user_id] =
        (balances[share.user_id] || 0) - Number(share.amount);
    }
  }

  // a settlement means from_user paid to_user, so from_user's balance goes up (less owed), to_user's goes down (less owed to them)
  for (const s of settlements) {
    balances[s.from_user_id] =
      (balances[s.from_user_id] || 0) + Number(s.amount);
    balances[s.to_user_id] = (balances[s.to_user_id] || 0) - Number(s.amount);
  }

  return balances;
}

// Greedy debt simplification: turns net balances into a minimal list of "who pays whom"
export function simplifyDebts(balances: Record<string, number>) {
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ userId, amount });
    else if (amount < -0.01) debtors.push({ userId, amount: -amount });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settleAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settleAmount,
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}
