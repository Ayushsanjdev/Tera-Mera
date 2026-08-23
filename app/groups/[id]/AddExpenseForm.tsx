"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddExpenseForm({
  groupId,
  memberIds,
  currentUserId,
}: {
  groupId: string;
  memberIds: string[];
  currentUserId: string;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const amt = parseFloat(amount);
  const perPerson = amt > 0 && memberIds.length ? amt / memberIds.length : 0;

  const handleAdd = async () => {
    if (!description.trim() || !amt || amt <= 0) return;
    setLoading(true);

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        group_id: groupId,
        description,
        amount: amt,
        paid_by: currentUserId,
      })
      .select()
      .single();

    if (error || !expense) {
      alert(error?.message);
      setLoading(false);
      return;
    }

    const shareRows = memberIds.map((userId) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: perPerson,
    }));

    await supabase.from("expense_shares").insert(shareRows);

    setDescription("");
    setAmount("");
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
    router.refresh();
  };

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <input
        className="w-full rounded-md p-2 text-sm"
        placeholder="What was it for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="w-full rounded-md p-2 text-sm"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {amt > 0 && memberIds.length > 0 && (
        <p className="amount text-xs text-[var(--text-muted)]">
          ₹{perPerson.toFixed(2)} each · split {memberIds.length} ways
        </p>
      )}

      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full rounded-md bg-[var(--marigold)] py-2 text-sm font-medium text-[#121212] transition hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Adding..."
          : success
            ? "Added ✓"
            : "Add expense (split equally)"}
      </button>
    </div>
  );
}
