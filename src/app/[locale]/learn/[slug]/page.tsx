import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { requireLocale } from "@/i18n/params";
import { localizePath } from "@/i18n/routing";
import { getArticle, getArticles } from "@/lib/articles";

export async function generateStaticParams() {
  return (await getArticles("en")).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const article = await getArticle(slug, requireLocale(localeParam));
  return { title: article?.title, description: article?.summary };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = requireLocale(localeParam);
  const article = await getArticle(slug, locale);
  if (!article) notFound();

  return (
    <AppShell>
      <article className="py-12 sm:py-16">
        <header className="mx-auto max-w-3xl px-4 sm:px-6">
          <Chip tone="blue">{article.category}</Chip>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-8 text-ink-soft">{article.summary}</p>
          <p className="mt-3 font-mono text-xs font-bold"><LocalizedText messageKey="article.minuteRead" replacements={{ minutes: article.readTime }} /></p>
          {article.datePosted && (
            <p className="mt-2 font-mono text-xs text-ink-soft">{article.datePosted}</p>
          )}
        </header>
        <div className="mx-auto mt-10 max-w-3xl border-t-[3px] border-border px-4 pt-9 sm:px-6">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-2xl font-black leading-tight text-info">{section.heading}</h2>
              {"body" in section ? (
                <p className="mt-3 text-base leading-8 text-ink-soft sm:text-lg">{section.body}</p>
              ) : (
                <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-7 text-ink-soft sm:text-lg">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
          <ButtonLink href={localizePath(locale, "/learn")} tone="secondary"><LocalizedText messageKey="article.back" /></ButtonLink>
        </div>
      </article>
    </AppShell>
  );
}
