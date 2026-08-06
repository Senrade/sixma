import type { Metadata } from "next";
import type { MessageKey } from "./messages/types";
import { requireLocale } from "./params";
import { getMessages } from "./server";

export interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function getLocalizedMetadata(
  params: Promise<{ locale: string }>,
  titleKey: MessageKey,
): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const messages = await getMessages(requireLocale(localeParam));
  return { title: messages[titleKey] };
}
