import type { Metadata } from "next";
import { AppShell } from "@/components/site/AppShell";
import { ServiceForm } from "@/components/site/ServiceForm";

export const metadata: Metadata = { title: "Redeem Event Card" };
export default function RedeemPage() { return <AppShell><section className="case-grid-bg py-14"><div className="mx-auto max-w-lg px-4"><div className="rounded-[8px] border-2 border-ink bg-surface p-6 shadow-[7px_7px_0_0_var(--color-ink)] sm:p-8"><p className="font-mono text-xs font-black uppercase text-danger">One-time event access</p><h1 className="mt-2 text-3xl font-black">Redeem a case card</h1><p className="mt-3 leading-7 text-ink-soft">Event cards can unlock limited investigations or achievements. Secure one-time redemption requires a server-side code store and an authenticated account.</p><ServiceForm kind="redeem" /></div></div></section></AppShell>; }
