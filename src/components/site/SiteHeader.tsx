"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, cn } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";

const NAVIGATION: Array<{ href: string; label: MessageKey }> = [
  { href: "/", label: "nav.home" },
  { href: "/cases", label: "nav.cases" },
  { href: "/learn", label: "nav.knowledge" },
  { href: "/dashboard", label: "nav.dashboard" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" },
];

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className={cn("inline-flex", className)}>
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (nextLocale === "vi" || nextLocale === "en") setLocale(nextLocale);
        }}
        aria-label={t("language.label")}
        className="h-10 min-w-28 cursor-pointer border-[3px] border-info bg-surface-2 px-3 text-sm font-extrabold text-foreground outline-none hover:bg-surface focus:border-accent"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-base font-black tracking-[0.08em] sm:text-lg">
          <span className="grid size-9 place-items-center border-[3px] border-info bg-info text-background shadow-[3px_3px_0_0_var(--color-accent)]">S</span>
          <span className="hidden min-[390px]:inline">SIX<span className="text-accent">MA</span></span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {NAVIGATION.map((item) => {
            const active = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-[3px] px-3 py-1.5 text-[13px] font-extrabold uppercase transition-colors",
                  active
                    ? "border-info bg-info text-info-foreground"
                    : "border-border bg-background/60 text-foreground hover:border-info hover:bg-surface-2 hover:text-info",
                )}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ButtonLink href="/redeem" tone="secondary" className="max-md:!hidden">{t("nav.redeem")}</ButtonLink>
          <ButtonLink href="/auth/sign-in" className="max-lg:!hidden">{t("nav.signIn")}</ButtonLink>
          <Button tone="ghost" className="xl:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            {menuOpen ? t("nav.close") : t("nav.menu")}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="border-t-[3px] border-border bg-surface px-4 py-3 xl:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
            {NAVIGATION.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="border-[3px] border-border bg-background px-3 py-2 text-sm font-extrabold uppercase text-foreground hover:border-info hover:bg-surface-2 hover:text-info">
                {t(item.label)}
              </Link>
            ))}
            <Link href="/redeem" onClick={() => setMenuOpen(false)} className="border-[3px] border-accent bg-accent px-3 py-2 text-sm font-extrabold uppercase text-accent-foreground">{t("nav.redeem")}</Link>
            <Link href="/auth/sign-in" onClick={() => setMenuOpen(false)} className="border-[3px] border-info bg-info px-3 py-2 text-sm font-extrabold uppercase text-info-foreground">{t("nav.signIn")}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
