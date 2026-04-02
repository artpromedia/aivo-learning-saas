export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "My son has ADHD and was struggling in traditional school. With AIVO, he actually asks to do his lessons. The AI tutors keep him engaged in a way his textbooks never could.",
    name: "Sarah M.",
    role: "Parent of a 4th grader",
  },
  {
    quote:
      "I have 28 students with 8 different IEPs. AIVO lets me actually differentiate for each one without working until midnight. It's the tool I've been waiting 15 years for.",
    name: "Marcus T.",
    role: "5th Grade Special Education Teacher",
  },
  {
    quote:
      "We piloted AIVO in 12 classrooms and saw a 31% improvement in reading scores for students with IEPs. We're now rolling it out district-wide.",
    name: "Dr. Lisa Chen",
    role: "Director of Special Education, Riverside USD",
  },
  {
    quote:
      "The Brain Clone AI is remarkable. It figured out that my daughter learns math better with visual models in just two sessions. Her confidence has skyrocketed.",
    name: "David K.",
    role: "Parent of a 6th grader",
  },
  {
    quote:
      "AIVO's IEP tracking saves me hours every week. Progress reports that used to take all weekend are now generated automatically with data I actually trust.",
    name: "Jennifer P.",
    role: "Special Education Coordinator",
  },
];
