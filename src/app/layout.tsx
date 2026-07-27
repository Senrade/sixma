import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veritas.Lab | Interactive media literacy",
    template: "%s | Veritas.Lab",
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
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
