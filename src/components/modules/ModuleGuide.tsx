import type { ModuleGuideDefinition } from "@/lib/module-guides";

export function ModuleGuide({ guide }: { guide: ModuleGuideDefinition }) {
  return (
    <section
      className="mb-4 border-l-4 border-info bg-info/10 px-4 py-3"
      aria-label={`How to play: ${guide.title}`}
    >
      <p className="font-mono text-[11px] font-black uppercase text-info">
        How to play / Module {guide.number}
      </p>
      <p className="mt-1 text-sm font-black text-ink">{guide.summary}</p>
      <ol className="mt-2 grid gap-1 text-sm leading-6 text-ink-soft sm:grid-cols-2 sm:gap-4">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="font-mono font-black text-info">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
