import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';

/// Pre-fetches upcoming lessons while online and caches them locally so that
/// learners can continue learning when the device goes offline.
///
/// The service maintains a buffer of up to [maxPrefetch] lessons (default 10)
/// with a 48-hour TTL per cached lesson.
class LessonPrefetchService {
  LessonPrefetchService({
    required ApiClient apiClient,
    required LessonDao lessonDao,
    required bool isOnline,
    this.maxPrefetch = 10,
  })  : _api = apiClient,
        _lessonDao = lessonDao,
        _isOnline = isOnline;

  final ApiClient _api;
  final LessonDao _lessonDao;
  final bool _isOnline;
  final int maxPrefetch;

  static const _lessonTtl = Duration(hours: 48);

  /// Evicts expired lessons and pre-fetches enough lessons to fill the buffer
  /// up to [maxPrefetch] for the given [learnerId].
  ///
  /// Does nothing when offline.
  Future<void> prefetchLessons(String learnerId) async {
    await _lessonDao.deleteExpiredLessons();

    if (!_isOnline) return;

    final cachedCount = await _lessonDao.countCachedLessons(learnerId);
    final needed = maxPrefetch - cachedCount;
    if (needed <= 0) return;

    try {
      final response = await _api.get(
        '/learning/sessions/upcoming',
        queryParameters: {
          'learnerId': learnerId,
          'limit': needed,
        },
      );
      final data = response.data as Map<String, dynamic>;
      final lessons = data['lessons'] as List<dynamic>? ?? [];

      for (var i = 0; i < lessons.length; i++) {
        final lesson = lessons[i] as Map<String, dynamic>;
        await _lessonDao.cacheLesson(CachedLessonsCompanion.insert(
          lessonId: lesson['lessonId'] as String,
          learnerId: learnerId,
          subject: lesson['subject'] as String,
          topic: lesson['topic'] as String,
          skillId: lesson['skillId'] as String,
          contentJson: jsonEncode(lesson['content']),
          interactionsJson: lesson['interactions'] != null
              ? Value(jsonEncode(lesson['interactions']))
              : const Value.absent(),
          orderIndex: Value(lesson['orderIndex'] as int? ?? i),
          expiresAt: DateTime.now().add(_lessonTtl),
        ),);
      }
    } on DioException catch (e) {
      debugPrint('[LessonPrefetch] Failed to prefetch lessons: $e');
    }
  }

  /// Called after a lesson is completed online to maintain the buffer.
  Future<void> refillAfterCompletion(String learnerId) async {
    await prefetchLessons(learnerId);
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final lessonPrefetchServiceProvider = Provider<LessonPrefetchService>((ref) {
  return LessonPrefetchService(
    apiClient: ref.watch(apiClientProvider),
    lessonDao: ref.watch(lessonDaoProvider),
    isOnline: ref.watch(isOnlineProvider),
  );
});
