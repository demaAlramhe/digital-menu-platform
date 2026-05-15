import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuQR — Digital Menu & QR Code for Restaurants",
  description:
    "Create a digital menu in minutes. Share a QR code on every table. No app needed. Update your menu anytime from one simple dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
