"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function AdminCreateStoreForm() {
  const { dict } = useLocale();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !storeName.trim() ||
      !storeSlug.trim() ||
      !ownerEmail.trim() ||
      !ownerPassword.trim() ||
      !ownerFullName.trim()
    ) {
      setMessage(dict.admin.createRequired);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName: storeName.trim(),
          storeSlug: normalizeSlug(storeSlug),
          ownerEmail: ownerEmail.trim(),
          ownerPassword,
          ownerFullName: ownerFullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || dict.admin.createFailed);
        return;
      }

      setMessage(dict.admin.createSuccess);

      setStoreName("");
      setStoreSlug("");
      setOwnerEmail("");
      setOwnerPassword("");
      setOwnerFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
    } catch {
      setMessage(dict.admin.createError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div>
        <label className="mb-1 block font-medium">{dict.common.name}</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.storeName}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.common.slug}</label>
        <input
          type="text"
          value={storeSlug}
          onChange={(e) => setStoreSlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.storeSlug}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.admin.ownerFullName}</label>
        <input
          type="text"
          value={ownerFullName}
          onChange={(e) => setOwnerFullName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.ownerName}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.admin.ownerEmail}</label>
        <input
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.ownerEmail}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.admin.ownerPassword}</label>
        <input
          type="password"
          value={ownerPassword}
          onChange={(e) => setOwnerPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.password}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.common.phone}</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.storePhone}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.common.email}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={dict.admin.placeholders.storeEmail}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">{dict.common.address}</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          rows={3}
          placeholder={dict.admin.placeholders.storeAddress}
        />
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? dict.admin.creating : dict.admin.createStore}
      </button>
    </form>
  );
}
