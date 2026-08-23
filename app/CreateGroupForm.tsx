"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateGroupForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error || !group) {
      alert(error?.message);
      setLoading(false);
      return;
    }

    const emails = memberEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    let missingEmails: string[] = [];

    if (emails.length) {
      const { data: foundProfiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("email", emails);

      const foundEmails = foundProfiles?.map((p) => p.email) ?? [];
      missingEmails = emails.filter((e) => !foundEmails.includes(e));

      const memberRows = [
        { group_id: group.id, user_id: userId },
        ...(foundProfiles?.map((p) => ({
          group_id: group.id,
          user_id: p.id,
        })) ?? []),
      ];
      await supabase.from("group_members").insert(memberRows);
    } else {
      await supabase
        .from("group_members")
        .insert({ group_id: group.id, user_id: userId });
    }

    setLoading(false);
    setName("");
    setMemberEmails("");

    if (missingEmails.length) {
      alert(
        `Group created, but these people haven't signed up yet so couldn't be added: ${missingEmails.join(", ")}. Ask them to sign in once, then add them.`,
      );
    }

    router.refresh();
  };

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <input
        className="w-full rounded-md p-2 text-sm"
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded-md p-2 text-sm"
        placeholder="Members' emails, comma separated"
        value={memberEmails}
        onChange={(e) => setMemberEmails(e.target.value)}
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full rounded-md bg-[var(--marigold)] py-2 text-sm font-medium text-[#121212] transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create group"}
      </button>
    </div>
  );
}
