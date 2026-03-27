import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners | AIVO",
  description:
    "AIVO integrates with the tools your school already uses. Explore our integration partners including Clever, ClassLink, Canvas, and more.",
  openGraph: {
    title: "Partners | AIVO",
    description:
      "AIVO integrates with the tools your school already uses.",
  },
};

const partners = [
  {
    name: "Clever",
    description:
      "Automatic roster sync, single sign-on, and grade passback. Clever makes it easy to connect AIVO with your existing student information system.",
  },
  {
    name: "ClassLink",
    description:
      "OneClick SSO and roster integration for districts. Seamlessly provision accounts and manage access for thousands of students.",
  },
  {
    name: "Canvas",
    description:
      "LMS integration for assignment sync and gradebook. Teachers can assign AIVO activities directly from Canvas and sync grades automatically.",
  },
  {
    name: "Google Classroom",
    description:
      "Import classes, sync assignments, and enable single sign-on. Students access AIVO with their existing Google accounts.",
  },
  {
    name: "Schoology",
    description:
      "Course integration and grade passback. Embed AIVO learning activities within your Schoology courses for a unified experience.",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl">
            Integration Partners
          </h1>
          <p className="mt-4 text-lg text-aivo-navy-500 max-w-2xl mx-auto">
            AIVO works with the tools your school already uses. Connect your
            existing systems for a seamless experience.
          </p>
        </div>
      </section>

      {/* Partner Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Partner initial as placeholder logo */}
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-aivo-purple-50">
                  <span className="text-xl font-bold text-aivo-purple-600">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-aivo-navy-800">
                  {partner.name}
                </h2>
                <p className="mt-3 text-sm text-aivo-navy-500 leading-relaxed">
                  {partner.description}
                </p>
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                >
                  Learn more
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Become a Partner
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Interested in integrating with AIVO? We&apos;re always looking to
            expand our ecosystem to better serve schools and districts.
          </p>
          <a
            href="mailto:partners@aivolearning.com"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            partners@aivolearning.com
          </a>
        </div>
      </section>
    </>
  );
}
