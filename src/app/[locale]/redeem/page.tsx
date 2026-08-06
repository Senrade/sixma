import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { ServiceForm } from "@/components/site/ServiceForm";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.redeem"); }
export default function RedeemPage() { return <AppShell><section className="case-grid-bg min-h-[75vh] py-12 sm:py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><LocalizedPageIntro kicker="redeem.kicker" title="redeem.title" description="redeem.intro" /><ServiceForm kind="redeem" /></div></section></AppShell>; }
