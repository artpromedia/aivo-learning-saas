"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Languages, Wand2 } from "lucide-react";
import { getI18nServiceUrl } from "@/i18n/config";

interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
}

interface TranslationRow {
  key: string;
  values: Record<string, string>;
  editing: Record<string, boolean>;
}

export default function NamespaceEditorPage() {
  const params = useParams();
  const namespace = params.namespace as string;

  const [locales, setLocales] = useState<LocaleInfo[]>([]);
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const localesRes = await fetch(`${getI18nServiceUrl()}/i18n/locales`);
      const localesData = localesRes.ok ? ((await localesRes.json()) as LocaleInfo[]) : [];
      setLocales(localesData);

      const allTranslations: Record<string, Record<string, string>> = {};
      const allKeys = new Set<string>();

      for (const locale of localesData) {
        const res = await fetch(
          `${getI18nServiceUrl()}/i18n/translations/${locale.code}/${namespace}`,
        );
        if (res.ok) {
          const data = (await res.json()) as Record<string, string>;
          allTranslations[locale.code] = data;
          for (const key of Object.keys(data)) {
            allKeys.add(key);
          }
        }
      }

      const sortedKeys = [...allKeys].sort();
      setRows(
        sortedKeys.map((key) => ({
          key,
          values: Object.fromEntries(
            localesData.map((l) => [l.code, allTranslations[l.code]?.[key] ?? ""]),
          ),
          editing: {},
        })),
      );
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (key: string, localeCode: string, value: string) => {
    setSaving(`${key}-${localeCode}`);
    try {
      await fetch(
        `${getI18nServiceUrl()}/i18n/translations/${localeCode}/${namespace}/${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value, isVerified: true }),
        },
      );

      setRows((prev) =>
        prev.map((row) =>
          row.key === key
            ? {
                ...row,
                values: { ...row.values, [localeCode]: value },
                editing: { ...row.editing, [localeCode]: false },
              }
            : row,
        ),
      );
    } finally {
      setSaving(null);
    }
  };

  const handleBulkTranslate = async (targetLocale: string) => {
    setTranslating(true);
    try {
      const untranslatedKeys = rows
        .filter((row) => !row.values[targetLocale] && row.values["en"])
        .map((row) => `${namespace}.${row.key}`);

      if (untranslatedKeys.length === 0) return;

      const res = await fetch(`${getI18nServiceUrl()}/i18n/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLocale: "en",
          targetLocale,
          keys: untranslatedKeys,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { translations: Record<string, string> };
        setRows((prev) =>
          prev.map((row) => {
            const fullKey = `${namespace}.${row.key}`;
            const translated = data.translations[fullKey];
            if (translated) {
              return {
                ...row,
                values: { ...row.values, [targetLocale]: translated },
              };
            }
            return row;
          }),
        );
      }
    } finally {
      setTranslating(false);
    }
  };

  const toggleEdit = (key: string, localeCode: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.key === key
          ? {
              ...row,
              editing: { ...row.editing, [localeCode]: !row.editing[localeCode] },
            }
          : row,
      ),
    );
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
          <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] capitalize">
            {namespace}
          </h1>
          <p className="text-sm text-[var(--aivo-text-secondary)]">
            {rows.length} translation keys
          </p>
        </div>
      </div>

      {/* Bulk translate buttons */}
      <div className="flex flex-wrap gap-2">
        {locales
          .filter((l) => l.code !== "en")
          .map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleBulkTranslate(locale.code)}
              disabled={translating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] text-sm font-medium text-[var(--aivo-text)] hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-300 transition-colors disabled:opacity-50"
            >
              <Wand2 className="h-3.5 w-3.5" />
              AI Translate → {locale.code.toUpperCase()}
            </button>
          ))}
      </div>

      {loading ? (
        <div className="p-10 text-center text-[#A89BB5]">Loading translations...</div>
      ) : (
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--aivo-bg)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--aivo-text-secondary)] sticky left-0 bg-[var(--aivo-bg)] min-w-[200px]">
                    Key
                  </th>
                  {locales.map((locale) => (
                    <th
                      key={locale.code}
                      className="px-4 py-3 text-left font-medium text-[var(--aivo-text-secondary)] min-w-[250px]"
                    >
                      {locale.code.toUpperCase()} — {locale.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6FF] dark:divide-[#3D2D5C]">
                {rows.map((row) => (
                  <tr key={row.key} className="hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--aivo-text-secondary)] sticky left-0 bg-white dark:bg-[#2A1E45]">
                      {row.key}
                    </td>
                    {locales.map((locale) => (
                      <td key={locale.code} className="px-4 py-3">
                        {row.editing[locale.code] ? (
                          <EditableCell
                            value={row.values[locale.code] ?? ""}
                            saving={saving === `${row.key}-${locale.code}`}
                            onSave={(value) => handleSave(row.key, locale.code, value)}
                            onCancel={() => toggleEdit(row.key, locale.code)}
                          />
                        ) : (
                          <button
                            onClick={() => toggleEdit(row.key, locale.code)}
                            className="text-left w-full text-[var(--aivo-text)] hover:bg-[#FFF5EB] dark:hover:bg-[#3D2D5C] rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                          >
                            {row.values[locale.code] || (
                              <span className="text-[#A89BB5] dark:text-[#7B6A94] italic">
                                untranslated
                              </span>
                            )}
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableCell({
  value: initialValue,
  saving,
  onSave,
  onCancel,
}: {
  value: string;
  saving: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
        className="flex-1 px-2 py-1 rounded border border-purple-300 dark:border-purple-600 bg-white dark:bg-[#2A1E45] text-[var(--aivo-text)] text-sm focus:ring-2 focus:ring-purple-500 outline-none"
        autoFocus
        disabled={saving}
      />
      <button
        onClick={() => onSave(value)}
        disabled={saving}
        className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
