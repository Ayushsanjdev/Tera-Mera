import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddExpenseForm from "./AddExpenseForm";
import SettleUpButton from "./SettleUpButton";
import { calculateBalances, simplifyDebts } from "@/lib/balances";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", id);

  const memberIds = members?.map((m) => m.user_id) ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", memberIds);

  const nameMap: Record<string, string> = {};
  profiles?.forEach((p) => {
    nameMap[p.id] =
      p.id === user.id ? "You" : (p.full_name?.split(" ")[0] ?? p.email);
  });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, expense_shares(*)")
    .eq("group_id", id)
    .order("created_at", { ascending: false });

  const { data: settlements } = await supabase
    .from("settlements")
    .select("*")
    .eq("group_id", id)
    .order("created_at", { ascending: false });

  const balances = calculateBalances(expenses ?? [], settlements ?? []);
  const debts = simplifyDebts(balances);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-md p-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          ← Back to groups
        </Link>

        <h1 className="font-display text-2xl font-medium text-[var(--text)]">
          {group?.name}
        </h1>

        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Balances
          </h2>
          <div className="space-y-2">
            {Object.entries(balances).map(([userId, amount]) => (
              <div key={userId} className="flex justify-between text-sm">
                <span className="text-[var(--text)]">
                  {nameMap[userId] ?? "Unknown"}
                </span>
                <span
                  className={`amount ${amount >= 0 ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}
                >
                  {amount >= 0 ? "+" : "-"}₹{Math.abs(amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {debts.length > 0 && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Settle up
            </h2>
            <div className="space-y-2">
              {debts.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--text)]">
                    {nameMap[d.from] ?? "Unknown"} owes{" "}
                    {nameMap[d.to] ?? "Unknown"}{" "}
                    <span className="amount">₹{d.amount.toFixed(2)}</span>
                  </span>
                  {d.from === user.id && (
                    <SettleUpButton
                      groupId={id}
                      fromUserId={d.from}
                      toUserId={d.to}
                      amount={d.amount}
                      toName={nameMap[d.to] ?? "them"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {debts.length === 0 && expenses && expenses.length > 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
            <p className="text-sm text-[var(--text)]">All settled up 🎉</p>
          </div>
        )}

        <div className="mt-6">
          <AddExpenseForm
            groupId={id}
            memberIds={memberIds}
            currentUserId={user.id}
          />
        </div>

        <h2 className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Activity
        </h2>
        <div className="space-y-2">
          {expenses?.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--text)]">
                    {e.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {nameMap[e.paid_by] ?? "Someone"} paid ·{" "}
                    {timeAgo(e.created_at)}
                  </p>
                </div>
                <span className="amount text-[var(--text)]">
                  ₹{Number(e.amount).toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-2">
                {e.expense_shares.map((s: any) => (
                  <span
                    key={s.user_id}
                    className="text-xs text-[var(--text-muted)]"
                  >
                    {nameMap[s.user_id] ?? "Unknown"}{" "}
                    <span className="amount">
                      ₹{Number(s.amount).toFixed(2)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}

          {settlements?.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-muted)]"
            >
              {nameMap[s.from_user_id] ?? "Someone"} paid{" "}
              {nameMap[s.to_user_id] ?? "someone"}{" "}
              <span className="amount">₹{Number(s.amount).toFixed(2)}</span> ·{" "}
              {timeAgo(s.created_at)}
            </div>
          ))}

          {!expenses?.length && (
            <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                No expenses yet
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Add the first one above to start splitting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
