import 'package:drift/drift.dart';

/// Stores the learner's "brain snapshot" — a local cache of their cognitive
/// profile, diagnoses, accommodations, mastery levels, and IEP goals.
///
/// Each row represents the most-recent snapshot for a given learner.
class BrainSnapshots extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get learnerId => text()();
  TextColumn get brainStateId => text()();

  /// One of: STANDARD, SUPPORTED, LOW_VERBAL, NON_VERBAL, PRE_SYMBOLIC.
  TextColumn get functioningLevel => text()();

  /// JSON-encoded array of diagnosis codes / labels.
  TextColumn get diagnoses => text().nullable()();

  /// JSON-encoded object of accommodation settings.
  TextColumn get accommodations => text().nullable()();

  /// JSON-encoded object mapping skill IDs to mastery data.
  TextColumn get masteryLevels => text().nullable()();

  /// JSON-encoded object of learning-preference flags.
  TextColumn get learningPreferences => text().nullable()();

  /// JSON-encoded array of strength descriptors.
  TextColumn get strengths => text().nullable()();

  /// JSON-encoded array of challenge descriptors.
  TextColumn get challenges => text().nullable()();

  /// JSON-encoded array of current goal objects.
  TextColumn get currentGoals => text().nullable()();

  /// JSON-encoded array of IEP goal objects.
  TextColumn get iepGoals => text().nullable()();

  /// Aggregate progress value in [0.0, 1.0].
  RealColumn get overallProgress =>
      real().withDefault(const Constant(0.0))();

  DateTimeColumn get lastSyncedAt => dateTime()();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
