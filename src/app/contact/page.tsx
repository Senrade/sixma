import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { ServiceForm } from "@/components/site/ServiceForm";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { en } from "@/i18n/messages/en";

export const metadata: Metadata = { title: en["metadata.title.contact"] };
export default function ContactPage() { return <InfoPage eyebrow="contact.eyebrow" title="contact.title" intro="contact.intro"><h2><LocalizedText messageKey="contact.send" /></h2><ServiceForm kind="contact" /></InfoPage>; }
