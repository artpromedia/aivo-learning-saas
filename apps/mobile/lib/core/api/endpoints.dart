/// Centralized API endpoint constants for the AIVO Learning mobile app.
///
/// Path-parameter helpers return interpolated strings so callers never
/// hard-code raw paths with manual string concatenation.
class Endpoints {
  Endpoints._();

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String oauthCallback = '/auth/oauth-callback';
  static const String verifyEmail = '/auth/verify-email';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  static const String usersMe = '/users/me';

  // ---------------------------------------------------------------------------
  // Learners
  // ---------------------------------------------------------------------------
  static const String learners = '/learners';
  static String learnerDetail(String id) => '/learners/$id';

  // ---------------------------------------------------------------------------
  // Learning
  // ---------------------------------------------------------------------------
  static const String learningSessionStart = '/learning/sessions/start';
  static String learningSessionInteract(String id) =>
      '/learning/sessions/$id/interact';
  static String learningSessionComplete(String id) =>
      '/learning/sessions/$id/complete';
  static String learningSessionDetail(String id) =>
      '/learning/sessions/$id';
  static const String learningSessionHistory = '/learning/sessions/history';
  static const String learningPath = '/learning/learning-path';
  static const String learningPathNext = '/learning/learning-path/next';
  static const String learningPathSpacedReview =
      '/learning/learning-path/spaced-review';
  static const String gradebookSummary = '/learning/gradebook/summary';
  static String gradebookSubject(String subject) =>
      '/learning/gradebook/subject/$subject';
  static const String questWorlds = '/learning/quests/worlds';
  static String questWorldDetail(String id) => '/learning/quests/worlds/$id';
  static const String questStart = '/learning/quests/start';
  static String questChapter(String id) => '/learning/quests/chapter/$id';
  static String questChapterComplete(String id) =>
      '/learning/quests/chapter/$id/complete';
  static const String questBoss = '/learning/quests/boss';
  static const String questProgress = '/learning/quests/progress';
  static const String learningGoals = '/learning/goals';

  // ---------------------------------------------------------------------------
  // Tutor
  // ---------------------------------------------------------------------------
  static const String tutorSessionStart = '/tutors/sessions/start';
  static String tutorSessionMessage(String id) =>
      '/tutors/sessions/$id/message';
  static String tutorSessionEnd(String id) => '/tutors/sessions/$id/end';
  static String tutorSessionDetail(String id) => '/tutors/sessions/$id';
  static const String tutorSessionHistory = '/tutors/sessions/history';
  static const String tutorCatalog = '/tutors/catalog';
  static const String tutorSubscriptions = '/tutors/subscriptions';
  static const String tutorHomeworkUpload = '/tutors/homework/upload';
  static String tutorHomeworkDetail(String id) => '/tutors/homework/$id';
  static String tutorHomeworkSessionStart(String id) =>
      '/tutors/homework/$id/session/start';
  static String tutorHomeworkSessionMessage(String id) =>
      '/tutors/homework/$id/session/message';
  static String tutorHomeworkSessionEnd(String id) =>
      '/tutors/homework/$id/session/end';

  // ---------------------------------------------------------------------------
  // Engagement
  // ---------------------------------------------------------------------------
  static String xp(String learnerId) => '/engagement/xp/$learnerId';
  static String xpHistory(String learnerId) =>
      '/engagement/xp/$learnerId/history';
  static String streaks(String learnerId) =>
      '/engagement/streaks/$learnerId';
  static String streakFreeze(String learnerId) =>
      '/engagement/streaks/$learnerId/freeze';
  static String badgesEarned(String learnerId) =>
      '/engagement/badges/$learnerId/earned';
  static const String badgesAvailable = '/engagement/badges/available';
  static String badgeProgress(String slug) =>
      '/engagement/badges/$slug/progress';
  static const String shopCatalog = '/engagement/shop/catalog';
  static const String shopPurchase = '/engagement/shop/purchase';
  static String inventory(String learnerId) =>
      '/engagement/inventory/$learnerId';
  static String avatar(String learnerId) =>
      '/engagement/avatar/$learnerId';
  static const String challenges = '/engagement/challenges';
  static String challengeJoin(String id) =>
      '/engagement/challenges/$id/join';
  static String challengePlay(String id) =>
      '/engagement/challenges/$id/play';
  static String challengeResult(String id) =>
      '/engagement/challenges/$id/result';
  static const String leaderboardGlobal = '/engagement/leaderboard/global';
  static const String leaderboardClassroom =
      '/engagement/leaderboard/classroom';
  static const String leaderboardFriends =
      '/engagement/leaderboard/friends';
  static const String selCheckin = '/engagement/sel/checkin';
  static const String selHistory = '/engagement/sel/history';
  static const String selBreak = '/engagement/sel/break';
  static const String dailyChallenges = '/engagement/daily/challenges';

  // ---------------------------------------------------------------------------
  // Family
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
  // Brain
  // ---------------------------------------------------------------------------
  static String brainLearner(String learnerId) =>
      '/brain/learner/$learnerId';
  static const String brainAccommodationsResolve =
      '/brain/accommodations/resolve';
  static String brainMasteryLearner(String learnerId) =>
      '/brain/mastery/learner/$learnerId';
  static const String brainMasteryUpdate = '/brain/mastery/update';
  static String brainRecommendationsLearner(String learnerId) =>
      '/brain/recommendations/learner/$learnerId';
  static const String brainTutors = '/brain/tutors';

  // ---------------------------------------------------------------------------
  // Comms
  // ---------------------------------------------------------------------------
  static String notifications(String userId) =>
      '/comms/notifications/$userId';
  static String notificationRead(String id) =>
      '/comms/notifications/$id/read';
  static String notificationsReadAll(String userId) =>
      '/comms/notifications/$userId/read-all';
  static String notificationPreferences(String userId) =>
      '/comms/notifications/$userId/preferences';
  static const String pushRegister = '/comms/push/register';
  static String pushRegisterDevice(String deviceId) =>
      '/comms/push/register/$deviceId';
  static const String ws = '/comms/ws';

  // ---------------------------------------------------------------------------
  // Billing
  // ---------------------------------------------------------------------------
  static const String billingPlans = '/billing/plans';
  static const String billingSubscriptions = '/billing/subscriptions';
  static const String billingAddons = '/billing/addons';

  // ---------------------------------------------------------------------------
  // i18n
  // ---------------------------------------------------------------------------
  static const String i18nLocales = '/i18n/locales';
  static String i18nTranslations(String locale) => '/i18n/translations/$locale';
  static String i18nTranslationsNamespace(String locale, String namespace) =>
      '/i18n/translations/$locale/$namespace';
  static String i18nExport(String locale) => '/i18n/export/$locale';
  static const String i18nExportCoverage = '/i18n/export/coverage';
}
