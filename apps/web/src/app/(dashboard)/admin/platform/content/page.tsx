"use client";

import React, { useEffect, useState } from "react";
import { Layers, BookOpen, Brain, Puzzle, Star, BarChart3, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { PurpleGradientHeader } from "@/components/brand/PurpleGradientHeader";
import { PageWrapper, BackLink, StatCard, ExpandableCard, AnimatedCard } from "@/components/ui/PageDesign";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { hasPermission } from "@/lib/rbac";
import type { PlatformRole } from "@/lib/rbac";

interface ContentItem {
  id: string;
  title: string;
  type: "lesson" | "quest" | "assessment" | "module";
  subject: string;
  gradeRange: string;
  status: "published" | "draft" | "review";
  usageCount: number;
  avgRating: number;
  updatedAt: string;
}

interface ContentOverview {
  totalItems: number;
  publishedCount: number;
  draftCount: number;
  reviewCount: number;
  totalUsage: number;
  items: ContentItem[];
}

export default function ContentPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<ContentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const t = useTranslations("platformAdmin");

  const platformRole = (user?.platformRole ?? "super_admin") as PlatformRole;
  const canManage = hasPermission(platformRole, "platform.content.manage");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiFetch<ContentOverview>("/api/admin/platform/content");
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => (<Skeleton key={i} height={70} className="w-full rounded-3xl" />))}</div>
      </div>
    );
  }

  if (!data) return null;

  const filtered = data.items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.subject.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeIcons: Record<string, React.ReactNode> = { lesson: <BookOpen size={16} />, quest: <Puzzle size={16} />, assessment: <Brain size={16} />, module: <Layers size={16} /> };
  const typeColors: Record<string, string> = { lesson: "#3B82F6", quest: "#10B981", assessment: "#F59E0B", module: "#7C3AED" };
  const statusColors: Record<string, string> = { published: "success", draft: "secondary", review: "warning" };

  return (
    <PageWrapper>
      <BackLink href="/admin/platform">{t("backToDashboard")}</BackLink>

      <PurpleGradientHeader className="rounded-3xl mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t("contentTitle")}</h1>
            <p className="text-white/80 text-sm">{t("contentSubtitle")}</p>
          </div>
        </div>
      </PurpleGradientHeader>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={<Layers size={18} />} label={t("contentStatTotalItems")} value={data.totalItems} color="#7C3AED" delay={100} />
        <StatCard icon={<BookOpen size={18} />} label={t("contentStatPublished")} value={data.publishedCount} color="#10B981" delay={200} />
        <StatCard icon={<Brain size={18} />} label={t("contentStatInReview")} value={data.reviewCount} color="#F59E0B" delay={300} />
        <StatCard icon={<BarChart3 size={18} />} label={t("contentStatTotalUsage")} value={data.totalUsage.toLocaleString()} color="#3B82F6" delay={400} />
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--aivo-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("contentSearchPlaceholder")}
            className="w-full pl-11 pr-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 rounded-3xl border border-[#E8DDF0] bg-white text-[var(--aivo-text)] focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none text-sm"
        >
          <option value="all">{t("contentAllTypes")}</option>
          <option value="lesson">{t("contentTypeLessons")}</option>
          <option value="quest">{t("contentTypeQuests")}</option>
          <option value="assessment">{t("contentTypeAssessments")}</option>
          <option value="module">{t("contentTypeModules")}</option>
        </select>
      </div>

      <ExpandableCard
        icon={<Layers size={16} />}
        title={t("contentItemsCount", { count: filtered.length })}
        subtitle={t("contentItemsSubtitle")}
        gradient="linear-gradient(135deg, #EC4899, #DB2777)"
        delay={500}
      >
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <AnimatedCard key={item.id} delay={600 + idx * 40}>
              <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--aivo-bg)", border: "1px solid var(--aivo-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: typeColors[item.type] }}>
                  {typeIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--aivo-text)" }}>{item.title}</h3>
                    <Badge variant={statusColors[item.status] as "success" | "warning" | "secondary" ?? "default"}>{item.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{item.subject}</span>
                    <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("contentGrades", { range: item.gradeRange })}</span>
                    <span className="text-xs flex items-center gap-0.5" style={{ color: "#F59E0B" }}><Star size={10} />{item.avgRating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: "var(--aivo-text-muted)" }}>{t("contentUses", { count: item.usageCount.toLocaleString() })}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </ExpandableCard>
    </PageWrapper>
  );
}
