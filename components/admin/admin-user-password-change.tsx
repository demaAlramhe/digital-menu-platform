"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import { dash } from "@/components/dashboard/ui/styles";

type AdminUserPasswordChangeProps = {
  userId: string;
  userLabel: string;
};

const MIN_PASSWORD_LENGTH = 8;

export function AdminUserPasswordChange({
  userId,
  userLabel,
}: AdminUserPasswordChangeProps) {
  const { dict } = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function resetForm() {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setMessage("");
    setIsSuccess(false);
  }

  function handleOpen() {
    resetForm();
    setIsOpen(true);
  }

  function handleCancel() {
    resetForm();
    setIsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!password.trim()) {
      setMessage(dict.admin.passwordRequired);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(dict.admin.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(dict.admin.passwordMismatch);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        setMessage(result.error || dict.admin.passwordUpdateFailed);
        return;
      }

      setIsSuccess(true);
      setMessage(dict.admin.passwordUpdateSuccess);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage(dict.admin.passwordUpdateError);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={handleOpen} className={dash.secondaryBtn}>
        {dict.admin.changePassword}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${dash.cardInset} mt-4 w-full max-w-md space-y-4 p-4`}
    >
      <div>
        <p className="text-sm font-medium text-stone-800">
          {dict.admin.changePassword}
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {userLabel}
        </p>
      </div>

      <label className="block">
        <span className={dash.label}>{dict.admin.newPassword}</span>
        <div className="relative mt-1.5">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={`${dash.input} pe-20`}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-brand-dark"
            disabled={loading}
          >
            {showPassword ? dict.admin.hidePassword : dict.admin.showPassword}
          </button>
        </div>
      </label>

      <label className="block">
        <span className={dash.label}>{dict.admin.confirmPassword}</span>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className={`${dash.input} mt-1.5`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />
      </label>

      {message && (
        <p
          className={`text-sm ${isSuccess ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={dash.primaryBtn} disabled={loading}>
          {loading ? dict.admin.updatingPassword : dict.admin.savePassword}
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
