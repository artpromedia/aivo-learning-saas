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
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import / Export Translations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bulk import or export translation files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-purple-600" />
            Export
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Locale
              </label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
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
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </button>
              <button
                onClick={() => handleExport("arb")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Export as ARB
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-teal-600" />
            Import
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Target Locale
              </label>
              <select
                value={importLocale}
                onChange={(e) => setImportLocale(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
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
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload a JSON or ARB file
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
              <p className="text-sm text-gray-500">Importing translations...</p>
            )}

            {importResult && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  importResult.startsWith("Successfully")
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
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
