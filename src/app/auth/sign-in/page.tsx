import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/site/AppShell";
import { ServiceForm } from "@/components/site/ServiceForm";

export const metadata: Metadata = { title: "Sign In" };
export default function SignInPage() { return <AppShell><section className="case-grid-bg py-14"><div className="mx-auto max-w-md px-4"><div className="rounded-[8px] border-2 border-ink bg-surface p-6 shadow-[7px_7px_0_0_var(--color-ink)]"><p className="font-mono text-xs font-black uppercase text-danger">Account access</p><h1 className="mt-2 text-3xl font-black">Sign in</h1><p className="mt-2 text-sm text-ink-soft">Account services are the next backend milestone. The playable demo remains available without an account.</p><ServiceForm kind="sign-in" /><p className="mt-5 text-sm">New here? <Link href="/auth/sign-up" className="font-bold underline">Create an account</Link></p></div></div></section></AppShell>; }
