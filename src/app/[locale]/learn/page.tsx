import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro, LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { requireLocale } from "@/i18n/params";
import { localizePath } from "@/i18n/routing";
import { getArticles } from "@/lib/articles";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.learn"); }

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const articles = await getArticles(locale);

  return (
    <AppShell>
      <section className="case-grid-bg min-h-[70vh] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <LocalizedPageIntro kicker="learn.kicker" title="learn.title" description="learn.intro" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="cyber-panel flex flex-col p-5">
                <Chip tone="blue" className="self-start">{article.category}</Chip>
                <h2 className="mt-4 text-xl font-black text-info">{article.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{article.summary}</p>
                <p className="mt-4 font-mono text-xs font-bold">{article.readTime} <LocalizedText messageKey="learn.minRead" /></p>
                <ButtonLink href={localizePath(locale, `/learn/${article.slug}`)} className="mt-4"><LocalizedText messageKey="learn.read" /></ButtonLink>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
