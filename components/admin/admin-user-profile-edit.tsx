"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { dash } from "@/components/dashboard/ui/styles";

type AdminUserProfileEditProps = {
  userId: string;
  initialFullName: string | null;
  initialEmail: string | null;
};

export function AdminUserProfileEdit({
  userId,
  initialFullName,
  initialEmail,
}: AdminUserProfileEditProps) {
  const router = useRouter();
  const { dict } = useLocale();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function resetForm() {
    setFullName(initialFullName ?? "");
    setEmail(initialEmail ?? "");
    setMessage("");
  }

  function handleCancel() {
    resetForm();
    setIsEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim()) {
      setMessage(dict.admin.userProfileNameRequired);
      return;
    }

    if (!email.trim()) {
      setMessage(dict.admin.userProfileEmailRequired);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        setMessage(result.error || dict.admin.userProfileUpdateFailed);
        return;
      }

      setMessage(dict.admin.userProfileUpdateSuccess);
      setIsEditing(false);
      router.refresh();
    } catch {
      setMessage(dict.admin.userProfileUpdateError);
    } finally {
      setLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsEditing(true);
        }}
        className={dash.secondaryBtn}
      >
        {dict.common.edit}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${dash.cardInset} mt-4 space-y-4 p-4`}
    >
      <p className="text-sm font-medium text-stone-800">{dict.admin.editUserProfile}</p>

      <label className="block">
        <span className={dash.label}>{dict.common.name}</span>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          className={`${dash.input} mt-1.5`}
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className={dash.label}>{dict.common.email}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={`${dash.input} mt-1.5`}
          autoComplete="email"
        />
      </label>

      {message && (
        <p
          className={`text-sm ${
            message === dict.admin.userProfileUpdateSuccess
              ? "text-emerald-700"
              : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={dash.primaryBtn} disabled={loading}>
          {loading ? dict.admin.updating : dict.common.save}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={dash.secondaryBtn}
          disabled={loading}
        >
          {dict.common.cancel}
        </button>
      </div>
    </form>
  );
}
