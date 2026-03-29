export interface NavLink {
  label: string;
  href: string;
  /** Key into messages.nav for translated label */
  i18nKey: string;
}

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features", i18nKey: "features" },
  { label: "How It Works", href: "#how-it-works", i18nKey: "howItWorks" },
  { label: "AI Tutors", href: "#ai-tutors", i18nKey: "tutors" },
  { label: "Pricing", href: "/pricing", i18nKey: "pricing" },
  { label: "Blog", href: "/blog", i18nKey: "blog" },
];
