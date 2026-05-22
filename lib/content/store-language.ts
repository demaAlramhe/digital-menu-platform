import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseContentLocale,
  type ContentLocale,
} from "@/lib/content/pick-localized";

const DEFAULT_SOURCE: ContentLocale = "ar";

export async function getStoreDefaultContentLanguage(
  storeId: string
): Promise<ContentLocale> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("default_content_language")
    .eq("id", storeId)
    .maybeSingle();

  return parseContentLocale(data?.default_content_language) ?? DEFAULT_SOURCE;
}
