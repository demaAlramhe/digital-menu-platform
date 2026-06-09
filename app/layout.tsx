import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();
  return {
    title: "MenuQR — Digital Menu & QR Code for Restaurants",
    description: dict.home.subheadline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, dict } = await getTranslations();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1c1917" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <LocaleProvider locale={locale} dict={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
