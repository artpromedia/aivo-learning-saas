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

const mockMastery = [
  { skill: "Addition & Subtraction", mastery: 95, attempts: 32, lastAttempt: new Date(Date.now() - 86400000).toISOString() },
  { skill: "Multiplication", mastery: 80, attempts: 24, lastAttempt: new Date(Date.now() - 172800000).toISOString() },
  { skill: "Fractions", mastery: 55, attempts: 15, lastAttempt: new Date(Date.now() - 86400000).toISOString() },
  { skill: "Reading Comprehension", mastery: 60, attempts: 20, lastAttempt: new Date(Date.now() - 259200000).toISOString() },
  { skill: "Vocabulary", mastery: 70, attempts: 18, lastAttempt: new Date(Date.now() - 172800000).toISOString() },
  { skill: "Earth Science", mastery: 78, attempts: 14, lastAttempt: new Date(Date.now() - 345600000).toISOString() },
];

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
  plan: "family",
  currentPeriodEnd: new Date(Date.now() + 86400000 * 25).toISOString(),
  cancelAtPeriodEnd: false,
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

  if (method !== "GET") return {};

  const routes: [string | RegExp, () => unknown][] = [
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
  ];

  return matchRoute(path, routes);
}
