import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center px-6 py-24 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--aivo-purple-500) 0%, var(--aivo-purple-700) 50%, var(--aivo-navy-900) 100%)",
        }}
      >
        <h1
          className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Learning Made Personal
        </h1>
        <p className="text-lg md:text-xl text-purple-100 max-w-2xl mb-10 leading-relaxed">
          AIVO adapts to every child&apos;s unique needs, using AI to create
          joyful, effective learning experiences for children on the autism
          spectrum.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl px-8 py-3 text-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--aivo-cta)" }}
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--aivo-bg-alt)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Adaptive AI"
            description="Lessons that adjust in real-time to your child's pace and learning style."
          />
          <FeatureCard
            title="Sensory-Friendly"
            description="Customizable themes, reduced animations, and calming color palettes."
          />
          <FeatureCard
            title="Progress Tracking"
            description="Detailed insights and analytics so you can celebrate every milestone."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm" style={{ color: "var(--aivo-text-muted)" }}>
        &copy; {new Date().getFullYear()} AIVO Learning. All rights reserved.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ backgroundColor: "var(--aivo-bg)" }}
    >
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: "var(--aivo-purple-600)", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--aivo-text-secondary)" }}>{description}</p>
    </div>
  );
}
