"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, cn } from "@/components/ui/Primitives";
import { ThemeToggle } from "./ThemeToggle";

const NAVIGATION = [
  { href: "/cases", label: "Case hub" },
  { href: "/learn", label: "Knowledge" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-black">
          <span className="grid h-9 w-9 place-items-center rounded-[6px] border-2 border-ink bg-accent shadow-[3px_3px_0_0_var(--color-ink)]">V</span>
          <span className="hidden min-[430px]:inline">Veritas<span className="text-danger">.Lab</span></span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAVIGATION.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[4px] border-2 border-transparent px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink",
                  active && "border-ink bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/redeem" tone="secondary" className="max-sm:!hidden">Redeem</ButtonLink>
          <ButtonLink href="/auth/sign-in" className="max-sm:!hidden">Sign in</ButtonLink>
          <Button tone="ghost" className="lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
            Menu
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t-2 border-ink bg-surface px-4 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
            {NAVIGATION.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-[4px] border-2 border-ink bg-background px-3 py-2 font-semibold shadow-[2px_2px_0_0_var(--color-ink)]">
                {item.label}
              </Link>
            ))}
            <Link href="/redeem" onClick={() => setMenuOpen(false)} className="rounded-[4px] border-2 border-ink bg-background px-3 py-2 font-semibold shadow-[2px_2px_0_0_var(--color-ink)]">Redeem event card</Link>
            <Link href="/auth/sign-in" onClick={() => setMenuOpen(false)} className="rounded-[4px] border-2 border-ink bg-ink px-3 py-2 font-semibold text-background shadow-[2px_2px_0_0_var(--color-ink)]">Sign in</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
