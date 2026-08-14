import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Disables the Next.js dev indicator/overlay (dev-only; no production effect).
  devIndicators: false,
};

const authAndDashboardBypass = [
  {
    urlPattern: ({ url }: { url: URL }) =>
      url.origin === self.origin &&
      (url.pathname.startsWith("/dashboard") ||
        url.pathname.startsWith("/admin") ||
        url.pathname.startsWith("/auth")),
    handler: "NetworkOnly",
  },
];

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [...authAndDashboardBypass, ...runtimeCaching],
});

// PWA uses webpack plugins — skip the wrapper in dev (Turbopack ignores webpack anyway).
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : pwaConfig(nextConfig);
