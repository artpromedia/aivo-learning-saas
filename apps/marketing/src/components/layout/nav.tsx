"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Brain,
  Users,
  Gamepad2,
  FileCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { events } from "@/lib/analytics";
import { useScrollPosition } from "@/hooks/use-scroll-position";

// ─── Navigation Data ────────────────────────────────────────────────────────────

const productFeatures = [
  {
    title: "Brain Clone AI",
    description: "Unique learning profile for every student",
    href: "/product/brain-clone",
    icon: Brain,
  },
  {
    title: "AI Tutors",
    description: "5 specialized tutors for every subject",
    href: "/product/ai-tutors",
    icon: Users,
  },
  {
    title: "Gamification",
    description: "Points, badges & streaks that motivate",
    href: "/product/gamification",
    icon: Gamepad2,
  },
  {
    title: "IEP Integration",
    description: "Automatic goal tracking & reporting",
    href: "/product/iep-integration",
    icon: FileCheck,
  },
] as const;

const solutionsItems = [
  {
    label: "For Teachers",
    href: "/solutions/teachers",
    description: "Classroom tools and insights",
  },
  {
    label: "For Parents",
    href: "/solutions/parents",
    description: "Monitor and support learning",
  },
  {
    label: "For Districts",
    href: "/solutions/districts",
    description: "Enterprise deployment & analytics",
  },
] as const;

const resourcesItems = [
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "FAQ", href: "/faq" },
  { label: "Help Center", href: "/help" },
] as const;

type DropdownId = "product" | "solutions" | "resources";

const dropdownAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.15 },
};

// ─── Nav Component ──────────────────────────────────────────────────────────────

export function Nav() {
  const pathname = usePathname();
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const shrunk = scrollY > 50;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownId | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const openDropdown = useCallback((id: DropdownId) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(id);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleTriggerKeyDown = useCallback(
    (id: DropdownId) => (e: ReactKeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveDropdown((prev) => (prev === id ? null : id));
      }
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    },
    [],
  );

  const handleDropdownKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        const trigger = navRef.current?.querySelector(
          `[data-dropdown-trigger="${activeDropdown}"]`,
        ) as HTMLElement | null;
        trigger?.focus();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(
          (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
            '[role="menuitem"]',
          ),
        );
        const idx = items.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === "ArrowDown"
            ? Math.min(idx + 1, items.length - 1)
            : Math.max(idx - 1, 0);
        items[next]?.focus();
      }
    },
    [activeDropdown],
  );

  const isActive = (href: string) => pathname === href;

  return (
    <header
      ref={navRef}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 shadow-nav-scrolled backdrop-blur-md"
          : "bg-white shadow-nav",
      )}
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            shrunk ? "h-16" : "h-20",
          )}
        >
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link href="/" className="shrink-0">
            <img
              src="/logos/aivo-logo-horizontal-purple.svg"
              alt="AIVO Learning"
              width={120}
              height={40}
              className={cn(
                "w-auto transition-all duration-300",
                shrunk ? "h-8" : "h-10",
              )}
            />
          </Link>

          {/* ── Desktop Centre Links ─────────────────────────────────── */}
          <div className="hidden items-center gap-1 lg:flex">
            {/* Product mega-dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("product")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-navy-700 hover:bg-primary-50 hover:text-primary-600",
                  activeDropdown === "product" &&
                    "bg-primary-50 text-primary-600",
                )}
                aria-expanded={activeDropdown === "product"}
                aria-haspopup="true"
                data-dropdown-trigger="product"
                onKeyDown={handleTriggerKeyDown("product")}
              >
                Product
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    activeDropdown === "product" && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === "product" && (
                  <motion.div
                    {...dropdownAnim}
                    className="absolute left-1/2 top-full pt-2 -translate-x-1/2"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    role="menu"
                    aria-label="Product features"
                    onKeyDown={handleDropdownKeyDown}
                  >
                    <div className="w-[640px] rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
                      <div className="grid grid-cols-2 gap-4">
                        {productFeatures.map((f) => (
                          <Link
                            key={f.href}
                            href={f.href}
                            role="menuitem"
                            tabIndex={0}
                            className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-primary-50"
                            aria-current={
                              isActive(f.href) ? "page" : undefined
                            }
                          >
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200">
                              <f.icon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-navy-800">
                                {f.title}
                              </div>
                              <div className="mt-0.5 text-xs text-navy-500">
                                {f.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("solutions")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-navy-700 hover:bg-primary-50 hover:text-primary-600",
                  activeDropdown === "solutions" &&
                    "bg-primary-50 text-primary-600",
                )}
                aria-expanded={activeDropdown === "solutions"}
                aria-haspopup="true"
                data-dropdown-trigger="solutions"
                onKeyDown={handleTriggerKeyDown("solutions")}
              >
                Solutions
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    activeDropdown === "solutions" && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === "solutions" && (
                  <motion.div
                    {...dropdownAnim}
                    className="absolute left-1/2 top-full pt-2 -translate-x-1/2"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    role="menu"
                    aria-label="Solutions"
                    onKeyDown={handleDropdownKeyDown}
                  >
                    <div className="w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                      {solutionsItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          tabIndex={0}
                          className="block px-4 py-2.5 transition-colors hover:bg-primary-50"
                          aria-current={
                            isActive(item.href) ? "page" : undefined
                          }
                        >
                          <div className="text-sm font-medium text-navy-800">
                            {item.label}
                          </div>
                          <div className="text-xs text-navy-500">
                            {item.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-navy-700 hover:bg-primary-50 hover:text-primary-600",
                isActive("/pricing") && "text-primary-600",
              )}
              aria-current={isActive("/pricing") ? "page" : undefined}
            >
              Pricing
            </Link>

            {/* Resources dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("resources")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-navy-700 hover:bg-primary-50 hover:text-primary-600",
                  activeDropdown === "resources" &&
                    "bg-primary-50 text-primary-600",
                )}
                aria-expanded={activeDropdown === "resources"}
                aria-haspopup="true"
                data-dropdown-trigger="resources"
                onKeyDown={handleTriggerKeyDown("resources")}
              >
                Resources
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    activeDropdown === "resources" && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === "resources" && (
                  <motion.div
                    {...dropdownAnim}
                    className="absolute right-0 top-full pt-2"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    role="menu"
                    aria-label="Resources"
                    onKeyDown={handleDropdownKeyDown}
                  >
                    <div className="w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                      {resourcesItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          tabIndex={0}
                          className="block px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          aria-current={
                            isActive(item.href) ? "page" : undefined
                          }
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Desktop Right CTAs ───────────────────────────────────── */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-navy-700 transition-colors hover:text-primary-600"
            >
              Login
            </Link>
            <Link
              href="/demo"
              data-testid="nav-cta-demo"
              onClick={() => events.demoRequest()}
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Book a Demo
            </Link>
            <Link
              href="/get-started"
              data-testid="nav-cta-signup"
              onClick={() => events.signupClick("nav")}
              className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
            >
              Get Started Free
            </Link>
          </div>

          {/* ── Mobile Hamburger ─────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-navy-800 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-0 top-16 z-40 overflow-y-auto bg-white lg:hidden"
          >
            <nav className="space-y-1 px-4 py-6" aria-label="Mobile">
              {/* Product */}
              <MobileAccordion
                title="Product"
                open={mobileAccordion === "product"}
                onToggle={() =>
                  setMobileAccordion((v) =>
                    v === "product" ? null : "product",
                  )
                }
              >
                {productFeatures.map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy-600 hover:text-primary-600"
                    aria-current={isActive(f.href) ? "page" : undefined}
                  >
                    {f.title}
                  </Link>
                ))}
              </MobileAccordion>

              {/* Solutions */}
              <MobileAccordion
                title="Solutions"
                open={mobileAccordion === "solutions"}
                onToggle={() =>
                  setMobileAccordion((v) =>
                    v === "solutions" ? null : "solutions",
                  )
                }
              >
                {solutionsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy-600 hover:text-primary-600"
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </MobileAccordion>

              {/* Pricing */}
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-navy-700 hover:bg-primary-50"
                aria-current={isActive("/pricing") ? "page" : undefined}
              >
                Pricing
              </Link>

              {/* Resources */}
              <MobileAccordion
                title="Resources"
                open={mobileAccordion === "resources"}
                onToggle={() =>
                  setMobileAccordion((v) =>
                    v === "resources" ? null : "resources",
                  )
                }
              >
                {resourcesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy-600 hover:text-primary-600"
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </MobileAccordion>

              <hr className="my-4 border-gray-200" />

              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-navy-700 hover:bg-primary-50"
              >
                Login
              </Link>

              <div className="space-y-3 px-4 pt-2">
                <Link
                  href="/demo"
                  data-testid="nav-cta-demo"
                  onClick={() => {
                    events.demoRequest();
                    setMobileOpen(false);
                  }}
                  className="block w-full rounded-lg bg-primary-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  Book a Demo
                </Link>
                <Link
                  href="/get-started"
                  data-testid="nav-cta-signup"
                  onClick={() => {
                    events.signupClick("nav-mobile");
                    setMobileOpen(false);
                  }}
                  className="block w-full rounded-lg border border-primary-200 px-5 py-3 text-center text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Mobile Accordion ───────────────────────────────────────────────────────────

function MobileAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-navy-700 hover:bg-primary-50"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={18}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
