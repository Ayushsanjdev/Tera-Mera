"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettleUpButton({
  groupId,
  fromUserId,
  toUserId,
  amount,
  toName,
}: {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  toName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSettle = async () => {
    if (!confirm(`Mark ₹${amount.toFixed(2)} as paid to ${toName}?`)) return;
    setLoading(true);

    const { error } = await supabase.from("settlements").insert({
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    });

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.refresh();
  };

  return (
    <button
      onClick={handleSettle}
      disabled={loading}
      className="rounded-md border border-[var(--marigold)] px-3 py-1 text-xs font-medium text-[var(--marigold)] transition hover:bg-[var(--marigold)] hover:text-[#121212] disabled:opacity-50"
    >
      {loading ? "..." : "Settle"}
    </button>
  );
}
