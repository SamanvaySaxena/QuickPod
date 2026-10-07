import type { StudyGuideSection as StudyGuideSectionType } from "@/types/study-guide";

interface StudyGuideSectionProps {
  section: StudyGuideSectionType;
  index: number;
}

export default function StudyGuideSection({
  section,
  index,
}: StudyGuideSectionProps) {
  return (
    <section className="border-b border-white/8 py-10 first:pt-0">
      {/* Section heading */}
      <div className="mb-6 flex items-start gap-4">
        <span className="pt-1 font-mono text-sm text-cyan-300/60">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {section.heading}
        </h2>
      </div>

      {/* Explanation */}
      <div className="ml-0 sm:ml-10">
        <p className="text-base leading-8 text-zinc-400">
          {section.explanation}
        </p>

        {/* Key points */}
        {section.key_points.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
              Key Points
            </h3>

            <ul className="space-y-3">
              {section.key_points.map((point, pointIndex) => (
                <li
                  key={`${point}-${pointIndex}`}
                  className="flex gap-3 text-sm leading-7 text-zinc-300"
                >
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {section.examples.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
              Examples
            </h3>

            <div className="space-y-3">
              {section.examples.map((example, exampleIndex) => (
                <div
                  key={`${example}-${exampleIndex}`}
                  className="rounded-xl border border-white/8 bg-[#111418] px-4 py-4 text-sm leading-7 text-zinc-300"
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}