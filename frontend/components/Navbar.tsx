"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setUserEmail(user?.email ?? null);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.replace("/login");
  }

  const isHome = pathname === "/";
  const isHistory = pathname.startsWith("/history");

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0b0d0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="QuickPod home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/5 transition-colors group-hover:border-cyan-300/35 group-hover:bg-cyan-300/8">
            <span className="text-sm font-bold tracking-tight text-cyan-300">
              Q
            </span>

            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.6)]" />
          </div>

          <div className="leading-none">
            <span className="text-[17px] font-semibold tracking-tight text-zinc-100">
              Quick<span className="text-cyan-300">Pod</span>
            </span>

            <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-700 sm:block">
              Learn faster
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center rounded-xl border border-white/6 bg-[#111418]/70 p-1 sm:flex">
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              isHome
                ? "bg-white/8 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
            }`}
          >
            Home
          </Link>

          <Link
            href="/history"
            aria-current={isHistory ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              isHistory
                ? "bg-cyan-300/8 text-cyan-200"
                : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
            }`}
          >
            History
          </Link>
        </nav>

        {/* Account */}
        <div className="flex shrink-0 items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-white/5" />
          ) : userEmail ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl border border-white/6 bg-[#111418]/70 px-3 py-2 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />

                <span className="max-w-44 truncate text-xs text-zinc-500">
                  {userEmail}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/8 bg-[#111418] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:bg-[#171b21] hover:text-zinc-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-2.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/12"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}