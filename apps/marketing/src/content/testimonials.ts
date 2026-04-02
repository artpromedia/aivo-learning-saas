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
    name: "Parent of 4th Grader with ASD",
    role: "Verified Aivo Parent, Washington DC",
  },
  {
    quote:
      "I have 28 students with 8 different IEPs. AIVO lets me actually differentiate for each one without working until midnight. It's the tool I've been waiting 15 years for.",
    name: "Special Education Teacher, 15 Years",
    role: "Verified Aivo Educator, Chicago",
  },
  {
    quote:
      "We piloted AIVO in 12 classrooms and saw a 31% improvement in reading scores for students with IEPs. We're now rolling it out district-wide.",
    name: "Director of Special Education",
    role: "Verified District Administrator, Minneapolis",
  },
  {
    quote:
      "The Brain Clone AI is remarkable. It figured out that my daughter learns math better with visual models in just two sessions. Her confidence has skyrocketed.",
    name: "Parent of 6th Grader with Dyscalculia",
    role: "Verified Aivo Parent, Dallas",
  },
  {
    quote:
      "AIVO's IEP tracking saves me hours every week. Progress reports that used to take all weekend are now generated automatically with data I actually trust.",
    name: "Special Education Coordinator",
    role: "Verified Aivo Educator, San Francisco",
  },
  {
    quote:
      "As a homeschool parent with three kids at different levels, Aivo has been a game-changer. Each child gets exactly what they need, and I can track it all from one dashboard.",
    name: "Homeschool Parent of 3 (Grades 2, 5, 8)",
    role: "Verified Aivo Parent, Washington DC",
  },
];
