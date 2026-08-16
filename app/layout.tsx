import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityWidget } from "@/components/accessibility/accessibility-widget";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { WhatsAppSupportButton } from "@/components/support/whatsapp-support-button";
import { getAccessibilityBootScript } from "@/lib/accessibility/boot-script";
import { getDirection } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();
  return {
    title: "Bel Afia — QR Menu for Restaurants",
    description: dict.home.subheadline,
    icons: {
      icon: "/brand/bel-afia-icon.png",
      apple: "/icons/icon-192.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, dict } = await getTranslations();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b4350" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{ __html: getAccessibilityBootScript() }}
        />
      </head>
      <body suppressHydrationWarning>
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <AccessibilityWidget />
          <WhatsAppSupportButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
