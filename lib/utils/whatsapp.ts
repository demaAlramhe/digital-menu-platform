/** Digits only, international format for wa.me (no + prefix). */
export function normalizeWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("972")) {
    return digits;
  }

  // Israeli local: 0541234567 → 972541234567
  if (digits.startsWith("0") && digits.length >= 9) {
    return `972${digits.slice(1)}`;
  }

  // Israeli mobile without leading 0: 541234567 → 972541234567
  if (digits.startsWith("5") && digits.length === 9) {
    return `972${digits}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone: string, message?: string): string | null {
  const digits = normalizeWhatsAppDigits(phone);
  if (!digits) return null;

  const url = new URL(`https://wa.me/${digits}`);
  if (message?.trim()) {
    url.searchParams.set("text", message.trim());
  }

  return url.toString();
}

export type SignupConfirmationData = {
  full_name: string;
  restaurant_name: string;
  email: string;
  whatsapp: string;
  plan_label: string;
  estimated_items_label: string;
  notes: string | null;
};

export function buildSignupConfirmationMessage(data: SignupConfirmationData): string {
  return `
طلب جديد من ${data.restaurant_name} 🎉

الاسم: ${data.full_name}
الإيميل: ${data.email}
واتساب: ${data.whatsapp}
الفئة: ${data.plan_label}
حجم المنيو التقريبي: ${data.estimated_items_label}
ملاحظات: ${data.notes || "—"}
  `.trim();
}

const BUSINESS_WHATSAPP_PLACEHOLDER = "972501234567";

export function getBusinessWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP?.trim();
  if (raw) {
    const digits = normalizeWhatsAppDigits(raw);
    if (digits) return digits;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[MenuQR] NEXT_PUBLIC_BUSINESS_WHATSAPP is not set; using placeholder number."
    );
  }

  return BUSINESS_WHATSAPP_PLACEHOLDER;
}

export function buildSignupConfirmationWhatsAppUrl(
  data: SignupConfirmationData
): string | null {
  return buildWhatsAppUrl(getBusinessWhatsAppNumber(), buildSignupConfirmationMessage(data));
}

const ORDER_MESSAGES: Record<
  "ar" | "he" | "en",
  (storeName: string) => string
> = {
  ar: (storeName) => `مرحبا، بدي أطلب طلبية من ${storeName} 🍽️`,
  he: (storeName) => `שלום, אני רוצה להזמין מ${storeName} 🍽️`,
  en: (storeName) => `Hi, I'd like to place an order from ${storeName} 🍽️`,
};

export function buildWhatsAppOrderUrl(
  phone: string,
  storeName: string,
  locale: "ar" | "he" | "en"
): string | null {
  const trimmed = phone?.trim();
  if (!trimmed) return null;

  const digits = normalizeWhatsAppDigits(trimmed);
  if (!digits) return null;

  const message = ORDER_MESSAGES[locale](storeName);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function normalizePhoneForTel(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  return phone.trim().startsWith("+") ? `+${digits}` : digits;
}
