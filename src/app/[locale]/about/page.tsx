import { InfoPage } from "@/components/site/InfoPage";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.about"); }
export default function AboutPage() { return <InfoPage eyebrow="about.eyebrow" title="about.title" intro="about.intro"><h2><LocalizedText messageKey="about.section1.title" /></h2><p><LocalizedText messageKey="about.section1.body" /></p><h2><LocalizedText messageKey="about.section2.title" /></h2><p><LocalizedText messageKey="about.section2.body" /></p><h2><LocalizedText messageKey="about.section3.title" /></h2><p><LocalizedText messageKey="about.section3.body" /></p></InfoPage>; }
