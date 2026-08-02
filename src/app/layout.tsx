import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SIXMA | Interactive media literacy",
    template: "%s | SIXMA",
  },
  description:
    "Playable investigations that teach students and families to identify manipulated images, coercive rhetoric, and phishing patterns.",
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
