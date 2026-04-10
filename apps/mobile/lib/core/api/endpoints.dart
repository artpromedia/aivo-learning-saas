/// Centralized API endpoint constants for the AIVO Learning mobile app.
///
/// All paths are relative to the identity-svc gateway root (http://host:3001).
/// Most routes go through /api prefix; family-svc routes are at root /family/*.
class Endpoints {
  Endpoints._();

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String logout = '/api/auth/logout';
  static const String refreshToken = '/api/auth/refresh';
  static const String oauthCallback = '/api/auth/oauth-callback';
  static const String verifyEmail = '/api/auth/verify-email';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String resetPassword = '/api/auth/reset-password';

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  static const String usersMe = '/api/users/me';

  // ---------------------------------------------------------------------------
  // Learners
  // ---------------------------------------------------------------------------
  static const String learners = '/api/learners';
  static String learnerDetail(String id) => '/api/learners/$id';

  // ---------------------------------------------------------------------------
  // Learner PIN
  // ---------------------------------------------------------------------------
  static String learnerSetPin(String id) => '/api/learners/$id/pin';
  static String learnerVerifyPin(String id) => '/api/learners/$id/pin/verify';

  // ---------------------------------------------------------------------------
  // Assessment (Parent + Baseline)
  // ---------------------------------------------------------------------------
  static const String parentAssessmentQuestions =
      '/api/assessment/parent/questions';
  static const String parentAssessmentSubmit = '/api/assessment/parent';
  static String baselineStart(String learnerId) =>
      '/api/assessment/baseline/$learnerId/start';
  static String baselineAnswer(String learnerId) =>
      '/api/assessment/baseline/$learnerId/answer';
  static String baselineComplete(String learnerId) =>
      '/api/assessment/baseline/$learnerId/complete';

  // ---------------------------------------------------------------------------
  // Brain (via identity-svc proxy → brain-svc)
  // ---------------------------------------------------------------------------
  static String brainProfile(String learnerId) =>
      '/api/learners/$learnerId/brain-profile';
  static String brainProfileApprove(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/approve';
  static String brainProfileDecline(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/decline';
  static String brainProfileInsights(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/insights';
  static String brainProfileSeed(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/seed';
  static String functioningLevel(String learnerId) =>
      '/api/learners/$learnerId/functioning-level';
  static String brainAccommodationsResolve(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/accommodations';

  // ---------------------------------------------------------------------------
  // Gradebook / Mastery (via identity-svc proxy → brain-svc)
  // ---------------------------------------------------------------------------
  static String gradebook(String learnerId) =>
      '/api/learners/$learnerId/gradebook';
  static String gradebookMastery(String learnerId) =>
      '/api/learners/$learnerId/gradebook/mastery';

  // ---------------------------------------------------------------------------
  // Recommendations (via identity-svc proxy → brain-svc)
  // ---------------------------------------------------------------------------
  static String recommendations(String learnerId) =>
      '/api/learners/$learnerId/recommendations';
  static String recommendationApprove(String learnerId, String recId) =>
      '/api/learners/$learnerId/recommendations/$recId/approve';
  static String recommendationDecline(String learnerId, String recId) =>
      '/api/learners/$learnerId/recommendations/$recId/decline';
  static String recommendationAdjust(String learnerId, String recId) =>
      '/api/learners/$learnerId/recommendations/$recId/adjust';

  // ---------------------------------------------------------------------------
  // Progress (via identity-svc proxy → engagement-svc + brain-svc)
  // ---------------------------------------------------------------------------
  static String progress(String learnerId) =>
      '/api/learners/$learnerId/progress';

  // ---------------------------------------------------------------------------
  // Learning (via identity-svc proxy → learning-svc)
  // ---------------------------------------------------------------------------
  static const String learningSessionStart = '/api/learning/sessions/start';
  static String learningSessionInteract(String id) =>
      '/api/learning/sessions/$id/interact';
  static String learningSessionComplete(String id) =>
      '/api/learning/sessions/$id/complete';
  static String learningSessionDetail(String id) =>
      '/api/learning/sessions/$id';
  static const String learningSessionHistory = '/api/learning/sessions/history';
  static String learningPath(String learnerId) =>
      '/api/learning/learning-path/$learnerId';
  static String learningPathNext(String learnerId) =>
      '/api/learning/learning-path/$learnerId/next';
  static const String learningPathSpacedReview =
      '/api/learning/learning-path/spaced-review';
  static const String questWorlds = '/api/learning/quests/worlds';
  static String questWorldDetail(String id) =>
      '/api/learning/quests/worlds/$id';
  static const String questStart = '/api/learning/quests/start';
  static String questChapter(String id) => '/api/learning/quests/chapter/$id';
  static String questChapterComplete(String id) =>
      '/api/learning/quests/chapter/$id/complete';
  static const String questBoss = '/api/learning/quests/boss';
  static const String questProgress = '/api/learning/quests/progress';
  static const String learningGoals = '/api/learning/goals';

  // ---------------------------------------------------------------------------
  // Tutor (via identity-svc proxy → tutor-svc)
  // ---------------------------------------------------------------------------
  static const String tutorSessionStart = '/api/tutors/sessions/start';
  static String tutorSessionMessage(String id) =>
      '/api/tutors/sessions/$id/message';
  static String tutorSessionEnd(String id) => '/api/tutors/sessions/$id/end';
  static String tutorSessionDetail(String id) => '/api/tutors/sessions/$id';
  static const String tutorSessionHistory = '/api/tutors/sessions/history';
  static const String tutorCatalog = '/api/tutors/catalog';
  static const String tutorSubscriptions = '/api/tutors/subscriptions';
  static const String tutorHomeworkUpload = '/api/tutors/homework/upload';
  static String tutorHomeworkDetail(String id) => '/api/tutors/homework/$id';
  static String tutorHomeworkSessionStart(String id) =>
      '/api/tutors/homework/$id/session/start';
  static String tutorHomeworkSessionMessage(String id) =>
      '/api/tutors/homework/$id/session/message';
  static String tutorHomeworkSessionEnd(String id) =>
      '/api/tutors/homework/$id/session/end';

  // ---------------------------------------------------------------------------
  // Engagement (via identity-svc proxy → engagement-svc)
  // ---------------------------------------------------------------------------
  static String xp(String learnerId) =>
      '/api/learners/$learnerId/engagement/xp';
  static String xpHistory(String learnerId) =>
      '/api/learners/$learnerId/engagement/xp/history';
  static String streaks(String learnerId) =>
      '/api/learners/$learnerId/engagement/streaks';
  static String streakFreeze(String learnerId) =>
      '/api/learners/$learnerId/engagement/streaks/freeze';
  static String badgesEarned(String learnerId) =>
      '/api/learners/$learnerId/engagement/badges';
  static const String badgesAvailable =
      '/api/engagement/badges/available';
  static String badgeProgress(String slug) =>
      '/api/engagement/badges/$slug/progress';
  static const String shopCatalog = '/api/shop/items';
  static const String shopPurchase = '/api/shop/purchase';
  static String inventory(String learnerId) =>
      '/api/learners/$learnerId/engagement/inventory';
  static String avatar(String learnerId) =>
      '/api/learners/$learnerId/avatar';
  static const String challenges = '/api/engagement/challenges';
  static String challengeJoin(String id) =>
      '/api/engagement/challenges/$id/join';
  static String challengePlay(String id) =>
      '/api/engagement/challenges/$id/play';
  static String challengeResult(String id) =>
      '/api/engagement/challenges/$id/result';
  static const String leaderboardGlobal = '/api/engagement/leaderboard/global';
  static const String leaderboardClassroom =
      '/api/engagement/leaderboard/classroom';
  static const String leaderboardFriends =
      '/api/engagement/leaderboard/friends';
  static const String selCheckin = '/api/engagement/sel/checkin';
  static const String selHistory = '/api/engagement/sel/history';
  static const String selBreak = '/api/engagement/sel/break';
  static const String dailyChallenges = '/api/engagement/daily/challenges';

  // ---------------------------------------------------------------------------
  // Family (root-level proxy, NOT under /api)
  // ---------------------------------------------------------------------------
  static String familyDashboardSummary(String learnerId) =>
      '/family/dashboard/$learnerId/summary';
  static String familyDashboard(String learnerId) =>
      '/family/dashboard/$learnerId';
  static String familyRecommendations(String learnerId) =>
      '/family/recommendations/$learnerId';
  static String familyRecommendationRespond(String id) =>
      '/family/recommendations/$id/respond';
  static const String familyRecommendationsHistory =
      '/family/recommendations/history';
  static const String familyInsights = '/family/insights';
  static String familyInsightsLearner(String learnerId) =>
      '/family/insights/$learnerId';
  static String familyCollaborationMembers(String learnerId) =>
      '/family/collaboration/$learnerId/members';
  static String familyCollaborationInvite(String learnerId) =>
      '/family/collaboration/$learnerId/invite';
  static const String familyIepUpload = '/family/iep/upload';
  static String familyIepDocuments(String learnerId) =>
      '/family/iep/documents/$learnerId';
  static String familyIepGoals(String learnerId) =>
      '/family/iep/goals/$learnerId';
  static String familyBrainProfile(String learnerId) =>
      '/family/brain/$learnerId/profile';
  static String familyBrainFunctioningLevel(String learnerId) =>
      '/family/brain/$learnerId/functioning-level';
  static String familyBrainAccommodations(String learnerId) =>
      '/family/brain/$learnerId/accommodations';
  static String familyBrainVersions(String learnerId) =>
      '/family/brain/$learnerId/versions';
  static String familyBrainExport(String learnerId) =>
      '/family/brain/$learnerId/export';
  static String familySettings(String learnerId) =>
      '/family/settings/$learnerId';
  static String familySettingsPrivacy(String learnerId) =>
      '/family/settings/$learnerId/privacy';
  static String familySubscriptionsOverview(String learnerId) =>
      '/family/subscriptions/$learnerId/overview';

  // ---------------------------------------------------------------------------
  // Notifications (via identity-svc proxy → comms-svc)
  // Proxy extracts userId from JWT, no need to pass userId manually
  // ---------------------------------------------------------------------------
  static const String notifications = '/api/notifications';
  static String notificationRead(String id) =>
      '/api/notifications/$id/read';
  static const String notificationsReadAll = '/api/notifications/read-all';
  static const String notificationPreferences =
      '/api/notifications/preferences';
  static const String pushRegister = '/api/notifications/push/register';
  static String pushRegisterDevice(String deviceId) =>
      '/api/notifications/push/devices/$deviceId';

  // ---------------------------------------------------------------------------
  // Billing (via identity-svc proxy → billing-svc)
  // ---------------------------------------------------------------------------
  static const String billingPlans = '/api/billing/plans';
  static const String billingSubscriptions = '/api/billing/subscriptions';
  static const String billingAddons = '/api/billing/addons';

  // ---------------------------------------------------------------------------
  // Teacher (via identity-svc proxy → teacher routes)
  // ---------------------------------------------------------------------------
  static const String teacherClassrooms = '/api/teacher/classrooms';
  static String teacherClassroomDetail(String id) =>
      '/api/teacher/classrooms/$id';
  static String teacherLearnerBrain(String learnerId) =>
      '/api/learners/$learnerId/brain-profile';
  static String teacherLearnerInsights(String learnerId) =>
      '/api/learners/$learnerId/brain-profile/insights';

  // ---------------------------------------------------------------------------
  // Caregiver (via identity-svc proxy → family-svc)
  // Caregiver routes go through family-svc with caregiver auth context
  // ---------------------------------------------------------------------------
  static const String caregiverChild = '/family/caregiver/child';
  static const String caregiverBrain = '/family/caregiver/brain';
  static const String caregiverAccommodations =
      '/family/caregiver/accommodations';
  static const String caregiverIep = '/family/caregiver/iep';
  static const String caregiverGradebook = '/family/caregiver/gradebook';
  static const String caregiverSessions = '/family/caregiver/sessions';

  // ---------------------------------------------------------------------------
  // i18n (direct to i18n-svc, no proxy in identity-svc)
  // ---------------------------------------------------------------------------
  static const String i18nLocales = '/api/i18n/locales';
  static String i18nTranslations(String locale) =>
      '/api/i18n/translations/$locale';
  static String i18nTranslationsNamespace(String locale, String namespace) =>
      '/api/i18n/translations/$locale/$namespace';
  static String i18nExport(String locale) => '/api/i18n/export/$locale';
  static const String i18nExportCoverage = '/api/i18n/export/coverage';
}
