/** Postgres undefined_column */
const PG_UNDEFINED_COLUMN = "42703";
/** PostgREST: column missing from schema cache (common after ALTER without reload) */
const PGRST_UNKNOWN_COLUMN = "PGRST204";

export function extractMissingColumnName(
  error: { message?: string } | null
): string | null {
  if (!error?.message) return null;
  const quoted = error.message.match(/'([^']+)'\s+column/i);
  if (quoted?.[1]) return quoted[1];
  const postgres = error.message.match(/column "([^"]+)" of relation/i);
  return postgres?.[1] ?? null;
}

export function isPostgresMissingColumnError(
  error: { message?: string; code?: string } | null,
  columnHint?: string
): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  const isMissingCode =
    error.code === PG_UNDEFINED_COLUMN || error.code === PGRST_UNKNOWN_COLUMN;

  if (isMissingCode || message.includes("could not find")) {
    if (!columnHint) return true;
    return message.includes(columnHint.toLowerCase());
  }
  if (message.includes("column") && message.includes("does not exist")) {
    if (!columnHint) return true;
    return message.includes(columnHint.toLowerCase());
  }
  return false;
}

type SupabaseLikeError = { message?: string; code?: string } | null;

/**
 * Updates `stores` while omitting columns that are not migrated yet.
 * PostgREST returns PGRST204 when a column is absent from the schema cache.
 */
export async function updateStoreOmittingMissingColumns<
  T extends Record<string, unknown>,
>(
  payload: T,
  runUpdate: (payload: T) => Promise<{
    data: unknown;
    error: SupabaseLikeError;
  }>
): Promise<{
  data: unknown;
  error: SupabaseLikeError;
  skippedColumns: string[];
}> {
  let current = { ...payload };
  const skippedColumns: string[] = [];
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await runUpdate(current);
    if (!error) {
      return { data, error: null, skippedColumns };
    }

    const missingColumn = extractMissingColumnName(error);
    const canRetry =
      missingColumn &&
      Object.prototype.hasOwnProperty.call(current, missingColumn) &&
      isPostgresMissingColumnError(error);

    if (!canRetry) {
      return { data, error, skippedColumns };
    }

    const { [missingColumn]: _removed, ...rest } = current;
    current = rest as T;
    skippedColumns.push(missingColumn);
  }

  return {
    data: null,
    error: { message: "Too many missing columns while saving store settings." },
    skippedColumns,
  };
}
