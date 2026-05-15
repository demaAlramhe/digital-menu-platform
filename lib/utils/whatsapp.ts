export function buildWhatsAppUrl(phone: string, message?: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const url = new URL(`https://wa.me/${digits}`);
  if (message?.trim()) {
    url.searchParams.set("text", message.trim());
  }

  return url.toString();
}

export function normalizePhoneForTel(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  return phone.trim().startsWith("+") ? `+${digits}` : digits;
}
