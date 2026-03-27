import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/local/database.dart';

/// Data access object for reading and writing brain snapshot cache rows.
///
/// This is a plain Dart class (no code generation) that operates directly on
/// the [AivoDatabase] instance.
class BrainDao {
  final AivoDatabase _db;

  BrainDao(this._db);

  /// Returns the most recent brain snapshot for the given learner, or `null`
  /// if no snapshot exists locally.
  Future<BrainSnapshotData?> getBrainSnapshot(String learnerId) {
    return (_db.select(_db.brainSnapshots)
          ..where((t) => t.learnerId.equals(learnerId))
          ..orderBy([(t) => OrderingTerm.desc(t.createdAt)])
          ..limit(1))
        .getSingleOrNull();
  }

  /// Inserts a new brain snapshot row.
  ///
  /// Pass a [BrainSnapshotsCompanion] with all required fields. If a row for
  /// the same learner already exists it will be replaced via
  /// [InsertMode.insertOrReplace].
  Future<int> saveBrainSnapshot(BrainSnapshotsCompanion companion) {
    return _db
        .into(_db.brainSnapshots)
        .insert(companion, mode: InsertMode.insertOrReplace);
  }

  /// Deletes all brain snapshot rows belonging to [learnerId].
  Future<int> deleteBrainSnapshot(String learnerId) {
    return (_db.delete(_db.brainSnapshots)
          ..where((t) => t.learnerId.equals(learnerId)))
        .go();
  }

  /// Returns the [lastSyncedAt] timestamp for the most recent snapshot of the
  /// given learner, or `null` if no row exists.
  Future<DateTime?> getLastSyncTime(String learnerId) async {
    final row = await (_db.select(_db.brainSnapshots)
          ..where((t) => t.learnerId.equals(learnerId))
          ..orderBy([(t) => OrderingTerm.desc(t.lastSyncedAt)])
          ..limit(1))
        .getSingleOrNull();
    return row?.lastSyncedAt;
  }
}

/// Companion class used to build insert/update maps for [BrainSnapshots].
///
/// Mirrors the shape that Drift's generated companions normally provide but
/// created manually so that no build_runner step is required.
class BrainSnapshotsCompanion extends UpdateCompanion<BrainSnapshotData> {
  final Value<int> id;
  final Value<String> learnerId;
  final Value<String> brainStateId;
  final Value<String> functioningLevel;
  final Value<String?> diagnoses;
  final Value<String?> accommodations;
  final Value<String?> masteryLevels;
  final Value<String?> learningPreferences;
  final Value<String?> strengths;
  final Value<String?> challenges;
  final Value<String?> currentGoals;
  final Value<String?> iepGoals;
  final Value<double> overallProgress;
  final Value<DateTime> lastSyncedAt;
  final Value<DateTime> createdAt;

  const BrainSnapshotsCompanion({
    this.id = const Value.absent(),
    this.learnerId = const Value.absent(),
    this.brainStateId = const Value.absent(),
    this.functioningLevel = const Value.absent(),
    this.diagnoses = const Value.absent(),
    this.accommodations = const Value.absent(),
    this.masteryLevels = const Value.absent(),
    this.learningPreferences = const Value.absent(),
    this.strengths = const Value.absent(),
    this.challenges = const Value.absent(),
    this.currentGoals = const Value.absent(),
    this.iepGoals = const Value.absent(),
    this.overallProgress = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
  });

  /// Named constructor with required fields for initial inserts.
  BrainSnapshotsCompanion.insert({
    this.id = const Value.absent(),
    required String learnerId,
    required String brainStateId,
    required String functioningLevel,
    this.diagnoses = const Value.absent(),
    this.accommodations = const Value.absent(),
    this.masteryLevels = const Value.absent(),
    this.learningPreferences = const Value.absent(),
    this.strengths = const Value.absent(),
    this.challenges = const Value.absent(),
    this.currentGoals = const Value.absent(),
    this.iepGoals = const Value.absent(),
    this.overallProgress = const Value.absent(),
    required DateTime lastSyncedAt,
    this.createdAt = const Value.absent(),
  })  : learnerId = Value(learnerId),
        brainStateId = Value(brainStateId),
        functioningLevel = Value(functioningLevel),
        lastSyncedAt = Value(lastSyncedAt);

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) map['id'] = Variable<int>(id.value);
    if (learnerId.present) {
      map['learner_id'] = Variable<String>(learnerId.value);
    }
    if (brainStateId.present) {
      map['brain_state_id'] = Variable<String>(brainStateId.value);
    }
    if (functioningLevel.present) {
      map['functioning_level'] = Variable<String>(functioningLevel.value);
    }
    if (diagnoses.present) {
      map['diagnoses'] = Variable<String>(diagnoses.value);
    }
    if (accommodations.present) {
      map['accommodations'] = Variable<String>(accommodations.value);
    }
    if (masteryLevels.present) {
      map['mastery_levels'] = Variable<String>(masteryLevels.value);
    }
    if (learningPreferences.present) {
      map['learning_preferences'] =
          Variable<String>(learningPreferences.value);
    }
    if (strengths.present) {
      map['strengths'] = Variable<String>(strengths.value);
    }
    if (challenges.present) {
      map['challenges'] = Variable<String>(challenges.value);
    }
    if (currentGoals.present) {
      map['current_goals'] = Variable<String>(currentGoals.value);
    }
    if (iepGoals.present) {
      map['iep_goals'] = Variable<String>(iepGoals.value);
    }
    if (overallProgress.present) {
      map['overall_progress'] = Variable<double>(overallProgress.value);
    }
    if (lastSyncedAt.present) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    return map;
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final brainDaoProvider = Provider<BrainDao>((ref) {
  final db = ref.watch(databaseProvider);
  return BrainDao(db);
});
