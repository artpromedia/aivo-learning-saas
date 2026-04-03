import type { Metadata } from "next";
import {
  Heart,
  Palmtree,
  Home,
  BookOpen,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = {
  title: "Careers | AIVO",
  description:
    "Join the AIVO team and help build the future of personalized learning. View open positions in engineering, ML, design, and more.",
  openGraph: {
    title: "Careers | AIVO",
    description:
      "Join the AIVO team and help build the future of personalized learning.",
  },
};

export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
}

const positions: Position[] = [
  {
    id: "senior-backend-engineer",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    salaryRange: "$150,000 - $190,000",
    summary:
      "Build and scale the microservices powering AIVO's Brain Clone AI and adaptive learning engine. You will work across our TypeScript services, PostgreSQL databases, NATS event bus, and Redis caching layer to deliver low-latency, high-reliability systems that directly impact student outcomes.",
    responsibilities: [
      "Design, implement, and maintain backend microservices in TypeScript (Fastify/Node.js)",
      "Architect event-driven systems using NATS JetStream for real-time learning analytics",
      "Optimize database queries and schema design in PostgreSQL with pgvector for AI embeddings",
      "Build and maintain RESTful APIs consumed by web and mobile applications",
      "Collaborate with ML engineers to integrate AI model inference into production services",
      "Implement comprehensive logging, monitoring, and alerting with Prometheus and Grafana",
      "Participate in on-call rotations and incident response for production systems",
      "Mentor junior engineers through code reviews and technical guidance",
    ],
    requirements: [
      "5+ years of professional backend development experience",
      "Strong proficiency in TypeScript/JavaScript and Node.js",
      "Experience with PostgreSQL (or similar RDBMS) including query optimization",
      "Familiarity with event-driven architectures (NATS, Kafka, RabbitMQ, or similar)",
      "Experience with containerization (Docker) and orchestration (Kubernetes or Helm)",
      "Solid understanding of REST API design principles and security best practices",
      "Ability to write clean, well-tested code with high coverage",
    ],
    niceToHave: [
      "Experience in EdTech, HealthTech, or mission-driven organizations",
      "Familiarity with Drizzle ORM or similar TypeScript ORM tools",
      "Experience with Terraform or other IaC tools",
      "Knowledge of FERPA, COPPA, or similar data privacy regulations",
    ],
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    department: "AI / Machine Learning",
    location: "Remote (US)",
    type: "Full-time",
    salaryRange: "$160,000 - $210,000",
    summary:
      "Design and train the machine learning models that power AIVO's adaptive learning engine, Brain Clone profiles, and AI tutor personalities. You will work at the intersection of NLP, recommendation systems, and educational science to build models that understand how each student learns best.",
    responsibilities: [
      "Design, train, and deploy ML models for adaptive learning path generation",
      "Build and iterate on the Brain Clone profiling system using student interaction data",
      "Develop NLP pipelines for curriculum content analysis and question generation",
      "Implement model evaluation frameworks with education-specific metrics (learning gain, engagement)",
      "Optimize model inference latency for real-time tutoring interactions",
      "Collaborate with curriculum designers to ensure AI-generated content meets academic standards",
      "Build data pipelines for training data preparation and feature engineering",
      "Research and prototype new approaches to personalized education AI",
    ],
    requirements: [
      "3+ years of experience in machine learning engineering or applied ML research",
      "Strong proficiency in Python, PyTorch or TensorFlow",
      "Experience with NLP techniques (transformers, embeddings, text classification)",
      "Familiarity with recommendation systems and collaborative filtering",
      "Experience deploying ML models in production environments",
      "Strong foundation in statistics and experimental design",
      "Ability to communicate technical concepts to non-technical stakeholders",
    ],
    niceToHave: [
      "PhD or Master's in Computer Science, Machine Learning, or related field",
      "Experience with educational data mining or learning analytics",
      "Familiarity with LLM fine-tuning and prompt engineering",
      "Knowledge of IEP frameworks and special education accommodations",
      "Publications in ML, NLP, or EdTech conferences",
    ],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote (US)",
    type: "Full-time",
    salaryRange: "$120,000 - $160,000",
    summary:
      "Create accessible, delightful learning experiences that work for every student \u2014 including those with learning differences, IEPs, and diverse accessibility needs. You will own the end-to-end design process from user research through high-fidelity prototyping and design system maintenance.",
    responsibilities: [
      "Lead end-to-end product design for student-facing and educator-facing experiences",
      "Conduct user research with students, parents, and educators to inform design decisions",
      "Design and maintain AIVO's cross-platform design system (web, mobile, marketing)",
      "Create wireframes, prototypes, and high-fidelity mockups in Figma",
      "Ensure all designs meet WCAG 2.1 AA accessibility standards",
      "Design gamification elements (badges, streaks, rewards) that motivate diverse learners",
      "Collaborate with engineers to ensure pixel-perfect implementation",
      "Run usability testing sessions and iterate based on quantitative and qualitative feedback",
    ],
    requirements: [
      "4+ years of product design experience, preferably in B2C or B2B SaaS",
      "Expert proficiency in Figma including component libraries and auto-layout",
      "Strong portfolio demonstrating user-centered design process",
      "Deep understanding of WCAG accessibility guidelines and inclusive design",
      "Experience designing for mobile and responsive web applications",
      "Ability to translate complex workflows into simple, intuitive interfaces",
      "Excellent communication and presentation skills",
    ],
    niceToHave: [
      "Experience designing for children or educational products",
      "Familiarity with special education and assistive technology needs",
      "Knowledge of design tokens and multi-platform design systems",
      "Experience with motion design (Framer Motion, Lottie, or similar)",
      "Background in cognitive psychology or learning science",
    ],
  },
  {
    id: "special-education-consultant",
    title: "Special Education Consultant",
    department: "Curriculum & Compliance",
    location: "Remote (US)",
    type: "Contract / Part-time",
    salaryRange: "$80 - $120/hr",
    summary:
      "Guide AIVO's product and curriculum teams to ensure our AI-powered learning platform genuinely serves students with IEPs, 504 plans, and diverse learning needs. Your expertise will directly shape how our technology adapts to each student's educational goals and accommodations.",
    responsibilities: [
      "Review and validate AI-generated IEP goal recommendations for accuracy and compliance",
      "Advise on accommodation frameworks and assistive technology integration",
      "Collaborate with ML engineers to improve the Brain Clone model's understanding of learning differences",
      "Develop content guidelines for accessible, multi-modal learning materials",
      "Conduct training sessions for the product team on special education best practices",
      "Review platform features for alignment with IDEA, Section 504, and state-level regulations",
      "Participate in user research sessions with special education teachers and parents",
    ],
    requirements: [
      "5+ years of experience in special education as a teacher, specialist, or administrator",
      "Deep knowledge of IEP development, implementation, and compliance",
      "Familiarity with IDEA, Section 504, ADA, and related federal/state regulations",
      "Experience with assistive technology and multi-modal instruction",
      "Excellent written and verbal communication skills",
      "Passion for improving educational outcomes through technology",
    ],
    niceToHave: [
      "Master's degree or higher in Special Education or related field",
      "Experience evaluating or implementing EdTech products in K-12 settings",
      "Board Certified Behavior Analyst (BCBA) or similar credential",
      "Experience with data-driven progress monitoring and response to intervention (RTI)",
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health, Dental & Vision",
    description:
      "Comprehensive medical, dental, and vision coverage for you and your dependents. We cover 100% of employee premiums and 75% for dependents.",
  },
  {
    icon: Palmtree,
    title: "Unlimited PTO",
    description:
      "Take the time you need to recharge. We trust you to manage your schedule and encourage a minimum of 4 weeks off per year.",
  },
  {
    icon: Home,
    title: "Remote-First",
    description:
      "Work from anywhere in the US. We are a fully distributed team spanning multiple time zones with async-first communication.",
  },
  {
    icon: BookOpen,
    title: "Learning Stipend",
    description:
      "$1,500/year for courses, books, conferences, and professional development. We invest in your growth.",
  },
  {
    icon: TrendingUp,
    title: "Equity",
    description:
      "Meaningful equity stake with a standard 4-year vesting schedule and 1-year cliff. You share in the success you help build.",
  },
  {
    icon: DollarSign,
    title: "401(k) Match",
    description:
      "4% employer match on 401(k) contributions, fully vested from day one. Start building your future immediately.",
  },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-aivo-purple-50 to-white pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-aivo-navy-800 sm:text-5xl lg:text-6xl">
            Join the AIVO Team
          </h1>
          <p className="mt-6 text-lg text-aivo-navy-500 max-w-3xl mx-auto leading-relaxed">
            Help us build the future of personalized learning. We&apos;re on a
            mission to ensure no learner is left behind, and we need passionate
            people to make it happen.
          </p>
        </div>
      </section>

      {/* Why AIVO */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-aivo-navy-800 sm:text-3xl">
            Why AIVO?
          </h2>
          <p className="mt-4 text-lg text-aivo-navy-500 leading-relaxed">
            At AIVO, every line of code, every pixel, and every model we train
            directly impacts students who learn differently. We&apos;re building
            AI that adapts to each student&apos;s unique needs, creating a world
            where learning differences are strengths, not barriers. If
            you&apos;re looking for work that matters, you&apos;ve found it.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Open Positions
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400">
              Click any role to view the full job description.
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Benefits &amp; Compensation
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400 max-w-3xl mx-auto">
              We take care of our team so they can focus on taking care of
              students.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-aivo-navy-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aivo-teal-50">
                    <Icon className="h-6 w-6 text-aivo-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-aivo-navy-800">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-aivo-navy-500 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="bg-aivo-navy-50 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-aivo-navy-800 sm:text-4xl">
              Apply Now
            </h2>
            <p className="mt-4 text-lg text-aivo-navy-400">
              Submit your application below. We review every resume and respond
              within 5 business days.
            </p>
          </div>

          <ApplicationForm positions={positions.map((p) => ({ id: p.id, title: p.title }))} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-aivo-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Don&apos;t see your role?
          </h2>
          <p className="mt-4 text-lg text-aivo-purple-100">
            We&apos;re always looking for talented people who share our mission.
            Submit a general application above or email us directly.
          </p>
          <a
            href="mailto:careers@aivolearning.com"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold text-aivo-purple-600 shadow-sm transition-colors hover:bg-aivo-purple-50"
          >
            careers@aivolearning.com
          </a>
        </div>
      </section>
    </>
  );
}

/* Position Card (expandable with <details>) */

function PositionCard({ position }: Readonly<{ position: Position }>) {
  return (
    <details className="group rounded-2xl border border-aivo-navy-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <summary className="cursor-pointer list-none p-8 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-aivo-navy-800">
              {position.title}
            </h3>
            <p className="mt-1 text-sm text-aivo-navy-400">
              {position.department}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-aivo-purple-50 px-3 py-1 text-xs font-medium text-aivo-purple-700">
                <MapPin className="h-3.5 w-3.5" />{position.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-aivo-teal-50 px-3 py-1 text-xs font-medium text-aivo-teal-700">
                <Clock className="h-3.5 w-3.5" />{position.type}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <DollarSign className="h-3.5 w-3.5" />{position.salaryRange}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#apply"
              className="inline-flex items-center gap-1 rounded-lg bg-aivo-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
            >
              Apply
            </a>
            <ChevronDown className="h-5 w-5 text-aivo-navy-400 transition-transform group-open:hidden" />
            <ChevronUp className="hidden h-5 w-5 text-aivo-navy-400 group-open:block" />
          </div>
        </div>
      </summary>

      <div className="border-t border-aivo-navy-100 px-8 pb-8 pt-6">
        <p className="text-aivo-navy-600 leading-relaxed">{position.summary}</p>

        <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-aivo-navy-800">
          Responsibilities
        </h4>
        <ul className="mt-3 space-y-2">
          {position.responsibilities.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-aivo-navy-500 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-purple-400" />
              {item}
            </li>
          ))}
        </ul>

        <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-aivo-navy-800">
          Requirements
        </h4>
        <ul className="mt-3 space-y-2">
          {position.requirements.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-aivo-navy-500 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-teal-400" />
              {item}
            </li>
          ))}
        </ul>

        <h4 className="mt-6 text-sm font-bold uppercase tracking-wider text-aivo-navy-800">
          Nice to Have
        </h4>
        <ul className="mt-3 space-y-2">
          {position.niceToHave.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-aivo-navy-500 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aivo-navy-300" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between rounded-xl bg-aivo-purple-50 p-4">
          <div>
            <p className="text-sm font-semibold text-aivo-purple-800">
              Compensation
            </p>
            <p className="text-lg font-bold text-aivo-purple-700">
              {position.salaryRange}
            </p>
            <p className="text-xs text-aivo-purple-500">
              + equity + full benefits package
            </p>
          </div>
          <a
            href="#apply"
            className="inline-flex items-center gap-1 rounded-lg bg-aivo-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-aivo-purple-700"
          >
            Apply Now
          </a>
        </div>
      </div>
    </details>
  );
}
