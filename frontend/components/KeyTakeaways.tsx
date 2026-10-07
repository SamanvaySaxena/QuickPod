interface KeyTakeawaysProps {
  takeaways: string[];
}

export default function KeyTakeaways({
  takeaways,
}: KeyTakeawaysProps) {
  if (takeaways.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-cyan-300/12 bg-cyan-300/4 p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/8">
          <span className="text-sm text-cyan-300">★</span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
            Revision
          </p>

          <h2 className="mt-1 text-xl font-semibold text-zinc-100">
            Key Takeaways
          </h2>
        </div>
      </div>

      <ul className="space-y-4">
        {takeaways.map((takeaway, index) => (
          <li
            key={`${takeaway}-${index}`}
            className="flex gap-3 text-sm leading-7 text-zinc-300"
          >
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span>{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}