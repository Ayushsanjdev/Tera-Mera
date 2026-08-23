import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateGroupForm from "./CreateGroupForm";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name)")
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-md p-6">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg font-medium text-[var(--text)]">
            Tera Mera
          </span>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
              Sign out
            </button>
          </form>
        </div>

        <h1 className="font-display text-2xl font-medium text-[var(--text)]">
          Hey, {user.user_metadata?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Here's what's happening with your groups.
        </p>

        <div className="mt-6">
          <CreateGroupForm userId={user.id} />
        </div>

        <h2 className="mb-2 mt-6 text-sm font-medium text-[var(--text-muted)]">
          Your groups
        </h2>
        <div className="space-y-2">
          {memberships?.map((m: any) => (
            <Link
              key={m.groups.id}
              href={`/groups/${m.groups.id}`}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:bg-[var(--surface-hover)]"
            >
              <span className="text-sm font-medium text-[var(--text)]">
                {m.groups.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]">→</span>
            </Link>
          ))}
          {!memberships?.length && (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                No groups yet
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Create one above and add friends by email to start splitting
                expenses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
