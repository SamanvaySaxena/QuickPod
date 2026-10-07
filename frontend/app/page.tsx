"use client";

import { useState } from "react";
import Generator from "@/components/Generator";
import StudyGuide from "@/components/StudyGuide";
import type {
  GenerateStudyGuideResponse,
} from "@/types/study-guide";

export default function Home() {
  const [generatedGuide, setGeneratedGuide] =
    useState<GenerateStudyGuideResponse | null>(null);

  function handleGenerated(
    response: GenerateStudyGuideResponse
  ) {
    setGeneratedGuide(response);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0d0f]">
      {/* Generator */}
      <section className="px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <Generator onGenerated={handleGenerated} />
      </section>

      {/* Generated study guide */}
      {generatedGuide && (
        <section className="border-t border-white/6 px-5 py-16 sm:px-8 sm:py-20">
          <StudyGuide
            studyGuide={generatedGuide.study_guide}
            videoId={generatedGuide.video_id}
          />
        </section>
      )}

      {/* Empty-state footer area */}
      {!generatedGuide && (
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-3xl border-t border-white/6 pt-8 text-center">
            <p className="text-xs tracking-wide text-zinc-700">
              Paste a lecture. Get a study guide. Start learning.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}