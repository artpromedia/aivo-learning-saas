"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronRight, LogOut, Settings, User } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[];
  userName?: string;
  userAvatarUrl?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  className?: string;
}

function TopBar({
  breadcrumbs = [],
  userName = "User",
  userAvatarUrl,
  onSearch,
  onLogout,
  className = "",
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={`flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight size={14} className="text-gray-400 mx-1" />
            )}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="text-gray-500 dark:text-gray-400 hover:text-[#7C3AED] transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-56 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-shadow"
          />
        </form>

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userName}
                </p>
              </div>
              <a
                href="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <User size={16} />
                Profile
              </a>
              <a
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings size={16} />
                Settings
              </a>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { TopBar };
