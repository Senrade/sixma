import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { en } from "@/i18n/messages/en";

export const metadata: Metadata = { title: en["metadata.title.about"] };
export default function AboutPage() { return <InfoPage eyebrow="about.eyebrow" title="about.title" intro="about.intro"><h2><LocalizedText messageKey="about.section1.title" /></h2><p><LocalizedText messageKey="about.section1.body" /></p><h2><LocalizedText messageKey="about.section2.title" /></h2><p><LocalizedText messageKey="about.section2.body" /></p><h2><LocalizedText messageKey="about.section3.title" /></h2><p><LocalizedText messageKey="about.section3.body" /></p></InfoPage>; }
