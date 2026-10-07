"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteStudyGuide,
  getStudyGuides,
  type StudyGuideHistoryItem,
} from "@/lib/api";

export default function HistoryPage() {
  const [studyGuides, setStudyGuides] = useState<
    StudyGuideHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error(
            "Your session could not be loaded."
          );
        }

        const response = await getStudyGuides(
          session.access_token
        );

        if (!mounted) {
          return;
        }

        setStudyGuides(response.study_guides);
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load your study guides.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function getOverviewPreview(overview: string) {
    const trimmed = overview.trim();

    if (trimmed.length <= 150) {
      return trimmed;
    }

    return `${trimmed.slice(0, 150).trim()}...`;
  }

  async function handleDelete(guideId: string) {
    const confirmed = window.confirm(
      "Delete this study guide? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(guideId);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your session could not be loaded."
        );
      }

      await deleteStudyGuide(
        guideId,
        session.access_token
      );

      setStudyGuides((currentGuides) =>
        currentGuides.filter(
          (guide) => guide.id !== guideId
        )
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete the study guide.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10">
            <div className="h-4 w-20 animate-pulse rounded bg-white/5" />

            <div className="mt-4 h-10 w-56 animate-pulse rounded bg-white/5" />

            <div className="mt-3 h-5 w-80 animate-pulse rounded bg-white/5" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-[#111418] p-6"
              >
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/5" />

                <div className="mt-4 h-4 w-full animate-pulse rounded bg-white/5" />

                <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-white/5" />

                <div className="mt-6 h-3 w-32 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/70">
            Library
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Study History
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Your previously generated study guides, saved for
                revision whenever you need them.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#081014] transition hover:bg-cyan-200"
            >
              New Guide
            </Link>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-sm text-red-300">
                !
              </span>

              <div>
                <p className="text-sm font-medium text-red-200">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm leading-6 text-red-200/65">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {studyGuides.length === 0 && !error && (
          <section className="rounded-2xl border border-white/8 bg-[#111418] px-6 py-14 text-center sm:px-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/5">
              <span className="text-sm font-bold text-cyan-300">
                Q
              </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-zinc-100">
              No study guides yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Generate your first study guide from a YouTube lecture
              and it will appear here automatically.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg border border-cyan-300/20 bg-cyan-300/8 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/12"
            >
              Create a Study Guide
            </Link>
          </section>
        )}

        {studyGuides.length > 0 && (
          <div className="space-y-4">
            {studyGuides.map((guide) => {
              const isDeleting = deletingId === guide.id;

              return (
                <article
                  key={guide.id}
                  className={`rounded-2xl border border-white/8 bg-[#111418] p-6 transition sm:p-7 ${
                    isDeleting
                      ? "opacity-60"
                      : "hover:border-white/12 hover:bg-[#13171c]"
                  }`}
                >
                  <div className="flex flex-col gap-5">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/65">
                          Study Guide
                        </span>

                        <span className="h-1 w-1 rounded-full bg-zinc-700" />

                        <span className="text-xs text-zinc-600">
                          {formatDate(guide.created_at)}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                        {guide.study_guide.title || guide.title}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-zinc-400">
                        {getOverviewPreview(
                          guide.study_guide.overview
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
                        <span>
                          {guide.study_guide.sections.length}{" "}
                          {guide.study_guide.sections.length === 1
                            ? "section"
                            : "sections"}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-zinc-700" />

                        <a
                          href={guide.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-zinc-300"
                        >
                          Open YouTube
                        </a>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden font-mono text-[11px] tracking-wide text-zinc-700 md:inline">
                          {guide.video_id}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(guide.id)
                          }
                          disabled={isDeleting}
                          className="rounded-lg border border-red-400/10 bg-red-400/5 px-4 py-2 text-xs font-medium text-red-300/80 transition hover:border-red-400/20 hover:bg-red-400/8 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                        <Link
                          href={`/history/${guide.id}`}
                          aria-disabled={isDeleting}
                          className={`rounded-lg border border-cyan-300/15 bg-cyan-300/5 px-4 py-2 text-xs font-medium text-cyan-200 transition hover:border-cyan-300/25 hover:bg-cyan-300/10 ${
                            isDeleting
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          Open Guide →
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}