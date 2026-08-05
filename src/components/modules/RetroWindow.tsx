import type { ReactNode } from "react";

export interface RetroWindowProps {
  title: string;
  children: ReactNode;
}

export function RetroWindow({ title, children }: RetroWindowProps) {
  return (
    <section className="overflow-hidden rounded-[8px] border-2 border-ink bg-surface font-sans text-ink shadow-[8px_8px_0_0_var(--color-ink)]">
      <header className="flex min-h-12 items-center gap-3 border-b-2 border-ink bg-ink px-3 py-2 text-background sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] border-2 border-background bg-accent font-mono text-xs font-black text-accent-foreground">S</span>
          <h2 className="truncate font-mono text-xs font-black uppercase sm:text-sm">{title}</h2>
        </div>
      </header>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

export default RetroWindow;
