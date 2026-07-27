import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/site/AppShell";
import { ServiceForm } from "@/components/site/ServiceForm";

export const metadata: Metadata = { title: "Create Account" };
export default function SignUpPage() { return <AppShell><section className="case-grid-bg py-14"><div className="mx-auto max-w-md px-4"><div className="rounded-[8px] border-2 border-ink bg-surface p-6 shadow-[7px_7px_0_0_var(--color-ink)]"><p className="font-mono text-xs font-black uppercase text-danger">Account access</p><h1 className="mt-2 text-3xl font-black">Create account</h1><p className="mt-2 text-sm text-ink-soft">This interface is ready for a secure provider, but this static MVP does not collect account data.</p><ServiceForm kind="sign-up" /><p className="mt-5 text-sm">Already registered? <Link href="/auth/sign-in" className="font-bold underline">Sign in</Link></p></div></div></section></AppShell>; }
