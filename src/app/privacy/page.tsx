import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { en } from "@/i18n/messages/en";

export const metadata: Metadata = { title: en["metadata.title.privacy"] };
export default function PrivacyPage() { return <InfoPage eyebrow="privacy.eyebrow" title="privacy.title" intro="privacy.intro"><h2><LocalizedText messageKey="privacy.section1.title" /></h2><p><LocalizedText messageKey="privacy.section1.body" /></p><h2><LocalizedText messageKey="privacy.section2.title" /></h2><p><LocalizedText messageKey="privacy.section2.body" /></p><h2><LocalizedText messageKey="privacy.section3.title" /></h2><p><LocalizedText messageKey="privacy.section3.body" /></p><h2><LocalizedText messageKey="privacy.section4.title" /></h2><p><LocalizedText messageKey="privacy.section4.body" /></p></InfoPage>; }
