const MOCK_LEARNER_ID = "learner-001";
const MOCK_LEARNER_ID_2 = "learner-002";

const mockLearners = [
  {
    id: MOCK_LEARNER_ID,
    name: "Alex Johnson",
    avatarUrl: "",
    functioningLevel: "SUPPORTED",
    currentStreak: 7,
    totalXp: 2450,
    level: 12,
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
    todayProgress: 65,
  },
  {
    id: MOCK_LEARNER_ID_2,
    name: "Maya Johnson",
    avatarUrl: "",
    functioningLevel: "STANDARD",
    currentStreak: 3,
    totalXp: 1200,
    level: 8,
    lastActiveAt: new Date(Date.now() - 7200000).toISOString(),
    todayProgress: 40,
  },
];

const mockNotifications = [
  { id: "n1", title: "Alex completed a quest!", message: "Alex finished the Ocean Explorer quest and earned 50 XP.", read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), type: "success" as const },
  { id: "n2", title: "Weekly progress report ready", message: "Your children's weekly summary is available.", read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), type: "info" as const },
  { id: "n3", title: "New tutor available", message: "Professor Cosmos is now available for science tutoring.", read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), type: "info" as const },
];

const mockBrainProfile = {
  learnerId: MOCK_LEARNER_ID,
  status: "approved",
  functioningLevel: "SUPPORTED",
  learningStyle: "Visual-spatial learner who excels with diagrams, color-coded information, and hands-on activities.",
  communicationStyle: "Responds well to clear, concise instructions with visual supports. Prefers written over verbal directions.",
  strengths: ["Visual Learning", "Pattern Recognition", "Creative Thinking", "Mathematics", "Spatial Reasoning"],
  challenges: ["Auditory Processing", "Time Management", "Social Communication"],
  sensoryPreferences: ["Low noise environments", "Dim lighting preferred", "Fidget tools helpful", "Weighted blanket for calm-down"],
  adaptations: [
    { type: "visual", label: "Visual Aids", description: "Uses image-based prompts and diagrams", strength: 0.85 },
    { type: "pacing", label: "Extended Time", description: "Allows 1.5x time for responses", strength: 0.7 },
    { type: "breaks", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes", strength: 0.6 },
    { type: "sensory", label: "Low Stimulation", description: "Reduced animations and sounds", strength: 0.45 },
  ],
  neuralConnections: [
    { from: "Visual Processing", to: "Pattern Recognition", strength: 0.92 },
    { from: "Pattern Recognition", to: "Mathematics", strength: 0.88 },
    { from: "Visual Processing", to: "Spatial Reasoning", strength: 0.85 },
    { from: "Creative Thinking", to: "Problem Solving", strength: 0.78 },
    { from: "Spatial Reasoning", to: "Creative Thinking", strength: 0.75 },
    { from: "Mathematics", to: "Problem Solving", strength: 0.82 },
    { from: "Auditory Processing", to: "Language", strength: 0.42 },
    { from: "Language", to: "Social Communication", strength: 0.38 },
  ],
  cognitiveScores: {
    visualProcessing: 92,
    patternRecognition: 88,
    spatialReasoning: 85,
    creativeThinking: 82,
    problemSolving: 78,
    workingMemory: 65,
    auditoryProcessing: 42,
    executiveFunction: 55,
  },
  weeklyEngagement: [
    { day: "Mon", minutes: 45, focus: 78 },
    { day: "Tue", minutes: 52, focus: 82 },
    { day: "Wed", minutes: 38, focus: 71 },
    { day: "Thu", minutes: 60, focus: 89 },
    { day: "Fri", minutes: 42, focus: 75 },
    { day: "Sat", minutes: 25, focus: 68 },
    { day: "Sun", minutes: 30, focus: 72 },
  ],
  milestones: [
    { id: "m1", title: "First full session completed", date: new Date(Date.now() - 86400000 * 60).toISOString(), icon: "rocket" },
    { id: "m2", title: "Visual learning style identified", date: new Date(Date.now() - 86400000 * 45).toISOString(), icon: "eye" },
    { id: "m3", title: "Optimal break pattern found", date: new Date(Date.now() - 86400000 * 30).toISOString(), icon: "clock" },
    { id: "m4", title: "Math mastery accelerating", date: new Date(Date.now() - 86400000 * 14).toISOString(), icon: "trending" },
    { id: "m5", title: "AI confidence reached 80%+", date: new Date(Date.now() - 86400000 * 3).toISOString(), icon: "brain" },
  ],
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
  lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  modelVersion: "v2.4",
  confidenceScore: 0.82,
};

const mockRecommendations = [
  { id: "rec1", title: "Focus on Reading Comprehension", description: "Alex shows strong visual skills. Introduce graphic novels to build reading comprehension.", type: "curriculum", priority: "high", status: "pending", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "rec2", title: "Try Professor Cosmos", description: "Based on Alex's interest in space, this science tutor may increase engagement.", type: "tutor", priority: "medium", status: "pending", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "rec3", title: "Adjust Session Length", description: "Data shows optimal focus at 20-minute sessions. Consider shorter, more frequent learning.", type: "adaptation", priority: "medium", status: "approved", createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const mockGradebook = {
  summary: {
    overallMastery: 72,
    totalLessonsCompleted: 45,
    averageScore: 78,
    strongestSubject: "Math",
    weakestSubject: "Language Arts",
  },
  subjects: [
    { name: "Math", mastery: 85, lessonsCompleted: 18, averageScore: 88, trend: "up" },
    { name: "Science", mastery: 75, lessonsCompleted: 12, averageScore: 79, trend: "up" },
    { name: "Language Arts", mastery: 58, lessonsCompleted: 10, averageScore: 65, trend: "stable" },
    { name: "Social Studies", mastery: 70, lessonsCompleted: 5, averageScore: 74, trend: "up" },
  ],
};

const mockMastery = {
  overallMastery: 72,
  totalSessions: 45,
  subjects: [
    { subject: "Mathematics", currentMastery: 85, trend: "up" as const, history: [
      { date: "2026-01-15", mastery: 70 }, { date: "2026-02-15", mastery: 75 }, { date: "2026-03-15", mastery: 82 }, { date: "2026-04-01", mastery: 85 },
    ]},
    { subject: "Science", currentMastery: 75, trend: "up" as const, history: [
      { date: "2026-01-15", mastery: 60 }, { date: "2026-02-15", mastery: 65 }, { date: "2026-03-15", mastery: 72 }, { date: "2026-04-01", mastery: 75 },
    ]},
    { subject: "Language Arts", currentMastery: 58, trend: "stable" as const, history: [
      { date: "2026-01-15", mastery: 55 }, { date: "2026-02-15", mastery: 56 }, { date: "2026-03-15", mastery: 57 }, { date: "2026-04-01", mastery: 58 },
    ]},
    { subject: "Social Studies", currentMastery: 70, trend: "up" as const, history: [
      { date: "2026-01-15", mastery: 58 }, { date: "2026-02-15", mastery: 62 }, { date: "2026-03-15", mastery: 67 }, { date: "2026-04-01", mastery: 70 },
    ]},
  ],
};

const mockIep = {
  goals: [
    { id: "g1", title: "Improve reading fluency", description: "Read grade-level passages at 90 words per minute with 95% accuracy.", progress: 65, targetDate: "2026-06-15", status: "in_progress", category: "academics" },
    { id: "g2", title: "Social interaction skills", description: "Initiate conversations with peers 3 times per day in structured settings.", progress: 40, targetDate: "2026-06-15", status: "in_progress", category: "social" },
    { id: "g3", title: "Self-regulation strategies", description: "Use taught coping strategies independently when frustrated.", progress: 80, targetDate: "2026-06-15", status: "on_track", category: "behavioral" },
  ],
  documents: [
    { id: "doc1", name: "IEP_2025-2026.pdf", uploadedAt: "2025-09-15T00:00:00Z", size: 245000, status: "processed" },
    { id: "doc2", name: "Progress_Report_Q1.pdf", uploadedAt: "2025-12-20T00:00:00Z", size: 128000, status: "processed" },
  ],
  lastReviewDate: "2025-09-15",
  nextReviewDate: "2026-03-15",
};

const mockCollaboration = [
  { id: "m1", name: "Ms. Rivera", role: "teacher", email: "rivera@school.edu", joinedAt: "2025-09-01T00:00:00Z", status: "active" },
  { id: "m2", name: "Dr. Chen", role: "therapist", email: "chen@therapy.com", joinedAt: "2025-10-15T00:00:00Z", status: "active" },
  { id: "m3", name: "Jamie Rodriguez", role: "caregiver", email: "jamie@email.com", joinedAt: "2025-11-01T00:00:00Z", status: "active" },
  { id: "m4", name: "", role: "caregiver", email: "grandma@email.com", joinedAt: "2026-01-10T00:00:00Z", status: "pending" },
];

const mockQuestWorlds = [
  { id: "w1", slug: "ocean-explorer", name: "Ocean Explorer", description: "Dive deep into the mysteries of the ocean", theme: "ocean", color: "#38BDF8", totalChapters: 8, completedChapters: 5, isLocked: false, requiredLevel: 1, xpReward: 200 },
  { id: "w2", slug: "space-adventure", name: "Space Adventure", description: "Journey through the solar system and beyond", theme: "space", color: "#7C3AED", totalChapters: 10, completedChapters: 3, isLocked: false, requiredLevel: 5, xpReward: 300 },
  { id: "w3", slug: "jungle-safari", name: "Jungle Safari", description: "Explore the rainforest and learn about wildlife", theme: "jungle", color: "#34D399", totalChapters: 6, completedChapters: 0, isLocked: false, requiredLevel: 8, xpReward: 150 },
  { id: "w4", slug: "ancient-egypt", name: "Ancient Egypt", description: "Uncover the secrets of the pharaohs", theme: "history", color: "#FB923C", totalChapters: 7, completedChapters: 0, isLocked: true, requiredLevel: 15, xpReward: 250 },
];

const mockQuestWorldDetail = {
  id: "w1",
  slug: "ocean-explorer",
  name: "Ocean Explorer",
  description: "Dive deep into the mysteries of the ocean and discover amazing sea creatures!",
  theme: "ocean",
  chapters: [
    { id: "q1", order: 1, title: "Coral Reef Colors", description: "Learn about the vibrant colors of coral reefs", xpReward: 25, status: "completed", lessonsCount: 4, completedLessons: 4 },
    { id: "q2", order: 2, title: "Deep Sea Creatures", description: "Discover creatures that live in the darkest depths", xpReward: 30, status: "completed", lessonsCount: 5, completedLessons: 5 },
    { id: "q3", order: 3, title: "Ocean Currents", description: "Understand how water moves around the globe", xpReward: 35, status: "completed", lessonsCount: 4, completedLessons: 4 },
    { id: "q4", order: 4, title: "Marine Mammals", description: "Learn about whales, dolphins, and seals", xpReward: 30, status: "completed", lessonsCount: 5, completedLessons: 5 },
    { id: "q5", order: 5, title: "Tidal Zones", description: "Explore life between high and low tide", xpReward: 40, status: "completed", lessonsCount: 4, completedLessons: 4 },
    { id: "q6", order: 6, title: "Pollution & Conservation", description: "How can we protect our oceans?", xpReward: 50, status: "available", lessonsCount: 6, completedLessons: 2 },
    { id: "q7", order: 7, title: "The Arctic Ocean", description: "Brave the frozen waters of the north", xpReward: 45, status: "locked", lessonsCount: 5, completedLessons: 0 },
    { id: "q8", order: 8, title: "Ocean Floor Mapping", description: "Map the mysteries beneath the waves", xpReward: 60, status: "locked", lessonsCount: 6, completedLessons: 0 },
  ],
};

const mockTutorSubscriptions = [
  { id: "t1", sku: "tutor-nova", status: "active", activatedAt: new Date(Date.now() - 86400000 * 30).toISOString(), tutor: { name: "Nova", subject: "Mathematics", persona: "nova", description: "Nova makes math fun with visual puzzles and real-world examples." } },
  { id: "t2", sku: "tutor-sage", status: "active", activatedAt: new Date(Date.now() - 86400000 * 20).toISOString(), tutor: { name: "Sage", subject: "Science", persona: "sage", description: "Sage takes you on scientific journeys of discovery." } },
  { id: "t3", sku: "tutor-spark", status: "active", activatedAt: new Date(Date.now() - 86400000 * 10).toISOString(), tutor: { name: "Spark", subject: "Creative Writing", persona: "spark", description: "Spark ignites creativity through stories and imagination." } },
];

const mockTutorStore = [
  { sku: "tutor-nova", name: "Nova", subject: "Mathematics", persona: "nova", price: 0, description: "Nova makes math fun with visual puzzles and real-world examples.", subscribed: true },
  { sku: "tutor-sage", name: "Sage", subject: "Science", persona: "sage", price: 0, description: "Sage takes you on scientific journeys of discovery.", subscribed: true },
  { sku: "tutor-spark", name: "Spark", subject: "Creative Writing", persona: "spark", price: 0, description: "Spark ignites creativity through stories and imagination.", subscribed: true },
  { sku: "tutor-chrono", name: "Chrono", subject: "History", persona: "chrono", price: 4.99, description: "Chrono travels through time to bring history to life.", subscribed: false },
  { sku: "tutor-pixel", name: "Pixel", subject: "Digital Art", persona: "pixel", price: 4.99, description: "Pixel teaches digital creativity and design thinking.", subscribed: false },
  { sku: "tutor-harmony", name: "Harmony", subject: "Music & Language Arts", persona: "harmony", price: 4.99, description: "Harmony uses music and rhythm to teach language skills.", subscribed: false },
  { sku: "tutor-echo", name: "Echo", subject: "Social Skills", persona: "echo", price: 4.99, description: "Echo helps build communication and social understanding.", subscribed: false },
];

const mockHomework = [
  { id: "hw1", subject: "Mathematics", status: "IN_PROGRESS", homeworkMode: "practice", createdAt: new Date(Date.now() - 86400000).toISOString(), adaptedProblems: [{}, {}, {}], extractedText: "Fractions worksheet - adding and subtracting fractions with unlike denominators" },
  { id: "hw2", subject: "Language Arts", status: "READY", homeworkMode: "review", createdAt: new Date(Date.now() - 43200000).toISOString(), adaptedProblems: [{}, {}], extractedText: "Chapter 5 comprehension questions" },
  { id: "hw3", subject: "Science", status: "COMPLETED", homeworkMode: "practice", createdAt: new Date(Date.now() - 259200000).toISOString(), adaptedProblems: [{}, {}, {}, {}], extractedText: "Ecosystems and food chains worksheet" },
];

const mockLearningActivities = [
  { id: "act-1", title: "Fraction Fun: Adding & Subtracting", subject: "Math", type: "lesson" as const, estimatedMinutes: 15, difficulty: "medium" as const, progress: 30 },
  { id: "act-2", title: "Ocean Currents Explorer", subject: "Science", type: "quest" as const, estimatedMinutes: 20, difficulty: "easy" as const, progress: 0 },
  { id: "act-3", title: "Vocabulary Builder: Space Words", subject: "Language Arts", type: "practice" as const, estimatedMinutes: 10, difficulty: "easy" as const, progress: 0 },
  { id: "act-4", title: "History Timeline Challenge", subject: "Social Studies", type: "homework" as const, estimatedMinutes: 25, difficulty: "hard" as const, progress: 60 },
];

const mockTutorGreetings: Record<string, { name: string; specialty: string; greeting: string }> = {
  nova: { name: "Nova", specialty: "Mathematics", greeting: "Hey there, math explorer! I'm Nova, and I love making numbers come alive! What shall we work on today? We could tackle fractions, geometry, or even some brain-teasing puzzles!" },
  sage: { name: "Sage", specialty: "Science", greeting: "Welcome, young scientist! I'm Sage, your guide through the wonders of the natural world. From tiny atoms to massive galaxies — what would you like to discover today?" },
  spark: { name: "Spark", specialty: "Creative Writing", greeting: "Hello, creative mind! I'm Spark, and I'm bursting with story ideas! Want to write an adventure? A mystery? Or maybe a silly poem? Let your imagination run wild!" },
  chrono: { name: "Chrono", specialty: "History", greeting: "Greetings, time traveler! I'm Chrono. Ready to journey through history? We could visit ancient civilizations, meet famous explorers, or uncover hidden mysteries of the past!" },
  pixel: { name: "Pixel", specialty: "Digital Art", greeting: "Hi there, future artist! I'm Pixel. Let's create something amazing together! We can explore colors, shapes, patterns, and design — what inspires you?" },
  harmony: { name: "Harmony", specialty: "Music & Language Arts", greeting: "Hello, friend! I'm Harmony. Music and words are my favorite things! Want to explore rhythm, learn about instruments, or play some word games? Let's make learning musical!" },
  echo: { name: "Echo", specialty: "Social Skills", greeting: "Hi! I'm Echo. I'm here to help you practice talking, listening, and making friends. We can role-play conversations, practice greetings, or work on expressing feelings. What sounds good?" },
};

const mockTutorResponses: Record<string, string[]> = {
  nova: [
    "Great question! Let me break that down for you with a visual example. Imagine you have a pizza cut into 8 slices...",
    "You're doing amazing! That's exactly right. Numbers can be tricky but you're getting the hang of it!",
    "Let's try another approach. Sometimes looking at math problems from a different angle makes them click!",
    "Wow, you solved that so fast! Want to try a trickier one? I bet you can handle it!",
  ],
  sage: [
    "That's a fantastic observation! Scientists call that phenomenon... let me explain with an experiment you can try!",
    "You're thinking like a real scientist! Asking 'why' is the most important thing a scientist can do.",
    "Let's explore that idea further. What do you think would happen if we changed one variable?",
    "Amazing connection! You just linked two concepts that many scientists took years to discover!",
  ],
  spark: [
    "Oh, I love that idea! Your story is getting really exciting. What happens next? Does the hero find the treasure?",
    "Beautiful words! You have such a creative way of describing things. Let's add some more details to paint the picture.",
    "Plot twist! What if the villain isn't really bad, but actually has a secret reason? That would make the story so interesting!",
    "Your writing is really improving! I can see so much imagination in your words. Keep going!",
  ],
  chrono: [
    "Excellent question! Back in ancient times, people used to... Let me take you on a journey to find out!",
    "You'd make a great historian! That's exactly the kind of connection that helps us understand the past.",
    "Time travel alert! Let's zoom forward 500 years and see how things changed...",
    "Fascinating! You just discovered something that puzzled historians for decades. Great detective work!",
  ],
  pixel: [
    "Love your creative vision! Colors can tell stories too — warm colors feel energetic while cool colors feel calm.",
    "That design is coming together beautifully! Try adding some contrast to make it pop even more.",
    "Great eye for detail! Professional designers use that same technique. You've got real talent!",
    "Let's experiment with different shapes. Sometimes the most unexpected combinations create the coolest art!",
  ],
  harmony: [
    "That's a wonderful observation about rhythm! Music and language both have patterns — can you spot the similarity?",
    "You're expressing yourself so well! Words are like music — they have rhythm, tone, and feeling.",
    "Let's try singing that sentence! When we add melody, it's easier to remember. Ready?",
    "Beautiful! You just found the connection between sounds and meanings. That's what language is all about!",
  ],
  echo: [
    "That was a really thoughtful response! Let's practice that again — remember to make eye contact and smile.",
    "Great job! You expressed your feelings clearly. That takes courage and practice.",
    "Let's try a role-play. I'll be a new kid at school, and you can practice introducing yourself. Ready?",
    "You're getting so much better at this! Remember, everyone feels nervous sometimes — that's totally normal.",
  ],
};

const mockShopItems = [
  { id: "s1", name: "Astronaut Helmet", category: "accessory" as const, imageUrl: "/assets/shop/astronaut-helmet.png", price: 150, rarity: "rare" as const, owned: false, equipped: false, description: "A shiny astronaut helmet for your avatar!" },
  { id: "s2", name: "Rainbow Cape", category: "accessory" as const, imageUrl: "/assets/shop/rainbow-cape.png", price: 200, rarity: "epic" as const, owned: true, equipped: true, description: "A flowing rainbow cape that sparkles!" },
  { id: "s3", name: "Dragon Wings", category: "background" as const, imageUrl: "/assets/shop/dragon-wings.png", price: 500, rarity: "legendary" as const, owned: false, equipped: false, description: "Fiery dragon wings behind your avatar." },
  { id: "s4", name: "Neon Sneakers", category: "outfit" as const, imageUrl: "/assets/shop/neon-sneakers.png", price: 100, rarity: "common" as const, owned: false, equipped: false, description: "Glowing neon sneakers for your avatar." },
  { id: "s5", name: "Star Trail", category: "effect" as const, imageUrl: "/assets/shop/star-trail.png", price: 300, rarity: "epic" as const, owned: false, equipped: false, description: "Leave a trail of stars wherever you go!" },
  { id: "s6", name: "Spiky Purple Hair", category: "hair" as const, imageUrl: "/assets/shop/spiky-purple-hair.png", price: 120, rarity: "rare" as const, owned: false, equipped: false, description: "Cool spiky purple hair for your avatar!" },
  { id: "s7", name: "Galaxy Outfit", category: "outfit" as const, imageUrl: "/assets/shop/galaxy-outfit.png", price: 350, rarity: "legendary" as const, owned: false, equipped: false, description: "A stunning galaxy-themed outfit." },
  { id: "s8", name: "Sparkle Effect", category: "effect" as const, imageUrl: "/assets/shop/sparkle-effect.png", price: 80, rarity: "common" as const, owned: true, equipped: false, description: "Sparkles follow you everywhere!" },
];

const mockBadges = [
  { id: "b1", name: "First Steps", description: "Complete your first lesson", icon: "🎯", earnedAt: "2025-09-05T00:00:00Z", category: "milestone" },
  { id: "b2", name: "Math Whiz", description: "Score 100% on 5 math quizzes", icon: "🧮", earnedAt: "2025-10-12T00:00:00Z", category: "subject" },
  { id: "b3", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", earnedAt: "2025-11-01T00:00:00Z", category: "streak" },
  { id: "b4", name: "Ocean Master", description: "Complete the Ocean Explorer world", icon: "🌊", earnedAt: null, category: "quest", progress: 62 },
  { id: "b5", name: "Social Butterfly", description: "Interact with 3 different tutors", icon: "🦋", earnedAt: "2025-12-01T00:00:00Z", category: "social" },
  { id: "b6", name: "Bookworm", description: "Complete 20 reading lessons", icon: "📚", earnedAt: null, category: "subject", progress: 75 },
];

const mockChallenges = [
  { id: "c1", title: "Speed Math Challenge", subject: "Mathematics", type: "1v1" as const, status: "open" as const, participants: 12, maxParticipants: 20, startsAt: new Date(Date.now() + 3600000).toISOString(), duration: 5, xpReward: 100, difficulty: "medium" as const },
  { id: "c2", title: "Reading Marathon", subject: "Language Arts", type: "global" as const, status: "in_progress" as const, participants: 45, maxParticipants: 100, startsAt: new Date(Date.now() - 1800000).toISOString(), duration: 10, xpReward: 75, difficulty: "easy" as const },
  { id: "c3", title: "Science Showdown", subject: "Science", type: "team" as const, status: "open" as const, participants: 8, maxParticipants: 16, startsAt: new Date(Date.now() + 7200000).toISOString(), duration: 8, xpReward: 150, difficulty: "hard" as const },
  { id: "c4", title: "Spelling Bee", subject: "Language Arts", type: "1v1" as const, status: "completed" as const, participants: 20, maxParticipants: 20, startsAt: new Date(Date.now() - 86400000).toISOString(), duration: 3, xpReward: 50, difficulty: "easy" as const },
];

const mockProfileStats = {
  name: "Alex Johnson",
  avatarUrl: "",
  level: 12,
  totalXp: 2450,
  coins: 680,
  currentStreak: 7,
  longestStreak: 14,
  totalBadges: 5,
  totalLessonsCompleted: 45,
  totalTimeSpent: 1250,
  favoriteSubject: "Math",
  memberSince: "2025-09-01T00:00:00Z",
};

const mockFunctioningLevel = {
  current: "SUPPORTED",
  history: [
    { level: "LOW_VERBAL", date: "2025-09-01" },
    { level: "SUPPORTED", date: "2025-11-15" },
  ],
  assessmentDate: "2025-11-15",
  nextAssessmentDate: "2026-02-15",
  details: {
    communication: 65,
    socialInteraction: 55,
    selfRegulation: 70,
    academicSkills: 75,
    dailyLiving: 80,
  },
};

const mockLearnerSettings = {
  privacyLevel: "standard",
  dataRetentionDays: 365,
  allowThirdPartySharing: false,
  notificationsEnabled: true,
  adaptiveContentEnabled: true,
};

const mockExportHistory = [
  { id: "e1", requestedAt: "2026-01-15T10:00:00Z", completedAt: "2026-01-15T10:05:00Z", status: "completed", fileUrl: "#", fileSize: 2400000 },
];

const mockSubscriptionStatus = {
  subscriptionId: "sub-001",
  status: "active",
  plan: { id: "family", name: "Family Plan", price: 1499, interval: "month", maxLearners: 3 },
  currentPeriodEnd: new Date(Date.now() + 86400000 * 25).toISOString(),
  cancelAtPeriodEnd: false,
  addOns: [],
  paymentMethod: { brand: "visa", last4: "4242", expMonth: 12, expYear: 2027 },
  invoices: [
    { id: "inv-001", amount: 1499, status: "paid", date: new Date(Date.now() - 86400000 * 5).toISOString(), pdfUrl: "#" },
    { id: "inv-002", amount: 1499, status: "paid", date: new Date(Date.now() - 86400000 * 35).toISOString(), pdfUrl: "#" },
  ],
};

const mockDistrictOverview = {
  totalStudents: 1247,
  activeStudents: 1089,
  totalTeachers: 86,
  totalClassrooms: 42,
  licensesUsed: 1247,
  licensesTotal: 1500,
  averageEngagement: 73,
  averageMastery: 68,
  weeklyActiveRate: 87,
  topSubjects: [
    { name: "Math", engagement: 82 },
    { name: "Science", engagement: 76 },
    { name: "Language Arts", engagement: 71 },
  ],
};

const mockTeachers = [
  { id: "t1", name: "Maria Rivera", email: "rivera@school.edu", classrooms: 3, students: 68, status: "active", lastActive: new Date(Date.now() - 3600000).toISOString() },
  { id: "t2", name: "James Park", email: "park@school.edu", classrooms: 2, students: 45, status: "active", lastActive: new Date(Date.now() - 7200000).toISOString() },
  { id: "t3", name: "Sarah Kim", email: "kim@school.edu", classrooms: 2, students: 52, status: "active", lastActive: new Date(Date.now() - 86400000).toISOString() },
];

const mockAdminClassrooms = [
  { id: "cl1", name: "3rd Grade - Section A", teacher: "Maria Rivera", teacherId: "t1", students: 24, averageMastery: 72, status: "active" },
  { id: "cl2", name: "3rd Grade - Section B", teacher: "Maria Rivera", teacherId: "t1", students: 22, averageMastery: 68, status: "active" },
  { id: "cl3", name: "4th Grade - Section A", teacher: "James Park", teacherId: "t2", students: 25, averageMastery: 75, status: "active" },
  { id: "cl4", name: "4th Grade - Section B", teacher: "James Park", teacherId: "t2", students: 20, averageMastery: 71, status: "active" },
  { id: "cl5", name: "5th Grade - Section A", teacher: "Sarah Kim", teacherId: "t3", students: 26, averageMastery: 70, status: "active" },
];

const mockLicenseData = {
  plan: "district",
  totalSeats: 1500,
  usedSeats: 1247,
  expiresAt: new Date(Date.now() + 86400000 * 180).toISOString(),
  autoRenew: true,
  allocations: [
    { school: "Lincoln Elementary", allocated: 500, used: 420 },
    { school: "Washington Middle", allocated: 600, used: 512 },
    { school: "Jefferson Elementary", allocated: 400, used: 315 },
  ],
};

const mockTeacherClassrooms = [
  {
    id: "tc1",
    name: "3rd Grade - Section A",
    gradeBand: "3rd Grade",
    subject: "All Subjects",
    learnerCount: 24,
    avgMasteryPct: 72,
    atRiskCount: 3,
    recentActivity: new Date(Date.now() - 3600000).toISOString(),
    learners: [
      { id: "s1", name: "Alex Johnson", masteryPct: 78, lastActiveAt: new Date(Date.now() - 3600000).toISOString(), atRisk: false, functioningLevel: "Supported" },
      { id: "s2", name: "Emma Wilson", masteryPct: 85, lastActiveAt: new Date(Date.now() - 7200000).toISOString(), atRisk: false, functioningLevel: "Independent" },
      { id: "s3", name: "Liam Brown", masteryPct: 62, lastActiveAt: new Date(Date.now() - 86400000).toISOString(), atRisk: true, functioningLevel: "Supported" },
      { id: "s4", name: "Sophia Martinez", masteryPct: 91, lastActiveAt: new Date(Date.now() - 1800000).toISOString(), atRisk: false, functioningLevel: "Independent" },
      { id: "s5", name: "Noah Davis", masteryPct: 45, lastActiveAt: new Date(Date.now() - 172800000).toISOString(), atRisk: true, functioningLevel: "Intensive" },
      { id: "s6", name: "Olivia Garcia", masteryPct: 73, lastActiveAt: new Date(Date.now() - 14400000).toISOString(), atRisk: false, functioningLevel: "Supported" },
    ],
  },
  {
    id: "tc2",
    name: "3rd Grade - Section B",
    gradeBand: "3rd Grade",
    subject: "All Subjects",
    learnerCount: 22,
    avgMasteryPct: 68,
    atRiskCount: 4,
    recentActivity: new Date(Date.now() - 7200000).toISOString(),
    learners: [
      { id: "s7", name: "Ethan Kim", masteryPct: 80, lastActiveAt: new Date(Date.now() - 5400000).toISOString(), atRisk: false, functioningLevel: "Independent" },
      { id: "s8", name: "Ava Chen", masteryPct: 55, lastActiveAt: new Date(Date.now() - 259200000).toISOString(), atRisk: true, functioningLevel: "Supported" },
      { id: "s9", name: "Mason Lee", masteryPct: 70, lastActiveAt: new Date(Date.now() - 10800000).toISOString(), atRisk: false, functioningLevel: "Supported" },
    ],
  },
];

const mockEngagement = {
  xp: { totalXp: 2450, weeklyXp: 385, dailyXp: 40, xpToNextLevel: 550 },
  streak: { currentStreak: 7, longestStreak: 14, lastActiveDate: new Date().toISOString() },
  badges: mockBadges.filter((b) => b.earnedAt).map((b) => ({ ...b, iconUrl: "" })),
  level: { level: 12, title: "Star Explorer", currentXp: 2450, requiredXp: 3000 },
  coins: 680,
  recentXp: [
    { date: new Date(Date.now() - 86400000 * 6).toISOString(), xp: 45 },
    { date: new Date(Date.now() - 86400000 * 5).toISOString(), xp: 60 },
    { date: new Date(Date.now() - 86400000 * 4).toISOString(), xp: 35 },
    { date: new Date(Date.now() - 86400000 * 3).toISOString(), xp: 80 },
    { date: new Date(Date.now() - 86400000 * 2).toISOString(), xp: 55 },
    { date: new Date(Date.now() - 86400000).toISOString(), xp: 70 },
    { date: new Date().toISOString(), xp: 40 },
  ],
};

const mockIntegrationStatus = {
  lti: { enabled: false, platformCount: 0 },
  clever: { enabled: true, lastSync: new Date(Date.now() - 86400000).toISOString(), status: "connected" },
  classlink: { enabled: false, status: "disconnected" },
  webhooks: { enabled: true, endpointCount: 2 },
};

const mockLearnerDetail = {
  learner: {
    id: MOCK_LEARNER_ID,
    name: "Alex Johnson",
    avatarUrl: "",
    functioningLevel: "SUPPORTED" as const,
    dateOfBirth: "2016-05-15T00:00:00Z",
    enrolledGrade: "3rd Grade",
    enrolledSubjects: ["Math", "Science", "Language Arts", "Social Studies"],
    languagePreference: "en",
    preferences: {
      theme: "default",
      reduceAnimations: false,
      fontSize: "medium" as const,
      soundEnabled: true,
    },
    pinSetAt: "2025-10-01T00:00:00Z",
  },
};

export function getMockTutorResponse(persona: string): string {
  const responses = mockTutorResponses[persona] ?? mockTutorResponses.nova;
  return responses[Math.floor(Math.random() * responses.length)];
}

function matchRoute(path: string, routes: [string | RegExp, () => unknown][]): unknown | undefined {
  for (const [pattern, handler] of routes) {
    if (typeof pattern === "string") {
      if (path === pattern) return handler();
    } else {
      if (pattern.test(path)) return handler();
    }
  }
  return undefined;
}

export function getMockResponse(path: string, method: string = "GET", body?: string): unknown | undefined {
  if (method === "POST" && /\/api\/learners\/[^/]+\/pin\/verify$/.test(path)) {
    try {
      const parsed = body ? JSON.parse(body) : {};
      if (parsed.pin === "1234") {
        return { success: true, token: "mock-learner-session-token" };
      }
    } catch {}
    return { success: false, error: "Invalid PIN" };
  }

  if (method === "POST" && path === "/api/tutors/sessions/start") {
    try {
      const parsed = body ? JSON.parse(body) : {};
      const slug = parsed.subject ?? "nova";
      const info = mockTutorGreetings[slug] ?? mockTutorGreetings.nova;
      return {
        session: {
          id: `mock-session-${slug}-${Date.now()}`,
          tutor: {
            name: info.name,
            slug: slug,
            avatarUrl: "",
            specialty: info.specialty,
            greeting: info.greeting,
          },
        },
      };
    } catch {}
    return { session: { id: "mock-session-fallback", tutor: { name: "Nova", slug: "nova", avatarUrl: "", specialty: "Mathematics", greeting: "Hi there! Let's learn together!" } } };
  }

  if (method === "POST" && /\/api\/learners\/[^/]+\/challenges\/[^/]+\/join$/.test(path)) {
    return { success: true };
  }

  if (method === "POST" && path === "/api/shop/purchase") {
    return { success: true };
  }

  if (method === "POST" && /\/api\/learning\/sessions\/[^/]+\/start$/.test(path)) {
    return {
      sessionId: `mock-learn-session-${Date.now()}`,
      question: { id: "q1", type: "multiple_choice", prompt: "What is 3/4 + 1/4?", options: ["1", "2/4", "1/2", "3/4"] },
      totalQuestions: 5,
    };
  }

  if (method === "POST" && /\/api\/learning\/sessions\/[^/]+\/interact$/.test(path)) {
    return { correct: true, feedback: "Great job! That's the right answer!", xpEarned: 10, nextQuestion: { id: "q2", type: "multiple_choice", prompt: "What is 1/2 of 10?", options: ["5", "10", "2", "1"] } };
  }

  if (method === "POST" && path === "/api/assessment/parent") {
    return { success: true };
  }

  if (method === "POST" && path === "/api/learners") {
    const bodyData = body ? JSON.parse(body) : {};
    const newId = `learner-${Date.now()}`;
    return {
      learner: {
        id: newId,
        name: bodyData.name ?? "New Learner",
        dateOfBirth: bodyData.dateOfBirth ?? new Date().toISOString(),
        avatarUrl: undefined,
        functioningLevel: "STANDARD",
        preferences: {},
      },
    };
  }

  if (method !== "GET") return {};

  const routes: [string | RegExp, () => unknown][] = [
    ["/api/assessment/parent/questions", () => ({
      categories: [
        {
          key: "learning_style",
          label: "Learning Style",
          questions: [
            { id: "ls-1", category: "learning_style", questionText: "How does your child learn best?", questionType: "multiple_choice", options: ["By seeing pictures, videos, and demonstrations", "By listening to explanations and discussions", "By doing hands-on activities and moving around", "By reading and writing things down", "A combination of several ways"], required: true, helpText: "Think about times when your child learned something new successfully." },
            { id: "ls-2", category: "learning_style", questionText: "When your child encounters a challenging problem, they typically:", questionType: "multiple_choice", options: ["Work through it independently with persistence", "Seek help immediately from an adult", "Get frustrated and give up quickly", "Try a few times, then ask for guidance", "Avoid the task altogether"], required: true },
            { id: "ls-3", category: "learning_style", questionText: "How long can your child focus on a learning task without becoming distracted?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Less than 5 minutes", max: "30+ minutes consistently" }, required: true },
            { id: "ls-4", category: "learning_style", questionText: "What time of day is your child most alert and ready to learn?", questionType: "multiple_choice", options: ["Early morning (6-9 AM)", "Late morning (9-12 PM)", "Early afternoon (12-3 PM)", "Late afternoon (3-6 PM)", "Evening (6-9 PM)", "It varies day to day"], required: true, helpText: "This helps us recommend optimal learning times." },
            { id: "ls-5", category: "learning_style", questionText: "Does your child prefer learning:", questionType: "multiple_choice", options: ["Alone and independently", "With one other person (parent, sibling, or peer)", "In a small group setting", "In a larger classroom environment", "Depends on the subject or activity"], required: true },
            { id: "ls-6", category: "learning_style", questionText: "How does your child respond to mistakes or incorrect answers?", questionType: "multiple_choice", options: ["Learns from them and tries again with enthusiasm", "Gets mildly frustrated but continues", "Becomes very upset and needs encouragement", "Avoids similar tasks in the future", "Shows little emotional response"], required: true },
          ],
        },
        {
          key: "strengths",
          label: "Strengths",
          questions: [
            { id: "str-1", category: "strengths", questionText: "Which subjects or activities does your child excel in?", questionType: "multi_select", options: ["Reading and comprehension", "Writing and storytelling", "Math and numbers", "Science and discovery", "Creative arts (drawing, music, etc.)", "Physical activities and sports", "Problem-solving and puzzles", "Social interactions and communication", "Memory and recall"], required: true, helpText: "Select all that apply." },
            { id: "str-2", category: "strengths", questionText: "What specific skills or talents have you noticed in your child?", questionType: "open_ended", required: false, helpText: "Share any unique abilities, interests, or accomplishments." },
            { id: "str-3", category: "strengths", questionText: "How creative is your child when solving problems or playing?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Prefers structured guidance", max: "Extremely imaginative and innovative" }, required: true },
            { id: "str-4", category: "strengths", questionText: "How well does your child remember and recall information?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Struggles to remember", max: "Excellent memory and recall" }, required: true },
          ],
        },
        {
          key: "challenges",
          label: "Challenges",
          questions: [
            { id: "ch-1", category: "challenges", questionText: "Which subjects or areas does your child find most challenging?", questionType: "multi_select", options: ["Reading and comprehension", "Writing and composition", "Math calculations", "Math word problems", "Spelling", "Science concepts", "Focusing and attention", "Following multi-step instructions", "Organization and time management"], required: false, helpText: "Select all that apply. This helps us provide targeted support." },
            { id: "ch-2", category: "challenges", questionText: "Does your child have any diagnosed learning differences or accommodations?", questionType: "multiple_choice", options: ["No, none that I'm aware of", "Yes, ADHD/ADD", "Yes, dyslexia or reading difficulty", "Yes, dyscalculia or math difficulty", "Yes, autism spectrum", "Yes, other (please specify in notes)", "Currently being evaluated"], required: false, helpText: "This information remains confidential and helps us personalize learning." },
            { id: "ch-3", category: "challenges", questionText: "Additional information about challenges or accommodations:", questionType: "open_ended", required: false, helpText: "Share any IEP/504 accommodations, strategies that work, or specific needs." },
            { id: "ch-4", category: "challenges", questionText: "How does your child handle homework or independent work?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Needs constant supervision", max: "Completely independent" }, required: true },
            { id: "ch-5", category: "challenges", questionText: "What frustrates your child most about learning?", questionType: "open_ended", required: false, helpText: "Understanding frustrations helps us avoid triggers and build confidence." },
          ],
        },
        {
          key: "behavior",
          label: "Behavior & Engagement",
          questions: [
            { id: "beh-1", category: "behavior", questionText: "How motivated is your child to learn new things?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Requires significant encouragement", max: "Self-motivated and curious" }, required: true },
            { id: "beh-2", category: "behavior", questionText: "How does your child respond to praise and rewards?", questionType: "multiple_choice", options: ["Very responsive - highly motivated by praise", "Moderately responsive", "Neutral - doesn't seem to affect motivation", "Prefers tangible rewards over verbal praise", "Internal motivation is stronger than external"], required: true },
            { id: "beh-3", category: "behavior", questionText: "Does your child exhibit any behavioral patterns during learning?", questionType: "multi_select", options: ["Gets restless and needs movement breaks", "Works better with background music or sound", "Prefers complete silence", "Needs frequent breaks", "Works best in short bursts", "Can sustain focus for extended periods", "None of the above"], required: false, helpText: "Select all that apply." },
            { id: "beh-4", category: "behavior", questionText: "How does your child typically start their day or learning session?", questionType: "multiple_choice", options: ["Energetic and ready to go", "Needs time to warm up", "Resistant and requires encouragement", "Depends on the activity or their mood", "Variable and unpredictable"], required: true },
          ],
        },
        {
          key: "preferences",
          label: "Preferences",
          questions: [
            { id: "pref-1", category: "preferences", questionText: "What subjects or topics is your child most interested in?", questionType: "multi_select", options: ["Animals and nature", "Space and astronomy", "Technology and computers", "Sports and athletics", "Art and creativity", "Music and performance", "History and cultures", "Math puzzles and logic", "Science experiments", "Reading and stories"], required: false, helpText: "We can incorporate these interests into learning activities." },
            { id: "pref-2", category: "preferences", questionText: "Does your child prefer structure or flexibility in learning?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Needs clear structure and routines", max: "Thrives with flexibility and choice" }, required: true },
            { id: "pref-3", category: "preferences", questionText: "What type of activities engage your child the most?", questionType: "multiple_choice", options: ["Games and competitions", "Stories and narratives", "Building and creating", "Exploring and discovering", "Practicing and mastering skills", "Collaborating with others"], required: true },
          ],
        },
        {
          key: "social_emotional",
          label: "Social-Emotional",
          questions: [
            { id: "se-1", category: "social_emotional", questionText: "How confident is your child in their abilities as a learner?", questionType: "rating_scale", scaleMin: 1, scaleMax: 5, scaleLabels: { min: "Low confidence, often doubts themselves", max: "Very confident and self-assured" }, required: true },
            { id: "se-2", category: "social_emotional", questionText: "How does your child handle frustration or setbacks?", questionType: "multiple_choice", options: ["Bounces back quickly and tries again", "Needs encouragement but persists", "Gets upset but calms down with support", "Becomes very discouraged", "Shuts down or avoids the situation"], required: true },
            { id: "se-3", category: "social_emotional", questionText: "Is there anything else you'd like us to know about your child?", questionType: "open_ended", required: false, helpText: "Share any additional insights, concerns, or context that would help us support your child's learning journey." },
          ],
        },
        {
          key: "functioning_level",
          label: "Functioning Level",
          questions: [
            { id: "fl-1", category: "functioning_level", questionText: "Does your child have an Individualized Education Program (IEP) or 504 plan?", questionType: "multiple_choice", options: ["No IEP or 504 plan", "Yes, 504 plan only", "Yes, IEP for learning disabilities", "Yes, IEP for developmental delay", "Yes, IEP for intellectual disability", "Yes, IEP for multiple disabilities", "Currently being evaluated"], required: true, helpText: "This helps us customize the assessment experience appropriately." },
            { id: "fl-2", category: "functioning_level", questionText: "Can your child follow simple 1-2 step verbal instructions independently?", questionType: "multiple_choice", options: ["Yes, consistently and independently", "Yes, with occasional reminders", "Sometimes, with frequent prompting needed", "Rarely, requires significant support", "No, requires physical guidance or demonstration"], required: true },
            { id: "fl-3", category: "functioning_level", questionText: "Can your child recognize and identify basic pictures and symbols?", questionType: "multiple_choice", options: ["Yes, recognizes many pictures and symbols", "Yes, recognizes common objects and simple symbols", "Somewhat, recognizes a limited set of familiar images", "Rarely, struggles to connect pictures to meaning", "No, does not demonstrate picture/symbol recognition"], required: true },
            { id: "fl-4", category: "functioning_level", questionText: "How does your child typically respond to questions or choices?", questionType: "multiple_choice", options: ["Verbally answers questions clearly", "Uses short words or phrases", "Points to or touches choices", "Uses communication device or pictures", "Looks at or gazes toward choices", "Requires adult to interpret responses", "Does not consistently respond to questions"], required: true },
            { id: "fl-5", category: "functioning_level", questionText: "What is your child's current level of reading ability?", questionType: "multiple_choice", options: ["Reads at or above grade level", "Reads 1-2 grades below level", "Recognizes some sight words", "Recognizes letters but not words", "Does not read or recognize letters", "Non-applicable / Pre-reading age"], required: true, helpText: "This helps us determine if content should be read aloud." },
            { id: "fl-6", category: "functioning_level", questionText: "Can your child independently use a tablet or touchscreen?", questionType: "multiple_choice", options: ["Yes, uses tablets/touchscreens independently", "Yes, with occasional guidance", "Yes, but needs large buttons/targets", "Somewhat, with physical hand-over-hand support", "No, requires an adult to navigate for them", "Uses assistive technology (switch, eye gaze)"], required: true },
            { id: "fl-7", category: "functioning_level", questionText: "How would you describe your child's overall developmental level?", questionType: "multiple_choice", options: ["Age-appropriate development", "Mild delays (about 1-2 years behind peers)", "Moderate delays (about 3-4 years behind peers)", "Significant delays (more than 4 years behind peers)", "Profound delays (functioning at infant/toddler level)", "Unsure / Prefer not to answer"], required: true, helpText: "This information is confidential and helps us create the best experience." },
            { id: "fl-8", category: "functioning_level", questionText: "Which daily living skills can your child perform independently? (Select all that apply)", questionType: "multi_select", options: ["Feeding themselves", "Dressing with minimal help", "Basic hygiene (handwashing, teeth brushing)", "Using the bathroom independently", "Following household routines", "None of the above independently"], required: false, helpText: "This helps us understand appropriate activity complexity." },
          ],
        },
        {
          key: "sensory_accessibility",
          label: "Sensory Accessibility",
          questions: [
            { id: "sa-1", category: "sensory_accessibility", questionText: "Does your child have any vision impairment?", questionType: "multiple_choice", options: ["No vision impairment", "Wears glasses/contacts (corrected to normal)", "Low vision (even with glasses)", "Legally blind", "Totally blind"], required: true, helpText: "This determines if we need to provide audio-first or screen reader content." },
            { id: "sa-2", category: "sensory_accessibility", questionText: "If your child has vision impairment, what tools do they use? (Select all that apply)", questionType: "multi_select", options: ["Not applicable - no vision impairment", "Screen reader (NVDA, JAWS, VoiceOver, TalkBack)", "Screen magnification software", "Braille display", "Audio descriptions", "High contrast mode", "Large print materials", "Tactile graphics/models"], required: false, helpText: "We will configure the app to work with these tools." },
            { id: "sa-3", category: "sensory_accessibility", questionText: "Does your child have any hearing impairment?", questionType: "multiple_choice", options: ["No hearing impairment", "Mild hearing loss (uses hearing aids)", "Moderate hearing loss", "Severe hearing loss", "Profoundly deaf", "Deaf since birth"], required: true, helpText: "This determines if we need to provide visual/sign language content." },
            { id: "sa-4", category: "sensory_accessibility", questionText: "If your child has hearing impairment, what do they use? (Select all that apply)", questionType: "multi_select", options: ["Not applicable - no hearing impairment", "Hearing aids", "Cochlear implant", "American Sign Language (ASL)", "British Sign Language (BSL)", "Other sign language", "Lip reading", "Written/text communication", "Captions/subtitles"], required: false, helpText: "We will provide appropriate visual supports." },
            { id: "sa-5", category: "sensory_accessibility", questionText: "Does your child have combined vision and hearing impairment (deafblind)?", questionType: "yes_no", options: ["Yes", "No"], required: true, helpText: "Deafblind learners need specialized tactile/haptic content." },
          ],
        },
        {
          key: "communication_needs",
          label: "Communication Needs",
          questions: [
            { id: "cn-1", category: "communication_needs", questionText: "How does your child primarily communicate?", questionType: "multiple_choice", options: ["Verbal speech (speaks clearly)", "Verbal speech (limited vocabulary or clarity)", "Sign language", "Picture symbols (PECS, Boardmaker, etc.)", "Communication device/app (AAC)", "Gestures and pointing", "Combination of methods", "Non-verbal / Pre-verbal"], required: true, helpText: "This helps us provide appropriate response options." },
            { id: "cn-2", category: "communication_needs", questionText: "Does your child use an AAC (Augmentative and Alternative Communication) device or app?", questionType: "multiple_choice", options: ["No, does not use AAC", "Yes - Proloquo2Go", "Yes - TouchChat", "Yes - LAMP Words for Life", "Yes - Snap + Core First", "Yes - GoTalk or similar low-tech device", "Yes - Picture Exchange Communication System (PECS)", "Yes - Other AAC system"], required: false, helpText: "We can integrate with some AAC systems for seamless communication." },
            { id: "cn-3", category: "communication_needs", questionText: "What symbol set is your child most familiar with?", questionType: "multiple_choice", options: ["Not applicable - uses verbal/text communication", "PCS (Picture Communication Symbols / Boardmaker)", "SymbolStix", "Widgit Symbols", "LAMP symbols", "Photographs of real objects", "Custom/other symbols", "Not sure"], required: false, helpText: "Using familiar symbols helps your child respond more easily." },
          ],
        },
        {
          key: "input_method",
          label: "Input Method",
          questions: [
            { id: "im-1", category: "input_method", questionText: "How does your child interact with screens/devices?", questionType: "multiple_choice", options: ["Standard touch/mouse - no adaptations needed", "Needs larger touch targets/buttons", "Uses switch access (single switch)", "Uses switch access (two switches)", "Uses eye gaze/eye tracking", "Uses head tracking", "Uses voice control", "Parent/aide operates device based on child's cues"], required: true, helpText: "We will configure the app for your child's access method." },
            { id: "im-2", category: "input_method", questionText: "If your child uses switch or scanning access, what settings work best?", questionType: "multiple_choice", options: ["Not applicable - does not use switch access", "Automatic scanning (items highlight in sequence)", "Step scanning (switch advances to next item)", "Row-column scanning", "Group scanning", "Unsure - need help determining"], required: false, helpText: "We can customize scanning patterns and timing." },
            { id: "im-3", category: "input_method", questionText: "Does your child need extra time to respond to questions?", questionType: "multiple_choice", options: ["No, responds at typical pace", "Yes, needs a few extra seconds", "Yes, needs significantly more time (10+ seconds)", "Yes, needs partner assistance to respond", "Yes, no time limits should be used"], required: true, helpText: "We will adjust timing and remove any time pressure." },
          ],
        },
        {
          key: "support_needs",
          label: "Support Needs",
          questions: [
            { id: "sn-1", category: "support_needs", questionText: "Will an adult need to be present during the assessment?", questionType: "multiple_choice", options: ["No, child can complete independently", "Yes, to provide encouragement but not help", "Yes, to read questions aloud", "Yes, to physically assist with responses", "Yes, to interpret/translate responses", "Yes, to fully facilitate (observational mode)"], required: true, helpText: "This helps us determine the best assessment format." },
            { id: "sn-2", category: "support_needs", questionText: "How many questions can your child typically handle before needing a break?", questionType: "multiple_choice", options: ["20+ questions at a time", "10-20 questions at a time", "5-10 questions at a time", "3-5 questions at a time", "1-2 questions at a time", "Needs frequent breaks after each question"], required: true, helpText: "We will build in appropriate breaks." },
            { id: "sn-3", category: "support_needs", questionText: "What type of breaks help your child re-focus? (Select all that apply)", questionType: "multi_select", options: ["Movement breaks (stretching, walking)", "Sensory breaks (calming music, visuals)", "Quiet rest (close eyes, dark room)", "Preferred activity break (watch video, play)", "Deep pressure/weighted blanket", "Snack break", "Social interaction break", "No specific break type needed"], required: false, helpText: "We can suggest appropriate break activities." },
            { id: "sn-4", category: "support_needs", questionText: "Does your child have any specific triggers we should avoid in content?", questionType: "multi_select", options: ["Loud or sudden sounds", "Flashing lights or animations", "Certain colors (please specify)", "Crowded or busy visuals", "Cartoon characters or faces", "Specific topics (please specify in notes)", "Time pressure or countdowns", "None that I'm aware of"], required: false, helpText: "This helps us create a comfortable assessment environment." },
            { id: "sn-5", category: "support_needs", questionText: "Any additional information about your child's accessibility or support needs?", questionType: "open_ended", required: false, helpText: "Share any specific accommodations, equipment, or strategies that help your child succeed." },
          ],
        },
      ],
    })],
    ["/api/learners", () => ({ learners: mockLearners })],
    [/^\/api\/learners\/[^/]+\/brain-profile$/, () => mockBrainProfile],
    [/^\/api\/learners\/[^/]+\/recommendations$/, () => mockRecommendations],
    [/^\/api\/learners\/[^/]+\/gradebook$/, () => mockGradebook],
    [/^\/api\/learners\/[^/]+\/gradebook\/mastery$/, () => mockMastery],
    [/^\/api\/learners\/[^/]+\/iep$/, () => mockIep],
    [/^\/api\/learners\/[^/]+\/collaboration$/, () => ({ subscriptionType: "parent", members: mockCollaboration })],
    [/^\/api\/learning\/learning-path\/[^/]+\/next$/, () => mockLearningActivities],
    [/^\/api\/learning\/learning-path\/[^/]+$/, () => ({ activities: mockLearningActivities, completedToday: 2, totalToday: 6 })],
    [/^\/api\/learners\/[^/]+\/quests\/worlds$/, () => mockQuestWorlds],
    [/^\/api\/learners\/[^/]+\/quests\/[^/]+$/, () => mockQuestWorldDetail],
    [/^\/api\/learners\/[^/]+\/engagement$/, () => mockEngagement],
    [/^\/api\/learners\/[^/]+\/engagement\/badges$/, () => mockEngagement.badges],
    [/^\/api\/learners\/[^/]+\/engagement\/xp$/, () => mockEngagement.xp],
    [/^\/api\/learners\/[^/]+\/engagement\/streaks$/, () => mockEngagement.streak],
    [/^\/api\/learners\/[^/]+\/engagement\/level$/, () => mockEngagement.level],
    [/^\/api\/learners\/[^/]+\/settings$/, () => mockLearnerSettings],
    [/^\/api\/learners\/[^/]+\/avatar$/, () => ({ equipped: [] })],
    [/^\/api\/learners\/[^/]+$/, () => mockLearnerDetail],
    [/^\/api\/learners\/[^/]+\/progress$/, () => ({ overallMastery: 72, sessionsThisWeek: 12, averageAccuracy: 78, recentSubjects: [{ name: "Math", mastery: 85 }, { name: "Science", mastery: 75 }, { name: "Language Arts", mastery: 58 }, { name: "Social Studies", mastery: 70 }] })],

    ["/api/notifications", () => mockNotifications],
    ["/api/notifications/preferences", () => ({ email: true, push: true, sms: false })],

    [/^\/api\/tutors\/homework\/learner\//, () => ({ assignments: mockHomework })],
    [/^\/api\/tutors\?learnerId=/, () => ({ subscriptions: mockTutorSubscriptions })],
    [/^\/api\/tutors\/store\?learnerId=/, () => ({ catalog: mockTutorStore })],
    ["/api/tutors", () => ({ subscriptions: mockTutorSubscriptions })],
    ["/api/tutors/store", () => ({ catalog: mockTutorStore })],

    ["/api/shop/items", () => mockShopItems],

    [/^\/api\/learners\/[^/]+\/challenges$/, () => mockChallenges],
    [/^\/family\/brain\/[^/]+\/functioning-level$/, () => mockFunctioningLevel],

    [/^\/api\/family\/learners\/[^/]+\/export\/status$/, () => ({ status: "idle" })],
    [/^\/api\/family\/learners\/[^/]+\/export\/history$/, () => ({ exports: mockExportHistory })],
    [/^\/api\/family\/insights\//, () => ({ insights: [] })],
    ["/api/billing/subscription/status", () => mockSubscriptionStatus],
    ["/api/billing/subscriptions/current", () => mockSubscriptionStatus],
    ["/api/billing/current", () => mockSubscriptionStatus],
    ["/api/billing/plans", () => [{ id: "family", name: "Family Plan", price: 1499, interval: "month" }]],

    [/^\/api\/analytics\/learner\//, () => ({ mastery: 72, sessions: 45, avgScore: 78 })],
    ["/api/analytics/dashboard", () => ({ learners: mockLearners.length, avgMastery: 72 })],

    ["/api/admin/analytics/overview", () => mockDistrictOverview],
    ["/api/admin/teachers", () => mockTeachers],
    ["/api/admin/classrooms", () => mockAdminClassrooms],
    [/^\/api\/admin\/classrooms\/[^/]+$/, () => ({
      id: "cl1", name: "3rd Grade - Section A", teacher: "Maria Rivera", teacherId: "t1",
      learners: mockTeacherClassrooms[0].learners, averageMastery: 72,
    })],
    ["/api/admin/licenses", () => mockLicenseData],
    ["/api/integrations/status", () => mockIntegrationStatus],
    ["/api/integrations/lti/platforms", () => ({ platforms: [] })],
    ["/api/integrations/webhooks", () => []],

    ["/api/teacher/classrooms", () => mockTeacherClassrooms],
    [/^\/api\/teacher\/classrooms\/[^/]+$/, () => mockTeacherClassrooms[0]],
    [/^\/api\/teacher\/learners\/[^/]+\/brain$/, () => ({
      id: "s1",
      name: "Alex Johnson",
      functioningLevel: "Supported",
      subjects: [
        { subject: "Mathematics", masteryPct: 85 },
        { subject: "Science", masteryPct: 75 },
        { subject: "Language Arts", masteryPct: 58 },
        { subject: "Social Studies", masteryPct: 70 },
      ],
      accommodations: [
        { id: "a1", label: "Visual Aids", description: "Uses image-based prompts and diagrams" },
        { id: "a2", label: "Extended Time", description: "1.5x time for responses" },
        { id: "a3", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes" },
        { id: "a4", label: "Low Stimulation", description: "Reduced animations and sounds" },
      ],
      iepGoals: [
        { id: "g1", title: "Improve reading fluency to grade level", progressPct: 62, targetDate: new Date(Date.now() + 86400000 * 60).toISOString() },
        { id: "g2", title: "Increase social interaction during group work", progressPct: 45, targetDate: new Date(Date.now() + 86400000 * 90).toISOString() },
        { id: "g3", title: "Use self-regulation strategies independently", progressPct: 78, targetDate: new Date(Date.now() + 86400000 * 30).toISOString() },
      ],
      recentSessions: [
        { id: "rs1", subject: "Mathematics", date: new Date(Date.now() - 3600000).toISOString(), durationMin: 25, score: 88 },
        { id: "rs2", subject: "Language Arts", date: new Date(Date.now() - 86400000).toISOString(), durationMin: 20, score: 72 },
        { id: "rs3", subject: "Science", date: new Date(Date.now() - 172800000).toISOString(), durationMin: 30, score: 80 },
        { id: "rs4", subject: "Mathematics", date: new Date(Date.now() - 259200000).toISOString(), durationMin: 22, score: 92 },
      ],
    })],
    [/^\/api\/teacher\/learners\/[^/]+\/insights$/, () => ({ insights: [] })],
    [/^\/api\/teacher\/learners\/[^/]+\/iep$/, () => ({ success: true })],
    [/^\/api\/teacher\/learners\/[^/]+\/family$/, () => ({
      subscriptionType: "district",
      members: [
        { id: "fm1", name: "Sarah Johnson", email: "sarah@email.com", role: "parent", status: "active", joinedAt: "2025-08-15T00:00:00Z" },
        { id: "fm2", name: "Jamie Rodriguez", email: "jamie@email.com", role: "caregiver", status: "active", joinedAt: "2025-11-01T00:00:00Z" },
      ],
    })],

    ["/api/caregiver/child", () => ({
      id: "learner-001",
      name: "Alex Johnson",
      functioningLevel: "SUPPORTED",
      grade: "3rd Grade",
      mastery: 72,
      recentSessionCount: 4,
      accommodationCount: 4,
      iepGoalCount: 3,
      subjects: [
        { name: "Mathematics", mastery: 85 },
        { name: "Science", mastery: 75 },
        { name: "Language Arts", mastery: 58 },
        { name: "Social Studies", mastery: 70 },
      ],
    })],
    [/^\/api\/caregiver\/child\/brain-profile$/, () => ({
      learningStyle: "Visual-spatial learner who excels with diagrams, color-coded information, and hands-on activities.",
      communicationStyle: "Responds well to clear, concise instructions with visual supports. Prefers written over verbal directions.",
      strengths: ["Visual Learning", "Pattern Recognition", "Creative Thinking", "Mathematics", "Spatial Reasoning"],
      challenges: ["Auditory Processing", "Time Management", "Social Communication"],
      sensoryPreferences: ["Low noise environments", "Dim lighting preferred", "Fidget tools helpful"],
      adaptations: [
        { label: "Visual Aids", description: "Uses image-based prompts", strength: 0.85 },
        { label: "Extended Time", description: "1.5x time for responses", strength: 0.7 },
        { label: "Micro-breaks", description: "Scheduled breaks every 15 min", strength: 0.6 },
      ],
    })],
    [/^\/api\/caregiver\/child\/accommodations$/, () => ({
      accommodations: [
        { id: "a1", label: "Visual Aids", description: "Uses image-based prompts and diagrams", category: "Visual" },
        { id: "a2", label: "Extended Time", description: "1.5x time for responses", category: "Pacing" },
        { id: "a3", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes", category: "Breaks" },
        { id: "a4", label: "Low Stimulation", description: "Reduced animations and sounds", category: "Sensory" },
      ],
    })],
    [/^\/api\/caregiver\/child\/iep$/, () => ({
      goals: [
        { id: "g1", title: "Improve reading fluency to grade level", progressPct: 62, targetDate: new Date(Date.now() + 86400000 * 60).toISOString() },
        { id: "g2", title: "Increase social interaction during group work", progressPct: 45, targetDate: new Date(Date.now() + 86400000 * 90).toISOString() },
        { id: "g3", title: "Use self-regulation strategies independently", progressPct: 78, targetDate: new Date(Date.now() + 86400000 * 30).toISOString() },
      ],
    })],
    [/^\/api\/caregiver\/child\/gradebook$/, () => ({
      subjects: [
        { name: "Mathematics", mastery: 85 },
        { name: "Science", mastery: 75 },
        { name: "Language Arts", mastery: 58 },
        { name: "Social Studies", mastery: 70 },
      ],
    })],
    [/^\/api\/caregiver\/child\/sessions$/, () => ({
      sessions: [
        { id: "rs1", subject: "Mathematics", date: new Date(Date.now() - 3600000).toISOString(), durationMin: 25, score: 88 },
        { id: "rs2", subject: "Language Arts", date: new Date(Date.now() - 86400000).toISOString(), durationMin: 20, score: 72 },
        { id: "rs3", subject: "Science", date: new Date(Date.now() - 172800000).toISOString(), durationMin: 30, score: 80 },
        { id: "rs4", subject: "Mathematics", date: new Date(Date.now() - 259200000).toISOString(), durationMin: 22, score: 92 },
      ],
    })],

    [/^\/api\/teacher\/learners\/[^/]+\/brain-profile$/, () => ({
      learningStyle: "Visual-spatial learner who excels with diagrams, color-coded information, and hands-on activities.",
      communicationStyle: "Responds well to clear, concise instructions with visual supports. Prefers written over verbal directions.",
      strengths: ["Visual Learning", "Pattern Recognition", "Creative Thinking", "Mathematics", "Spatial Reasoning"],
      challenges: ["Auditory Processing", "Time Management", "Social Communication"],
      sensoryPreferences: ["Low noise environments", "Dim lighting preferred", "Fidget tools helpful", "Weighted blanket for calm-down"],
      adaptations: [
        { type: "visual", label: "Visual Aids", description: "Uses image-based prompts and diagrams", strength: 0.85 },
        { type: "pacing", label: "Extended Time", description: "Allows 1.5x time for responses", strength: 0.7 },
        { type: "breaks", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes", strength: 0.6 },
        { type: "sensory", label: "Low Stimulation", description: "Reduced animations and sounds", strength: 0.45 },
      ],
    })],

    ["/api/users/me", () => ({ id: "test-parent-1", name: "Sarah Johnson", email: "parent@test.aivo.com", role: "parent" })],
    ["/api/users/me/preferences", () => ({ theme: "light", language: "en" })],

    [/^\/api\/learners\/[^/]+\/profile\/stats$/, () => mockProfileStats],
    [/^\/api\/learners\/[^/]+\/profile$/, () => mockProfileStats],

    ["/api/admin/platform/overview", () => ({
      totalDistricts: 47, totalUsers: 12840, totalLearners: 9256, activeSubscriptions: 42, monthlyRevenue: 18750000,
      systemHealth: "healthy", uptime: 99.97, apiLatency: 42,
      recentActivity: [
        { id: "a1", action: "New district onboarded", user: "ops@aivo.com", timestamp: "2026-04-09T14:30:00Z", type: "success" },
        { id: "a2", action: "Subscription upgraded to Enterprise", user: "billing@aivo.com", timestamp: "2026-04-09T13:15:00Z", type: "info" },
        { id: "a3", action: "Content module published: Fractions Mastery", user: "content@aivo.com", timestamp: "2026-04-09T11:45:00Z", type: "info" },
        { id: "a4", action: "API rate limit exceeded for District #23", user: "system", timestamp: "2026-04-09T10:20:00Z", type: "warning" },
        { id: "a5", action: "User suspension: policy violation", user: "support@aivo.com", timestamp: "2026-04-09T09:00:00Z", type: "warning" },
      ],
      topDistricts: [
        { name: "Sunshine Valley USD", learners: 1240, mastery: 78 },
        { name: "Lakewood School District", learners: 980, mastery: 82 },
        { name: "Mountain View ISD", learners: 875, mastery: 75 },
        { name: "Riverside County Schools", learners: 720, mastery: 71 },
        { name: "Oakdale Unified", learners: 650, mastery: 84 },
      ],
    })],

    ["/api/admin/platform/districts", () => ({
      districts: [
        { id: "d1", name: "Sunshine Valley USD", state: "California", learnerCount: 1240, teacherCount: 85, avgMastery: 78, status: "active", plan: "Enterprise", createdAt: "2025-01-15" },
        { id: "d2", name: "Lakewood School District", state: "Oregon", learnerCount: 980, teacherCount: 62, avgMastery: 82, status: "active", plan: "Enterprise", createdAt: "2025-03-20" },
        { id: "d3", name: "Mountain View ISD", state: "Texas", learnerCount: 875, teacherCount: 54, avgMastery: 75, status: "active", plan: "Professional", createdAt: "2025-06-10" },
        { id: "d4", name: "Riverside County Schools", state: "Florida", learnerCount: 720, teacherCount: 48, avgMastery: 71, status: "active", plan: "Enterprise", createdAt: "2025-02-28" },
        { id: "d5", name: "Oakdale Unified", state: "Michigan", learnerCount: 650, teacherCount: 42, avgMastery: 84, status: "active", plan: "Professional", createdAt: "2025-04-15" },
        { id: "d6", name: "Willowbrook Academy", state: "New York", learnerCount: 340, teacherCount: 24, avgMastery: 79, status: "trial", plan: "Trial", createdAt: "2026-03-01" },
        { id: "d7", name: "Cedar Hills Elementary", state: "Colorado", learnerCount: 180, teacherCount: 12, avgMastery: 68, status: "trial", plan: "Trial", createdAt: "2026-03-15" },
        { id: "d8", name: "Pine Ridge School District", state: "Montana", learnerCount: 0, teacherCount: 3, avgMastery: 0, status: "suspended", plan: "Professional", createdAt: "2025-09-01" },
      ],
    })],

    [/^\/api\/admin\/platform\/districts\/[^/]+$/, () => ({
      id: "d1", name: "Sunshine Valley USD", state: "California", status: "active", plan: "Enterprise",
      contactName: "Dr. Maria Gonzalez", contactEmail: "mgonzalez@sunshinevalley.edu", contactPhone: "(555) 234-5678",
      createdAt: "2025-01-15", learnerCount: 1240, teacherCount: 85, classroomCount: 42, avgMastery: 78,
      licensesUsed: 1240, licensesTotal: 1500,
      topTeachers: [
        { name: "Ms. Rivera", learners: 32, mastery: 85 },
        { name: "Mr. Chen", learners: 28, mastery: 82 },
        { name: "Mrs. Patel", learners: 30, mastery: 79 },
      ],
      recentActivity: [
        { action: "New teacher onboarded", timestamp: "2026-04-09T10:00:00Z" },
        { action: "Classroom created: 4th Grade Math", timestamp: "2026-04-08T15:30:00Z" },
      ],
    })],

    ["/api/admin/platform/users", () => ({
      users: [
        { id: "u1", name: "Elena Rodriguez", email: "elena@aivo.com", role: "platform_admin", platformRole: "super_admin", status: "active", lastLoginAt: "2026-04-09T14:00:00Z", createdAt: "2024-06-01" },
        { id: "u2", name: "Marcus Chen", email: "marcus@aivo.com", role: "platform_admin", platformRole: "ops_manager", status: "active", lastLoginAt: "2026-04-09T10:30:00Z", createdAt: "2024-08-15" },
        { id: "u3", name: "Priya Sharma", email: "priya@aivo.com", role: "platform_admin", platformRole: "content_manager", status: "active", lastLoginAt: "2026-04-08T16:00:00Z", createdAt: "2025-01-10" },
        { id: "u4", name: "Jordan Blake", email: "jordan@aivo.com", role: "platform_admin", platformRole: "support_agent", status: "active", lastLoginAt: "2026-04-09T12:45:00Z", createdAt: "2025-03-20" },
        { id: "u5", name: "Taylor Kim", email: "taylor@aivo.com", role: "platform_admin", platformRole: "billing_manager", status: "active", lastLoginAt: "2026-04-07T09:00:00Z", createdAt: "2025-06-01" },
        { id: "u6", name: "Dr. Maria Gonzalez", email: "mgonzalez@sunshinevalley.edu", role: "admin", status: "active", district: "Sunshine Valley USD", lastLoginAt: "2026-04-09T08:30:00Z", createdAt: "2025-01-15" },
        { id: "u7", name: "Ms. Rivera", email: "rivera@sunshinevalley.edu", role: "teacher", status: "active", district: "Sunshine Valley USD", lastLoginAt: "2026-04-09T07:00:00Z", createdAt: "2025-02-01" },
        { id: "u8", name: "Sarah Johnson", email: "sarah@example.com", role: "parent", status: "active", lastLoginAt: "2026-04-09T13:00:00Z", createdAt: "2025-09-01" },
        { id: "u9", name: "Suspended User", email: "suspended@example.com", role: "parent", status: "suspended", lastLoginAt: "2026-02-15T10:00:00Z", createdAt: "2025-11-01" },
      ],
    })],

    ["/api/admin/platform/subscriptions", () => ({
      totalMrr: 18750000, totalArr: 225000000, activeCount: 42, trialCount: 5, pastDueCount: 2, churnRate: 3.2,
      subscriptions: [
        { id: "s1", district: "Sunshine Valley USD", plan: "Enterprise", status: "active", mrr: 4500000, learners: 1240, renewsAt: "2027-01-15" },
        { id: "s2", district: "Lakewood School District", plan: "Enterprise", status: "active", mrr: 3600000, learners: 980, renewsAt: "2027-03-20" },
        { id: "s3", district: "Mountain View ISD", plan: "Professional", status: "active", mrr: 2100000, learners: 875, renewsAt: "2026-12-10" },
        { id: "s4", district: "Willowbrook Academy", plan: "Trial", status: "trial", mrr: 0, learners: 340, renewsAt: "2026-05-01" },
        { id: "s5", district: "Greenfield Schools", plan: "Professional", status: "past_due", mrr: 1800000, learners: 520, renewsAt: "2026-03-15" },
      ],
    })],

    ["/api/admin/platform/content", () => ({
      totalItems: 284, publishedCount: 231, draftCount: 38, reviewCount: 15, totalUsage: 456000,
      items: [
        { id: "c1", title: "Fractions Mastery: Part 1", type: "lesson", subject: "Mathematics", gradeRange: "3-5", status: "published", usageCount: 12400, avgRating: 4.8, updatedAt: "2026-04-01" },
        { id: "c2", title: "Reading Comprehension Quest", type: "quest", subject: "English Language Arts", gradeRange: "2-4", status: "published", usageCount: 9800, avgRating: 4.6, updatedAt: "2026-03-28" },
        { id: "c3", title: "Multiplication Facts Assessment", type: "assessment", subject: "Mathematics", gradeRange: "3-4", status: "published", usageCount: 15600, avgRating: 4.5, updatedAt: "2026-04-05" },
        { id: "c4", title: "Geometry Basics: Shapes & Angles", type: "lesson", subject: "Mathematics", gradeRange: "4-6", status: "review", usageCount: 0, avgRating: 0, updatedAt: "2026-04-08" },
        { id: "c5", title: "Sensory-Friendly Reading Module", type: "module", subject: "Special Education", gradeRange: "K-3", status: "draft", usageCount: 0, avgRating: 0, updatedAt: "2026-04-06" },
      ],
    })],

    ["/api/admin/platform/audit", () => ({
      entries: [
        { id: "al1", action: "User suspended", actor: "Elena Rodriguez", actorRole: "super_admin", target: "suspended@example.com", targetType: "user", severity: "critical", timestamp: "2026-04-09T14:30:00Z", ip: "192.168.1.100", details: "Policy violation: inappropriate content" },
        { id: "al2", action: "District onboarded", actor: "Marcus Chen", actorRole: "ops_manager", target: "Willowbrook Academy", targetType: "district", severity: "info", timestamp: "2026-04-09T13:15:00Z", ip: "192.168.1.101" },
        { id: "al3", action: "Subscription upgraded", actor: "Taylor Kim", actorRole: "billing_manager", target: "Mountain View ISD", targetType: "subscription", severity: "info", timestamp: "2026-04-09T12:00:00Z", ip: "192.168.1.102", details: "Professional to Enterprise" },
        { id: "al4", action: "API rate limit exceeded", actor: "system", actorRole: "system", target: "District #23 API Key", targetType: "api_key", severity: "warning", timestamp: "2026-04-09T10:20:00Z", ip: "10.0.0.1" },
        { id: "al5", action: "Failed login attempt (5x)", actor: "unknown", actorRole: "unknown", target: "admin@lakewood.edu", targetType: "user", severity: "critical", timestamp: "2026-04-09T08:30:00Z", ip: "203.0.113.42", details: "Account temporarily locked" },
        { id: "al6", action: "Content published", actor: "Priya Sharma", actorRole: "content_manager", target: "Fractions Mastery", targetType: "content", severity: "info", timestamp: "2026-04-09T09:45:00Z", ip: "192.168.1.103" },
        { id: "al7", action: "SSO configuration updated", actor: "Elena Rodriguez", actorRole: "super_admin", target: "Lakewood School District", targetType: "district", severity: "warning", timestamp: "2026-04-07T11:00:00Z", ip: "192.168.1.100" },
      ],
    })],

    ["/api/admin/platform/settings", () => ({
      maintenanceMode: false, maxDistrictSize: 5000, defaultTrialDays: 30, enforceSSO: false, apiRateLimit: 1000,
      admins: [
        { id: "a1", name: "Elena Rodriguez", email: "elena@aivo.com", platformRole: "super_admin", lastLoginAt: "2026-04-09T14:00:00Z" },
        { id: "a2", name: "Marcus Chen", email: "marcus@aivo.com", platformRole: "ops_manager", lastLoginAt: "2026-04-09T10:30:00Z" },
        { id: "a3", name: "Priya Sharma", email: "priya@aivo.com", platformRole: "content_manager", lastLoginAt: "2026-04-08T16:00:00Z" },
        { id: "a4", name: "Jordan Blake", email: "jordan@aivo.com", platformRole: "support_agent", lastLoginAt: "2026-04-09T12:45:00Z" },
        { id: "a5", name: "Taylor Kim", email: "taylor@aivo.com", platformRole: "billing_manager", lastLoginAt: "2026-04-07T09:00:00Z" },
      ],
    })],
  ];

  return matchRoute(path, routes);
}
