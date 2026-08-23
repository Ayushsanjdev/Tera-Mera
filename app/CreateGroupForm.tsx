"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Spinner from "@/lib/Spinner";

export default function CreateGroupForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Give your group a name");
      return;
    }
    setError("");
    setLoading(true);

    const { data: group, error: err } = await supabase
      .from("groups")
      .insert({ name: name.trim(), created_by: userId })
      .select()
      .single();

    if (err || !group) {
      toast(err?.message ?? "Something went wrong", "error");
      setLoading(false);
      return;
    }

    await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId });

    toast("Group created");
    router.push(`/groups/${group.id}`);
  };

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <input
        className="w-full rounded-md p-2 text-sm"
        placeholder="Group name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError("");
        }}
      />
      {error && <p className="text-xs text-[var(--coral)]">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--marigold)] py-2 text-sm font-medium text-[#121212] transition hover:opacity-90 disabled:opacity-50"
      >
        {loading && <Spinner />}
        {loading ? "Creating..." : "Create group"}
      </button>
    </div>
  );
}
