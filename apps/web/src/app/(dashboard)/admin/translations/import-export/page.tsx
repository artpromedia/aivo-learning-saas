"use client";

import React, { useEffect, useState, useRef } from "react";
import { Upload, Download, FileJson, FileText } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, ExpandableCard } from "@/components/ui/PageDesign";
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
        const filename = format === "arb" ? `app_${selectedLocale}.arb` : `${selectedLocale}.json`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch {
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch(`${getI18nServiceUrl()}/i18n/import/${importLocale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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

  const selectClass = "w-full rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] bg-white dark:bg-[#2A1E45] px-3 py-2 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none";

  return (
    <PageWrapper>
      <BackLink href="/admin/translations">Back to Translations</BackLink>

      <PurpleGradientHeader className="rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Upload size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Import / Export Translations</h1>
            <p className="mt-0.5 text-white/80 text-sm">Bulk import or export translation files</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpandableCard
          icon={<Download size={16} />}
          title="Export"
          subtitle="Download translations in JSON or ARB format"
          gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
          delay={100}
          infoText="Export all translations for a specific locale. JSON format works with most i18n libraries. ARB format is used by Flutter."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--aivo-text)" }}>Locale</label>
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className={selectClass}
                style={{ color: "var(--aivo-text)" }}
              >
                {locales.map((locale) => (
                  <option key={locale.code} value={locale.code}>{locale.code.toUpperCase()} — {locale.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport("json")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] text-sm font-medium hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45] transition-colors"
                style={{ color: "var(--aivo-text)" }}
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </button>
              <button
                onClick={() => handleExport("arb")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] text-sm font-medium hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45] transition-colors"
                style={{ color: "var(--aivo-text)" }}
              >
                <FileText className="h-4 w-4" />
                Export as ARB
              </button>
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          icon={<Upload size={16} />}
          title="Import"
          subtitle="Upload a JSON or ARB file to import translations"
          gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
          delay={200}
          infoText="Import translations from a JSON or ARB file. This will merge with existing translations — it won't delete any existing keys."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--aivo-text)" }}>Target Locale</label>
              <select
                value={importLocale}
                onChange={(e) => setImportLocale(e.target.value)}
                className={selectClass}
                style={{ color: "var(--aivo-text)" }}
              >
                {locales.map((locale) => (
                  <option key={locale.code} value={locale.code}>{locale.code.toUpperCase()} — {locale.name}</option>
                ))}
              </select>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E8DDF0] dark:border-[#3D2D5C] rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--aivo-text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>Click to upload a JSON or ARB file</p>
              <p className="text-xs mt-1" style={{ color: "var(--aivo-text-muted)" }}>Supported formats: .json, .arb</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.arb"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImport(file); }}
            />
            {importing && <p className="text-sm" style={{ color: "var(--aivo-text-secondary)" }}>Importing translations...</p>}
            {importResult && (
              <div className={`p-3 rounded-2xl text-sm ${
                importResult.startsWith("Successfully")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-[#FFE0E0] dark:bg-[#991B1B]/10 text-[#991B1B] dark:text-[#F87171] border border-[#FECACA] dark:border-[#991B1B]/30"
              }`}>
                {importResult}
              </div>
            )}
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
  );
}
