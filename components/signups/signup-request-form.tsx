"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STOREFRONT_GOLD,
  STOREFRONT_GOLD_LIGHT,
} from "@/lib/storefront/premium-theme";

type PlanId = "basic" | "pro" | "premium";

type SignupRequestFormProps = {
  initialPlan?: string | null;
};

const PLAN_OPTIONS: { id: PlanId; label: string }[] = [
  { id: "basic", label: "أساسية — $299" },
  { id: "pro", label: "متقدمة — $499" },
  { id: "premium", label: "بريميوم — $799" },
];

function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "basic" || value === "pro" || value === "premium";
}

export function SignupRequestForm({ initialPlan }: SignupRequestFormProps) {
  const defaultPlan = useMemo(
    () => (isPlanId(initialPlan) ? initialPlan : "pro"),
    [initialPlan]
  );

  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [plan, setPlan] = useState<PlanId>(defaultPlan);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      <div className="rounded-2xl border border-[#C9A962]/50 bg-stone-900/70 p-6 text-center sm:p-8">
        <p className="text-3xl" aria-hidden>
          ✅
        </p>
        <h2 className="mt-3 text-xl font-bold" style={{ color: STOREFRONT_GOLD_LIGHT }}>
          تم استلام طلبك!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          سنتواصل معك خلال 24 ساعة على واتساب أو الإيميل.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#C9A962]/60 px-5 py-2.5 text-sm font-semibold text-[#f5e6c8] hover:border-[#C9A962]"
        >
          العودة للباقات
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-700 bg-stone-900/70 p-6 sm:p-8"
    >
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
          label="الباقة"
          input={
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanId)}
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

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-stone-900 transition hover:brightness-110 disabled:opacity-50"
          style={{
            background: `linear-gradient(180deg, ${STOREFRONT_GOLD} 0%, #9A7B3C 100%)`,
          }}
        >
          {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-600 bg-stone-950/80 px-3.5 py-2.5 text-[15px] text-white outline-none transition placeholder:text-stone-500 focus:border-[#C9A962] focus:ring-2 focus:ring-[#C9A962]/20";

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
    <label className="block text-sm font-medium text-white/90">
      {label}
      {input}
      {error && (
        <span className="mt-1 block text-xs text-red-400" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
