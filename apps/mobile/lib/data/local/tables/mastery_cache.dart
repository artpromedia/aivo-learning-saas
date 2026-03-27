import 'package:drift/drift.dart';

/// Per-skill mastery data cached locally so the adaptive engine can make
/// instant decisions without a round-trip.
///
/// The compound unique key (learnerId, skillId) ensures one row per skill per
/// learner.
class MasteryCache extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get learnerId => text()();
  TextColumn get skillId => text()();
  TextColumn get subject => text()();

  /// Current mastery estimate in [0.0, 1.0].
  RealColumn get masteryLevel =>
      real().withDefault(const Constant(0.0))();

  IntColumn get totalAttempts =>
      integer().withDefault(const Constant(0))();

  IntColumn get correctAttempts =>
      integer().withDefault(const Constant(0))();

  /// JSON-encoded array of the most recent N scores (doubles).
  TextColumn get recentScores => text().nullable()();

  DateTimeColumn get lastPracticedAt => dateTime().nullable()();

  /// Spaced-repetition: when this skill should next surface for review.
  DateTimeColumn get nextReviewAt => dateTime().nullable()();

  DateTimeColumn get updatedAt =>
      dateTime().withDefault(currentDateAndTime)();

  @override
  List<Set<Column>> get uniqueKeys => [
        {learnerId, skillId},
      ];
}
