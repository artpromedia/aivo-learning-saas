import type { Metadata } from "next";
import Link from "next/link";
import {
  Lightbulb,
  Heart,
  Shield,
  Zap,
  Users,
  Brain,
  Sparkles,
  BarChart3,
  Gamepad2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | AIVO",
  description:
    "Learn about AIVO Learning's mission to ensure no learner is left behind. AI-powered personalized education for every student.",
  openGraph: {
    title: "About | AIVO",
    description:
      "Learn about AIVO Learning's mission to ensure no learner is left behind.",
  },
};

const principles = [
  {
    icon: Brain,
    title: "Truly Personalized",
    description:
      "Every interaction adapts to the individual learner's Brain Clone, a unique AI profile that understands how each student learns best.",
  },
  {
    icon: Heart,
    title: "Inclusive by Design",
    description:
      "Built from the ground up for all functioning levels, with deep IEP integration ensuring every student gets the support they need.",
  },
  {
    icon: Sparkles,
    title: "AI-Native",
    description:
      "Not AI-bolted-on. The AI IS the product. Every feature is powered by advanced artificial intelligence, not retrofitted with it.",
  },
  {
    icon: BarChart3,
    title: "Measurably Effective",
    description:
      "Data-driven outcomes with transparent progress tracking. Parents and educators always know exactly where students stand.",
  },
  {
    icon: Gamepad2,
    title: "Joyful Learning",
    description:
      "Gamification, personality-rich tutors, and engaging content make learning something students look forward to every day.",
  },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible in education technology, using cutting-edge AI to solve real learning challenges.",
  },
  {
    icon: Users,
    title: "Inclusion",
    description:
      "Every decision we make is guided by our commitment to serving all learners, regardless of ability, background, or learning style.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We protect student data fiercely, communicate honestly with families and educators, and hold ourselves to the highest ethical standards.",
  },
  {
    icon: Zap,
    title: "Impact",
    description:
      "We measure success by student outcomes. If it doesn't measurably help learners grow, we don't ship it.",
  },
];

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  linkedin?: string;
  image?: string;
}

const team: TeamMember[] = [
  {
    name: "Dr. Ikechukwu Osuji",
    role: "Co-Founder & Chairman",
    bio: "Ikechukwu Osuji, MD, MPH, is a distinguished Internal Medicine physician and healthcare executive with over 35 years of global experience. A graduate of the University of Jos (Nigeria), he completed his Internal Medicine residency at Howard University \u2014 graduating top of his class \u2014 and earned a Master of Public Health from George Washington University specializing in International Health. Ike served as Chief of Staff at the Medical Center of Lancaster and Hampton Community Hospital, and spent roughly a decade as Medical Director of Ernest Health International overseeing 26 hospitals nationwide. As an entrepreneur he built a private practice into five locations before its acquisition by WellMed (UnitedHealth Group) in 2024. He brings deep expertise in clinical operations, healthcare governance, and scaling medical organizations to AIVO's mission.",
    linkedin: "https://www.linkedin.com/",
  },
  {
    name: "Ofem Ekapong Ofem",
    role: "Co-Founder & Chief Strategy Officer",
    bio: "Ofem Ofem is a business executive with nearly two decades of international acclaim in workforce development, human capital optimization, and strategic leadership. After thirteen years at KPMG Nigeria \u2014 where he built the firm's Strategy Practice and led landmark engagements for Shell Nigeria, Unilever Nigeria, and the Dangote Group \u2014 he created a workforce development methodology documented by Lagos Business School, adopted by 15 major corporations, and credited by the Federal Government of Nigeria as a foundation for national policy under Vision 2020. He served as Managing Director of SmartCity Lagos, a $10 billion initiative assessed by PwC as one of the largest single FDIs in Nigerian history. A published scholar with three peer-reviewed articles (including publications in Human Resource Development Review and AI & Society), Ofem is currently completing his Doctor of Business Administration at Saint Mary's University of Minnesota with a concentration in Organizational Dynamics in AI.",
    linkedin: "https://www.linkedin.com/in/ofem-ofem",
  },
  {
    name: "Nnamdi Uzokwe",
    role: "Co-Founder & Chief Commercial Officer",
    bio: "Nnamdi Uzokwe is a retired U.S. Navy Reserves officer with over three decades of experience in medical device sales and entrepreneurship. His extensive career in the healthcare and life-sciences industries gives AIVO a powerful commercial lens \u2014 from go-to-market strategy and channel partnerships to enterprise sales execution.",
    linkedin: "https://www.linkedin.com/",
  },
  {
    name: "Edward Hamilton",
    role: "VP, Special Education & Sales",
    bio: "Edward Hamilton is a veteran of the NYPD 911 system and a passionate special education advocate. His frontline public-service career instilled a deep commitment to serving vulnerable communities, which he now channels into AIVO's mission. Edward bridges the gap between families navigating the special education system and the technology that can transform their children's outcomes. As VP of Special Education & Sales, he leads AIVO's outreach to school districts, therapy practices, and parent communities \u2014 ensuring the platform reaches the families who need it most.",
    linkedin: "https://www.linkedin.com/",
  },
  {
    name: "Dr. Patrick Ukata",
    role: "VP, Curriculum Design & Compliance",
    bio: "Patrick Ukata, PhD, brings over three decades of experience in the education sector, including positions at American University (Washington, D.C.), George Washington University, and Johns Hopkins University. His deep expertise in curriculum development, instructional design, and regulatory compliance ensures that AIVO's learning content meets the highest academic and accessibility standards.",
    linkedin: "https://www.linkedin.com/",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-aivo-purple-600">
            Our Mission
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl">
            No Learner Left Behind
          </h1>
          <p className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed">
            AIVO Learning was founded on a simple belief: every student deserves
            a learning experience that adapts to them, not the other way around.
            Our AI-powered platform creates a unique learning profile, a Brain
            Clone, for every student, ensuring that no learner is left behind
            regardless of their learning differences, disabilities, or
            functioning level.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Core Principles
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              The foundations that guide everything we build.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-purple-50">
                    <Icon className="h-6 w-6 text-aivo-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-aivo-navy-800">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-aivo-navy-500 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              What we stand for as a company and as educators.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-2xl bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-teal-50">
                    <Icon className="h-6 w-6 text-aivo-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-aivo-navy-800">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-aivo-navy-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Meet Our Leadership
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              AIVO is led by a team of seasoned executives who bring decades of
              cross-sector experience in healthcare, business strategy, education,
              public service, and technology.
            </p>
          </div>

          <div className="space-y-12">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col md:flex-row items-start gap-8 rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
              >
                {/* Avatar / Photo placeholder */}
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-aivo-purple-50">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-14 w-14 text-aivo-purple-300" />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-aivo-navy-800">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-aivo-purple-600">
                    {member.role}
                  </p>
                  <p className="mt-4 text-aivo-navy-500 leading-relaxed">
                    {member.bio}
                  </p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-aivo-purple-600 hover:text-aivo-purple-700 transition-colors"
                    >
                      LinkedIn Profile
                      {" "}
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Join Our Mission
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            Help us build a world where every student gets the personalized
            education they deserve.
          </p>
          <Link
            href="/careers"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            View Open Positions
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}
