import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/local/database.dart';

/// Data access object for pre-cached lesson content.
///
/// Plain Dart class — no code generation required.
class LessonDao {
  final AivoDatabase _db;

  LessonDao(this._db);

  /// Returns all non-expired, incomplete cached lessons for [learnerId],
  /// ordered by [orderIndex] ascending.
  Future<List<CachedLessonData>> getCachedLessons(String learnerId) {
    return (_db.select(_db.cachedLessons)
          ..where((t) => t.learnerId.equals(learnerId))
          ..where((t) => t.expiresAt.isBiggerThanValue(DateTime.now()))
          ..orderBy([(t) => OrderingTerm.asc(t.orderIndex)]))
        .get();
  }

  /// Returns the next [limit] incomplete, non-expired lessons for [learnerId].
  Future<List<CachedLessonData>> getNextLessons(
    String learnerId, {
    int limit = 5,
  }) {
    return (_db.select(_db.cachedLessons)
          ..where((t) => t.learnerId.equals(learnerId))
          ..where((t) => t.isCompleted.equals(false))
          ..where((t) => t.expiresAt.isBiggerThanValue(DateTime.now()))
          ..orderBy([(t) => OrderingTerm.asc(t.orderIndex)])
          ..limit(limit))
        .get();
  }

  /// Returns a single cached lesson by its server-side [lessonId], or `null`
  /// if not found or expired.
  Future<CachedLessonData?> getCachedLesson(String lessonId) {
    return (_db.select(_db.cachedLessons)
          ..where((t) => t.lessonId.equals(lessonId))
          ..where((t) => t.expiresAt.isBiggerThanValue(DateTime.now()))
          ..limit(1))
        .getSingleOrNull();
  }

  /// Inserts or replaces a lesson in the local cache.
  Future<int> cacheLesson(CachedLessonsCompanion companion) {
    return _db
        .into(_db.cachedLessons)
        .insert(companion, mode: InsertMode.insertOrReplace);
  }

  /// Marks the lesson identified by [lessonId] as completed.
  Future<int> markLessonCompleted(String lessonId) {
    return (_db.update(_db.cachedLessons)
          ..where((t) => t.lessonId.equals(lessonId)))
        .write(const CachedLessonsCompanion(
      isCompleted: Value(true),
    ),);
  }

  /// Deletes all cached lessons whose [expiresAt] is in the past.
  ///
  /// Returns the number of rows deleted.
  Future<int> deleteExpiredLessons() {
    return (_db.delete(_db.cachedLessons)
          ..where((t) => t.expiresAt.isSmallerThanValue(DateTime.now())))
        .go();
  }

  /// Returns the number of non-expired cached lessons for [learnerId].
  Future<int> countCachedLessons(String learnerId) async {
    final countExpr = _db.cachedLessons.id.count();
    final query = _db.selectOnly(_db.cachedLessons)
      ..addColumns([countExpr])
      ..where(_db.cachedLessons.learnerId.equals(learnerId))
      ..where(_db.cachedLessons.expiresAt.isBiggerThanValue(DateTime.now()));
    final result = await query.getSingle();
    return result.read(countExpr) ?? 0;
  }
}

/// Companion class used to build insert/update maps for [CachedLessons].
class CachedLessonsCompanion extends UpdateCompanion<CachedLessonData> {
  final Value<int> id;
  final Value<String> lessonId;
  final Value<String> learnerId;
  final Value<String> subject;
  final Value<String> topic;
  final Value<String> skillId;
  final Value<String> contentJson;
  final Value<String?> interactionsJson;
  final Value<int> orderIndex;
  final Value<bool> isCompleted;
  final Value<DateTime> cachedAt;
  final Value<DateTime> expiresAt;

  const CachedLessonsCompanion({
    this.id = const Value.absent(),
    this.lessonId = const Value.absent(),
    this.learnerId = const Value.absent(),
    this.subject = const Value.absent(),
    this.topic = const Value.absent(),
    this.skillId = const Value.absent(),
    this.contentJson = const Value.absent(),
    this.interactionsJson = const Value.absent(),
    this.orderIndex = const Value.absent(),
    this.isCompleted = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.expiresAt = const Value.absent(),
  });

  CachedLessonsCompanion.insert({
    this.id = const Value.absent(),
    required String lessonId,
    required String learnerId,
    required String subject,
    required String topic,
    required String skillId,
    required String contentJson,
    this.interactionsJson = const Value.absent(),
    this.orderIndex = const Value.absent(),
    this.isCompleted = const Value.absent(),
    this.cachedAt = const Value.absent(),
    required DateTime expiresAt,
  })  : lessonId = Value(lessonId),
        learnerId = Value(learnerId),
        subject = Value(subject),
        topic = Value(topic),
        skillId = Value(skillId),
        contentJson = Value(contentJson),
        expiresAt = Value(expiresAt);

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) map['id'] = Variable<int>(id.value);
    if (lessonId.present) {
      map['lesson_id'] = Variable<String>(lessonId.value);
    }
    if (learnerId.present) {
      map['learner_id'] = Variable<String>(learnerId.value);
    }
    if (subject.present) map['subject'] = Variable<String>(subject.value);
    if (topic.present) map['topic'] = Variable<String>(topic.value);
    if (skillId.present) map['skill_id'] = Variable<String>(skillId.value);
    if (contentJson.present) {
      map['content_json'] = Variable<String>(contentJson.value);
    }
    if (interactionsJson.present) {
      map['interactions_json'] = Variable<String>(interactionsJson.value);
    }
    if (orderIndex.present) {
      map['order_index'] = Variable<int>(orderIndex.value);
    }
    if (isCompleted.present) {
      map['is_completed'] = Variable<bool>(isCompleted.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (expiresAt.present) {
      map['expires_at'] = Variable<DateTime>(expiresAt.value);
    }
    return map;
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final lessonDaoProvider = Provider<LessonDao>((ref) {
  final db = ref.watch(databaseProvider);
  return LessonDao(db);
});
