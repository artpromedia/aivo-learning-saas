import 'package:drift/drift.dart';

/// Locally-cached gamification data — XP, streaks, coins, badges, and equipped
/// cosmetic items.
///
/// One row per learner (enforced via the unique constraint on [learnerId]).
class EngagementCache extends Table {
  IntColumn get id => integer().autoIncrement()();

  /// Unique learner identifier.
  TextColumn get learnerId => text().unique()();

  IntColumn get totalXp =>
      integer().withDefault(const Constant(0))();

  IntColumn get currentLevel =>
      integer().withDefault(const Constant(1))();

  IntColumn get xpToNextLevel =>
      integer().withDefault(const Constant(100))();

  IntColumn get currentStreak =>
      integer().withDefault(const Constant(0))();

  IntColumn get longestStreak =>
      integer().withDefault(const Constant(0))();

  IntColumn get aivoCoins =>
      integer().withDefault(const Constant(0))();

  /// JSON-encoded array of earned badge slug strings.
  TextColumn get earnedBadges => text().nullable()();

  /// JSON-encoded array of currently equipped cosmetic-item IDs.
  TextColumn get activeItems => text().nullable()();

  DateTimeColumn get lastActivityAt => dateTime().nullable()();

  /// If the current time passes this value the streak resets to zero.
  DateTimeColumn get streakExpiresAt => dateTime().nullable()();

  DateTimeColumn get updatedAt =>
      dateTime().withDefault(currentDateAndTime)();
}
