"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStudyGuide } from "@/lib/api";
import type { StudyGuideHistoryItem } from "@/lib/api";
import StudyGuide from "@/components/StudyGuide";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";

export default function HistoryStudyGuidePage() {
  const params = useParams<{ id: string }>();
  const studyGuideId = params.id;

  const [guide, setGuide] =
    useState<StudyGuideHistoryItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStudyGuide() {
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

        const response = await getStudyGuide(
          studyGuideId,
          session.access_token
        );

        if (!mounted) {
          return;
        }

        setGuide(response);
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load the study guide.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStudyGuide();

    return () => {
      mounted = false;
    };
  }, [studyGuideId]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/history"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-300"
          >
            ← Back to History
          </Link>

          <div className="mt-8">
            <LoadingState />
          </div>
        </div>
      </main>
    );
  }

  if (error || !guide) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/history"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-300"
          >
            ← Back to History
          </Link>

          <div className="mt-8">
            <ErrorMessage
              message={error ?? "Study guide not found."}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f]">
      <section className="px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/history"
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-300"
            >
              ← Back to History
            </Link>

            <a
              href={guide.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
            >
              Open YouTube ↗
            </a>
          </div>

          <StudyGuide
            studyGuide={guide.study_guide}
            videoId={guide.video_id}
          />
        </div>
      </section>
    </main>
  );
}