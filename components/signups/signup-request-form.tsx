"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  marketingCardClass,
  marketingErrorClass,
  marketingFieldErrorClass,
  marketingInputClass,
  marketingLabelClass,
  marketingLinkFocus,
  marketingPrimaryBtnClass,
  marketingSecondaryBtnClass,
} from "@/components/marketing/marketing-form-styles";
import { buildSignupConfirmationWhatsAppUrl } from "@/lib/utils/whatsapp";

type PlanId = "small" | "medium" | "large";

type EstimatedItems = "up_to_25" | "26_50" | "51_80" | "over_80";

type SignupRequestFormProps = {
  initialPlan?: string | null;
};

const PLAN_OPTIONS: { id: PlanId; label: string }[] = [
  { id: "small", label: "صغير — حتى 25 صنف" },
  { id: "medium", label: "متوسط — 26-50 صنف" },
  { id: "large", label: "كبير — 51-80 صنف" },
];

const ESTIMATED_ITEMS_OPTIONS: { value: EstimatedItems; label: string }[] = [
  { value: "up_to_25", label: "حتى 25" },
  { value: "26_50", label: "26-50" },
  { value: "51_80", label: "51-80" },
  { value: "over_80", label: "أكثر من 80" },
];

function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "small" || value === "medium" || value === "large";
}

function planToEstimatedItems(plan: PlanId): EstimatedItems {
  if (plan === "small") return "up_to_25";
  if (plan === "medium") return "26_50";
  return "51_80";
}

function labelForPlan(plan: PlanId): string {
  return PLAN_OPTIONS.find((option) => option.id === plan)?.label ?? plan;
}

function labelForEstimatedItems(value: EstimatedItems): string {
  return (
    ESTIMATED_ITEMS_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function SignupRequestForm({ initialPlan }: SignupRequestFormProps) {
  const { dict } = useLocale();

  const defaultPlan = useMemo(
    () => (isPlanId(initialPlan) ? initialPlan : "medium"),
    [initialPlan]
  );

  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [plan, setPlan] = useState<PlanId>(defaultPlan);
  const [estimatedItems, setEstimatedItems] = useState<EstimatedItems>(
    planToEstimatedItems(defaultPlan)
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const whatsappConfirmUrl = useMemo(() => {
    if (!success) return null;

    return buildSignupConfirmationWhatsAppUrl({
      full_name: fullName.trim(),
      restaurant_name: restaurantName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      plan_label: labelForPlan(plan),
      estimated_items_label: labelForEstimatedItems(estimatedItems),
      notes: notes.trim() || null,
    });
  }, [
    success,
    fullName,
    restaurantName,
    email,
    whatsapp,
    plan,
    estimatedItems,
    notes,
  ]);

  function handlePlanChange(nextPlan: PlanId) {
    setPlan(nextPlan);
    setEstimatedItems(planToEstimatedItems(nextPlan));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const nextFieldErrors: Record<string, string> = {};
    if (!fullName.trim()) nextFieldErrors.full_name = "الاسم مطلوب";
    if (!restaurantName.trim()) nextFieldErrors.restaurant_name = "اسم المطعم مطلوب";
    if (!email.trim()) nextFieldErrors.email = "الإيميل مطلوب";
    if (!whatsapp.trim()) nextFieldErrors.whatsapp = "رقم الواتساب مطلوب";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          restaurant_name: restaurantName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          plan,
          notes: notes.trim() || null,
          estimated_items: estimatedItems || null,
        }),
      });

      const result = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setError(result.error || "حدث خطأ. حاول مرة أخرى.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        data-testid="signup-success"
        className={`${marketingCardClass} text-center`}
      >
        <p className="text-3xl text-[#15803d]" aria-hidden>
          ✅
        </p>
        <h2 className="mt-3 text-xl font-bold text-brand-dark">تم استلام طلبك!</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
          سنتواصل معك خلال 24 ساعة على واتساب أو الإيميل.
        </p>

        {whatsappConfirmUrl && (
          <div className="mt-6">
            <a
              href={whatsappConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20BD5A] active:scale-[0.98] ${marketingLinkFocus}`}
            >
              <WhatsAppIcon />
              {dict.signup.whatsappConfirm}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
              {dict.signup.whatsappConfirmHint}
            </p>
          </div>
        )}

        <Link
          href="/pricing"
          className={`mt-6 ${marketingSecondaryBtnClass}`}
        >
          العودة للباقات
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={marketingCardClass}>
      <div className="space-y-5">
        <Field
          label="الاسم الكامل"
          error={fieldErrors.full_name}
          input={
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          }
        />

        <Field
          label="اسم المطعم"
          error={fieldErrors.restaurant_name}
          input={
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          }
        />

        <Field
          label="البريد الإلكتروني"
          error={fieldErrors.email}
          input={
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              disabled={loading}
              dir="ltr"
            />
          }
        />

        <Field
          label="واتساب"
          error={fieldErrors.whatsapp}
          input={
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+972501234567"
              className={inputClass}
              disabled={loading}
              dir="ltr"
            />
          }
        />

        <Field
          label="فئة الحجم"
          input={
            <select
              value={plan}
              onChange={(e) => handlePlanChange(e.target.value as PlanId)}
              className={inputClass}
              disabled={loading}
            >
              {PLAN_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        <Field
          label="ملاحظات (اختياري)"
          input={
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل إضافية..."
              rows={4}
              className={`${inputClass} resize-y`}
              disabled={loading}
            />
          }
        />

        <Field
          label="تقريباً قديش عندك صنف بالمنيو؟ (اختياري)"
          input={
            <select
              value={estimatedItems}
              onChange={(e) => setEstimatedItems(e.target.value as EstimatedItems)}
              className={inputClass}
              disabled={loading}
            >
              {ESTIMATED_ITEMS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />

        {error && (
          <p className={marketingErrorClass} role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={marketingPrimaryBtnClass}>
          {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
    </form>
  );
}

const inputClass = marketingInputClass;

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label className={marketingLabelClass}>
      {label}
      {input}
      {error && (
        <span className={marketingFieldErrorClass} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
