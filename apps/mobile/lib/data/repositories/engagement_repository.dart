import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/engagement_dao.dart';
import 'package:aivo_mobile/data/models/engagement.dart';

/// Repository for gamification data: XP, streaks, badges, shop, avatar,
/// leaderboards, and challenges.
///
/// XP and streak data are cached locally for instant display.  The full cache
/// can be synced via [syncEngagementCache].
class EngagementRepository {
  const EngagementRepository({
    required ApiClient apiClient,
    required EngagementDao engagementDao,
    required bool isOnline,
    required SyncManager syncManager,
  })  : _api = apiClient,
        _engagementDao = engagementDao,
        _isOnline = isOnline,
        _syncManager = syncManager;

  final ApiClient _api;
  final EngagementDao _engagementDao;
  final bool _isOnline;
  final SyncManager _syncManager;

  // ---------------------------------------------------------------------------
  // XP
  // ---------------------------------------------------------------------------

  /// Returns the XP summary for a learner, falling back to local cache.
  Future<EngagementSummary> getXpSummary(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api.get(Endpoints.xp(learnerId));
        final summary = EngagementSummary.fromJson(
            response.data as Map<String, dynamic>,);
        await _saveEngagementSummary(learnerId, summary);
        return summary;
      } on DioException {
        // Fall through.
      }
    }

    final local = await _loadEngagementSummary(learnerId);
    if (local != null) return local;

    throw StateError(
      'No engagement data for learner $learnerId (offline with empty cache)',
    );
  }

  // ---------------------------------------------------------------------------
  // Streaks
  // ---------------------------------------------------------------------------

  /// Returns the streak data for a learner.
  Future<EngagementSummary> getStreak(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api.get(Endpoints.streaks(learnerId));
        final summary = EngagementSummary.fromJson(
            response.data as Map<String, dynamic>,);
        await _saveEngagementSummary(learnerId, summary);
        return summary;
      } on DioException {
        // Fall through.
      }
    }

    final local = await _loadEngagementSummary(learnerId);
    if (local != null) return local;

    throw StateError(
      'No streak data for learner $learnerId (offline with empty cache)',
    );
  }

  /// Uses a streak freeze for the learner.
  Future<void> freezeStreak(String learnerId) async {
    if (_isOnline) {
      try {
        await _api.post(Endpoints.streakFreeze(learnerId));
        return;
      } on DioException {
        // Queue offline.
      }
    }

    await _syncManager.queueAction(SyncAction(
      endpoint: Endpoints.streakFreeze(learnerId),
      method: 'POST',
      payload: jsonEncode({}),
    ),);
  }

  // ---------------------------------------------------------------------------
  // Badges
  // ---------------------------------------------------------------------------

  /// Returns badges the learner has earned.
  Future<List<Badge>> getEarnedBadges(String learnerId) async {
    if (_isOnline) {
      try {
        final response = await _api.get(Endpoints.badgesEarned(learnerId));
        final data = response.data as Map<String, dynamic>;
        return (data['badges'] as List<dynamic>?)
                ?.map((e) => Badge.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [];
      } on DioException {
        // Return empty list offline -- badge details are not cached.
      }
    }

    return [];
  }

  /// Returns all badges available in the system.
  Future<List<Badge>> getAvailableBadges() async {
    final response = await _api.get(Endpoints.badgesAvailable);
    final data = response.data as Map<String, dynamic>;
    return (data['badges'] as List<dynamic>?)
            ?.map((e) => Badge.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Shop
  // ---------------------------------------------------------------------------

  /// Returns the shop catalog of purchasable items.
  Future<List<ShopItem>> getShopCatalog() async {
    final response = await _api.get(Endpoints.shopCatalog);
    final data = response.data as Map<String, dynamic>;
    return (data['items'] as List<dynamic>?)
            ?.map((e) => ShopItem.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  /// Purchases an item from the shop.
  Future<void> purchaseItem(String itemId) async {
    await _api.post(
      Endpoints.shopPurchase,
      data: {'itemId': itemId},
    );
  }

  /// Returns the learner's inventory of owned items.
  Future<List<ShopItem>> getInventory(String learnerId) async {
    final response = await _api.get(Endpoints.inventory(learnerId));
    final data = response.data as Map<String, dynamic>;
    return (data['items'] as List<dynamic>?)
            ?.map((e) => ShopItem.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Avatar
  // ---------------------------------------------------------------------------

  /// Returns the learner's avatar configuration.
  Future<AvatarConfig> getAvatar(String learnerId) async {
    final response = await _api.get(Endpoints.avatar(learnerId));
    return AvatarConfig.fromJson(response.data as Map<String, dynamic>);
  }

  /// Updates the learner's avatar configuration.
  Future<void> updateAvatar(String learnerId, AvatarConfig config) async {
    await _api.put(
      Endpoints.avatar(learnerId),
      data: config.toJson(),
    );
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------

  /// Returns the leaderboard for the given [type] (global, classroom, friends).
  Future<List<LeaderboardEntry>> getLeaderboard(String type) async {
    final endpoint = switch (type) {
      'classroom' => Endpoints.leaderboardClassroom,
      'friends' => Endpoints.leaderboardFriends,
      _ => Endpoints.leaderboardGlobal,
    };

    final response = await _api.get(endpoint);
    final data = response.data as Map<String, dynamic>;
    return (data['entries'] as List<dynamic>?)
            ?.map(
                (e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Challenges
  // ---------------------------------------------------------------------------

  /// Returns available challenges.
  Future<List<Challenge>> getChallenges() async {
    final response = await _api.get(Endpoints.challenges);
    final data = response.data as Map<String, dynamic>;
    return (data['challenges'] as List<dynamic>?)
            ?.map((e) => Challenge.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
  }

  /// Joins a challenge.
  Future<void> joinChallenge(String id) async {
    await _api.post(Endpoints.challengeJoin(id));
  }

  /// Returns today's daily challenges.
  Future<List<DailyChallenge>> getDailyChallenges() async {
    final response = await _api.get(Endpoints.dailyChallenges);
    final data = response.data as Map<String, dynamic>;
    return (data['challenges'] as List<dynamic>?)
            ?.map(
                (e) => DailyChallenge.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Cache sync
  // ---------------------------------------------------------------------------

  /// Fetches XP, streak, and badge data from the API and saves to local cache.
  Future<void> syncEngagementCache(String learnerId) async {
    final responses = await Future.wait([
      _api.get(Endpoints.xp(learnerId)),
      _api.get(Endpoints.streaks(learnerId)),
      _api.get(Endpoints.badgesEarned(learnerId)),
    ]);

    final xpData = responses[0].data as Map<String, dynamic>;
    final streakData = responses[1].data as Map<String, dynamic>;
    final badgeData = responses[2].data as Map<String, dynamic>;

    final badgeSlugs = (badgeData['badges'] as List<dynamic>?)
            ?.map((e) => (e as Map<String, dynamic>)['slug'] as String)
            .toList() ??
        [];

    await _engagementDao.upsertEngagement(EngagementCacheCompanion.insert(
      learnerId: learnerId,
      totalXp: Value(xpData['totalXp'] as int? ?? 0),
      currentLevel: Value(xpData['currentLevel'] as int? ?? 1),
      xpToNextLevel: Value(xpData['xpToNextLevel'] as int? ?? 100),
      currentStreak: Value(streakData['currentStreak'] as int? ?? 0),
      longestStreak: Value(streakData['longestStreak'] as int? ?? 0),
      aivoCoins: Value(xpData['aivoCoins'] as int? ?? 0),
      earnedBadges: Value(jsonEncode(badgeSlugs)),
      lastActivityAt: xpData['lastActivityAt'] != null
          ? Value(DateTime.parse(xpData['lastActivityAt'] as String))
          : const Value.absent(),
      streakExpiresAt: streakData['streakExpiresAt'] != null
          ? Value(DateTime.parse(streakData['streakExpiresAt'] as String))
          : const Value.absent(),
    ),);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Persists an [EngagementSummary] to the local database.
  Future<void> _saveEngagementSummary(String learnerId, EngagementSummary summary) async {
    await _engagementDao.upsertEngagement(EngagementCacheCompanion.insert(
      learnerId: learnerId,
      totalXp: Value(summary.totalXp),
      currentLevel: Value(summary.currentLevel),
      xpToNextLevel: Value(summary.xpToNextLevel),
      currentStreak: Value(summary.currentStreak),
      longestStreak: Value(summary.longestStreak),
      aivoCoins: Value(summary.aivoCoins),
      lastActivityAt: summary.lastActivityAt != null
          ? Value(summary.lastActivityAt!)
          : const Value.absent(),
      streakExpiresAt: summary.streakExpiresAt != null
          ? Value(summary.streakExpiresAt!)
          : const Value.absent(),
    ),);
  }

  /// Reads an [EngagementSummary] from the local database, or returns `null`.
  Future<EngagementSummary?> _loadEngagementSummary(
      String learnerId,) async {
    final row = await _engagementDao.getEngagement(learnerId);
    if (row == null) return null;
    return EngagementSummary(
      learnerId: row.learnerId,
      totalXp: row.totalXp,
      currentLevel: row.currentLevel,
      xpToNextLevel: row.xpToNextLevel,
      xpProgress: 0,
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      aivoCoins: row.aivoCoins,
      lastActivityAt: row.lastActivityAt,
      streakExpiresAt: row.streakExpiresAt,
    );
  }
}

/// Riverpod provider for [EngagementRepository].
final engagementRepositoryProvider = Provider<EngagementRepository>((ref) {
  return EngagementRepository(
    apiClient: ref.watch(apiClientProvider),
    engagementDao: ref.watch(engagementDaoProvider),
    isOnline: ref.watch(isOnlineProvider),
    syncManager: ref.watch(syncManagerProvider),
  );
});
