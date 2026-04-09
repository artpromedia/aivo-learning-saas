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
          <h1 className="text-2xl font-extrabold text-[var(--aivo-text)] flex items-center gap-2">
            <Globe className="h-6 w-6 text-purple-600" />
            {t("translationManagement")}
          </h1>
          <p className="mt-1 text-[var(--aivo-text-secondary)]">
            {t("translationManagementDesc")}
          </p>
        </div>
        <Link
          href="/admin/translations/import-export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          {t("importExport")}
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-900/30">
              <Languages className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--aivo-text-secondary)]">{t("localesCount")}</p>
              <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
                {coverage.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-teal-100 dark:bg-teal-900/30">
              <Globe className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--aivo-text-secondary)]">{t("namespacesCount")}</p>
              <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
                {namespaceKeys.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--aivo-text-secondary)]">{t("totalKeys")}</p>
              <p className="text-2xl font-extrabold text-[var(--aivo-text)]">
                {coverage[0]?.totalKeys ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage heatmap */}
      <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] overflow-hidden">
        <div className="p-5 border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
          <h2 className="text-lg font-bold text-[var(--aivo-text)]">
            {t("coverageMatrix")}
          </h2>
          <p className="text-sm text-[var(--aivo-text-secondary)]">
            {t("coverageMatrixDesc")}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#A89BB5]">{t("loadingCoverage")}</div>
        ) : coverage.length === 0 ? (
          <div className="p-10 text-center text-[#A89BB5]">
            {t("noTranslationData")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--aivo-bg)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--aivo-text-secondary)] sticky left-0 bg-[var(--aivo-bg)]">
                    {t("locale")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-[var(--aivo-text-secondary)]">
                    {t("overall")}
                  </th>
                  {namespaceKeys.map((ns) => (
                    <th key={ns} className="px-4 py-3 text-center font-medium text-[var(--aivo-text-secondary)]">
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
              <tbody className="divide-y divide-[#F0E6FF] dark:divide-[#3D2D5C]">
                {coverage.map((row) => (
                  <tr key={row.locale} className="hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50">
                    <td className="px-4 py-3 font-medium text-[var(--aivo-text)] sticky left-0 bg-white dark:bg-[#2A1E45]">
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
      <div className="bg-white dark:bg-[#2A1E45] rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] p-5">
        <h2 className="text-lg font-bold text-[var(--aivo-text)] mb-4">
          {t("editByNamespace")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {namespaceKeys.map((ns) => (
            <Link
              key={ns}
              href={`/admin/translations/${ns}`}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
            >
              <span className="font-medium text-[var(--aivo-text)] capitalize">
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
