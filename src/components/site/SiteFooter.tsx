"use client";

import Link from "next/link";
import { Chip } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";
import { LanguageSwitch } from "./SiteHeader";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-20 border-t-[3px] border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-black tracking-[0.08em]">SIX<span className="text-accent">MA</span></p>
          <p className="mt-3 max-w-md text-sm text-ink-soft">{t("footer.tagline")}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Chip tone="amber">{t("footer.prototype")}</Chip><Chip>{t("footer.independent")}</Chip></div>
          <LanguageSwitch className="mt-5" />
        </div>
        <FooterColumn title={t("footer.explore")} links={[["/cases", "nav.cases"], ["/learn", "nav.knowledge"], ["/achievements", "footer.achievements"], ["/redeem", "footer.eventAccess"]]} />
        <FooterColumn title={t("footer.project")} links={[["/about", "nav.about"], ["/#faq", "footer.faq"], ["/contact", "nav.contact"], ["/privacy", "footer.privacy"], ["/terms", "footer.terms"]]} />
      </div>
      <p className="border-t-[3px] border-border px-4 py-4 text-center text-xs text-ink-soft">{t("footer.disclaimer")}</p>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, MessageKey]> }) {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map(([href, label]) => <li key={href}><Link href={href} className="text-ink-soft underline-offset-4 hover:text-info hover:underline">{t(label)}</Link></li>)}
      </ul>
    </div>
  );
}
