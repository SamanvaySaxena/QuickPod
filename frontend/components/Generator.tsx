"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  generateStudyGuide,
} from "@/lib/api";
import type { GenerateStudyGuideResponse } from "@/types/study-guide";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";

interface GeneratorProps {
  onGenerated: (response: GenerateStudyGuideResponse) => void;
}

export default function Generator({ onGenerated }: GeneratorProps) {
  const [ytUrl, setYtUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = ytUrl.trim();

    if (!trimmedUrl) {
      setError("Please enter a YouTube video URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Your session has expired. Please log in again.");
        return;
      }
      console.log("ACCESS TOKEN:", session.access_token);

      const response = await generateStudyGuide(
        trimmedUrl,
        session.access_token
      );

      onGenerated(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the study guide.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-cyan-300/70">
          Learn faster
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Turn lectures into
          <span className="block text-cyan-300">
            something you can study.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
          Paste a YouTube lecture and QuickPod will transform its content
          into a structured study guide.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-white/10 bg-[#111418] p-2 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={ytUrl}
              onChange={(event) => setYtUrl(event.target.value)}
              placeholder="Paste a YouTube video URL..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-4 py-3.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/8 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-semibold text-[#081014] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Guide"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-zinc-600">
          YouTube videos only. QuickPod extracts the transcript and builds
          your guide from it.
        </p>
      </form>

      {loading && (
        <div className="mt-8">
          <LoadingState />
        </div>
      )}

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}
    </section>
  );
}