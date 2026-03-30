import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/local/database.dart';

/// Data access object for per-skill mastery cache entries.
///
/// Plain Dart class — no code generation required.
class MasteryDao {
  final AivoDatabase _db;

  MasteryDao(this._db);

  /// Returns all mastery records for [learnerId].
  Future<List<MasteryCacheData>> getMasteryForLearner(String learnerId) {
    return (_db.select(_db.masteryCache)
          ..where((t) => t.learnerId.equals(learnerId)))
        .get();
  }

  /// Returns a single mastery record for [learnerId] + [skillId], or `null`.
  Future<MasteryCacheData?> getMastery(String learnerId, String skillId) {
    return (_db.select(_db.masteryCache)
          ..where(
              (t) => t.learnerId.equals(learnerId) & t.skillId.equals(skillId),)
          ..limit(1))
        .getSingleOrNull();
  }

  /// Upserts a mastery record. If the (learnerId, skillId) pair already exists
  /// the row is replaced.
  Future<int> upsertMastery(MasteryCacheCompanion companion) {
    return _db
        .into(_db.masteryCache)
        .insert(companion, mode: InsertMode.insertOrReplace);
  }

  /// Returns a single mastery record for [learnerId] + [skillId], aliased
  /// as `getMasteryForSkill` for clarity in domain code.
  Future<MasteryCacheData?> getMasteryForSkill(
      String learnerId, String skillId,) {
    return getMastery(learnerId, skillId);
  }

  /// Returns all mastery records for [learnerId] filtered to a [subject].
  Future<List<MasteryCacheData>> getMasteryForSubject(
      String learnerId, String subject,) {
    return (_db.select(_db.masteryCache)
          ..where((t) =>
              t.learnerId.equals(learnerId) & t.subject.equals(subject),))
        .get();
  }

  /// Batch-inserts or replaces multiple mastery records in a single
  /// transaction.
  Future<void> batchUpsertMastery(List<MasteryCacheCompanion> companions) {
    return _db.batch((batch) {
      for (final companion in companions) {
        batch.insert(_db.masteryCache, companion,
            mode: InsertMode.insertOrReplace,);
      }
    });
  }

  /// Returns all mastery records for [learnerId] whose [nextReviewAt] is at or
  /// before [now], ordered by review date ascending.
  Future<List<MasteryCacheData>> getSkillsDueForReview(
    String learnerId, {
    DateTime? now,
  }) {
    final cutoff = now ?? DateTime.now();
    return (_db.select(_db.masteryCache)
          ..where((t) => t.learnerId.equals(learnerId))
          ..where((t) => t.nextReviewAt.isSmallerOrEqualValue(cutoff))
          ..orderBy([(t) => OrderingTerm.asc(t.nextReviewAt)]))
        .get();
  }

  /// Removes all mastery rows for [learnerId].
  Future<int> clearForLearner(String learnerId) {
    return (_db.delete(_db.masteryCache)
          ..where((t) => t.learnerId.equals(learnerId)))
        .go();
  }

  /// Removes all mastery rows.
  Future<int> clearAll() {
    return _db.delete(_db.masteryCache).go();
  }
}

/// Companion class for building insert/update maps for [MasteryCache].
class MasteryCacheCompanion extends UpdateCompanion<MasteryCacheData> {
  final Value<int> id;
  final Value<String> learnerId;
  final Value<String> skillId;
  final Value<String> subject;
  final Value<double> masteryLevel;
  final Value<int> totalAttempts;
  final Value<int> correctAttempts;
  final Value<String?> recentScores;
  final Value<DateTime?> lastPracticedAt;
  final Value<DateTime?> nextReviewAt;
  final Value<DateTime> updatedAt;

  const MasteryCacheCompanion({
    this.id = const Value.absent(),
    this.learnerId = const Value.absent(),
    this.skillId = const Value.absent(),
    this.subject = const Value.absent(),
    this.masteryLevel = const Value.absent(),
    this.totalAttempts = const Value.absent(),
    this.correctAttempts = const Value.absent(),
    this.recentScores = const Value.absent(),
    this.lastPracticedAt = const Value.absent(),
    this.nextReviewAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  });

  MasteryCacheCompanion.insert({
    this.id = const Value.absent(),
    required String learnerId,
    required String skillId,
    required String subject,
    this.masteryLevel = const Value.absent(),
    this.totalAttempts = const Value.absent(),
    this.correctAttempts = const Value.absent(),
    this.recentScores = const Value.absent(),
    this.lastPracticedAt = const Value.absent(),
    this.nextReviewAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  })  : learnerId = Value(learnerId),
        skillId = Value(skillId),
        subject = Value(subject);

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) map['id'] = Variable<int>(id.value);
    if (learnerId.present) {
      map['learner_id'] = Variable<String>(learnerId.value);
    }
    if (skillId.present) map['skill_id'] = Variable<String>(skillId.value);
    if (subject.present) map['subject'] = Variable<String>(subject.value);
    if (masteryLevel.present) {
      map['mastery_level'] = Variable<double>(masteryLevel.value);
    }
    if (totalAttempts.present) {
      map['total_attempts'] = Variable<int>(totalAttempts.value);
    }
    if (correctAttempts.present) {
      map['correct_attempts'] = Variable<int>(correctAttempts.value);
    }
    if (recentScores.present) {
      map['recent_scores'] = Variable<String>(recentScores.value);
    }
    if (lastPracticedAt.present) {
      map['last_practiced_at'] = Variable<DateTime>(lastPracticedAt.value);
    }
    if (nextReviewAt.present) {
      map['next_review_at'] = Variable<DateTime>(nextReviewAt.value);
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

final masteryDaoProvider = Provider<MasteryDao>((ref) {
  final db = ref.watch(databaseProvider);
  return MasteryDao(db);
});
