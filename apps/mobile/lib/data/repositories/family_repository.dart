import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/models/recommendation.dart';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final familyRepositoryProvider = Provider<FamilyRepository>((ref) {
  return FamilyRepository(apiClient: ref.watch(apiClientProvider));
});

// ---------------------------------------------------------------------------
// Data classes
// ---------------------------------------------------------------------------

class Learner {
  final String id;
  final String name;
  final String? avatarUrl;
  final String functioningLevel;
  final int todayXp;
  final int streak;
  final int lessonsCompletedToday;
  final int timeSpentTodayMinutes;
  final double masteryProgress;
  final DateTime? lastActiveAt;

  const Learner({
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.functioningLevel,
    required this.todayXp,
    required this.streak,
    required this.lessonsCompletedToday,
    required this.timeSpentTodayMinutes,
    required this.masteryProgress,
    this.lastActiveAt,
  });

  factory Learner.fromJson(Map<String, dynamic> json) {
    return Learner(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      functioningLevel: json['functioningLevel'] as String? ?? 'standard',
      todayXp: json['todayXp'] as int? ?? 0,
      streak: json['streak'] as int? ?? 0,
      lessonsCompletedToday: json['lessonsCompletedToday'] as int? ?? 0,
      timeSpentTodayMinutes: json['timeSpentTodayMinutes'] as int? ?? 0,
      masteryProgress: (json['masteryProgress'] as num?)?.toDouble() ?? 0.0,
      lastActiveAt: json['lastActiveAt'] != null
          ? DateTime.parse(json['lastActiveAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatarUrl': avatarUrl,
        'functioningLevel': functioningLevel,
        'todayXp': todayXp,
        'streak': streak,
        'lessonsCompletedToday': lessonsCompletedToday,
        'timeSpentTodayMinutes': timeSpentTodayMinutes,
        'masteryProgress': masteryProgress,
        'lastActiveAt': lastActiveAt?.toIso8601String(),
      };
}

class DashboardSummary {
  final int totalLearningTimeMinutes;
  final int totalLessonsCompleted;
  final int unreadNotifications;
  final List<Learner> learners;

  const DashboardSummary({
    required this.totalLearningTimeMinutes,
    required this.totalLessonsCompleted,
    required this.unreadNotifications,
    required this.learners,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      totalLearningTimeMinutes:
          json['totalLearningTimeMinutes'] as int? ?? 0,
      totalLessonsCompleted: json['totalLessonsCompleted'] as int? ?? 0,
      unreadNotifications: json['unreadNotifications'] as int? ?? 0,
      learners: (json['learners'] as List<dynamic>?)
              ?.map((e) => Learner.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class ChildDashboard {
  final Learner learner;
  final int xpEarnedToday;
  final int streak;
  final double masteryProgress;
  final int timeSpentMinutes;
  final Map<String, double> subjectProgress;
  final List<ActivityItem> recentActivity;
  final List<LessonPreview> nextLessons;
  final List<WeeklyDataPoint> weeklyTrend;

  const ChildDashboard({
    required this.learner,
    required this.xpEarnedToday,
    required this.streak,
    required this.masteryProgress,
    required this.timeSpentMinutes,
    required this.subjectProgress,
    required this.recentActivity,
    required this.nextLessons,
    required this.weeklyTrend,
  });

  factory ChildDashboard.fromJson(Map<String, dynamic> json) {
    return ChildDashboard(
      learner: Learner.fromJson(json['learner'] as Map<String, dynamic>),
      xpEarnedToday: json['xpEarnedToday'] as int? ?? 0,
      streak: json['streak'] as int? ?? 0,
      masteryProgress:
          (json['masteryProgress'] as num?)?.toDouble() ?? 0.0,
      timeSpentMinutes: json['timeSpentMinutes'] as int? ?? 0,
      subjectProgress:
          (json['subjectProgress'] as Map<String, dynamic>?)?.map(
                (k, v) => MapEntry(k, (v as num).toDouble()),
              ) ??
              const {},
      recentActivity: (json['recentActivity'] as List<dynamic>?)
              ?.map(
                  (e) => ActivityItem.fromJson(e as Map<String, dynamic>),)
              .toList() ??
          const [],
      nextLessons: (json['nextLessons'] as List<dynamic>?)
              ?.map(
                  (e) => LessonPreview.fromJson(e as Map<String, dynamic>),)
              .toList() ??
          const [],
      weeklyTrend: (json['weeklyTrend'] as List<dynamic>?)
              ?.map((e) =>
                  WeeklyDataPoint.fromJson(e as Map<String, dynamic>),)
              .toList() ??
          const [],
    );
  }
}

class ActivityItem {
  final String id;
  final String type;
  final String title;
  final String? subtitle;
  final DateTime timestamp;

  const ActivityItem({
    required this.id,
    required this.type,
    required this.title,
    this.subtitle,
    required this.timestamp,
  });

  factory ActivityItem.fromJson(Map<String, dynamic> json) {
    return ActivityItem(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class LessonPreview {
  final String lessonId;
  final String subject;
  final String title;
  final String status;

  const LessonPreview({
    required this.lessonId,
    required this.subject,
    required this.title,
    required this.status,
  });

  factory LessonPreview.fromJson(Map<String, dynamic> json) {
    return LessonPreview(
      lessonId: json['lessonId'] as String,
      subject: json['subject'] as String,
      title: json['title'] as String,
      status: json['status'] as String? ?? 'pending',
    );
  }
}

class WeeklyDataPoint {
  final String label;
  final double value;

  const WeeklyDataPoint({required this.label, required this.value});

  factory WeeklyDataPoint.fromJson(Map<String, dynamic> json) {
    return WeeklyDataPoint(
      label: json['label'] as String,
      value: (json['value'] as num).toDouble(),
    );
  }
}

class IepDocument {
  final String id;
  final String fileName;
  final DateTime uploadedAt;
  final String? status;

  const IepDocument({
    required this.id,
    required this.fileName,
    required this.uploadedAt,
    this.status,
  });

  factory IepDocument.fromJson(Map<String, dynamic> json) {
    return IepDocument(
      id: json['id'] as String,
      fileName: json['fileName'] as String,
      uploadedAt: DateTime.parse(json['uploadedAt'] as String),
      status: json['status'] as String?,
    );
  }
}

class FamilySettings {
  final String learnerId;
  final String functioningLevel;
  final bool useDyslexicFont;
  final double fontSizeScale;
  final bool audioNarration;
  final bool switchScan;
  final bool pushLearningReminders;
  final bool pushStreakWarnings;
  final bool pushRecommendations;
  final bool pushBadges;
  final bool dataSharing;
  final int sessionDurationLimitMinutes;
  final int dailyGoalMinutes;
  final List<String> enabledSubjects;

  const FamilySettings({
    required this.learnerId,
    required this.functioningLevel,
    this.useDyslexicFont = false,
    this.fontSizeScale = 1.0,
    this.audioNarration = false,
    this.switchScan = false,
    this.pushLearningReminders = true,
    this.pushStreakWarnings = true,
    this.pushRecommendations = true,
    this.pushBadges = true,
    this.dataSharing = true,
    this.sessionDurationLimitMinutes = 30,
    this.dailyGoalMinutes = 20,
    this.enabledSubjects = const ['math', 'reading', 'science', 'social_studies'],
  });

  FamilySettings copyWith({
    String? learnerId,
    String? functioningLevel,
    bool? useDyslexicFont,
    double? fontSizeScale,
    bool? audioNarration,
    bool? switchScan,
    bool? pushLearningReminders,
    bool? pushStreakWarnings,
    bool? pushRecommendations,
    bool? pushBadges,
    bool? dataSharing,
    int? sessionDurationLimitMinutes,
    int? dailyGoalMinutes,
    List<String>? enabledSubjects,
  }) {
    return FamilySettings(
      learnerId: learnerId ?? this.learnerId,
      functioningLevel: functioningLevel ?? this.functioningLevel,
      useDyslexicFont: useDyslexicFont ?? this.useDyslexicFont,
      fontSizeScale: fontSizeScale ?? this.fontSizeScale,
      audioNarration: audioNarration ?? this.audioNarration,
      switchScan: switchScan ?? this.switchScan,
      pushLearningReminders: pushLearningReminders ?? this.pushLearningReminders,
      pushStreakWarnings: pushStreakWarnings ?? this.pushStreakWarnings,
      pushRecommendations: pushRecommendations ?? this.pushRecommendations,
      pushBadges: pushBadges ?? this.pushBadges,
      dataSharing: dataSharing ?? this.dataSharing,
      sessionDurationLimitMinutes:
          sessionDurationLimitMinutes ?? this.sessionDurationLimitMinutes,
      dailyGoalMinutes: dailyGoalMinutes ?? this.dailyGoalMinutes,
      enabledSubjects: enabledSubjects ?? this.enabledSubjects,
    );
  }

  factory FamilySettings.fromJson(Map<String, dynamic> json) {
    return FamilySettings(
      learnerId: json['learnerId'] as String,
      functioningLevel: json['functioningLevel'] as String? ?? 'standard',
      useDyslexicFont: json['useDyslexicFont'] as bool? ?? false,
      fontSizeScale: (json['fontSizeScale'] as num?)?.toDouble() ?? 1.0,
      audioNarration: json['audioNarration'] as bool? ?? false,
      switchScan: json['switchScan'] as bool? ?? false,
      pushLearningReminders: json['pushLearningReminders'] as bool? ?? true,
      pushStreakWarnings: json['pushStreakWarnings'] as bool? ?? true,
      pushRecommendations: json['pushRecommendations'] as bool? ?? true,
      pushBadges: json['pushBadges'] as bool? ?? true,
      dataSharing: json['dataSharing'] as bool? ?? true,
      sessionDurationLimitMinutes:
          json['sessionDurationLimitMinutes'] as int? ?? 30,
      dailyGoalMinutes: json['dailyGoalMinutes'] as int? ?? 20,
      enabledSubjects: (json['enabledSubjects'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const ['math', 'reading', 'science', 'social_studies'],
    );
  }

  Map<String, dynamic> toJson() => {
        'learnerId': learnerId,
        'functioningLevel': functioningLevel,
        'useDyslexicFont': useDyslexicFont,
        'fontSizeScale': fontSizeScale,
        'audioNarration': audioNarration,
        'switchScan': switchScan,
        'pushLearningReminders': pushLearningReminders,
        'pushStreakWarnings': pushStreakWarnings,
        'pushRecommendations': pushRecommendations,
        'pushBadges': pushBadges,
        'dataSharing': dataSharing,
        'sessionDurationLimitMinutes': sessionDurationLimitMinutes,
        'dailyGoalMinutes': dailyGoalMinutes,
        'enabledSubjects': enabledSubjects,
      };
}

class TeacherInsight {
  final String id;
  final String learnerId;
  final String authorId;
  final String authorName;
  final String insightType;
  final String description;
  final String severity;
  final List<String> relatedSkills;
  final String? photoUrl;
  final DateTime createdAt;

  const TeacherInsight({
    required this.id,
    required this.learnerId,
    required this.authorId,
    required this.authorName,
    required this.insightType,
    required this.description,
    required this.severity,
    required this.relatedSkills,
    this.photoUrl,
    required this.createdAt,
  });

  factory TeacherInsight.fromJson(Map<String, dynamic> json) {
    return TeacherInsight(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      authorId: json['authorId'] as String,
      authorName: json['authorName'] as String? ?? '',
      insightType: json['insightType'] as String,
      description: json['description'] as String,
      severity: json['severity'] as String? ?? 'low',
      relatedSkills: (json['relatedSkills'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      photoUrl: json['photoUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'learnerId': learnerId,
        'authorId': authorId,
        'authorName': authorName,
        'insightType': insightType,
        'description': description,
        'severity': severity,
        'relatedSkills': relatedSkills,
        'photoUrl': photoUrl,
        'createdAt': createdAt.toIso8601String(),
      };
}

class ClassroomStudent {
  final String id;
  final String name;
  final String? avatarUrl;
  final String functioningLevel;
  final double todayProgress;
  final DateTime? lastActiveAt;
  final bool atRisk;

  const ClassroomStudent({
    required this.id,
    required this.name,
    this.avatarUrl,
    required this.functioningLevel,
    required this.todayProgress,
    this.lastActiveAt,
    this.atRisk = false,
  });

  factory ClassroomStudent.fromJson(Map<String, dynamic> json) {
    return ClassroomStudent(
      id: json['id'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      functioningLevel: json['functioningLevel'] as String? ?? 'standard',
      todayProgress:
          (json['todayProgress'] as num?)?.toDouble() ?? 0.0,
      lastActiveAt: json['lastActiveAt'] != null
          ? DateTime.parse(json['lastActiveAt'] as String)
          : null,
      atRisk: json['atRisk'] as bool? ?? false,
    );
  }
}

class ClassroomSummary {
  final double classAverage;
  final int studentsAtRisk;
  final int topPerformers;
  final List<ClassroomStudent> students;

  const ClassroomSummary({
    required this.classAverage,
    required this.studentsAtRisk,
    required this.topPerformers,
    required this.students,
  });

  factory ClassroomSummary.fromJson(Map<String, dynamic> json) {
    return ClassroomSummary(
      classAverage:
          (json['classAverage'] as num?)?.toDouble() ?? 0.0,
      studentsAtRisk: json['studentsAtRisk'] as int? ?? 0,
      topPerformers: json['topPerformers'] as int? ?? 0,
      students: (json['students'] as List<dynamic>?)
              ?.map((e) =>
                  ClassroomStudent.fromJson(e as Map<String, dynamic>),)
              .toList() ??
          const [],
    );
  }
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

/// Repository for the family/parent dashboard, learner management, IEP
/// documents, settings, collaboration, and insights.
class FamilyRepository {
  const FamilyRepository({required ApiClient apiClient})
      : _apiClient = apiClient;

  final ApiClient _apiClient;

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  /// Returns the dashboard summary for a specific learner.
  Future<Map<String, dynamic>> getDashboardSummary(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyDashboardSummary(learnerId));
    return response.data as Map<String, dynamic>;
  }

  /// Returns a detailed child dashboard.
  Future<ChildDashboard> getChildDashboard(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyDashboard(learnerId));
    return ChildDashboard.fromJson(
        response.data as Map<String, dynamic>,);
  }

  // ---------------------------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------------------------

  /// Returns recommendations for a learner.
  Future<List<Recommendation>> getRecommendations(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyRecommendations(learnerId));
    final data = response.data;
    if (data is List<dynamic>) {
      return data
          .map((e) => Recommendation.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    final map = data as Map<String, dynamic>;
    return (map['recommendations'] as List<dynamic>?)
            ?.map(
                (e) => Recommendation.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }

  /// Responds to a recommendation (approve, reject, or adjust).
  Future<void> respondToRecommendation(
    String id,
    String response, {
    Map<String, dynamic>? adjustments,
  }) async {
    await _apiClient.post(
      Endpoints.familyRecommendationRespond(id),
      data: {
        'response': response,
        if (adjustments != null) 'adjustments': adjustments,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Brain profile
  // ---------------------------------------------------------------------------

  /// Returns the brain profile for a learner.
  Future<BrainContext> getBrainProfile(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyBrainProfile(learnerId));
    return BrainContext.fromJson(
        response.data as Map<String, dynamic>,);
  }

  /// Returns the functioning level label for a learner.
  Future<String> getFunctioningLevel(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyBrainFunctioningLevel(learnerId));
    final data = response.data as Map<String, dynamic>;
    return data['functioningLevel'] as String;
  }

  /// Exports brain data for a learner.
  Future<void> exportBrainData(String learnerId) async {
    await _apiClient.get(Endpoints.familyBrainExport(learnerId));
  }

  /// Returns brain profile version history for a learner.
  Future<List<Map<String, dynamic>>> getBrainVersions(
      String learnerId,) async {
    final response = await _apiClient
        .get(Endpoints.familyBrainVersions(learnerId));
    final list = response.data as List<dynamic>;
    return list.cast<Map<String, dynamic>>();
  }

  // ---------------------------------------------------------------------------
  // IEP
  // ---------------------------------------------------------------------------

  /// Returns IEP goals for a learner.
  Future<List<IepGoal>> getIepGoals(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyIepGoals(learnerId));
    final data = response.data;
    if (data is List<dynamic>) {
      return data
          .map((e) => IepGoal.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    final map = data as Map<String, dynamic>;
    return (map['goals'] as List<dynamic>?)
            ?.map((e) => IepGoal.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  /// Uploads an IEP document (PDF or image).
  Future<void> uploadIep(String filePath) async {
    await _apiClient.upload(
      Endpoints.familyIepUpload,
      filePath: filePath,
      fieldName: 'file',
    );
  }

  /// Returns IEP documents for a learner.
  Future<List<IepDocument>> getIepDocuments(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familyIepDocuments(learnerId));
    final list = response.data as List<dynamic>;
    return list
        .map((e) => IepDocument.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  /// Returns the learner's family-managed settings.
  Future<Map<String, dynamic>> getSettings(String learnerId) async {
    final response = await _apiClient
        .get(Endpoints.familySettings(learnerId));
    return response.data as Map<String, dynamic>;
  }

  /// Updates the learner's family-managed settings.
  Future<void> updateSettings(
      String learnerId, Map<String, dynamic> settings,) async {
    await _apiClient.put(
      Endpoints.familySettings(learnerId),
      data: settings,
    );
  }

  // ---------------------------------------------------------------------------
  // Collaboration
  // ---------------------------------------------------------------------------

  /// Returns the list of collaboration members (therapists, teachers, etc.)
  /// for a learner.
  Future<List<Map<String, dynamic>>> getCollaborationMembers(
      String learnerId,) async {
    final response = await _apiClient
        .get(Endpoints.familyCollaborationMembers(learnerId));
    final data = response.data;
    if (data is List<dynamic>) {
      return data.map((e) => e as Map<String, dynamic>).toList();
    }
    final map = data as Map<String, dynamic>;
    return (map['members'] as List<dynamic>?)
            ?.map((e) => e as Map<String, dynamic>)
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Insights
  // ---------------------------------------------------------------------------

  /// Submits a parent/family insight observation.
  Future<void> submitInsight(Map<String, dynamic> insight) async {
    await _apiClient.post(
      Endpoints.familyInsights,
      data: insight,
    );
  }

  /// Returns insights for a learner.
  Future<List<TeacherInsight>> getInsightsForLearner(
      String learnerId,) async {
    final response = await _apiClient
        .get(Endpoints.familyInsightsLearner(learnerId));
    final list = response.data as List<dynamic>;
    return list
        .map((e) => TeacherInsight.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // ---------------------------------------------------------------------------
  // Learners
  // ---------------------------------------------------------------------------

  /// Returns the list of learners associated with the authenticated parent.
  Future<List<Map<String, dynamic>>> getLearners() async {
    final response = await _apiClient.get(Endpoints.learners);
    final data = response.data;
    if (data is List<dynamic>) {
      return data.map((e) => e as Map<String, dynamic>).toList();
    }
    final map = data as Map<String, dynamic>;
    return (map['learners'] as List<dynamic>?)
            ?.map((e) => e as Map<String, dynamic>)
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Teacher / Classroom
  // ---------------------------------------------------------------------------

  /// Returns the classroom summary for a teacher.
  Future<ClassroomSummary> getClassroom() async {
    final response = await _apiClient.get('/teacher/classroom');
    return ClassroomSummary.fromJson(
        response.data as Map<String, dynamic>,);
  }

  /// Returns the unread notification count for a user.
  Future<int> getUnreadNotificationCount(String userId) async {
    final response = await _apiClient
        .get(Endpoints.notifications(userId), queryParameters: {
      'unreadOnly': true,
      'countOnly': true,
    },);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data['count'] as int? ?? 0;
    }
    return 0;
  }
}
