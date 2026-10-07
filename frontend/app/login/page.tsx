"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0b0d0f] px-5 py-16 sm:px-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/5">
            <span className="text-lg font-bold text-cyan-300">Q</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Welcome to Quick<span className="text-cyan-300">Pod</span>
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Turn YouTube lectures into structured study guides built for
            focused learning.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/10 bg-[#111418] p-6 shadow-2xl shadow-black/20 sm:p-7">
          <div className="mb-6">
            <p className="text-sm font-medium text-zinc-200">
              Sign in to continue
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Your study guides and history are tied to your account.
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#171b21] px-4 py-3.5 text-sm font-medium text-zinc-200 transition hover:border-white/15 hover:bg-[#1c2128] hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21.805 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z"
                fill="currentColor"
                className="text-blue-400"
              />
              <path
                d="M12 22c2.76 0 5.07-.91 6.76-2.47l-3.3-2.56c-.91.61-2.07.97-3.46.97-2.66 0-4.92-1.8-5.73-4.22H2.86v2.65A10.2 10.2 0 0 0 12 22Z"
                fill="currentColor"
                className="text-emerald-400"
              />
              <path
                d="M6.27 13.72A6.1 6.1 0 0 1 5.95 12c0-.6.11-1.19.32-1.72V7.63H2.86A10.01 10.01 0 0 0 1.8 12c0 1.58.38 3.07 1.06 4.37l3.41-2.65Z"
                fill="currentColor"
                className="text-yellow-400"
              />
              <path
                d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.07 3.1 14.76 2 12 2a10.2 10.2 0 0 0-9.14 5.63l3.41 2.65C7.08 7.86 9.34 6.06 12 6.06Z"
                fill="currentColor"
                className="text-red-400"
              />
            </svg>

            <span>Continue with Google</span>
          </button>

          <div className="mt-6 border-t border-white/6 pt-5">
            <p className="text-center text-[11px] leading-5 text-zinc-600">
              By continuing, you agree to use QuickPod responsibly for
              educational purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[11px] tracking-wide text-zinc-700">
            QUICKPOD / LEARN FASTER
          </p>
        </div>
      </div>
    </main>
  );
}