import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/database.dart';
import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';
import 'package:aivo_mobile/data/models/quest.dart';

/// Repository that bridges the Learning service API with local lesson caching.
///
/// Sessions started while offline use pre-cached lesson content.  Interactions
/// and session completions performed offline are queued in the [SyncManager].
class LearningRepository {
  const LearningRepository({
    required ApiClient apiClient,
    required LessonDao lessonDao,
    required bool isOnline,
    required SyncManager syncManager,
  })  : _api = apiClient,
        _lessonDao = lessonDao,
        _isOnline = isOnline,
        _syncManager = syncManager;

  final ApiClient _api;
  final LessonDao _lessonDao;
  final bool _isOnline;
  final SyncManager _syncManager;

  // ---------------------------------------------------------------------------
  // Learning path
  // ---------------------------------------------------------------------------

  /// Returns the full learning path for a learner.
  Future<LearningPath> getLearningPath(String learnerId) async {
    final response = await _api.get(
      Endpoints.learningPath,
      queryParameters: {'learnerId': learnerId},
    );
    return LearningPath.fromJson(response.data as Map<String, dynamic>);
  }

  /// Returns the next recommended lesson on the learning path.
  Future<LearningPathItem> getNextLesson(String learnerId) async {
    final response = await _api.get(
      Endpoints.learningPathNext,
      queryParameters: {'learnerId': learnerId},
    );
    return LearningPathItem.fromJson(response.data as Map<String, dynamic>);
  }

  // ---------------------------------------------------------------------------
  // Sessions
  // ---------------------------------------------------------------------------

  /// Starts a new learning session. Falls back to a cached lesson when offline.
  Future<LearningSession> startSession(String lessonId) async {
    if (_isOnline) {
      try {
        final response = await _api.post(
          Endpoints.learningSessionStart,
          data: {'lessonId': lessonId},
        );
        return LearningSession.fromJson(
            response.data as Map<String, dynamic>);
      } on DioException {
        // Fall through to cached lesson.
      }
    }

    final cached = await _lessonDao.getCachedLesson(lessonId);
    if (cached != null) return _rowToSession(cached);

    throw StateError(
      'Cannot start session for lesson $lessonId: offline with no cache',
    );
  }

  /// Submits a learner interaction within a session. Queues offline.
  Future<Interaction> submitInteraction(
    String sessionId,
    String interactionId,
    String response,
  ) async {
    final payload = {
      'interactionId': interactionId,
      'response': response,
    };

    if (_isOnline) {
      try {
        final apiResponse = await _api.post(
          Endpoints.learningSessionInteract(sessionId),
          data: payload,
        );
        return Interaction.fromJson(
            apiResponse.data as Map<String, dynamic>);
      } on DioException {
        // Queue offline.
      }
    }

    await _syncManager.queueAction(SyncAction(
      endpoint: Endpoints.learningSessionInteract(sessionId),
      method: 'POST',
      payload: jsonEncode(payload),
    ));

    // Return a provisional interaction so the UI can proceed.
    return Interaction(
      id: interactionId,
      type: 'pending',
      prompt: '',
      data: const {},
      studentResponse: response,
      respondedAt: DateTime.now(),
    );
  }

  /// Completes a session. Queues offline.
  Future<LearningSession> completeSession(
    String sessionId, {
    double? score,
  }) async {
    final payload = <String, dynamic>{
      if (score != null) 'score': score,
    };

    if (_isOnline) {
      try {
        final response = await _api.post(
          Endpoints.learningSessionComplete(sessionId),
          data: payload,
        );
        return LearningSession.fromJson(
            response.data as Map<String, dynamic>);
      } on DioException {
        // Queue offline.
      }
    }

    await _syncManager.queueAction(SyncAction(
      endpoint: Endpoints.learningSessionComplete(sessionId),
      method: 'POST',
      payload: jsonEncode(payload),
    ));

    // Return a provisional completed session.
    return LearningSession(
      id: sessionId,
      lessonId: '',
      learnerId: '',
      subject: '',
      topic: '',
      skillId: '',
      status: 'completed_offline',
      content: const {},
      score: score,
      interactions: const [],
      timeSpentSeconds: 0,
      startedAt: DateTime.now(),
      completedAt: DateTime.now(),
    );
  }

  /// Returns the learner's session history.
  Future<List<LearningSession>> getSessionHistory() async {
    final response = await _api.get(Endpoints.learningSessionHistory);
    final data = response.data as Map<String, dynamic>;
    final sessions = (data['sessions'] as List<dynamic>?)
            ?.map(
                (e) => LearningSession.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return sessions;
  }

  /// Returns a gradebook summary.
  Future<Map<String, dynamic>> getGradebookSummary() async {
    final response = await _api.get(Endpoints.gradebookSummary);
    return response.data as Map<String, dynamic>;
  }

  // ---------------------------------------------------------------------------
  // Lesson pre-caching
  // ---------------------------------------------------------------------------

  /// Fetches the next [count] lessons from the learning path and caches them
  /// locally via [LessonDao] so they are available offline.
  Future<void> preCacheLessons(String learnerId, {int count = 10}) async {
    final response = await _api.get(
      Endpoints.learningPath,
      queryParameters: {'learnerId': learnerId, 'limit': count},
    );

    final data = response.data as Map<String, dynamic>;
    final items = (data['items'] as List<dynamic>?) ?? [];

    final expiresAt = DateTime.now().add(const Duration(days: 7));

    for (var i = 0; i < items.length; i++) {
      final item = items[i] as Map<String, dynamic>;
      final lessonId = item['lessonId'] as String;

      // Fetch individual lesson content.
      try {
        final lessonResponse = await _api.get(
          Endpoints.learningSessionDetail(lessonId),
        );
        final lessonData = lessonResponse.data as Map<String, dynamic>;

        await _lessonDao.cacheLesson(CachedLessonsCompanion.insert(
          lessonId: lessonId,
          learnerId: learnerId,
          subject: item['subject'] as String? ?? '',
          topic: item['topic'] as String? ?? '',
          skillId: item['skillId'] as String? ?? '',
          contentJson: jsonEncode(lessonData),
          orderIndex: Value(i),
          expiresAt: expiresAt,
        ));
      } on DioException {
        // Skip lessons that fail to download.
        continue;
      }
    }
  }

  /// Returns a cached lesson as a [LearningSession], or `null` if not cached.
  Future<LearningSession?> getCachedLesson(String lessonId) async {
    final row = await _lessonDao.getCachedLesson(lessonId);
    if (row == null) return null;
    return _rowToSession(row);
  }

  // ---------------------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------------------

  /// Returns all quest worlds.
  Future<List<QuestWorld>> getQuestWorlds() async {
    final response = await _api.get(Endpoints.questWorlds);
    final data = response.data as Map<String, dynamic>;
    return (data['worlds'] as List<dynamic>?)
            ?.map((e) => QuestWorld.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  /// Returns the details of a single quest chapter.
  Future<QuestChapter> getQuestChapter(String chapterId) async {
    final response = await _api.get(Endpoints.questChapter(chapterId));
    return QuestChapter.fromJson(response.data as Map<String, dynamic>);
  }

  /// Marks a quest chapter as completed.
  Future<void> completeChapter(String chapterId) async {
    if (_isOnline) {
      try {
        await _api.post(Endpoints.questChapterComplete(chapterId));
        return;
      } on DioException {
        // Queue offline.
      }
    }

    await _syncManager.queueAction(SyncAction(
      endpoint: Endpoints.questChapterComplete(chapterId),
      method: 'POST',
      payload: jsonEncode({}),
    ));
  }

  /// Returns overall quest progress.
  Future<QuestProgress> getQuestProgress() async {
    final response = await _api.get(Endpoints.questProgress);
    return QuestProgress.fromJson(response.data as Map<String, dynamic>);
  }

  /// Starts a new quest in a world.
  Future<void> startQuest(String worldId) async {
    await _api.post(Endpoints.questStart, data: {'worldId': worldId});
  }

  // ---------------------------------------------------------------------------
  // Spaced review
  // ---------------------------------------------------------------------------

  /// Returns items due for spaced-repetition review.
  Future<List<LearningPathItem>> getSpacedReview() async {
    final response = await _api.get(Endpoints.learningPathSpacedReview);
    final data = response.data as Map<String, dynamic>;
    return (data['items'] as List<dynamic>?)
            ?.map(
                (e) => LearningPathItem.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Converts a cached lesson row into a [LearningSession] suitable for
  /// offline playback.
  LearningSession _rowToSession(CachedLessonData row) {
    final content = jsonDecode(row.contentJson) as Map<String, dynamic>;
    final interactions = row.interactionsJson != null
        ? (jsonDecode(row.interactionsJson!) as List<dynamic>)
            .map((e) => Interaction.fromJson(e as Map<String, dynamic>))
            .toList()
        : <Interaction>[];
    return LearningSession(
      id: 'offline_${row.lessonId}',
      lessonId: row.lessonId,
      learnerId: row.learnerId,
      subject: row.subject,
      topic: row.topic,
      skillId: row.skillId,
      status: 'cached',
      content: content,
      interactions: interactions,
      timeSpentSeconds: 0,
      startedAt: DateTime.now(),
    );
  }
}

/// Riverpod provider for [LearningRepository].
final learningRepositoryProvider = Provider<LearningRepository>((ref) {
  return LearningRepository(
    apiClient: ref.watch(apiClientProvider),
    lessonDao: ref.watch(lessonDaoProvider),
    isOnline: ref.watch(isOnlineProvider),
    syncManager: ref.watch(syncManagerProvider),
  );
});
