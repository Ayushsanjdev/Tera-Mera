"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Spinner from "@/lib/Spinner";

export default function JoinGroupButton({
  inviteCode,
  groupId,
}: {
  inviteCode: string;
  groupId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const handleJoin = async () => {
    setLoading(true);
    const { error } = await supabase.rpc("join_group_by_code", {
      _invite_code: inviteCode,
    });
    setLoading(false);

    if (error) {
      toast(error.message, "error");
      return;
    }

    toast("Joined group");
    router.push(`/groups/${groupId}`);
  };

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--marigold)] py-2.5 text-sm font-medium text-[#121212] transition hover:opacity-90 disabled:opacity-50"
    >
      {loading && <Spinner />}
      {loading ? "Joining..." : "Join group"}
    </button>
  );
}
