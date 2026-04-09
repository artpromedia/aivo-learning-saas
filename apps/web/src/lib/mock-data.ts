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
  status: "active",
  strengths: ["Visual Learning", "Pattern Recognition", "Creative Thinking"],
  challenges: ["Auditory Processing", "Time Management"],
  adaptations: [
    { type: "visual", label: "Visual Aids", description: "Uses image-based prompts and diagrams", strength: 0.85 },
    { type: "pacing", label: "Extended Time", description: "Allows 1.5x time for responses", strength: 0.7 },
    { type: "breaks", label: "Micro-breaks", description: "Scheduled breaks every 15 minutes", strength: 0.6 },
    { type: "sensory", label: "Low Stimulation", description: "Reduced animations and sounds", strength: 0.45 },
  ],
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
];

const mockQuestWorlds = [
  { id: "w1", slug: "ocean-explorer", name: "Ocean Explorer", description: "Dive deep into the mysteries of the ocean", icon: "🌊", color: "#38BDF8", totalQuests: 8, completedQuests: 5, xpReward: 200, locked: false },
  { id: "w2", slug: "space-adventure", name: "Space Adventure", description: "Journey through the solar system and beyond", icon: "🚀", color: "#7C3AED", totalQuests: 10, completedQuests: 3, xpReward: 300, locked: false },
  { id: "w3", slug: "jungle-safari", name: "Jungle Safari", description: "Explore the rainforest and learn about wildlife", icon: "🌴", color: "#34D399", totalQuests: 6, completedQuests: 0, xpReward: 150, locked: false },
  { id: "w4", slug: "ancient-egypt", name: "Ancient Egypt", description: "Uncover the secrets of the pharaohs", icon: "🏛️", color: "#FB923C", totalQuests: 7, completedQuests: 0, xpReward: 250, locked: true },
];

const mockQuestWorldDetail = {
  id: "w1",
  slug: "ocean-explorer",
  name: "Ocean Explorer",
  description: "Dive deep into the mysteries of the ocean and discover amazing sea creatures!",
  icon: "🌊",
  color: "#38BDF8",
  quests: [
    { id: "q1", title: "Coral Reef Colors", description: "Learn about the vibrant colors of coral reefs", xp: 25, status: "completed", difficulty: "easy" },
    { id: "q2", title: "Deep Sea Creatures", description: "Discover creatures that live in the darkest depths", xp: 30, status: "completed", difficulty: "easy" },
    { id: "q3", title: "Ocean Currents", description: "Understand how water moves around the globe", xp: 35, status: "completed", difficulty: "medium" },
    { id: "q4", title: "Marine Mammals", description: "Learn about whales, dolphins, and seals", xp: 30, status: "completed", difficulty: "easy" },
    { id: "q5", title: "Tidal Zones", description: "Explore life between high and low tide", xp: 40, status: "completed", difficulty: "medium" },
    { id: "q6", title: "Pollution & Conservation", description: "How can we protect our oceans?", xp: 50, status: "available", difficulty: "hard" },
    { id: "q7", title: "The Arctic Ocean", description: "Brave the frozen waters of the north", xp: 45, status: "locked", difficulty: "hard" },
    { id: "q8", title: "Ocean Floor Mapping", description: "Map the mysteries beneath the waves", xp: 60, status: "locked", difficulty: "hard" },
  ],
};

const mockTutorSubscriptions = [
  { id: "t1", tutorId: "tutor-luna", name: "Luna", subject: "Mathematics", avatar: "🌙", personality: "Patient and encouraging", status: "active", sessionsCompleted: 12, lastSession: new Date(Date.now() - 86400000).toISOString() },
  { id: "t2", tutorId: "tutor-atlas", name: "Atlas", subject: "Science", avatar: "🗺️", personality: "Curious and adventurous", status: "active", sessionsCompleted: 8, lastSession: new Date(Date.now() - 172800000).toISOString() },
];

const mockTutorStore = [
  { id: "tutor-luna", name: "Luna", slug: "luna", subject: "Mathematics", avatar: "🌙", personality: "Patient and encouraging", description: "Luna makes math fun with visual puzzles and real-world examples.", price: 0, subscribed: true },
  { id: "tutor-atlas", name: "Atlas", slug: "atlas", subject: "Science", avatar: "🗺️", personality: "Curious and adventurous", description: "Atlas takes you on scientific journeys of discovery.", price: 0, subscribed: true },
  { id: "tutor-cosmos", name: "Professor Cosmos", slug: "professor-cosmos", subject: "Space Science", avatar: "🔭", personality: "Wise and inspiring", description: "Professor Cosmos reveals the wonders of the universe.", price: 100, subscribed: false },
  { id: "tutor-melodie", name: "Melodie", slug: "melodie", subject: "Language Arts", avatar: "🎵", personality: "Creative and playful", description: "Melodie uses stories and songs to teach reading and writing.", price: 100, subscribed: false },
];

const mockHomework = [
  { id: "hw1", title: "Math Practice: Fractions", subject: "Mathematics", dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: "in_progress", progress: 60, assignedBy: "Ms. Rivera", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "hw2", title: "Reading: Chapter 5 Questions", subject: "Language Arts", dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), status: "not_started", progress: 0, assignedBy: "Mr. Park", createdAt: new Date(Date.now() - 43200000).toISOString() },
  { id: "hw3", title: "Science: Ecosystems Worksheet", subject: "Science", dueDate: new Date(Date.now() - 86400000).toISOString(), status: "completed", progress: 100, assignedBy: "Ms. Rivera", createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const mockShopItems = [
  { id: "s1", name: "Astronaut Helmet", type: "avatar_item", category: "headwear", price: 150, currency: "coins", imageUrl: "", owned: false, equipped: false, description: "A shiny astronaut helmet for your avatar!" },
  { id: "s2", name: "Rainbow Cape", type: "avatar_item", category: "accessory", price: 200, currency: "coins", imageUrl: "", owned: true, equipped: true, description: "A flowing rainbow cape that sparkles!" },
  { id: "s3", name: "Dragon Pet", type: "companion", category: "pet", price: 500, currency: "coins", imageUrl: "", owned: false, equipped: false, description: "A friendly baby dragon companion." },
  { id: "s4", name: "Neon Sneakers", type: "avatar_item", category: "footwear", price: 100, currency: "coins", imageUrl: "", owned: false, equipped: false, description: "Glowing neon sneakers for your avatar." },
  { id: "s5", name: "Star Trail", type: "effect", category: "trail", price: 300, currency: "coins", imageUrl: "", owned: false, equipped: false, description: "Leave a trail of stars wherever you go!" },
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
  { id: "c1", title: "Speed Math Challenge", description: "Answer 20 math questions in under 5 minutes", type: "timed", xpReward: 100, coinReward: 50, expiresAt: new Date(Date.now() + 86400000).toISOString(), status: "available", difficulty: "medium" },
  { id: "c2", title: "Reading Marathon", description: "Complete 3 reading lessons today", type: "daily", xpReward: 75, coinReward: 30, expiresAt: new Date(Date.now() + 43200000).toISOString(), status: "in_progress", progress: 66, difficulty: "easy" },
  { id: "c3", title: "Perfect Week", description: "Score above 80% on every activity this week", type: "weekly", xpReward: 250, coinReward: 100, expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(), status: "in_progress", progress: 40, difficulty: "hard" },
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
    subject: "All Subjects",
    studentCount: 24,
    averageMastery: 72,
    recentActivity: new Date(Date.now() - 3600000).toISOString(),
    students: [
      { id: "s1", name: "Alex Johnson", mastery: 78, streak: 7, lastActive: new Date(Date.now() - 3600000).toISOString(), status: "active" },
      { id: "s2", name: "Emma Wilson", mastery: 85, streak: 12, lastActive: new Date(Date.now() - 7200000).toISOString(), status: "active" },
      { id: "s3", name: "Liam Brown", mastery: 62, streak: 3, lastActive: new Date(Date.now() - 86400000).toISOString(), status: "needs_attention" },
    ],
  },
  {
    id: "tc2",
    name: "3rd Grade - Section B",
    subject: "All Subjects",
    studentCount: 22,
    averageMastery: 68,
    recentActivity: new Date(Date.now() - 7200000).toISOString(),
    students: [],
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
  id: MOCK_LEARNER_ID,
  name: "Alex Johnson",
  pinSetAt: "2025-10-01T00:00:00Z",
};

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

export function getMockResponse(path: string, method: string = "GET"): unknown | undefined {
  if (method !== "GET") return {};

  const routes: [string | RegExp, () => unknown][] = [
    ["/api/learners", () => ({ learners: mockLearners })],
    [/^\/api\/learners\/[^/]+\/brain-profile$/, () => mockBrainProfile],
    [/^\/api\/learners\/[^/]+\/recommendations$/, () => mockRecommendations],
    [/^\/api\/learners\/[^/]+\/gradebook$/, () => mockGradebook],
    [/^\/api\/learners\/[^/]+\/gradebook\/mastery$/, () => mockMastery],
    [/^\/api\/learners\/[^/]+\/iep$/, () => mockIep],
    [/^\/api\/learners\/[^/]+\/collaboration$/, () => mockCollaboration],
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
    [/^\/api\/learners\/[^/]+\/progress$/, () => ({ progress: 65, sessions: 45, lastActive: new Date().toISOString() })],

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
      students: mockTeacherClassrooms[0].students, averageMastery: 72,
    })],
    ["/api/admin/licenses", () => mockLicenseData],
    ["/api/integrations/status", () => mockIntegrationStatus],
    ["/api/integrations/lti/platforms", () => ({ platforms: [] })],
    ["/api/integrations/webhooks", () => []],

    ["/api/teacher/classrooms", () => mockTeacherClassrooms],
    [/^\/api\/teacher\/classrooms\/[^/]+$/, () => mockTeacherClassrooms[0]],
    [/^\/api\/teacher\/learners\/[^/]+\/brain$/, () => mockBrainProfile],
    [/^\/api\/teacher\/learners\/[^/]+\/insights$/, () => ({ insights: [] })],

    ["/api/users/me", () => ({ id: "test-parent-1", name: "Sarah Johnson", email: "parent@test.aivo.com", role: "parent" })],
    ["/api/users/me/preferences", () => ({ theme: "light", language: "en" })],

    [/^\/api\/learners\/[^/]+\/profile\/stats$/, () => mockProfileStats],
    [/^\/api\/learners\/[^/]+\/profile$/, () => mockProfileStats],
  ];

  return matchRoute(path, routes);
}
