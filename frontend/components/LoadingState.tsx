"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    label: "Fetching the lecture transcript",
    description: "Getting the source material from YouTube.",
  },
  {
    label: "Reading the lecture content",
    description: "Going through the transcript and identifying the important ideas.",
  },
  {
    label: "Building your study guide",
    description: "Structuring the material into clear learning sections.",
  },
  {
    label: "Organizing key points",
    description: "Pulling together definitions, examples, and important details.",
  },
  {
    label: "Finishing your guide",
    description: "Polishing the final structure for revision.",
  },
];

export default function LoadingState() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= stages.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, 2200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const stage = stages[stageIndex];

  return (
    <div className="rounded-2xl border border-white/8 bg-[#111418] p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
          <span className="absolute h-6 w-6 animate-ping rounded-full bg-cyan-300/10" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-zinc-100">
              {stage.label}
            </p>

            <span className="shrink-0 font-mono text-[10px] tracking-wider text-zinc-700">
              {String(stageIndex + 1).padStart(2, "0")}/05
            </span>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-zinc-600 sm:text-sm">
            {stage.description}
          </p>

          <div className="mt-5 flex gap-1.5">
            {stages.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  index <= stageIndex
                    ? "bg-cyan-300/60"
                    : "bg-white/6"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}