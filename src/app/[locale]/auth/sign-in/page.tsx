import Link from "next/link";
import { AppShell } from "@/components/site/AppShell";
import { ServiceForm } from "@/components/site/ServiceForm";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";
import { requireLocale } from "@/i18n/params";
import { localizePath } from "@/i18n/routing";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.signIn"); }
export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: localeParam } = await params; const locale = requireLocale(localeParam); return <AppShell><section className="case-grid-bg py-14"><div className="mx-auto max-w-md px-4"><div className="rounded-[8px] border-2 border-ink bg-surface p-6 shadow-[7px_7px_0_0_var(--color-ink)]"><p className="font-mono text-xs font-black uppercase text-danger"><LocalizedText messageKey="auth.eyebrow" /></p><h1 className="mt-2 text-3xl font-black"><LocalizedText messageKey="auth.signIn.title" /></h1><p className="mt-2 text-sm text-ink-soft"><LocalizedText messageKey="auth.signIn.intro" /></p><ServiceForm kind="sign-in" /><p className="mt-5 text-sm"><LocalizedText messageKey="auth.signIn.prompt" />{" "}<Link href={localizePath(locale, "/auth/sign-up")} className="font-bold underline"><LocalizedText messageKey="auth.signIn.link" /></Link></p></div></div></section></AppShell>; }
