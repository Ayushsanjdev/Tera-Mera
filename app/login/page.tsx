"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className="relative z-10 w-full max-w-sm text-center">
      <svg width="40" height="24" viewBox="0 0 40 24" className="mx-auto mb-6">
        <circle
          cx="14"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--marigold)"
          strokeWidth="1.5"
        />
        <circle
          cx="26"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--emerald)"
          strokeWidth="1.5"
        />
      </svg>

      <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--text)]">
        Tera Mera
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Split expenses with friends, without the awkward math.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] py-3 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)] active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C40.9 36.4 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-[var(--text-muted)]">
        By continuing, you agree to split bills fairly and settle up on time.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
