declare module "next-pwa" {
  import type { NextConfig } from "next";

  export type RuntimeCaching = {
    urlPattern: RegExp | ((context: { url: URL }) => boolean);
    handler: string;
    method?: string;
    options?: Record<string, unknown>;
  };

  type PWAConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCaching[];
  };

  export default function withPWA(
    config: PWAConfig
  ): (nextConfig: NextConfig) => NextConfig;
}

declare module "next-pwa/cache" {
  import type { RuntimeCaching } from "next-pwa";

  const runtimeCaching: RuntimeCaching[];
  export default runtimeCaching;
}

