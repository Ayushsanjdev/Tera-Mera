"use client";

import { useState } from "react";

export default function InviteLink({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-md border border-[var(--border)] py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--marigold)] hover:text-[var(--text)]"
    >
      {copied ? "Link copied ✓" : "Copy invite link"}
    </button>
  );
}
