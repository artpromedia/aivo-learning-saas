"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Upload, Download, Languages } from "lucide-react";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Button } from "@/components/ui/Button";
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
      } finally {
        setLoading(false);
      }
    }
    fetchCoverage();
  }, []);

  const namespaceKeys = coverage.length > 0 ? Object.keys(coverage[0].namespaces) : [];

  return (
    <PageWrapper>
      <BackLink href="/admin/district">Back to District</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{t("translationManagement")}</h1>
              <p className="mt-0.5 text-white/80 text-sm">{t("translationManagementDesc")}</p>
            </div>
          </div>
          <Link href="/admin/translations/import-export">
            <Button size="sm" variant="secondary" leftIcon={<Upload size={16} />} className="bg-white/20 hover:bg-white/30 text-white">
              {t("importExport")}
            </Button>
          </Link>
        </div>
      </PurpleGradientHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <StatCard icon={<Languages size={18} />} label={t("localesCount")} value={coverage.length} color="#7C3AED" delay={100} />
        <StatCard icon={<Globe size={18} />} label={t("namespacesCount")} value={namespaceKeys.length} color="#2DD4BF" delay={200} />
        <StatCard icon={<Download size={18} />} label={t("totalKeys")} value={coverage[0]?.totalKeys ?? 0} color="#3B82F6" delay={300} />
      </div>

      <ExpandableCard
        icon={<Globe size={16} />}
        title={t("coverageMatrix")}
        subtitle={t("coverageMatrixDesc")}
        gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
        delay={400}
        infoText="This matrix shows translation coverage for each locale across all namespaces. Green indicates good coverage (90%+), yellow is moderate (60-89%), and red means low coverage."
      >
        {loading ? (
          <div className="p-10 text-center text-[#A89BB5]">{t("loadingCoverage")}</div>
        ) : coverage.length === 0 ? (
          <div className="p-10 text-center text-[#A89BB5]">{t("noTranslationData")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--aivo-bg)" }}>
                  <th className="px-4 py-3 text-left font-medium sticky left-0" style={{ color: "var(--aivo-text-secondary)", backgroundColor: "var(--aivo-bg)" }}>
                    {t("locale")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium" style={{ color: "var(--aivo-text-secondary)" }}>{t("overall")}</th>
                  {namespaceKeys.map((ns) => (
                    <th key={ns} className="px-4 py-3 text-center font-medium" style={{ color: "var(--aivo-text-secondary)" }}>
                      <Link href={`/admin/translations/${ns}`} className="hover:text-purple-600 transition-colors">{ns}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6FF] dark:divide-[#3D2D5C]">
                {coverage.map((row) => (
                  <tr key={row.locale} className="hover:bg-[var(--aivo-bg)] dark:hover:bg-[#2A1E45]/50">
                    <td className="px-4 py-3 font-medium sticky left-0 bg-white dark:bg-[#2A1E45]" style={{ color: "var(--aivo-text)" }}>
                      {row.locale} — {row.name}
                    </td>
                    <td className="px-4 py-3 text-center"><CoverageBadge percentage={row.overall} /></td>
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
      </ExpandableCard>

      <div className="mt-6">
        <ExpandableCard
          icon={<Languages size={16} />}
          title={t("editByNamespace")}
          subtitle="Click a namespace to edit its translations"
          gradient="linear-gradient(135deg, #2DD4BF, #14B8A6)"
          delay={500}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {namespaceKeys.map((ns, idx) => (
              <AnimatedCard key={ns} delay={600 + idx * 50}>
                <Link
                  href={`/admin/translations/${ns}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#E8DDF0] dark:border-[#3D2D5C] hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                >
                  <span className="font-medium capitalize" style={{ color: "var(--aivo-text)" }}>{ns}</span>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </ExpandableCard>
      </div>
    </PageWrapper>
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
