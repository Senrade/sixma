import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocaleOptions, isLocale, LOCALES, SUPPORTED_LOCALES } from "@/i18n/registry";
import { getMessages } from "@/i18n/server";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return {
    title: {
      default: messages["metadata.siteTitle"],
      template: messages["metadata.siteTitleTemplate"],
    },
    description: messages["metadata.siteDescription"],
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);

  return (
    <html
      lang={LOCALES[locale].htmlLang}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider
          initialLocale={locale}
          localeOptions={getLocaleOptions()}
          messages={messages}
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
