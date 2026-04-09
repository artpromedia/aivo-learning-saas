"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Brain,
  BookOpen,
  Trophy,
  ShoppingBag,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Compass,
  CreditCard,
  Languages,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { AivoLogo } from "@/components/brand/AivoLogo";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
}

const parentNav: NavItem[] = [
  { href: "/parent", labelKey: "dashboard", icon: <Home size={20} />, color: "#7C3AED" },
  { href: "/notifications", labelKey: "notifications", icon: <Bell size={20} />, color: "#38BDF8" },
  { href: "/manage", labelKey: "subscription", icon: <CreditCard size={20} />, color: "#34D399" },
  { href: "/parent/settings", labelKey: "settings", icon: <Settings size={20} />, color: "#A89BB5" },
];

const learnerNav: NavItem[] = [
  { href: "/learner", labelKey: "home", icon: <Home size={20} />, color: "#7C3AED" },
  { href: "/learner/quests", labelKey: "quests", icon: <Compass size={20} />, color: "#2DD4BF" },
  { href: "/learner/tutors", labelKey: "tutors", icon: <Bot size={20} />, color: "#38BDF8" },
  { href: "/learner/homework", labelKey: "homework", icon: <BookOpen size={20} />, color: "#FB923C" },
  { href: "/learner/shop", labelKey: "shop", icon: <ShoppingBag size={20} />, color: "#F472B6" },
  { href: "/learner/badges", labelKey: "badges", icon: <Trophy size={20} />, color: "#FBBF24" },
  { href: "/learner/profile", labelKey: "profile", icon: <User size={20} />, color: "#34D399" },
  { href: "/learner/settings", labelKey: "settings", icon: <Settings size={20} />, color: "#A89BB5" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", labelKey: "myClassrooms", icon: <Home size={20} />, color: "#7C3AED" },
  { href: "/notifications", labelKey: "notifications", icon: <Bell size={20} />, color: "#38BDF8" },
];

const districtAdminNav: NavItem[] = [
  { href: "/admin/district", labelKey: "overview", icon: <Home size={20} />, color: "#7C3AED" },
  { href: "/admin/district/teachers", labelKey: "teachers", icon: <Users size={20} />, color: "#2DD4BF" },
  { href: "/admin/district/classrooms", labelKey: "classrooms", icon: <BookOpen size={20} />, color: "#38BDF8" },
  { href: "/admin/district/integrations", labelKey: "integrations", icon: <Settings size={20} />, color: "#FB923C" },
  { href: "/admin/district/licenses", labelKey: "licenses", icon: <CreditCard size={20} />, color: "#34D399" },
  { href: "/admin/translations", labelKey: "translations", icon: <Languages size={20} />, color: "#F472B6" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLearner = pathname.startsWith("/learner");
  const isTeacher = pathname.startsWith("/teacher");
  const isAdmin = pathname.startsWith("/admin");

  let navItems = parentNav;
  if (isLearner) navItems = learnerNav;
  else if (isTeacher) navItems = teacherNav;
  else if (isAdmin) navItems = districtAdminNav;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const renderNavItem = (item: NavItem, onClick?: () => void) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/parent" &&
        item.href !== "/learner" &&
        pathname.startsWith(item.href));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
          isActive
            ? "shadow-md scale-[1.02]"
            : "hover:scale-[1.01]"
        }`}
        style={
          isActive
            ? { backgroundColor: `${item.color}15`, color: item.color }
            : { color: "var(--aivo-text-secondary)" }
        }
      >
        <span
          className={`shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${isActive ? "text-white shadow-[var(--shadow-card)]" : ""}`}
          style={isActive ? { backgroundColor: item.color } : { backgroundColor: "var(--aivo-purple-50)", color: item.color }}
        >
          {item.icon}
        </span>
        <span>{t(item.labelKey)}</span>
        {item.labelKey === "notifications" && unreadCount > 0 && (
          <span className="ml-auto flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold" style={{ backgroundColor: "#FF6B6B" }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--aivo-bg)" }}>
      <aside className="hidden lg:flex lg:flex-col lg:w-72 fixed inset-y-0 left-0 z-30 rounded-r-3xl shadow-[var(--shadow-soft)]" style={{ backgroundColor: "var(--aivo-bg-card)", borderRight: "1px solid var(--aivo-border)" }}>
        <div className="flex items-center gap-3 px-6 py-5">
          <AivoLogo size="sm" />
        </div>

        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid var(--aivo-border)" }}>
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--aivo-text)" }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--aivo-text-muted)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{ color: "var(--aivo-text-secondary)" }}
          >
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--aivo-coral-light, #FFE0E0)", color: "var(--aivo-coral)" }}>
              <LogOut size={18} />
            </span>
            {t("signOut")}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#2D1B4E]/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 rounded-r-3xl shadow-[var(--shadow-playful)] transform transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "var(--aivo-bg-card)", borderRight: "1px solid var(--aivo-border)" }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <AivoLogo size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-2xl transition-colors" style={{ color: "var(--aivo-text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        <nav className="px-4 py-3 space-y-1">
          {navItems.map((item) => renderNavItem(item, () => setSidebarOpen(false)))}
        </nav>
      </aside>

      <div className="flex-1 lg:ml-72">
        <header className="sticky top-0 z-20 px-4 lg:px-8 py-3 flex items-center justify-between backdrop-blur-md" style={{ backgroundColor: "rgba(255,251,247,0.8)", borderBottom: "1px solid var(--aivo-border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-2xl" style={{ color: "var(--aivo-text-secondary)" }}>
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link href="/notifications" className="relative p-2.5 rounded-2xl transition-all hover:scale-105" style={{ backgroundColor: "var(--aivo-purple-50)", color: "var(--aivo-purple-500)" }}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: "#FF6B6B" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
