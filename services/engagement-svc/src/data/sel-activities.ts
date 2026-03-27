export type Emotion = "happy" | "calm" | "tired" | "frustrated" | "sad";

export interface SelPrompt {
  emotion: Emotion;
  emoji: string;
  label: string;
  followUpPrompt: string;
}

export const SEL_EMOTIONS: SelPrompt[] = [
  { emotion: "happy", emoji: "😊", label: "Happy", followUpPrompt: "That's wonderful! What made you feel happy today?" },
  { emotion: "calm", emoji: "😌", label: "Calm", followUpPrompt: "Feeling calm is great for learning. Ready to start?" },
  { emotion: "tired", emoji: "😴", label: "Tired", followUpPrompt: "It's okay to feel tired. Would you like a shorter session today?" },
  { emotion: "frustrated", emoji: "😤", label: "Frustrated", followUpPrompt: "It's okay to feel frustrated. Would you like to try a break activity first?" },
  { emotion: "sad", emoji: "😢", label: "Sad", followUpPrompt: "I'm sorry you're feeling sad. Remember, it's okay to feel this way. Want to talk about it?" },
];

export type BreakActivityType = "breathing" | "stretch" | "mindfulness" | "fidget";

export interface BreakActivity {
  type: BreakActivityType;
  name: string;
  description: string;
  durationSeconds: number;
  instructions: string[];
  xpReward: number;
}

export const BREAK_ACTIVITIES: BreakActivity[] = [
  {
    type: "breathing",
    name: "Calm Breathing",
    description: "A guided breathing exercise to help you relax and refocus.",
    durationSeconds: 60,
    instructions: [
      "Close your eyes or look at the screen",
      "Breathe in slowly for 4 seconds",
      "Hold your breath for 4 seconds",
      "Breathe out slowly for 4 seconds",
      "Repeat 4 times",
    ],
    xpReward: 5,
  },
  {
    type: "stretch",
    name: "Quick Stretch",
    description: "A series of gentle stretches to get your body moving.",
    durationSeconds: 90,
    instructions: [
      "Stand up and reach your arms above your head",
      "Touch your toes (or as far as you can)",
      "Roll your shoulders forward 5 times",
      "Roll your shoulders backward 5 times",
      "Shake out your hands",
      "Take 3 deep breaths",
    ],
    xpReward: 5,
  },
  {
    type: "mindfulness",
    name: "Mindful Moment",
    description: "A short mindfulness exercise to help you focus.",
    durationSeconds: 120,
    instructions: [
      "Sit comfortably and close your eyes",
      "Notice 5 things you can hear",
      "Notice 4 things you can feel",
      "Notice 3 things you can smell",
      "Take 3 slow, deep breaths",
      "Open your eyes when you're ready",
    ],
    xpReward: 5,
  },
  {
    type: "fidget",
    name: "Fidget Spinner",
    description: "An interactive fidget spinner to help release energy.",
    durationSeconds: 30,
    instructions: [
      "Tap or swipe to spin the fidget spinner",
      "Watch it spin and slow down",
      "Spin it as many times as you like",
    ],
    xpReward: 5,
  },
];

export function getBreakActivity(type: BreakActivityType): BreakActivity | undefined {
  return BREAK_ACTIVITIES.find((a) => a.type === type);
}
