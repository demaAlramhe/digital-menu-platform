"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dash } from "@/components/dashboard/ui/styles";
import { PrimaryButton } from "@/components/dashboard/ui/buttons";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { PendingSignupRow } from "@/types/db";

type SignupWithStore = PendingSignupRow & {
  store_slug: string | null;
};

type ApprovedCredentials = {
  full_name: string;
  email: string;
  password: string;
  store_slug: string;
  store_name: string;
  dashboard_url: string;
  menu_url: string;
};

type AdminSignupsTableProps = {
  signups: SignupWithStore[];
  statusFilter: "all" | "pending" | "approved" | "rejected";
};

const FILTERS = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "approved", label: "موافق عليه" },
  { value: "rejected", label: "مرفوض" },
] as const;

export function AdminSignupsTable({
  signups,
  statusFilter,
}: AdminSignupsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<ApprovedCredentials | null>(null);
  const [error, setError] = useState("");

  async function handleApprove(id: string) {
    if (!window.confirm("الموافقة على الطلب وإنشاء حساب المطعم؟")) return;

    try {
      setLoadingId(id);
      setError("");
      const response = await fetch(`/api/admin/signups/${id}/approve`, {
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        credentials?: ApprovedCredentials;
      };

      if (!response.ok || !result.credentials) {
        setError(result.error || "فشلت الموافقة على الطلب.");
        return;
      }

      setCredentials(result.credentials);
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء الموافقة.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!window.confirm("رفض هذا الطلب؟")) return;

    try {
      setLoadingId(id);
      setError("");
      const response = await fetch(`/api/admin/signups/${id}/reject`, {
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "فشل رفض الطلب.");
        return;
      }

      router.refresh();
    } catch {
      setError("حدث خطأ أثناء الرفض.");
    } finally {
      setLoadingId(null);
    }
  }

  async function copyCredentials() {
    if (!credentials) return;

    const siteUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    const text = `
مرحبا ${credentials.full_name} 👋
منيوك الرقمي جاهز!

رابط تسجيل الدخول: ${siteUrl}/auth/login
إيميل: ${credentials.email}
كلمة السر: ${credentials.password}

رابط المنيو: ${siteUrl}${credentials.menu_url}

من لوحة التحكم تقدر تضيف أصنافك وصورك وتطبع الـ QR.
أنا موجود لأي سؤال 🙏
`.trim();

    await navigator.clipboard.writeText(text);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? "/admin/signups"
              : `/admin/signups?status=${filter.value}`;
          const active = statusFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={href}
              className={active ? dash.filterChipActive : dash.filterChip}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {signups.length === 0 ? (
        <p className="text-sm text-stone-600">لا توجد طلبات.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200/80">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50/90">
              <tr>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">التاريخ</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">الاسم</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">المطعم</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">الإيميل</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">واتساب</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">الباقة</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {signups.map((signup) => {
                const waUrl = buildWhatsAppUrl(signup.whatsapp);
                const isLoading = loadingId === signup.id;

                return (
                  <tr key={signup.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {formatDate(signup.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">
                      {signup.full_name}
                    </td>
                    <td className="px-4 py-3 text-stone-800">{signup.restaurant_name}</td>
                    <td className="px-4 py-3 text-stone-700" dir="ltr">
                      {signup.email}
                    </td>
                    <td className="px-4 py-3">
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 hover:underline"
                          dir="ltr"
                        >
                          {signup.whatsapp}
                        </a>
                      ) : (
                        <span dir="ltr">{signup.whatsapp}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={signup.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={signup.status} />
                    </td>
                    <td className="px-4 py-3">
                      {signup.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(signup.id)}
                            disabled={isLoading}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isLoading ? "..." : "✓ موافقة"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(signup.id)}
                            disabled={isLoading}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {isLoading ? "..." : "✗ رفض"}
                          </button>
                        </div>
                      ) : signup.status === "approved" && signup.store_slug ? (
                        <Link
                          href={`/${signup.store_slug}`}
                          className="font-medium text-stone-800 hover:underline"
                          target="_blank"
                        >
                          /{signup.store_slug}
                        </Link>
                      ) : signup.status === "rejected" ? (
                        <span className="text-stone-500">مرفوض</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {credentials && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="credentials-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h2 id="credentials-title" className="text-lg font-bold text-stone-900">
              ✅ تم إنشاء الحساب بنجاح
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <Row label="المطعم" value={credentials.store_name} />
              <CopyRow label="الإيميل" value={credentials.email} />
              <CopyRow label="كلمة السر" value={credentials.password} />
              <CopyRow
                label="رابط المنيو"
                value={credentials.menu_url}
                display={credentials.menu_url}
              />
              <Row label="رابط الداشبورد" value={credentials.dashboard_url} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <PrimaryButton type="button" onClick={copyCredentials}>
                نسخ كل المعلومات
              </PrimaryButton>
              <button
                type="button"
                onClick={() => setCredentials(null)}
                className={dash.secondaryBtn}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-stone-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-stone-900" dir="ltr">
        {value}
      </dd>
    </div>
  );
}

function CopyRow({
  label,
  value,
  display,
}: {
  label: string;
  value: string;
  display?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <dt className="text-stone-500">{label}</dt>
        <dd className="mt-0.5 font-medium text-stone-900" dir="ltr">
          {display ?? value}
        </dd>
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
        aria-label={`نسخ ${label}`}
      >
        📋
      </button>
    </div>
  );
}

function PlanBadge({ plan }: { plan: PendingSignupRow["plan"] }) {
  const styles = {
    basic: "bg-stone-100 text-stone-700",
    pro: "bg-amber-100 text-amber-900",
    premium: "bg-purple-100 text-purple-900",
  } as const;

  const labels = {
    basic: "أساسية",
    pro: "متقدمة",
    premium: "بريميوم",
  } as const;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[plan]}`}>
      {labels[plan]}
    </span>
  );
}

function StatusBadge({ status }: { status: PendingSignupRow["status"] }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-900",
    approved: "bg-emerald-100 text-emerald-900",
    rejected: "bg-red-100 text-red-900",
  } as const;

  const labels = {
    pending: "قيد الانتظار",
    approved: "موافق",
    rejected: "مرفوض",
  } as const;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
