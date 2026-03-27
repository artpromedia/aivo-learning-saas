import 'package:drift/drift.dart';

/// Locally-cached lesson content so learners can continue offline.
///
/// Lessons are pre-fetched while the device is online and expire after a
/// configurable TTL (see [expiresAt]).
class CachedLessons extends Table {
  IntColumn get id => integer().autoIncrement()();

  /// Server-side lesson identifier. Unique across the table.
  TextColumn get lessonId => text().unique()();

  TextColumn get learnerId => text()();
  TextColumn get subject => text()();
  TextColumn get topic => text()();
  TextColumn get skillId => text()();

  /// Full lesson content serialised as JSON.
  TextColumn get contentJson => text()();

  /// Optional interaction-template definitions serialised as JSON.
  TextColumn get interactionsJson => text().nullable()();

  /// Ordering hint for sequential playback inside a topic.
  IntColumn get orderIndex =>
      integer().withDefault(const Constant(0))();

  BoolColumn get isCompleted =>
      boolean().withDefault(const Constant(false))();

  DateTimeColumn get cachedAt =>
      dateTime().withDefault(currentDateAndTime)();

  /// After this timestamp the row should be evicted by the maintenance job.
  DateTimeColumn get expiresAt => dateTime()();
}
