export interface AudienceBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface AudienceWalkthrough {
  step: number;
  title: string;
  description: string;
}

export interface AudienceTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Audience {
  id: string;
  label: string;
  headline: string;
  subheadline: string;
  benefits: AudienceBenefit[];
  walkthrough: AudienceWalkthrough[];
  testimonial: AudienceTestimonial;
  ctaLabel: string;
  ctaHref: string;
}

export const audiences: Audience[] = [
  {
    id: "parents",
    label: "Parents",
    headline: "Give Your Child a Learning Superpower",
    subheadline:
      "AIVO creates a personalized learning companion that adapts to your child's unique needs, whether they have an IEP, are gifted, or simply learn differently.",
    benefits: [
      {
        icon: "Heart",
        title: "Personalized to Your Child",
        description:
          "Brain Clone AI builds a unique learning profile, adapting every lesson to your child's pace, style, and interests.",
      },
      {
        icon: "Shield",
        title: "Safe & Private",
        description:
          "FERPA and COPPA compliant. Your child's data is encrypted, never sold, and you control what's shared.",
      },
      {
        icon: "TrendingUp",
        title: "Real Progress Tracking",
        description:
          "See exactly what your child is learning, where they excel, and where they need support — updated in real-time.",
      },
      {
        icon: "Clock",
        title: "Learn Anytime, Anywhere",
        description:
          "Offline-capable mobile app means learning continues on road trips, in waiting rooms, or at grandma's house.",
      },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Create Your Child's Profile",
        description:
          "Answer a few questions about your child's age, grade, interests, and learning needs. Upload their IEP if they have one.",
      },
      {
        step: 2,
        title: "Meet Their AI Learning Team",
        description:
          "Your child gets matched with AI tutors who match their personality. Nova for math, Sage for reading, Spark for science, and more.",
      },
      {
        step: 3,
        title: "Watch Them Thrive",
        description:
          "Track progress on your parent dashboard. See skills mastered, time spent learning, and areas where they're growing.",
      },
    ],
    testimonial: {
      quote:
        "My son has ADHD and was struggling in traditional school. With AIVO, he actually asks to do his lessons. The AI tutors keep him engaged in a way his textbooks never could.",
      name: "Sarah M.",
      role: "Parent of a 4th grader",
    },
    ctaLabel: "Start Your Free Trial",
    ctaHref: "/get-started",
  },
  {
    id: "teachers",
    label: "Teachers",
    headline: "Your AI-Powered Teaching Assistant",
    subheadline:
      "AIVO handles differentiation, progress monitoring, and IEP tracking so you can focus on what matters most — connecting with your students.",
    benefits: [
      {
        icon: "Zap",
        title: "6+ Hours Saved Per Week",
        description:
          "Automated lesson differentiation, progress reports, and IEP documentation free up your most valuable resource: time.",
      },
      {
        icon: "BarChart3",
        title: "Real-Time Class Insights",
        description:
          "See every student's progress at a glance. Identify who needs intervention before they fall behind.",
      },
      {
        icon: "FileText",
        title: "Automatic IEP Alignment",
        description:
          "Upload IEPs and AIVO automatically aligns content, tracks goals, and generates compliant progress reports.",
      },
      {
        icon: "Layers",
        title: "Effortless Differentiation",
        description:
          "One lesson, 30 versions. AIVO automatically adapts content for every learner in your classroom.",
      },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Set Up Your Classroom",
        description:
          "Import your roster from Clever or ClassLink. Upload IEPs and set learning goals for each student.",
      },
      {
        step: 2,
        title: "Assign & Adapt",
        description:
          "Create assignments that automatically differentiate for each student. AIVO adjusts difficulty, scaffolding, and format.",
      },
      {
        step: 3,
        title: "Monitor & Report",
        description:
          "Track progress in real-time. Generate IEP progress reports, parent updates, and intervention recommendations.",
      },
    ],
    testimonial: {
      quote:
        "I have 28 students with 8 different IEPs. AIVO lets me actually differentiate for each one without working until midnight. It's the tool I've been waiting 15 years for.",
      name: "Marcus T.",
      role: "5th Grade Special Education Teacher",
    },
    ctaLabel: "Get Started for Free",
    ctaHref: "/get-started",
  },
  {
    id: "districts",
    label: "Districts",
    headline: "Scale Personalized Learning District-Wide",
    subheadline:
      "AIVO provides enterprise-grade AI learning infrastructure with FERPA compliance, SIS integration, and district-wide analytics.",
    benefits: [
      {
        icon: "Building",
        title: "Enterprise SIS Integration",
        description:
          "Native Clever and ClassLink integration. Automatic roster sync, single sign-on, and grade passback.",
      },
      {
        icon: "Lock",
        title: "FERPA & COPPA Compliant",
        description:
          "SOC 2 Type II certified. Student data is encrypted at rest and in transit. Annual third-party audits.",
      },
      {
        icon: "LineChart",
        title: "District-Wide Analytics",
        description:
          "Track performance across schools, grades, and demographics. Identify equity gaps and measure intervention effectiveness.",
      },
      {
        icon: "Headphones",
        title: "Dedicated Support",
        description:
          "Implementation specialists, professional development training, and 24/7 technical support for your team.",
      },
    ],
    walkthrough: [
      {
        step: 1,
        title: "Pilot Program",
        description:
          "Start with a 30-day pilot in select classrooms. We handle setup, training, and provide a dedicated success manager.",
      },
      {
        step: 2,
        title: "Measure Impact",
        description:
          "Review pilot data: engagement metrics, learning gains, teacher satisfaction, and IEP compliance improvements.",
      },
      {
        step: 3,
        title: "Scale District-Wide",
        description:
          "Roll out across schools with SIS integration, custom policies, and district admin dashboards.",
      },
    ],
    testimonial: {
      quote:
        "We piloted AIVO in 12 classrooms and saw a 31% improvement in reading scores for students with IEPs. We're now rolling it out district-wide.",
      name: "Dr. Lisa Chen",
      role: "Director of Special Education, Riverside USD",
    },
    ctaLabel: "Request a Demo",
    ctaHref: "/demo",
  },
];
