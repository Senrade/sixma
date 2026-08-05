import { InfoPage } from "@/components/site/InfoPage";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.terms"); }
export default function TermsPage() { return <InfoPage eyebrow="terms.eyebrow" title="terms.title" intro="terms.intro"><h2><LocalizedText messageKey="terms.section1.title" /></h2><p><LocalizedText messageKey="terms.section1.body" /></p><h2><LocalizedText messageKey="terms.section2.title" /></h2><p><LocalizedText messageKey="terms.section2.body" /></p><h2><LocalizedText messageKey="terms.section3.title" /></h2><p><LocalizedText messageKey="terms.section3.body" /></p><h2><LocalizedText messageKey="terms.section4.title" /></h2><p><LocalizedText messageKey="terms.section4.body" /></p></InfoPage>; }
