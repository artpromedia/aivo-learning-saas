import { Shield, Lock, Eye, Accessibility } from "lucide-react";

const badges = [
  { icon: Shield, label: "FERPA Compliant", description: "Student data protection" },
  { icon: Lock, label: "COPPA Compliant", description: "Children's privacy" },
  { icon: Eye, label: "SOC 2 Type II", description: "Enterprise security" },
  { icon: Accessibility, label: "WCAG AA", description: "Accessibility certified" },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 text-aivo-navy-400">
              <badge.icon size={24} className="text-aivo-navy-300" />
              <div>
                <p className="text-sm font-semibold text-aivo-navy-600">{badge.label}</p>
                <p className="text-xs text-aivo-navy-400">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
