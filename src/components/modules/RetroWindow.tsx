import type { ReactNode } from "react";

export interface RetroWindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export function RetroWindow({ title, children, onClose }: RetroWindowProps) {
  return (
    <section className="overflow-hidden rounded-[8px] border-2 border-ink bg-surface font-sans text-ink shadow-[8px_8px_0_0_var(--color-ink)]">
      <header className="flex min-h-12 items-center justify-between gap-3 border-b-2 border-ink bg-ink px-3 py-2 text-background sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] border-2 border-background bg-accent font-mono text-xs font-black text-accent-foreground">V</span>
          <h2 className="truncate font-mono text-xs font-black uppercase sm:text-sm">{title}</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Return to the previous module" className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] border-2 border-background bg-surface text-lg font-black text-ink hover:bg-accent">&times;</button>
        )}
      </header>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

export default RetroWindow;
