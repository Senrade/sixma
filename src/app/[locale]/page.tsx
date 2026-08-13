import { HomeContent } from "@/components/home/HomeContent";
import { requireLocale } from "@/i18n/params";
import { getCases } from "@/lib/cases";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const cases = await getCases(requireLocale(localeParam));
  return <HomeContent cases={cases} />;
}
