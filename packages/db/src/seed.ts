import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://aivo:aivo_dev@localhost:5432/aivo_dev";

const sql = postgres(DATABASE_URL);

const TENANT_ID = "a0000000-0000-4000-8000-000000000001";
const PARENT_USER_ID = "b0000000-0000-4000-8000-000000000001";
const ALEX_USER_ID = "b0000000-0000-4000-8000-000000000002";
const MAYA_USER_ID = "b0000000-0000-4000-8000-000000000003";
const TEACHER_USER_ID = "b0000000-0000-4000-8000-000000000004";
const CAREGIVER_USER_ID = "b0000000-0000-4000-8000-000000000005";
const ALEX_LEARNER_ID = "c0000000-0000-4000-8000-000000000001";
const MAYA_LEARNER_ID = "c0000000-0000-4000-8000-000000000002";
const ALEX_BRAIN_STATE_ID = "d0000000-0000-4000-8000-000000000001";
const MAYA_BRAIN_STATE_ID = "d0000000-0000-4000-8000-000000000002";
const PARENT_ASSESSMENT_ID = "e0000000-0000-4000-8000-000000000001";
const BASELINE_ASSESSMENT_ID = "f0000000-0000-4000-8000-000000000001";
const SUBSCRIPTION_ID = "10000000-0000-4000-8000-000000000001";
const IEP_DOC_ID = "20000000-0000-4000-8000-000000000001";
const IEP_DOC_2_ID = "20000000-0000-4000-8000-000000000002";
const ALEX_XP_ID = "30000000-0000-4000-8000-000000000001";
const MAYA_XP_ID = "30000000-0000-4000-8000-000000000002";

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();
const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
const dayAgo = new Date(Date.now() - 86400000).toISOString();

async function seed() {
  console.log("🌱 Starting AIVO seed...\n");

  await sql`TRUNCATE tenants, users, learners, brain_states, parent_assessments, baseline_assessments, assessment_items, iep_documents, iep_goals, recommendations, learner_xp, badges, learner_badges, quests, learner_quests, notifications, subscriptions, xp_events, accounts RESTART IDENTITY CASCADE`;
  console.log("  Cleared existing data.");

  console.log("  Creating tenant...");
  await sql`
    INSERT INTO tenants (id, name, slug, type, status)
    VALUES (${TENANT_ID}, 'Johnson Family', 'johnson-family', 'B2C_FAMILY', 'ACTIVE')
  `;

  console.log("  Creating users...");
  await sql`
    INSERT INTO users (id, tenant_id, email, name, role, status, email_verified_at) VALUES
      (${PARENT_USER_ID}, ${TENANT_ID}, 'parent@test.aivo.com', 'Sarah Johnson', 'PARENT', 'ACTIVE', ${now}),
      (${ALEX_USER_ID}, ${TENANT_ID}, 'alex@test.aivo.com', 'Alex Johnson', 'LEARNER', 'ACTIVE', ${now}),
      (${MAYA_USER_ID}, ${TENANT_ID}, 'maya@test.aivo.com', 'Maya Johnson', 'LEARNER', 'ACTIVE', ${now}),
      (${TEACHER_USER_ID}, ${TENANT_ID}, 'rivera@school.edu', 'Ms. Rivera', 'TEACHER', 'ACTIVE', ${now}),
      (${CAREGIVER_USER_ID}, ${TENANT_ID}, 'jamie@email.com', 'Jamie Rodriguez', 'CAREGIVER', 'ACTIVE', ${now})
  `;

  await sql`
    INSERT INTO accounts (id, user_id, provider_id, provider_account_id, access_token) VALUES
      (gen_random_uuid(), ${PARENT_USER_ID}, 'credential', ${PARENT_USER_ID}, NULL)
  `;

  console.log("  Creating learners...");
  await sql`
    INSERT INTO learners (id, user_id, tenant_id, parent_id, name, enrolled_grade, functioning_level, communication_mode, date_of_birth) VALUES
      (${ALEX_LEARNER_ID}, ${ALEX_USER_ID}, ${TENANT_ID}, ${PARENT_USER_ID}, 'Alex Johnson', 5, 'SUPPORTED', 'VERBAL', '2015-03-15'),
      (${MAYA_LEARNER_ID}, ${MAYA_USER_ID}, ${TENANT_ID}, ${PARENT_USER_ID}, 'Maya Johnson', 3, 'STANDARD', 'VERBAL', '2017-07-22')
  `;

  await sql`
    INSERT INTO learner_teachers (id, learner_id, teacher_user_id, accepted_at) VALUES
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${TEACHER_USER_ID}, ${now})
  `;

  await sql`
    INSERT INTO learner_caregivers (id, learner_id, caregiver_user_id, relationship, accepted_at) VALUES
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${CAREGIVER_USER_ID}, 'family_friend', ${now})
  `;

  console.log("  Creating brain states...");
  const alexBrainState = {
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
      visualProcessing: 92, patternRecognition: 88, spatialReasoning: 85,
      creativeThinking: 82, problemSolving: 78, workingMemory: 65,
      auditoryProcessing: 42, executiveFunction: 55,
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
    confidenceScore: 0.82,
    modelVersion: "v2.4",
    status: "approved",
  };

  const alexFunctioningLevelProfile = {
    level: "SUPPORTED",
    communicationMode: "VERBAL",
    sensoryPreferences: alexBrainState.sensoryPreferences,
    adaptations: alexBrainState.adaptations,
  };

  await sql`
    INSERT INTO brain_states (id, learner_id, main_brain_version, seed_version, state, functioning_level_profile, preferred_modality, attention_span_minutes, cognitive_load) VALUES
      (${ALEX_BRAIN_STATE_ID}, ${ALEX_LEARNER_ID}, 'v2.4', 'v1.0', ${JSON.stringify(alexBrainState)}, ${JSON.stringify(alexFunctioningLevelProfile)}, 'visual', 20, 'MEDIUM'),
      (${MAYA_BRAIN_STATE_ID}, ${MAYA_LEARNER_ID}, 'v2.4', 'v1.0', ${JSON.stringify({ status: "approved", confidenceScore: 0.75, strengths: ["Reading", "Social Skills"], challenges: ["Math Concepts"] })}, ${JSON.stringify({ level: "STANDARD", communicationMode: "VERBAL" })}, 'auditory', 25, 'LOW')
  `;

  console.log("  Creating parent assessment...");
  const parentAssessmentResponses = {
    communicationAbility: "verbal_fluent",
    learningPreferences: ["visual", "hands_on"],
    socialInteraction: "prefers_small_groups",
    sensoryNeeds: ["noise_sensitive", "needs_fidgets"],
    academicStrengths: ["math", "spatial_reasoning"],
    academicChallenges: ["reading_comprehension", "auditory_processing"],
    behavioralNotes: "Focused and engaged with visual materials. Needs breaks every 15-20 minutes.",
    existingDiagnoses: ["ADHD", "Autism Spectrum"],
    currentAccommodations: ["extended_time", "preferential_seating", "visual_schedules"],
  };

  await sql`
    INSERT INTO parent_assessments (id, learner_id, parent_id, responses, functioning_level_signals, assessment_type, support_level, has_existing_iep, learning_style_notes, strengths_notes, challenges_notes, behavior_notes, started_at, completed_at) VALUES
      (${PARENT_ASSESSMENT_ID}, ${ALEX_LEARNER_ID}, ${PARENT_USER_ID}, ${JSON.stringify(parentAssessmentResponses)}, ${JSON.stringify({ verbal: 0.8, cognitive: 0.7, sensory: 0.5 })}, 'STANDARD_WITH_ACCOMMODATIONS', 65, true, 'Visual-spatial learner', 'Strong in math and pattern recognition', 'Auditory processing and time management', 'Focused with visual materials, needs regular breaks', ${dayAgo}, ${dayAgo})
  `;

  console.log("  Creating baseline assessment...");
  await sql`
    INSERT INTO baseline_assessments (id, learner_id, assessment_mode, status, domains, started_at, completed_at) VALUES
      (${BASELINE_ASSESSMENT_ID}, ${ALEX_LEARNER_ID}, 'STANDARD', 'COMPLETED', ${JSON.stringify({ math: { score: 85, items: 12 }, reading: { score: 58, items: 10 }, science: { score: 75, items: 8 } })}, ${dayAgo}, ${dayAgo})
  `;

  const assessmentItemsData = [
    { domain: "math", skill: "Addition", difficulty: "easy", correct: true, timeMs: 4500 },
    { domain: "math", skill: "Subtraction", difficulty: "easy", correct: true, timeMs: 5200 },
    { domain: "math", skill: "Multiplication", difficulty: "medium", correct: true, timeMs: 8100 },
    { domain: "math", skill: "Fractions", difficulty: "medium", correct: true, timeMs: 12000 },
    { domain: "math", skill: "Division", difficulty: "medium", correct: false, timeMs: 15000 },
    { domain: "reading", skill: "Vocabulary", difficulty: "easy", correct: true, timeMs: 6000 },
    { domain: "reading", skill: "Comprehension", difficulty: "medium", correct: false, timeMs: 18000 },
    { domain: "reading", skill: "Inference", difficulty: "hard", correct: false, timeMs: 20000 },
    { domain: "science", skill: "Observation", difficulty: "easy", correct: true, timeMs: 5000 },
    { domain: "science", skill: "Classification", difficulty: "medium", correct: true, timeMs: 9000 },
  ];

  for (const item of assessmentItemsData) {
    await sql`
      INSERT INTO assessment_items (id, baseline_assessment_id, domain, skill, difficulty, response, is_correct, response_time_ms, responded_at) VALUES
        (gen_random_uuid(), ${BASELINE_ASSESSMENT_ID}, ${item.domain}, ${item.skill}, ${item.difficulty}, ${JSON.stringify({ selected: item.correct ? "correct_option" : "wrong_option" })}, ${item.correct}, ${item.timeMs}, ${dayAgo})
    `;
  }

  console.log("  Creating IEP documents & goals...");
  await sql`
    INSERT INTO iep_documents (id, learner_id, uploaded_by, file_url, file_type, parsed_data, parse_status, confirmed_by, confirmed_at) VALUES
      (${IEP_DOC_ID}, ${ALEX_LEARNER_ID}, ${PARENT_USER_ID}, '/uploads/iep/IEP_2025-2026.pdf', 'application/pdf', ${JSON.stringify({ goals: 3, accommodations: 5, services: 2 })}, 'CONFIRMED', ${PARENT_USER_ID}, '2025-09-15T00:00:00Z'),
      (${IEP_DOC_2_ID}, ${ALEX_LEARNER_ID}, ${PARENT_USER_ID}, '/uploads/iep/Progress_Report_Q1.pdf', 'application/pdf', ${JSON.stringify({ progressNotes: "Meeting goals in math, needs support in reading" })}, 'CONFIRMED', ${PARENT_USER_ID}, '2025-12-20T00:00:00Z')
  `;

  await sql`
    INSERT INTO iep_goals (id, learner_id, iep_document_id, goal_text, domain, target_metric, target_value, current_value, status) VALUES
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${IEP_DOC_ID}, 'Read grade-level passages at 90 words per minute with 95% accuracy.', 'academics', 'words_per_minute', '90', '58', 'ACTIVE'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${IEP_DOC_ID}, 'Initiate conversations with peers 3 times per day in structured settings.', 'social', 'interactions_per_day', '3', '1', 'ACTIVE'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${IEP_DOC_ID}, 'Use taught coping strategies independently when frustrated.', 'behavioral', 'independent_use_percentage', '100', '80', 'ACTIVE')
  `;

  console.log("  Creating recommendations...");
  await sql`
    INSERT INTO recommendations (id, brain_state_id, learner_id, type, title, description, status) VALUES
      (gen_random_uuid(), ${ALEX_BRAIN_STATE_ID}, ${ALEX_LEARNER_ID}, 'CURRICULUM_ADJUSTMENT', 'Focus on Reading Comprehension', 'Alex shows strong visual skills. Introduce graphic novels to build reading comprehension.', 'PENDING'),
      (gen_random_uuid(), ${ALEX_BRAIN_STATE_ID}, ${ALEX_LEARNER_ID}, 'TUTOR_ADDON', 'Try Professor Cosmos', 'Based on Alex''s interest in space, this science tutor may increase engagement.', 'PENDING'),
      (gen_random_uuid(), ${ALEX_BRAIN_STATE_ID}, ${ALEX_LEARNER_ID}, 'ACCOMMODATION_CHANGE', 'Adjust Session Length', 'Data shows optimal focus at 20-minute sessions. Consider shorter, more frequent learning.', 'APPROVED')
  `;

  console.log("  Creating engagement data (XP, badges, quests)...");
  await sql`
    INSERT INTO learner_xp (id, learner_id, total_xp, level, current_streak_days, longest_streak_days, last_activity_date, virtual_currency) VALUES
      (${ALEX_XP_ID}, ${ALEX_LEARNER_ID}, 2450, 12, 7, 14, ${now.split('T')[0]}, 680),
      (${MAYA_XP_ID}, ${MAYA_LEARNER_ID}, 1200, 8, 3, 7, ${now.split('T')[0]}, 320)
  `;

  await sql`
    INSERT INTO badges (id, slug, name, description, category, criteria, icon_url) VALUES
      (gen_random_uuid(), 'first-steps', 'First Steps', 'Complete your first lesson', 'milestone', '{"type":"lesson_count","value":1}', '🎯'),
      (gen_random_uuid(), 'math-whiz', 'Math Whiz', 'Score 100% on 5 math quizzes', 'subject', '{"type":"perfect_quiz_count","subject":"math","value":5}', '🧮'),
      (gen_random_uuid(), 'week-warrior', 'Week Warrior', 'Maintain a 7-day streak', 'streak', '{"type":"streak_days","value":7}', '🔥'),
      (gen_random_uuid(), 'ocean-master', 'Ocean Master', 'Complete the Ocean Explorer world', 'quest', '{"type":"quest_complete","quest":"ocean-explorer"}', '🌊'),
      (gen_random_uuid(), 'social-butterfly', 'Social Butterfly', 'Interact with 3 different tutors', 'social', '{"type":"tutor_count","value":3}', '🦋'),
      (gen_random_uuid(), 'bookworm', 'Bookworm', 'Complete 20 reading lessons', 'subject', '{"type":"lesson_count","subject":"reading","value":20}', '📚')
  `;

  const badgeRows = await sql`SELECT id, name FROM badges ORDER BY name`;
  const badgeMap = Object.fromEntries(badgeRows.map(b => [b.name, b.id]));

  await sql`
    INSERT INTO learner_badges (id, learner_id, badge_id, earned_at) VALUES
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${badgeMap["First Steps"]}, '2025-09-05T00:00:00Z'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${badgeMap["Math Whiz"]}, '2025-10-12T00:00:00Z'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${badgeMap["Week Warrior"]}, '2025-11-01T00:00:00Z'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${badgeMap["Social Butterfly"]}, '2025-12-01T00:00:00Z')
  `;

  console.log("  Creating quests...");
  const oceanChapters = [
    { id: "q1", order: 1, title: "Coral Reef Colors", description: "Learn about the vibrant colors of coral reefs", xpReward: 25, lessonsCount: 4 },
    { id: "q2", order: 2, title: "Deep Sea Creatures", description: "Discover creatures that live in the darkest depths", xpReward: 30, lessonsCount: 5 },
    { id: "q3", order: 3, title: "Ocean Currents", description: "Understand how water moves around the globe", xpReward: 35, lessonsCount: 4 },
    { id: "q4", order: 4, title: "Marine Mammals", description: "Learn about whales, dolphins, and seals", xpReward: 30, lessonsCount: 5 },
    { id: "q5", order: 5, title: "Tidal Zones", description: "Explore life between high and low tide", xpReward: 40, lessonsCount: 4 },
    { id: "q6", order: 6, title: "Pollution & Conservation", description: "How can we protect our oceans?", xpReward: 50, lessonsCount: 6 },
    { id: "q7", order: 7, title: "The Arctic Ocean", description: "Brave the frozen waters of the north", xpReward: 45, lessonsCount: 5 },
    { id: "q8", order: 8, title: "Ocean Floor Mapping", description: "Map the mysteries beneath the waves", xpReward: 60, lessonsCount: 6 },
  ];

  await sql`
    INSERT INTO quests (id, slug, title, description, subject, chapters, total_xp) VALUES
      (gen_random_uuid(), 'ocean-explorer', 'Ocean Explorer', 'Dive deep into the mysteries of the ocean', 'Science', ${JSON.stringify(oceanChapters)}, 200),
      (gen_random_uuid(), 'space-adventure', 'Space Adventure', 'Journey through the solar system and beyond', 'Science', '[]', 300),
      (gen_random_uuid(), 'jungle-safari', 'Jungle Safari', 'Explore the rainforest and learn about wildlife', 'Science', '[]', 150),
      (gen_random_uuid(), 'ancient-egypt', 'Ancient Egypt', 'Uncover the secrets of the pharaohs', 'Social Studies', '[]', 250)
  `;

  const questRows = await sql`SELECT id, slug FROM quests ORDER BY slug`;
  const questMap = Object.fromEntries(questRows.map(q => [q.slug, q.id]));

  await sql`
    INSERT INTO learner_quests (id, learner_id, quest_id, status, current_chapter, started_at) VALUES
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${questMap["ocean-explorer"]}, 'ACTIVE', 5, '2025-09-10T00:00:00Z'),
      (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${questMap["space-adventure"]}, 'ACTIVE', 3, '2025-10-01T00:00:00Z')
  `;

  console.log("  Creating notifications...");
  await sql`
    INSERT INTO notifications (id, user_id, type, title, body, read) VALUES
      (gen_random_uuid(), ${PARENT_USER_ID}, 'success', 'Alex completed a quest!', 'Alex finished the Ocean Explorer quest and earned 50 XP.', false),
      (gen_random_uuid(), ${PARENT_USER_ID}, 'info', 'Weekly progress report ready', 'Your children''s weekly summary is available.', false),
      (gen_random_uuid(), ${PARENT_USER_ID}, 'info', 'New tutor available', 'Professor Cosmos is now available for science tutoring.', true)
  `;

  console.log("  Creating subscription...");
  const periodStart = new Date();
  const periodEnd = new Date(Date.now() + 30 * 86400000);

  await sql`
    INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end) VALUES
      (${SUBSCRIPTION_ID}, ${TENANT_ID}, 'family_plus', 'ACTIVE', ${periodStart.toISOString()}, ${periodEnd.toISOString()})
  `;

  console.log("  Creating XP events...");
  const xpEvents = [
    { activity: "lesson_complete", xp: 25, trigger: "math_lesson_fractions" },
    { activity: "quest_progress", xp: 50, trigger: "ocean_explorer_chapter_5" },
    { activity: "streak_bonus", xp: 15, trigger: "7_day_streak" },
    { activity: "badge_earned", xp: 30, trigger: "social_butterfly" },
    { activity: "tutor_session", xp: 20, trigger: "nova_math_session" },
  ];

  for (const evt of xpEvents) {
    await sql`
      INSERT INTO xp_events (id, learner_id, activity, xp_amount, trigger_event) VALUES
        (gen_random_uuid(), ${ALEX_LEARNER_ID}, ${evt.activity}, ${evt.xp}, ${evt.trigger})
    `;
  }

  console.log("\n✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("  Tenant:   Johnson Family");
  console.log("  Parent:   parent@test.aivo.com (Sarah Johnson)");
  console.log("  Learners: Alex Johnson (SUPPORTED, Grade 5)");
  console.log("            Maya Johnson (STANDARD, Grade 3)");
  console.log("  Teacher:  Ms. Rivera (rivera@school.edu)");
  console.log("  Caregiver: Jamie Rodriguez (jamie@email.com)");
  console.log("─────────────────────────────────────────");
  console.log(`\n  Learner IDs:`);
  console.log(`    Alex: ${ALEX_LEARNER_ID}`);
  console.log(`    Maya: ${MAYA_LEARNER_ID}`);

  await sql.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
