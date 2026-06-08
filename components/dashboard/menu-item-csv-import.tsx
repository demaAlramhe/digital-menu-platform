"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";
import {
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
} from "@/components/dashboard/ui/buttons";
import { dash } from "@/components/dashboard/ui/styles";
import {
  generateCSVTemplate,
  parseMenuCSV,
  type CSVParseResult,
  type CSVRow,
} from "@/lib/dashboard/csv-import";
import { formatMessage } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";

type Step = "upload" | "importing" | "done";

type ImportResult = {
  imported: number;
  failed: number;
  errors: string[];
};

export function MenuItemCsvImport() {
  const { dict } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");

  function errorLabel(reason: string): string {
    const errors = dict.csvImport.errors;
    if (reason in errors) {
      return errors[reason as keyof typeof errors];
    }
    return reason;
  }

  function handleDownloadTemplate() {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "menu-import-template.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setParseResult(parseMenuCSV(text));
      setStep("upload");
    };
    reader.onerror = () => {
      setParseResult({ valid: [], errors: [{ row: 1, reason: "emptyFile" }] });
    };
    reader.readAsText(file, "UTF-8");
  }

  function resetImport() {
    setStep("upload");
    setParseResult(null);
    setImportResult(null);
    setImportError("");
    setImportProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImport() {
    if (!parseResult || parseResult.valid.length === 0) return;

    setStep("importing");
    setImportError("");
    setImportProgress({ current: 0, total: parseResult.valid.length });

    try {
      const response = await fetch("/api/menu-items/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parseResult.valid }),
      });

      const result = await response.json();

      if (!response.ok) {
        setImportError(result.error || dict.menuItems.createError);
        setStep("upload");
        return;
      }

      setImportProgress({
        current: parseResult.valid.length,
        total: parseResult.valid.length,
      });
      setImportResult({
        imported: result.imported ?? 0,
        failed: result.failed ?? 0,
        errors: result.errors ?? [],
      });
      setStep("done");
    } catch {
      setImportError(dict.menuItems.createError);
      setStep("upload");
    }
  }

  const validRows = parseResult?.valid ?? [];
  const errorRows = parseResult?.errors ?? [];

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <>
          <div className={`${dash.card} space-y-4 p-5 sm:p-6`}>
            <div className="flex flex-wrap gap-3">
              <SecondaryButton type="button" onClick={handleDownloadTemplate}>
                {dict.csvImport.downloadTemplate}
              </SecondaryButton>
            </div>

            <div>
              <label
                htmlFor="csv-import-file"
                className={`${dash.primaryBtn} inline-flex cursor-pointer`}
              >
                {dict.csvImport.uploadFile}
              </label>
              <input
                ref={fileInputRef}
                id="csv-import-file"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </div>

            {importError && (
              <p className="text-sm text-red-700">{importError}</p>
            )}
          </div>

          {parseResult && (
            <div className={`${dash.card} space-y-5 p-5 sm:p-6`}>
              <h2 className={dash.sectionTitle}>{dict.csvImport.preview}</h2>

              {validRows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-800">
                    {dict.csvImport.validRows} ({validRows.length})
                  </p>
                  <PreviewTable rows={validRows} variant="valid" dict={dict} />
                </div>
              )}

              {errorRows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-800">
                    {dict.csvImport.errorRows} ({errorRows.length})
                  </p>
                  <ul className="space-y-1 text-sm text-red-700">
                    {errorRows.map((err) => (
                      <li key={`${err.row}-${err.reason}`}>
                        {formatMessage(dict.csvImport.rowError, {
                          row: err.row,
                          reason: errorLabel(err.reason),
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <PrimaryButton
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0}
              >
                {formatMessage(dict.csvImport.importButton, {
                  count: validRows.length,
                })}
              </PrimaryButton>
            </div>
          )}
        </>
      )}

      {step === "importing" && (
        <div className={`${dash.card} p-5 sm:p-6`}>
          <p className="text-sm font-medium text-stone-800">
            {formatMessage(dict.csvImport.importingProgress, {
              current: importProgress.current,
              total: importProgress.total,
            })}
          </p>
          <p className="mt-2 text-sm text-stone-500">{dict.csvImport.importing}</p>
        </div>
      )}

      {step === "done" && importResult && (
        <div className={`${dash.card} space-y-4 p-5 sm:p-6`}>
          {importResult.imported > 0 && (
            <p className="text-sm font-medium text-emerald-800">
              ✅{" "}
              {formatMessage(dict.csvImport.success, {
                count: importResult.imported,
              })}
            </p>
          )}

          {importResult.failed > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800">
                ⚠️{" "}
                {formatMessage(dict.csvImport.failed, {
                  count: importResult.failed,
                })}
              </p>
              <ul className="space-y-1 text-sm text-stone-600">
                {importResult.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <SecondaryLink href="/dashboard/menu-items">
              {dict.csvImport.goToItems}
            </SecondaryLink>
            <SecondaryButton type="button" onClick={resetImport}>
              {dict.csvImport.importAnother}
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewTable({
  rows,
  variant,
  dict,
}: {
  rows: CSVRow[];
  variant: "valid" | "error";
  dict: Dictionary;
}) {
  const rowClass =
    variant === "valid"
      ? "border-emerald-100 bg-emerald-50/50"
      : "border-red-100 bg-red-50/50";

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200/80">
      <table className="min-w-full text-start text-sm">
        <thead>
          <tr className="border-b border-stone-200/80 bg-stone-50/80 text-xs uppercase tracking-wide text-stone-500">
            <th className="px-3 py-2 font-semibold">{dict.common.category}</th>
            <th className="px-3 py-2 font-semibold">{dict.common.name}</th>
            <th className="px-3 py-2 font-semibold">{dict.common.description}</th>
            <th className="px-3 py-2 font-semibold">{dict.common.price}</th>
            <th className="px-3 py-2 font-semibold">{dict.common.featured}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.name}-${index}`}
              className={`border-b border-stone-100 last:border-0 ${rowClass}`}
            >
              <td className="px-3 py-2 text-stone-800">
                {row.category || dict.common.uncategorized}
              </td>
              <td className="px-3 py-2 font-medium text-stone-900">{row.name}</td>
              <td className="px-3 py-2 text-stone-600">{row.description || "—"}</td>
              <td className="px-3 py-2 tabular-nums text-stone-800">
                {dict.common.currency}
                {row.price}
              </td>
              <td className="px-3 py-2 text-stone-600">
                {row.is_featured ? "✓" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
