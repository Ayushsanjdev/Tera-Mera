"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Spinner from "@/lib/Spinner";

type Member = { id: string; name: string };

export default function AddExpenseForm({
  groupId,
  members,
  currentUserId,
}: {
  groupId: string;
  members: Member[];
  currentUserId: string;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<string[]>(members.map((m) => m.id));
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
    selected?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const canAddExpense = members.length > 1;

  const amt = parseFloat(amount);
  const perPerson = amt > 0 && selected.length ? amt / selected.length : 0;

  const toggleMember = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
    if (errors.selected) setErrors((s) => ({ ...s, selected: undefined }));
  };

  const handleAdd = async () => {
    const newErrors: typeof errors = {};
    if (!description.trim()) newErrors.description = "What was this for?";
    if (!amt || amt <= 0) newErrors.amount = "Enter a valid amount";
    if (selected.length === 0)
      newErrors.selected = "Pick at least one person to split with";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        group_id: groupId,
        description: description.trim(),
        amount: amt,
        paid_by: currentUserId,
      })
      .select()
      .single();

    if (error || !expense) {
      toast(error?.message ?? "Could not add expense", "error");
      setLoading(false);
      return;
    }

    const shareRows = selected.map((userId) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: perPerson,
    }));
    await supabase.from("expense_shares").insert(shareRows);

    setDescription("");
    setAmount("");
    setLoading(false);
    toast("Expense added");
    router.refresh();
  };

  if (!canAddExpense) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
        <p className="text-sm font-medium text-[var(--text)]">
          Invite someone first
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          You need at least one other person in the group before you can split
          an expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <input
          className="w-full rounded-md p-2 text-sm"
          placeholder="What was it for?"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((s) => ({ ...s, description: undefined }));
          }}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-[var(--coral)]">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <input
          className="w-full rounded-md p-2 text-sm"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) setErrors((s) => ({ ...s, amount: undefined }));
          }}
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-[var(--coral)]">{errors.amount}</p>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Split with
        </p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleMember(m.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selected.includes(m.id)
                  ? "border-[var(--marigold)] bg-[var(--marigold)]/15 text-[var(--marigold)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        {errors.selected && (
          <p className="mt-1 text-xs text-[var(--coral)]">{errors.selected}</p>
        )}
      </div>

      {amt > 0 && selected.length > 0 && !errors.amount && (
        <p className="amount text-xs text-[var(--text-muted)]">
          ₹{perPerson.toFixed(2)} each · split {selected.length} way
          {selected.length > 1 ? "s" : ""}
        </p>
      )}

      <button
        onClick={handleAdd}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--marigold)] py-2 text-sm font-medium text-[#121212] transition hover:opacity-90 disabled:opacity-50"
      >
        {loading && <Spinner />}
        {loading ? "Adding..." : "Add expense"}
      </button>
    </div>
  );
}
