import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro, LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink } from "@/components/ui/Primitives";
import { requireLocale } from "@/i18n/params";
import { localizePath } from "@/i18n/routing";
import { getArticles } from "@/lib/articles";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.knowledgeHub"); }

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocale(localeParam);
  const articles = await getArticles(locale);

  return (
    <AppShell>
      <section className="case-grid-bg min-h-[70vh] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <LocalizedPageIntro
            kicker="learn.kicker"
            title="learn.title"
            description="learn.intro"
            descriptionClassName="max-w-4xl"
          />
          <div className="mt-10 border-y-[3px] border-border">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="border-b-[3px] border-border py-7 last:border-b-0 sm:py-9"
              >
                <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-info">{article.category}</p>
                    <h2 className="mt-2 max-w-4xl text-2xl font-black leading-tight sm:text-3xl">
                      {article.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">
                      {article.summary}
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase text-muted-foreground">
                      {article.readTime} <LocalizedText messageKey="learn.minRead" />
                    </p>
                  </div>
                  <ButtonLink
                    href={localizePath(locale, `/learn/${article.slug}`)}
                    className="md:mt-7 md:self-start"
                  >
                    <LocalizedText messageKey="learn.read" />
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
