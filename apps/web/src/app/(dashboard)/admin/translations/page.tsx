"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Upload, Download, Languages } from "lucide-react";
import { getI18nServiceUrl } from "@/i18n/config";

interface CoverageLocale {
  locale: string;
  name: string;
  overall: number;
  totalTranslated: number;
  totalKeys: number;
  namespaces: Record<string, { translated: number; total: number; percentage: number }>;
}

export default function TranslationDashboardPage() {
  const t = useTranslations("dashboard");
  const [coverage, setCoverage] = useState<CoverageLocale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoverage() {
      try {
        const res = await fetch(`${getI18nServiceUrl()}/i18n/export/coverage`);
        if (res.ok) {
          const data = (await res.json()) as { coverage: CoverageLocale[] };
          setCoverage(data.coverage);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchCoverage();
  }, []);

  const namespaceKeys = coverage.length > 0
    ? Object.keys(coverage[0].namespaces)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-purple-600" />
            Translation Management
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage translations across all supported locales
          </p>
        </div>
        <Link
          href="/admin/translations/import-export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Import / Export
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Languages className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Locales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coverage.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Globe className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Namespaces</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {namespaceKeys.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coverage[0]?.totalKeys ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage heatmap */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Coverage Matrix
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Translation coverage by locale and namespace
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading coverage data...</div>
        ) : coverage.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No translation data available. Import translations to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-800">
                    Locale
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">
                    Overall
                  </th>
                  {namespaceKeys.map((ns) => (
                    <th key={ns} className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">
                      <Link
                        href={`/admin/translations/${ns}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {ns}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {coverage.map((row) => (
                  <tr key={row.locale} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                      {row.locale} — {row.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CoverageBadge percentage={row.overall} />
                    </td>
                    {namespaceKeys.map((ns) => {
                      const nsData = row.namespaces[ns];
                      return (
                        <td key={ns} className="px-4 py-3 text-center">
                          <CoverageBadge percentage={nsData?.percentage ?? 0} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Namespace links */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit by Namespace
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {namespaceKeys.map((ns) => (
            <Link
              key={ns}
              href={`/admin/translations/${ns}`}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                {ns}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverageBadge({ percentage }: { percentage: number }) {
  let colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (percentage >= 90) {
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  } else if (percentage >= 60) {
    colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  } else if (percentage >= 30) {
    colorClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {percentage}%
    </span>
  );
}
