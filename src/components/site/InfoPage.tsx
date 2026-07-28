import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { SectionLabel } from "@/components/ui/Primitives";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <AppShell><section className="py-12 sm:py-16"><div className="mx-auto max-w-3xl px-4 sm:px-6"><SectionLabel>{eyebrow}</SectionLabel><h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1><p className="mt-4 text-lg leading-8 text-ink-soft">{intro}</p><div className="mt-9 border-t-2 border-ink pt-8 leading-7 text-ink-soft [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-ink [&_p]:mt-3">{children}</div></div></section></AppShell>;
}
