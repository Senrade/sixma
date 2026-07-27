import type { Metadata } from "next";
import { AppShell } from "@/components/site/AppShell";
import { ButtonLink, Chip, SectionLabel } from "@/components/ui/Primitives";
import { articles } from "@/lib/articles";

export const metadata: Metadata = { title: "Knowledge Hub" };

export default function LearnPage() {
  return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><SectionLabel>Field guides</SectionLabel><h1 className="mt-3 text-4xl font-black sm:text-5xl">Knowledge Hub</h1><p className="mt-3 max-w-2xl text-lg text-ink-soft">Short references for the skills practiced inside each investigation.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <article key={article.slug} className="flex flex-col rounded-[8px] border-2 border-ink bg-surface p-5 shadow-[5px_5px_0_0_var(--color-ink)]"><Chip tone="blue" className="self-start">{article.category}</Chip><h2 className="mt-4 text-xl font-black">{article.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{article.summary}</p><p className="mt-4 font-mono text-xs font-bold">{article.readTime} min read</p><ButtonLink href={`/learn/${article.slug}`} className="mt-4">Read guide</ButtonLink></article>)}</div></div></section></AppShell>;
}
