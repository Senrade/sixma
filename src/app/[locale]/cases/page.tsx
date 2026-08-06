import { CaseHubClient } from "@/components/cases/CaseHubClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { getCases } from "@/lib/cases";
import { requireLocale } from "@/i18n/params";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.caseHub"); }

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const cases = await getCases(requireLocale(localeParam));
  return (
    <AppShell>
      <section className="case-grid-bg min-h-[70vh] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <LocalizedPageIntro kicker="cases.kicker" title="cases.title" description="cases.intro" />
          <CaseHubClient cases={cases} />
        </div>
      </section>
    </AppShell>
  );
}
