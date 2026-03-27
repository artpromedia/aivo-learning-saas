"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    const heroEl = document.querySelector("section");
    if (heroEl) {
      observer.observe(heroEl);
    }

    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-aivo-navy-100 shadow-lg p-3 animate-slide-up">
      <Link
        href="/get-started"
        className="block w-full text-center rounded-lg bg-aivo-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-aivo-purple-700 transition-colors"
      >
        Start Free Trial
      </Link>
    </div>
  );
}
