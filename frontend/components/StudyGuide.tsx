import type { StudyGuide as StudyGuideType } from "@/types/study-guide";
import StudyGuideSection from "@/components/StudyGuideSection";
import KeyTakeaways from "@/components/KeyTakeaways";

interface StudyGuideProps {
  studyGuide: StudyGuideType;
  videoId?: string;
}

export default function StudyGuide({
  studyGuide,
  videoId,
}: StudyGuideProps) {
  return (
    <article className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <header className="border-b border-white/8 pb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70">
            Study Guide
          </span>

          {videoId && (
            <>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span className="text-xs text-zinc-600">
                YouTube
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
          {studyGuide.title}
        </h1>
      </header>

      {/* Overview */}
      <section className="mt-8 rounded-2xl border border-white/8 bg-[#111418] p-6 sm:p-7">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
          Overview
        </p>

        <p className="text-base leading-8 text-zinc-300">
          {studyGuide.overview}
        </p>
      </section>

      {/* Sections */}
      <div className="mt-10">
        {studyGuide.sections.map((section, index) => (
          <StudyGuideSection
            key={`${section.heading}-${index}`}
            section={section}
            index={index}
          />
        ))}
      </div>

      {/* Takeaways */}
      <div className="mt-12">
        <KeyTakeaways takeaways={studyGuide.key_takeaways} />
      </div>
    </article>
  );
}