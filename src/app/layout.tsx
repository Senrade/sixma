import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/I18nProvider";
import { en } from "@/i18n/messages/en";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: en["metadata.siteTitle"],
    template: en["metadata.siteTitleTemplate"],
  },
  description:
    en["metadata.siteDescription"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
