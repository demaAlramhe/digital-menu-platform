/**
 * Supabase clients expect the project base URL (e.g. https://xxx.supabase.co),
 * not the PostgREST path (/rest/v1). Using the REST URL causes auth errors like
 * "Invalid path specified in request URL".
 */
export function getSupabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }
}
