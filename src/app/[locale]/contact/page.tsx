import { InfoPage } from "@/components/site/InfoPage";
import { ServiceForm } from "@/components/site/ServiceForm";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.contact"); }
export default function ContactPage() { return <InfoPage eyebrow="contact.eyebrow" title="contact.title" intro="contact.intro"><h2><LocalizedText messageKey="contact.send" /></h2><ServiceForm kind="contact" /></InfoPage>; }
