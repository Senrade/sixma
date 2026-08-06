import { redirect } from "next/navigation";
import { requireLocale } from "@/i18n/params";
import { localizePath } from "@/i18n/routing";

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  redirect(localizePath(requireLocale(localeParam), "/#faq"));
}
