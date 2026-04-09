"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, FileJson, FileText } from "lucide-react";
import { getI18nServiceUrl } from "@/i18n/config";

interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
}

export default function ImportExportPage() {
  const [locales, setLocales] = useState<LocaleInfo[]>([]);
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [importLocale, setImportLocale] = useState("en");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchLocales() {
      try {
        const res = await fetch(`${getI18nServiceUrl()}/i18n/locales`);
        if (res.ok) {
          const data = (await res.json()) as LocaleInfo[];
          setLocales(data);
        }
      } catch {
        // silently fail
      }
    }
    fetchLocales();
  }, []);

  const handleExport = async (format: "json" | "arb") => {
    const url = `${getI18nServiceUrl()}/i18n/export/${selectedLocale}?format=${format}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const filename =
          format === "arb"
            ? `app_${selectedLocale}.arb`
            : `${selectedLocale}.json`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch {
      // silently fail
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch(
        `${getI18nServiceUrl()}/i18n/import/${importLocale}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (res.ok) {
        const result = (await res.json()) as { imported: number };
        setImportResult(`Successfully imported ${result.imported} translations for ${importLocale}`);
      } else {
        setImportResult("Import failed. Please check the file format.");
      }
    } catch {
      setImportResult("Import failed. Invalid JSON file.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/translations"
          className="p-2 rounded-2xl hover:bg-[#FFF5EB] dark:hover:bg-[#2A1E45] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--aivo-text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--aivo-text)]">
            Import / Export Translations
          </h1>
          <p className="text-sm text-[var(--aivo-text-secondary)]">
            Bulk import or export translation files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-6">
          <h2 className="text-lg font-bold text-[var(--aivo-text)] flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-purple-600" />
            Export
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5">
                Locale
              </label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="w-full rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] px-3 py-2 text-sm text-[var(--aivo-text)]"
              >
                {locales.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.code.toUpperCase()} — {locale.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleExport("json")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] text-sm font-medium text-[var(--aivo-text)] hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45] transition-colors"
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </button>
              <button
                onClick={() => handleExport("arb")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] text-sm font-medium text-[var(--aivo-text)] hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45] transition-colors"
              >
                <FileText className="h-4 w-4" />
                Export as ARB
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-6">
          <h2 className="text-lg font-bold text-[var(--aivo-text)] flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-teal-600" />
            Import
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--aivo-text)] mb-1.5">
                Target Locale
              </label>
              <select
                value={importLocale}
                onChange={(e) => setImportLocale(e.target.value)}
                className="w-full rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] px-3 py-2 text-sm text-[var(--aivo-text)]"
              >
                {locales.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.code.toUpperCase()} — {locale.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              <Upload className="h-8 w-8 text-[var(--aivo-text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--aivo-text-secondary)]">
                Click to upload a JSON or ARB file
              </p>
              <p className="text-xs text-[var(--aivo-text-muted)] mt-1">
                Supported formats: .json, .arb
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.arb"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />

            {importing && (
              <p className="text-sm text-[var(--aivo-text-secondary)]">Importing translations...</p>
            )}

            {importResult && (
              <div
                className={`p-3 rounded-2xl text-sm ${
                  importResult.startsWith("Successfully")
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-[#FFE0E0] dark:bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171] border border-[#FECACA] dark:border-[#991B1B]/30"
                }`}
              >
                {importResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
