export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  {
    value: 150,
    suffix: "+",
    label: "Students in pilot programs",
  },
  {
    value: 31,
    suffix: "%",
    label: "Reading score improvement",
  },
  {
    value: 6,
    suffix: "+",
    label: "Hours saved per teacher/week",
  },
  {
    value: 5,
    suffix: "",
    label: "Specialized AI Tutors",
  },
];
