import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinGroupButton from "./JoinGroupButton";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/join/${code}`);
  }

  const { data: preview } = await supabase
    .rpc("get_group_preview", { _invite_code: code })
    .maybeSingle();

  if (!preview) {
    redirect("/?error=invalid-invite");
  }

  // already a member? skip straight in
  const { data: existingMembership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", preview.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    redirect(`/groups/${preview.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
          You've been invited to
        </p>
        <h1 className="font-display mt-2 text-2xl font-medium text-[var(--text)]">
          {preview.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Join to start splitting expenses with this group.
        </p>

        <div className="mt-6">
          <JoinGroupButton inviteCode={code} groupId={preview.id} />
        </div>
      </div>
    </div>
  );
}
