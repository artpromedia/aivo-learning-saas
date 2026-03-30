import 'dart:convert';
import 'dart:math';

import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/mastery_dao.dart';

/// Lightweight offline mastery inference engine.
///
/// When a lesson is completed offline, this engine:
/// 1. Calculates a mastery delta from the learner's performance
/// 2. Updates the local [MasteryCache] with the inferred mastery level
/// 3. Computes a simplified SM-2 next-review date
/// 4. Queues the completion event as a [SyncAction] for server replay
///
/// The server Brain recalculates authoritatively on reconnect — these local
/// updates are inferential only so the learner sees immediate feedback.
class OfflineMasteryEngine {
  OfflineMasteryEngine({
    required MasteryDao masteryDao,
    required SyncManager syncManager,
  })  : _masteryDao = masteryDao,
        _syncManager = syncManager;

  final MasteryDao _masteryDao;
  final SyncManager _syncManager;

  static const _masteryDelta = 0.05;

  /// Processes a lesson completion that happened offline.
  ///
  /// [learnerId]       — the learner who completed the lesson
  /// [skillId]         — the skill practiced in the lesson
  /// [subject]         — the subject area
  /// [correctAttempts] — number of correct responses in the session
  /// [totalAttempts]   — total number of responses in the session
  /// [sessionId]       — the learning session identifier
  /// [timeSpentSeconds] — time the learner spent on the lesson
  Future<void> processCompletion({
    required String learnerId,
    required String skillId,
    required String subject,
    required int correctAttempts,
    required int totalAttempts,
    required String sessionId,
    required int timeSpentSeconds,
  }) async {
    await _updateLocalMastery(
      learnerId: learnerId,
      skillId: skillId,
      subject: subject,
      correctAttempts: correctAttempts,
      totalAttempts: totalAttempts,
    );

    await _queueForSync(
      learnerId: learnerId,
      sessionId: sessionId,
      skillId: skillId,
      correctAttempts: correctAttempts,
      totalAttempts: totalAttempts,
      timeSpentSeconds: timeSpentSeconds,
    );
  }

  Future<void> _updateLocalMastery({
    required String learnerId,
    required String skillId,
    required String subject,
    required int correctAttempts,
    required int totalAttempts,
  }) async {
    final existing = await _masteryDao.getMasteryForSkill(learnerId, skillId);
    final score = totalAttempts > 0 ? correctAttempts / totalAttempts : 0.0;

    final oldLevel = existing?.masteryLevel ?? 0.0;
    final delta = score >= 0.5 ? _masteryDelta : -_masteryDelta;
    final newLevel = (oldLevel + delta).clamp(0.0, 1.0);

    final oldTotal = existing?.totalAttempts ?? 0;
    final oldCorrect = existing?.correctAttempts ?? 0;

    final recentScores = _updatedRecentScores(existing?.recentScores, score);
    final nextReview = _computeNextReview(score, existing?.nextReviewAt);

    await _masteryDao.upsertMastery(MasteryCacheCompanion.insert(
      learnerId: learnerId,
      skillId: skillId,
      subject: subject,
      masteryLevel: Value(newLevel),
      totalAttempts: Value(oldTotal + totalAttempts),
      correctAttempts: Value(oldCorrect + correctAttempts),
      recentScores: Value(jsonEncode(recentScores)),
      lastPracticedAt: Value(DateTime.now()),
      nextReviewAt: Value(nextReview),
    ),);
  }

  /// Keeps the last 10 scores as a sliding window.
  List<double> _updatedRecentScores(String? existing, double newScore) {
    final scores = <double>[];
    if (existing != null) {
      final decoded = jsonDecode(existing);
      if (decoded is List) {
        scores.addAll(decoded.cast<num>().map((n) => n.toDouble()));
      }
    }
    scores.add(newScore);
    if (scores.length > 10) {
      scores.removeRange(0, scores.length - 10);
    }
    return scores;
  }

  /// Simplified SM-2 review scheduling.
  ///
  /// If score >= 0.8 the current interval is multiplied by 2.5 (starting from
  /// 1 day).  Otherwise the interval resets to 1 day.
  DateTime _computeNextReview(double score, DateTime? currentNextReview) {
    final now = DateTime.now();
    if (score >= 0.8) {
      final currentInterval = currentNextReview != null
          ? max(currentNextReview.difference(now).inDays, 1)
          : 1;
      final nextInterval = (currentInterval * 2.5).round();
      return now.add(Duration(days: nextInterval));
    }
    return now.add(const Duration(days: 1));
  }

  Future<void> _queueForSync({
    required String learnerId,
    required String sessionId,
    required String skillId,
    required int correctAttempts,
    required int totalAttempts,
    required int timeSpentSeconds,
  }) async {
    await _syncManager.queueAction(SyncAction(
      endpoint: '/learning/sessions/$sessionId/complete',
      method: 'POST',
      payload: jsonEncode({
        'learnerId': learnerId,
        'skillId': skillId,
        'correctAttempts': correctAttempts,
        'totalAttempts': totalAttempts,
        'timeSpentSeconds': timeSpentSeconds,
        'completedOffline': true,
      }),
    ),);
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final offlineMasteryEngineProvider = Provider<OfflineMasteryEngine>((ref) {
  return OfflineMasteryEngine(
    masteryDao: ref.watch(masteryDaoProvider),
    syncManager: ref.watch(syncManagerProvider),
  );
});
