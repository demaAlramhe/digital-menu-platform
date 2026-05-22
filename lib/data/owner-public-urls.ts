import "server-only";

import {
  buildPublicEntryUrl,
  buildPublicMenuUrl,
} from "@/lib/utils/public-menu-url";

export async function getOwnerPublicUrls(storeSlug: string) {
  const [entryUrl, menuUrl] = await Promise.all([
    buildPublicEntryUrl(storeSlug),
    buildPublicMenuUrl(storeSlug),
  ]);

  return { entryUrl, menuUrl };
}
