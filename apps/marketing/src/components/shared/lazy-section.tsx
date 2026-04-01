"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  height: number | string;
  className?: string;
  children: ReactNode;
}

export function LazySection({ height, className, children }: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        <div
          className="bg-gray-50 animate-pulse rounded-lg"
          style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
          data-testid="lazy-section-skeleton"
        />
      )}
    </div>
  );
}
