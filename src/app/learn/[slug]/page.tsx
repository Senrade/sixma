import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/AppShell";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { articles, getArticle } from "@/lib/articles";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { en } from "@/i18n/messages/en";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = getArticle(slug); return { title: article ? en[article.title] : en["metadata.notFound.guide"], description: article ? en[article.summary] : undefined }; }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const article = getArticle(slug); if (!article) notFound();
  return <AppShell><article className="py-12 sm:py-16"><header className="mx-auto max-w-3xl px-4 sm:px-6"><Chip tone="blue"><LocalizedText messageKey={article.category} /></Chip><h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl"><LocalizedText messageKey={article.title} /></h1><p className="mt-4 text-lg leading-8 text-ink-soft"><LocalizedText messageKey={article.summary} /></p><p className="mt-3 font-mono text-xs font-bold"><LocalizedText messageKey="article.minuteRead" replacements={{ minutes: article.readTime }} /></p></header><div className="mx-auto mt-10 max-w-3xl border-t-2 border-ink px-4 pt-8 sm:px-6">{article.sections.map((section) => <section key={section.heading} className="mb-9"><h2 className="text-2xl font-black"><LocalizedText messageKey={section.heading} /></h2><p className="mt-3 text-base leading-8 text-ink-soft"><LocalizedText messageKey={section.body} /></p></section>)}<ButtonLink href="/learn" tone="secondary"><LocalizedText messageKey="article.back" /></ButtonLink></div></article></AppShell>;
}
