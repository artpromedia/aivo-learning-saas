import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/brain_dao.dart';
import 'package:aivo_mobile/data/local/daos/mastery_dao.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/models/recommendation.dart';
import 'package:aivo_mobile/data/services/lesson_prefetch_service.dart';

/// Result of a brain snapshot reconciliation after reconnecting.
enum BrainReconciliationResult {
  noChange,
  serverUpdated,
  offlineReplayed,
  conflictResolved,
}

/// Repository for the learner Brain (cognitive profile, mastery, accommodations).
///
/// Tries the remote API first and falls back to the local Drift cache when the
/// device is offline.  Mutations performed while offline are queued in the
/// [SyncManager] for replay on reconnection.
class BrainRepository {
  const BrainRepository({
    required ApiClient apiClient,
    required BrainDao brainDao,
    required MasteryDao masteryDao,
    required bool isOnline,
    required SyncManager syncManager,
    LessonPrefetchService? lessonPrefetchService,
  })  : _api = apiClient,
        _brainDao = brainDao,
        _masteryDao = masteryDao,
        _isOnline = isOnline,
        _syncManager = syncManager,
        _lessonPrefetchService = lessonPrefetchService;

  final ApiClient _api;
  final BrainDao _brainDao;
  final MasteryDao _masteryDao;
  final bool _isOnline;
  final SyncManager _syncManager;
  final LessonPrefetchService? _lessonPrefetchService;

  // ---------------------------------------------------------------------------
  // Brain context
  // ---------------------------------------------------------------------------

  /// Fetches the full brain context for a learner. Tries the remote API first
  /// and falls back to the local cache when offline.
  Future<BrainContext> getBrainContext(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api.get(Endpoints.brainLearner(learnerId));
        final data = response.data as Map<String, dynamic>;
        final context = BrainContext.fromJson(data);
        // Cache locally for offline access.
        await _saveBrainContext(context);
        return context;
      } on DioException {
        // Fall through to local cache.
      }
    }

    final local = await _loadBrainContext(learnerId);
    if (local != null) return local;

    throw StateError(
      'No brain context available for learner $learnerId (offline with empty cache)',
    );
  }

  /// Forces a full sync of the brain snapshot from the remote API into local
  /// storage and returns the fresh [BrainContext].
  Future<BrainContext> syncBrainSnapshot(String learnerId) async {
    final response = await _api.get(Endpoints.brainLearner(learnerId));
    final data = response.data as Map<String, dynamic>;
    final context = BrainContext.fromJson(data);
    await _saveBrainContext(context);
    return context;
  }

  /// Returns the locally-cached brain snapshot, or `null` if none exists.
  Future<BrainContext?> getLocalBrainSnapshot(String learnerId) async {
    return _loadBrainContext(learnerId);
  }

  // ---------------------------------------------------------------------------
  // Mastery
  // ---------------------------------------------------------------------------

  /// Returns mastery levels for the learner. Prefers remote when online,
  /// otherwise reads the local cache.
  Future<List<MasteryLevel>> getMasteryLevels(String learnerId) async {
    if (_isOnline) {
      try {
        final response =
            await _api.get(Endpoints.brainMasteryLearner(learnerId));
        final data = response.data as Map<String, dynamic>;
        final items = (data['masteryLevels'] as List<dynamic>?)
                ?.map(
                    (e) => MasteryLevel.fromJson(e as Map<String, dynamic>),)
                .toList() ??
            [];
        // Cache each mastery record locally.
        for (final mastery in items) {
          await _masteryDao.upsertMastery(MasteryCacheCompanion.insert(
            learnerId: learnerId,
            skillId: mastery.skillId,
            subject: mastery.subject,
            masteryLevel: Value(mastery.level),
            totalAttempts: Value(mastery.totalAttempts),
            correctAttempts: Value(mastery.correctAttempts),
            lastPracticedAt: Value(mastery.lastPracticedAt),
            nextReviewAt: Value(mastery.nextReviewAt),
          ),);
        }
        return items;
      } on DioException {
        // Fall through.
      }
    }

    final rows = await _masteryDao.getMasteryForLearner(learnerId);
    return rows
        .map((row) => MasteryLevel(
              skillId: row.skillId,
              subject: row.subject,
              level: row.masteryLevel,
              totalAttempts: row.totalAttempts,
              correctAttempts: row.correctAttempts,
              lastPracticedAt: row.lastPracticedAt,
              nextReviewAt: row.nextReviewAt,
            ),)
        .toList();
  }

  /// Updates a single mastery score. Queues the mutation when offline.
  Future<void> updateMastery(
      String learnerId, String skillId, double score,) async {
    final payload = {
      'learnerId': learnerId,
      'skillId': skillId,
      'score': score,
    };

    if (_isOnline) {
      try {
        await _api.post(Endpoints.brainMasteryUpdate, data: payload);
        return;
      } on DioException {
        // Queue offline.
      }
    }

    await _syncManager.queueAction(SyncAction(
      endpoint: Endpoints.brainMasteryUpdate,
      method: 'POST',
      payload: jsonEncode(payload),
    ),);
  }

  // ---------------------------------------------------------------------------
  // Accommodations
  // ---------------------------------------------------------------------------

  /// Returns the accommodation settings for a learner.
  Future<Map<String, dynamic>> getAccommodations(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api.get(
          '/brain/accommodations/learner/$learnerId',
        );
        return response.data as Map<String, dynamic>;
      } on DioException {
        // Fall through to local snapshot.
      }
    }

    final local = await _brainDao.getBrainSnapshot(learnerId);
    if (local?.accommodations != null) {
      return jsonDecode(local!.accommodations!) as Map<String, dynamic>;
    }
    return {};
  }

  // ---------------------------------------------------------------------------
  // Recommendations
  // ---------------------------------------------------------------------------

  /// Returns AI-generated recommendations for a learner.
  Future<List<Recommendation>> getRecommendations(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api
            .get(Endpoints.brainRecommendationsLearner(learnerId),);
        final data = response.data as Map<String, dynamic>;
        final items = (data['recommendations'] as List<dynamic>?)
                ?.map((e) =>
                    Recommendation.fromJson(e as Map<String, dynamic>),)
                .toList() ??
            [];
        return items;
      } on DioException {
        // Recommendations are not cached locally -- return empty.
      }
    }

    return [];
  }

  // ---------------------------------------------------------------------------
  // Reconciliation
  // ---------------------------------------------------------------------------

  /// Reconciles the local brain state with the server after reconnecting.
  ///
  /// 1. Fetches the authoritative server Brain state
  /// 2. Compares timestamps to detect drift
  /// 3. Replays unsynced actions onto the server state
  /// 4. Fetches the final state (now including replayed actions)
  /// 5. Pre-fetches fresh lessons based on the new state
  ///
  /// Returns a [BrainReconciliationResult] describing what changed.
  Future<BrainReconciliationResult> reconcileAfterReconnect(
      String learnerId,) async {
    final localSnapshot = await _brainDao.getBrainSnapshot(learnerId);
    final localLastSynced = localSnapshot?.lastSyncedAt;

    // Fetch server state.
    BrainContext serverContext;
    try {
      final response = await _api.get(Endpoints.brainLearner(learnerId));
      final data = response.data as Map<String, dynamic>;
      serverContext = BrainContext.fromJson(data);
    } on DioException {
      return BrainReconciliationResult.noChange;
    }

    final serverUpdatedAt = serverContext.lastUpdated;
    final hasUnsyncedActions =
        (await _syncManager.dao.unsyncedActions()).isNotEmpty;

    // Determine if the server moved ahead while we were offline.
    final serverIsNewer = localLastSynced == null ||
        serverUpdatedAt.isAfter(localLastSynced);

    if (!serverIsNewer && !hasUnsyncedActions) {
      return BrainReconciliationResult.noChange;
    }

    // Server wins: overwrite local snapshot.
    await _saveBrainContext(serverContext);

    // Replay all unsynced mastery interactions on top of server state.
    if (hasUnsyncedActions) {
      await _syncManager.drainSyncQueue();

      // Fetch fresh state that now includes replayed actions.
      try {
        final response = await _api.get(Endpoints.brainLearner(learnerId));
        final data = response.data as Map<String, dynamic>;
        final finalContext = BrainContext.fromJson(data);
        await _saveBrainContext(finalContext);
      } on DioException {
        // Proceed with the server state we already saved.
      }
    }

    // Pre-fetch fresh lessons based on the reconciled state.
    await _lessonPrefetchService?.prefetchLessons(learnerId);

    if (hasUnsyncedActions && serverIsNewer) {
      return BrainReconciliationResult.conflictResolved;
    }
    if (hasUnsyncedActions) {
      return BrainReconciliationResult.offlineReplayed;
    }
    return BrainReconciliationResult.serverUpdated;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Persists a [BrainContext] to the local database.
  Future<void> _saveBrainContext(BrainContext context) async {
    await _brainDao.saveBrainSnapshot(BrainSnapshotsCompanion.insert(
      learnerId: context.learnerId,
      brainStateId: context.brainStateId,
      functioningLevel: context.functioningLevel,
      diagnoses: Value(jsonEncode(context.diagnoses)),
      accommodations: Value(jsonEncode(context.accommodations)),
      masteryLevels: Value(jsonEncode(
        context.masteryLevels
            .map((key, value) => MapEntry(key, value.toJson())),
      ),),
      learningPreferences: Value(jsonEncode(context.learningPreferences)),
      strengths: Value(jsonEncode(context.strengths)),
      challenges: Value(jsonEncode(context.challenges)),
      currentGoals: Value(jsonEncode(
        context.currentGoals.map((g) => g.toJson()).toList(),
      ),),
      iepGoals: Value(jsonEncode(
        context.iepGoals.map((g) => g.toJson()).toList(),
      ),),
      overallProgress: Value(context.overallProgress),
      lastSyncedAt: DateTime.now(),
    ),);
  }

  /// Reads a [BrainContext] from the local database, or returns `null`.
  Future<BrainContext?> _loadBrainContext(String learnerId) async {
    final row = await _brainDao.getBrainSnapshot(learnerId);
    if (row == null) return null;

    final masteryMap = row.masteryLevels != null
        ? (jsonDecode(row.masteryLevels!) as Map<String, dynamic>).map(
            (key, value) => MapEntry(
              key,
              MasteryLevel.fromJson(value as Map<String, dynamic>),
            ),
          )
        : <String, MasteryLevel>{};

    return BrainContext(
      brainStateId: row.brainStateId,
      learnerId: row.learnerId,
      functioningLevel: row.functioningLevel,
      diagnoses: row.diagnoses != null
          ? (jsonDecode(row.diagnoses!) as List<dynamic>)
              .map((e) => e as String)
              .toList()
          : [],
      accommodations: row.accommodations != null
          ? jsonDecode(row.accommodations!) as Map<String, dynamic>
          : {},
      masteryLevels: masteryMap,
      learningPreferences: row.learningPreferences != null
          ? jsonDecode(row.learningPreferences!) as Map<String, dynamic>
          : {},
      strengths: row.strengths != null
          ? (jsonDecode(row.strengths!) as List<dynamic>)
              .map((e) => e as String)
              .toList()
          : [],
      challenges: row.challenges != null
          ? (jsonDecode(row.challenges!) as List<dynamic>)
              .map((e) => e as String)
              .toList()
          : [],
      currentGoals: row.currentGoals != null
          ? (jsonDecode(row.currentGoals!) as List<dynamic>)
              .map((e) => BrainGoal.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      iepGoals: row.iepGoals != null
          ? (jsonDecode(row.iepGoals!) as List<dynamic>)
              .map((e) => IepGoal.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      overallProgress: row.overallProgress,
      lastUpdated: row.lastSyncedAt,
    );
  }
}

/// Riverpod provider for [BrainRepository].
final brainRepositoryProvider = Provider<BrainRepository>((ref) {
  return BrainRepository(
    apiClient: ref.watch(apiClientProvider),
    brainDao: ref.watch(brainDaoProvider),
    masteryDao: ref.watch(masteryDaoProvider),
    isOnline: ref.watch(isOnlineProvider),
    syncManager: ref.watch(syncManagerProvider),
    lessonPrefetchService: ref.watch(lessonPrefetchServiceProvider),
  );
});
