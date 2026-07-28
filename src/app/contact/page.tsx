import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { ServiceForm } from "@/components/site/ServiceForm";

export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() { return <InfoPage eyebrow="Project contact" title="Contact the team" intro="Questions, classroom feedback, and partnership ideas help shape the next version."><h2>Send a message</h2><ServiceForm kind="contact" /></InfoPage>; }
