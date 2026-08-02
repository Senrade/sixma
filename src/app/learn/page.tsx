import type { Metadata } from "next";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro, LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { articles } from "@/lib/articles";

export const metadata: Metadata = { title: "Knowledge Hub" };

export default function LearnPage() {
  return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><LocalizedPageIntro kicker="learn.kicker" title="learn.title" description="learn.intro" /><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <article key={article.slug} className="cyber-panel flex flex-col p-5"><Chip tone="blue" className="self-start">{article.category}</Chip><h2 className="mt-4 text-xl font-black text-info">{article.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{article.summary}</p><p className="mt-4 font-mono text-xs font-bold">{article.readTime} <LocalizedText messageKey="learn.minRead" /></p><ButtonLink href={`/learn/${article.slug}`} className="mt-4"><LocalizedText messageKey="learn.read" /></ButtonLink></article>)}</div></div></section></AppShell>;
}
