import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/local/database.dart';

/// Data access object for locally-cached gamification / engagement data.
///
/// Plain Dart class — no code generation required.
class EngagementDao {
  final AivoDatabase _db;

  EngagementDao(this._db);

  /// Returns the cached engagement row for [learnerId], or `null` if none
  /// exists.
  Future<EngagementCacheData?> getEngagement(String learnerId) {
    return (_db.select(_db.engagementCache)
          ..where((t) => t.learnerId.equals(learnerId))
          ..limit(1))
        .getSingleOrNull();
  }

  /// Inserts or replaces the engagement row for the learner identified in
  /// [companion].
  Future<int> upsertEngagement(EngagementCacheCompanion companion) {
    return _db
        .into(_db.engagementCache)
        .insert(companion, mode: InsertMode.insertOrReplace);
  }

  /// Removes the engagement row for [learnerId].
  Future<int> clearForLearner(String learnerId) {
    return (_db.delete(_db.engagementCache)
          ..where((t) => t.learnerId.equals(learnerId)))
        .go();
  }

  /// Removes all engagement rows.
  Future<int> clearAll() {
    return _db.delete(_db.engagementCache).go();
  }
}

/// Companion class for building insert/update maps for [EngagementCache].
class EngagementCacheCompanion extends UpdateCompanion<EngagementCacheData> {
  final Value<int> id;
  final Value<String> learnerId;
  final Value<int> totalXp;
  final Value<int> currentLevel;
  final Value<int> xpToNextLevel;
  final Value<int> currentStreak;
  final Value<int> longestStreak;
  final Value<int> aivoCoins;
  final Value<String?> earnedBadges;
  final Value<String?> activeItems;
  final Value<DateTime?> lastActivityAt;
  final Value<DateTime?> streakExpiresAt;
  final Value<DateTime> updatedAt;

  const EngagementCacheCompanion({
    this.id = const Value.absent(),
    this.learnerId = const Value.absent(),
    this.totalXp = const Value.absent(),
    this.currentLevel = const Value.absent(),
    this.xpToNextLevel = const Value.absent(),
    this.currentStreak = const Value.absent(),
    this.longestStreak = const Value.absent(),
    this.aivoCoins = const Value.absent(),
    this.earnedBadges = const Value.absent(),
    this.activeItems = const Value.absent(),
    this.lastActivityAt = const Value.absent(),
    this.streakExpiresAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  });

  EngagementCacheCompanion.insert({
    this.id = const Value.absent(),
    required String learnerId,
    this.totalXp = const Value.absent(),
    this.currentLevel = const Value.absent(),
    this.xpToNextLevel = const Value.absent(),
    this.currentStreak = const Value.absent(),
    this.longestStreak = const Value.absent(),
    this.aivoCoins = const Value.absent(),
    this.earnedBadges = const Value.absent(),
    this.activeItems = const Value.absent(),
    this.lastActivityAt = const Value.absent(),
    this.streakExpiresAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  }) : learnerId = Value(learnerId);

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) map['id'] = Variable<int>(id.value);
    if (learnerId.present) {
      map['learner_id'] = Variable<String>(learnerId.value);
    }
    if (totalXp.present) map['total_xp'] = Variable<int>(totalXp.value);
    if (currentLevel.present) {
      map['current_level'] = Variable<int>(currentLevel.value);
    }
    if (xpToNextLevel.present) {
      map['xp_to_next_level'] = Variable<int>(xpToNextLevel.value);
    }
    if (currentStreak.present) {
      map['current_streak'] = Variable<int>(currentStreak.value);
    }
    if (longestStreak.present) {
      map['longest_streak'] = Variable<int>(longestStreak.value);
    }
    if (aivoCoins.present) {
      map['aivo_coins'] = Variable<int>(aivoCoins.value);
    }
    if (earnedBadges.present) {
      map['earned_badges'] = Variable<String>(earnedBadges.value);
    }
    if (activeItems.present) {
      map['active_items'] = Variable<String>(activeItems.value);
    }
    if (lastActivityAt.present) {
      map['last_activity_at'] = Variable<DateTime>(lastActivityAt.value);
    }
    if (streakExpiresAt.present) {
      map['streak_expires_at'] = Variable<DateTime>(streakExpiresAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    return map;
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final engagementDaoProvider = Provider<EngagementDao>((ref) {
  final db = ref.watch(databaseProvider);
  return EngagementDao(db);
});
