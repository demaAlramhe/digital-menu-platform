export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.e2e.example to .env.e2e.local and fill in test credentials.`
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function isTruthyEnv(name: string): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function uniqueTestEmail(prefix = "e2e"): string {
  const stamp = Date.now();
  return `${prefix}-${stamp}@menuqr-e2e.test`;
}

export function uniqueTestSlug(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}
