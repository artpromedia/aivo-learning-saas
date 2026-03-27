export interface CaseStudy {
  slug: string;
  title: string;
  date: string;
  type: string;
  heroStat: string;
  heroStatLabel: string;
  excerpt: string;
  challenge: string;
  solution: string;
  results: string;
  testimonial: { quote: string; name: string; role: string };
  metrics: { label: string; value: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "springfield-district-reading-improvement",
    title: "Springfield District: 31% Reading Score Improvement",
    date: "2025-02-10",
    type: "B2B",
    heroStat: "31%",
    heroStatLabel: "Reading Score Improvement",
    excerpt:
      "How Springfield USD used AIVO to dramatically improve reading outcomes for students with IEPs across 12 classrooms.",
    challenge:
      "Springfield USD serves 4,200 students across 8 schools, with 18% of students on IEPs. Special education teachers were spending 10+ hours per week on differentiation and IEP documentation, leaving less time for direct instruction. Reading scores for students with IEPs had plateaued for three consecutive years despite increased intervention spending.",
    solution:
      "Springfield piloted AIVO in 12 classrooms across 3 schools, focusing on students with IEPs in grades 3-5. Teachers uploaded existing IEP documents, and AIVO's Brain Clone AI automatically aligned content to each student's goals and accommodations. AI tutors provided personalized reading instruction while teachers focused on small-group and one-on-one support.",
    results:
      "After one semester, students with IEPs using AIVO showed a 31% improvement in reading assessment scores compared to the control group. Teachers reported saving an average of 6.2 hours per week on differentiation and documentation. Student engagement increased by 2.3x, with students voluntarily completing additional sessions outside of class time.",
    testimonial: {
      quote:
        "We piloted AIVO in 12 classrooms and saw a 31% improvement in reading scores for students with IEPs. We're now rolling it out district-wide.",
      name: "Dr. Lisa Chen",
      role: "Director of Special Education, Springfield USD",
    },
    metrics: [
      { label: "Reading Score Improvement", value: "31%" },
      { label: "Teacher Time Saved", value: "6.2 hrs/week" },
      { label: "Student Engagement", value: "2.3x increase" },
      { label: "Classrooms", value: "12" },
    ],
  },
  {
    slug: "martinez-family-adhd-transformation",
    title:
      "The Martinez Family: How AIVO Transformed Learning for a Child with ADHD",
    date: "2025-02-18",
    type: "B2C",
    heroStat: "47%",
    heroStatLabel: "Grade Improvement",
    excerpt:
      "How one family used AIVO to help their son with ADHD go from struggling to thriving in just three months.",
    challenge:
      "Diego Martinez, a 4th grader with ADHD, was struggling to keep up in his general education classroom. Despite accommodations in his IEP, traditional worksheets and textbooks couldn't hold his attention. His parents tried three different tutoring services, but none could adapt quickly enough to his engagement patterns. Diego's reading was two grade levels behind and his confidence was plummeting.",
    solution:
      "Diego's parents signed up for AIVO Pro and uploaded his IEP. Within the first session, Brain Clone AI identified that Diego learned best through short, game-like interactions with immediate feedback. The AI tutors — especially Nova for math and Sage for reading — adapted their teaching style to match Diego's need for novelty and quick wins. Sessions were automatically broken into 10-minute focused blocks with movement breaks.",
    results:
      "After three months, Diego's reading level improved by 1.5 grade levels. His math scores went from a C- to a B+. Most importantly, Diego started asking to do his AIVO sessions voluntarily — something his parents never expected. His teacher reported improved focus and participation in the classroom as well.",
    testimonial: {
      quote:
        "My son has ADHD and was struggling in traditional school. With AIVO, he actually asks to do his lessons. The AI tutors keep him engaged in a way his textbooks never could.",
      name: "Sarah Martinez",
      role: "Parent of Diego, 4th Grade",
    },
    metrics: [
      { label: "Reading Level Gain", value: "1.5 grades" },
      { label: "Math Grade", value: "C- to B+" },
      { label: "Time to Results", value: "3 months" },
      { label: "Daily Engagement", value: "45 min avg" },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((s) => s.slug === slug);
}
