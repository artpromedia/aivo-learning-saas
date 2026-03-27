import {
  Brain,
  Sparkles,
  FileCheck,
  Users,
  BookOpen,
  Trophy,
  Heart,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  FileText,
  Layers,
  Building,
  Lock,
  LineChart,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Sparkles,
  FileCheck,
  Users,
  BookOpen,
  Trophy,
  Heart,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  FileText,
  Layers,
  Building,
  Lock,
  LineChart,
  Headphones,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24 }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} size={size} />;
}
