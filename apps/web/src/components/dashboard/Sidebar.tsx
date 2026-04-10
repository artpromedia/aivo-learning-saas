"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { AivoLogo } from "../brand/AivoLogo";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  navItems?: SidebarNavItem[];
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  activePath?: string;
  onLogout?: () => void;
  className?: string;
}

const defaultNavItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Courses", href: "/dashboard/courses", icon: <BookOpen size={20} /> },
  { label: "Achievements", href: "/dashboard/achievements", icon: <Trophy size={20} /> },
  { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 size={20} /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
];

function Sidebar({
  navItems = defaultNavItems,
  userName = "User",
  userEmail,
  userAvatarUrl,
  activePath = "/dashboard",
  onLogout,
  className = "",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#E8DDF0] dark:border-[#3D2D5C]">
        {!collapsed && <AivoLogo size="sm" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-md text-[var(--aivo-text-muted)] hover:text-[var(--aivo-text-secondary)] dark:hover:text-[#A89BB5] hover:bg-[#FFF5EB] dark:hover:bg-[#2A1E45] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors
                ${isActive
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#7C4DFF]/20 dark:text-[#7C4DFF]"
                  : "text-[var(--aivo-text)] dark:text-[#A89BB5] hover:bg-[#FFF5EB] dark:hover:bg-[#2A1E45]"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-[#7C3AED] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#E8DDF0] dark:border-[#3D2D5C]">
        <div className="flex items-center gap-3 px-3 py-2">
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--aivo-text)]  truncate">
                {userName}
              </p>
              {userEmail && (
                <p className="text-xs text-[var(--aivo-text-secondary)] dark:text-[var(--aivo-text-muted)] truncate">
                  {userEmail}
                </p>
              )}
            </div>
          )}
          {!collapsed && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-[var(--aivo-text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-2xl bg-white dark:bg-[#2A1E45] shadow-md border border-[#E8DDF0] dark:border-[#3D2D5C]"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-[var(--aivo-text)] dark:text-[#A89BB5]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64
          bg-white dark:bg-[#2A1E45] border-r border-[#E8DDF0] dark:border-[#3D2D5C]
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--aivo-text-muted)] hover:text-[var(--aivo-text-secondary)] dark:hover:text-[#A89BB5]"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col shrink-0
          ${collapsed ? "w-[72px]" : "w-64"}
          h-screen bg-white dark:bg-[#2A1E45]
          border-r border-[#E8DDF0] dark:border-[#3D2D5C]
          transition-[width] duration-200 ease-in-out
          ${className}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export { Sidebar };
