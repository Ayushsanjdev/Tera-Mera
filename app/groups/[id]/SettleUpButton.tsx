"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Spinner from "@/lib/Spinner";

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
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const handleSettle = async () => {
    setLoading(true);
    const { error } = await supabase.from("settlements").insert({
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    });
    setLoading(false);
    setConfirming(false);

    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(`Marked ₹${amount.toFixed(2)} as paid to ${toName}`);
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleSettle}
          disabled={loading}
          className="flex items-center gap-1 rounded-md bg-[var(--marigold)] px-2 py-1 text-xs font-medium text-[#121212] disabled:opacity-50"
        >
          {loading && <Spinner />}
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-[var(--marigold)] px-3 py-1 text-xs font-medium text-[var(--marigold)] transition hover:bg-[var(--marigold)] hover:text-[#121212]"
    >
      Settle
    </button>
  );
}
