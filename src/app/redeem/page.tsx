import type { Metadata } from "next";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { ServiceForm } from "@/components/site/ServiceForm";
import { en } from "@/i18n/messages/en";

export const metadata: Metadata = { title: en["metadata.title.redeem"] };
export default function RedeemPage() { return <AppShell><section className="case-grid-bg py-14"><div className="mx-auto max-w-xl px-4"><div className="cyber-panel p-6 sm:p-8"><LocalizedPageIntro kicker="redeem.kicker" title="redeem.title" description="redeem.intro" /><ServiceForm kind="redeem" /></div></div></section></AppShell>; }
