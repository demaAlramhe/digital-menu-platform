"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { dash } from "@/components/dashboard/ui/styles";
import { PrimaryButton, SecondaryButton } from "@/components/dashboard/ui/buttons";
import type { Tables } from "@/types/db";

type Integration = Tables<"system_integrations">;

type SystemIntegrationsTableProps = {
  integrations: Integration[];
};

type FormState = {
  name: string;
  category: Integration["category"];
  status: Integration["status"];
  expires_at: string;
  renewal_url: string;
  notes: string;
};

const CATEGORIES = [
  { value: "hosting", label: "استضافة" },
  { value: "database", label: "قاعدة بيانات" },
  { value: "email", label: "بريد" },
  { value: "ai", label: "ذكاء اصطناعي" },
  { value: "security", label: "أمان" },
  { value: "other", label: "أخرى" },
] as const;

const STATUSES = [
  { value: "active", label: "نشط" },
  { value: "expiring_soon", label: "ينتهي قريباً" },
  { value: "expired", label: "منتهي" },
  { value: "inactive", label: "غير نشط" },
] as const;

const EMPTY_FORM: FormState = {
  name: "",
  category: "other",
  status: "active",
  expires_at: "",
  renewal_url: "",
  notes: "",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function SystemIntegrationsTable({
  integrations,
}: SystemIntegrationsTableProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function openEdit(row: Integration) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      category: row.category,
      status: row.status,
      expires_at: toDatetimeLocalValue(row.expires_at),
      renewal_url: row.renewal_url ?? "",
      notes: row.notes ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      status: form.status,
      expires_at: form.expires_at || null,
      renewal_url: form.renewal_url.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/system-integrations/${editingId}`
          : "/api/admin/system-integrations",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "فشل حفظ الخدمة.");
        return;
      }

      closeForm();
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`حذف الخدمة «${name}»؟`)) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/system-integrations/${id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "فشل حذف الخدمة.");
        return;
      }

      if (editingId === id) closeForm();
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء الحذف.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={dash.sectionDesc}>
          تتبّع تواريخ انتهاء الاشتراكات والخدمات المرتبطة بالمنصة.
        </p>
        <PrimaryButton type="button" onClick={openCreate} disabled={loading}>
          إضافة خدمة
        </PrimaryButton>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className={`${dash.cardInset} space-y-3 p-4`}
        >
          <h3 className="text-sm font-semibold text-brand-dark">
            {editingId ? "تعديل خدمة" : "خدمة جديدة"}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={dash.label} htmlFor="integration-name">
                الاسم
              </label>
              <input
                id="integration-name"
                className={dash.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={dash.label} htmlFor="integration-category">
                الفئة
              </label>
              <select
                id="integration-category"
                className={dash.select}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as FormState["category"],
                  }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={dash.label} htmlFor="integration-status">
                الحالة
              </label>
              <select
                id="integration-status"
                className={dash.select}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as FormState["status"],
                  }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={dash.label} htmlFor="integration-expires">
                تاريخ الانتهاء
              </label>
              <input
                id="integration-expires"
                type="datetime-local"
                className={dash.input}
                value={form.expires_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expires_at: e.target.value }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={dash.label} htmlFor="integration-url">
                رابط التجديد
              </label>
              <input
                id="integration-url"
                type="url"
                dir="ltr"
                className={dash.input}
                value={form.renewal_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, renewal_url: e.target.value }))
                }
                placeholder="https://"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={dash.label} htmlFor="integration-notes">
                ملاحظات
              </label>
              <textarea
                id="integration-notes"
                className={dash.input}
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "..." : editingId ? "حفظ التعديل" : "إنشاء"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={closeForm} disabled={loading}>
              إلغاء
            </SecondaryButton>
          </div>
        </form>
      )}

      {integrations.length === 0 ? (
        <p className="text-sm text-stone-600">لا توجد خدمات مربوطة بعد.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200/80">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50/90">
              <tr>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  الاسم
                </th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  الفئة
                </th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  الانتهاء
                </th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  التجديد
                </th>
                <th className="px-4 py-3 text-start font-semibold text-stone-700">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {integrations.map((row) => {
                const tone = resolveExpiryTone(row);
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{row.name}</div>
                      {row.notes ? (
                        <div className="mt-0.5 text-xs text-stone-500">
                          {row.notes}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {categoryLabel(row.category)}
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryPill tone={tone} status={row.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {row.expires_at ? formatDate(row.expires_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.renewal_url ? (
                        <a
                          href={row.renewal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 hover:underline"
                          dir="ltr"
                        >
                          فتح
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          disabled={loading}
                          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id, row.name)}
                          disabled={loading}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type ExpiryTone = "red" | "yellow" | "green";

function resolveExpiryTone(row: Integration): ExpiryTone {
  const now = Date.now();
  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : null;

  if (row.status === "expired" || (expiresAt !== null && expiresAt < now)) {
    return "red";
  }

  if (expiresAt !== null && expiresAt - now <= THIRTY_DAYS_MS) {
    return "yellow";
  }

  return "green";
}

function ExpiryPill({
  tone,
  status,
}: {
  tone: ExpiryTone;
  status: string;
}) {
  const styles = {
    red: "bg-red-100 text-red-900",
    yellow: "bg-yellow-100 text-yellow-900",
    green: "bg-emerald-100 text-emerald-900",
  } as const;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function toDatetimeLocalValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
