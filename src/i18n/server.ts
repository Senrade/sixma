import "server-only";

import type { Messages } from "./messages/types";
import { loadLocale, type Locale } from "./registry";

export async function getMessages(locale: Locale): Promise<Messages> {
  const [english, localized] = await Promise.all([
    loadLocale("en"),
    loadLocale(locale),
  ]);
  return { ...english.messages, ...localized.messages } as Messages;
}
