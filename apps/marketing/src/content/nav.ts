export interface NavLink {
  key: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "tutors", href: "#ai-tutors" },
  { key: "pricing", href: "/pricing" },
  { key: "blog", href: "/blog" },
];
