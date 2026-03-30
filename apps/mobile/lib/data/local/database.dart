import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'tables/brain_snapshot.dart';
import 'tables/cached_lessons.dart';
import 'tables/engagement_cache.dart';
import 'tables/mastery_cache.dart';
import 'tables/sync_queue.dart';

export 'tables/brain_snapshot.dart';
export 'tables/cached_lessons.dart';
export 'tables/engagement_cache.dart';
export 'tables/mastery_cache.dart';
export 'tables/sync_queue.dart';

// ---------------------------------------------------------------------------
// Data classes
// ---------------------------------------------------------------------------

class BrainSnapshotData {
  final int id;
  final String learnerId;
  final String brainStateId;
  final String functioningLevel;
  final String? diagnoses;
  final String? accommodations;
  final String? masteryLevels;
  final String? learningPreferences;
  final String? strengths;
  final String? challenges;
  final String? currentGoals;
  final String? iepGoals;
  final double overallProgress;
  final DateTime lastSyncedAt;
  final DateTime createdAt;

  BrainSnapshotData({
    required this.id,
    required this.learnerId,
    required this.brainStateId,
    required this.functioningLevel,
    this.diagnoses,
    this.accommodations,
    this.masteryLevels,
    this.learningPreferences,
    this.strengths,
    this.challenges,
    this.currentGoals,
    this.iepGoals,
    required this.overallProgress,
    required this.lastSyncedAt,
    required this.createdAt,
  });
}

class CachedLessonData {
  final int id;
  final String lessonId;
  final String learnerId;
  final String subject;
  final String topic;
  final String skillId;
  final String contentJson;
  final String? interactionsJson;
  final int orderIndex;
  final bool isCompleted;
  final DateTime cachedAt;
  final DateTime expiresAt;

  CachedLessonData({
    required this.id,
    required this.lessonId,
    required this.learnerId,
    required this.subject,
    required this.topic,
    required this.skillId,
    required this.contentJson,
    this.interactionsJson,
    required this.orderIndex,
    required this.isCompleted,
    required this.cachedAt,
    required this.expiresAt,
  });
}

class SyncQueueItemData {
  final int id;
  final String actionId;
  final String endpoint;
  final String method;
  final String payload;
  final String? headers;
  final bool synced;
  final int retryCount;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime? syncedAt;

  SyncQueueItemData({
    required this.id,
    required this.actionId,
    required this.endpoint,
    required this.method,
    required this.payload,
    this.headers,
    required this.synced,
    required this.retryCount,
    this.errorMessage,
    required this.createdAt,
    this.syncedAt,
  });
}

class MasteryCacheData {
  final int id;
  final String learnerId;
  final String skillId;
  final String subject;
  final double masteryLevel;
  final int totalAttempts;
  final int correctAttempts;
  final String? recentScores;
  final DateTime? lastPracticedAt;
  final DateTime? nextReviewAt;
  final DateTime updatedAt;

  MasteryCacheData({
    required this.id,
    required this.learnerId,
    required this.skillId,
    required this.subject,
    required this.masteryLevel,
    required this.totalAttempts,
    required this.correctAttempts,
    this.recentScores,
    this.lastPracticedAt,
    this.nextReviewAt,
    required this.updatedAt,
  });
}

class EngagementCacheData {
  final int id;
  final String learnerId;
  final int totalXp;
  final int currentLevel;
  final int xpToNextLevel;
  final int currentStreak;
  final int longestStreak;
  final int aivoCoins;
  final String? earnedBadges;
  final String? activeItems;
  final DateTime? lastActivityAt;
  final DateTime? streakExpiresAt;
  final DateTime updatedAt;

  EngagementCacheData({
    required this.id,
    required this.learnerId,
    required this.totalXp,
    required this.currentLevel,
    required this.xpToNextLevel,
    required this.currentStreak,
    required this.longestStreak,
    required this.aivoCoins,
    this.earnedBadges,
    this.activeItems,
    this.lastActivityAt,
    this.streakExpiresAt,
    required this.updatedAt,
  });
}

// ---------------------------------------------------------------------------
// Generated-style table implementations
// ---------------------------------------------------------------------------

class $BrainSnapshotsTable extends BrainSnapshots
    with TableInfo<$BrainSnapshotsTable, BrainSnapshotData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _aliasedName;

  $BrainSnapshotsTable(this.attachedDatabase, [this._aliasedName]);

  @override
  String get aliasedName => _aliasedName ?? actualTableName;

  @override
  String get actualTableName => 'brain_snapshots';

  @override
  Set<GeneratedColumn> get $primaryKey => {id};

  @override
  BrainSnapshotData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final p = tablePrefix != null ? '$tablePrefix.' : '';
    return BrainSnapshotData(
      id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${p}id'])!,
      learnerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}learner_id'])!,
      brainStateId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}brain_state_id'])!,
      functioningLevel: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}functioning_level'])!,
      diagnoses: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}diagnoses']),
      accommodations: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}accommodations']),
      masteryLevels: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}mastery_levels']),
      learningPreferences: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}learning_preferences']),
      strengths: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}strengths']),
      challenges: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}challenges']),
      currentGoals: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}current_goals']),
      iepGoals: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}iep_goals']),
      overallProgress: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${p}overall_progress'])!,
      lastSyncedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}last_synced_at'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}created_at'])!,
    );
  }

  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id', aliasedName, false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'),
  );
  @override
  late final GeneratedColumn<String> learnerId = GeneratedColumn<String>(
    'learner_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> brainStateId = GeneratedColumn<String>(
    'brain_state_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> functioningLevel =
      GeneratedColumn<String>(
    'functioning_level', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> diagnoses = GeneratedColumn<String>(
    'diagnoses', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> accommodations = GeneratedColumn<String>(
    'accommodations', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> masteryLevels = GeneratedColumn<String>(
    'mastery_levels', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> learningPreferences =
      GeneratedColumn<String>(
    'learning_preferences', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> strengths = GeneratedColumn<String>(
    'strengths', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> challenges = GeneratedColumn<String>(
    'challenges', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> currentGoals = GeneratedColumn<String>(
    'current_goals', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> iepGoals = GeneratedColumn<String>(
    'iep_goals', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<double> overallProgress = GeneratedColumn<double>(
    'overall_progress', aliasedName, false,
    type: DriftSqlType.double,
    defaultValue: const Constant(0.0),
  );
  @override
  late final GeneratedColumn<DateTime> lastSyncedAt =
      GeneratedColumn<DateTime>(
    'last_synced_at', aliasedName, false,
    type: DriftSqlType.dateTime,
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at', aliasedName, false,
    type: DriftSqlType.dateTime,
    defaultValue: currentDateAndTime,
  );

  @override
  List<GeneratedColumn> get $columns => [
        id, learnerId, brainStateId, functioningLevel, diagnoses,
        accommodations, masteryLevels, learningPreferences, strengths,
        challenges, currentGoals, iepGoals, overallProgress, lastSyncedAt,
        createdAt,
      ];

  @override
  $BrainSnapshotsTable createAlias(String alias) {
    return $BrainSnapshotsTable(attachedDatabase, alias);
  }
}

// -- CachedLessons -----------------------------------------------------------

class $CachedLessonsTable extends CachedLessons
    with TableInfo<$CachedLessonsTable, CachedLessonData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _aliasedName;

  $CachedLessonsTable(this.attachedDatabase, [this._aliasedName]);

  @override
  String get aliasedName => _aliasedName ?? actualTableName;

  @override
  String get actualTableName => 'cached_lessons';

  @override
  Set<GeneratedColumn> get $primaryKey => {id};

  @override
  CachedLessonData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final p = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedLessonData(
      id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${p}id'])!,
      lessonId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}lesson_id'])!,
      learnerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}learner_id'])!,
      subject: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}subject'])!,
      topic: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}topic'])!,
      skillId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}skill_id'])!,
      contentJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}content_json'])!,
      interactionsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}interactions_json']),
      orderIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}order_index'])!,
      isCompleted: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${p}is_completed'])!,
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}cached_at'])!,
      expiresAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}expires_at'])!,
    );
  }

  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id', aliasedName, false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'),
  );
  @override
  late final GeneratedColumn<String> lessonId = GeneratedColumn<String>(
    'lesson_id', aliasedName, false,
    type: DriftSqlType.string,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  @override
  late final GeneratedColumn<String> learnerId = GeneratedColumn<String>(
    'learner_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> subject = GeneratedColumn<String>(
    'subject', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> topic = GeneratedColumn<String>(
    'topic', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> skillId = GeneratedColumn<String>(
    'skill_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> contentJson = GeneratedColumn<String>(
    'content_json', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> interactionsJson =
      GeneratedColumn<String>(
    'interactions_json', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<int> orderIndex = GeneratedColumn<int>(
    'order_index', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<bool> isCompleted = GeneratedColumn<bool>(
    'is_completed', aliasedName, false,
    type: DriftSqlType.bool,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('CHECK ("is_completed" IN (0, 1))'),
    defaultValue: const Constant(false),
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at', aliasedName, false,
    type: DriftSqlType.dateTime,
    defaultValue: currentDateAndTime,
  );
  @override
  late final GeneratedColumn<DateTime> expiresAt = GeneratedColumn<DateTime>(
    'expires_at', aliasedName, false,
    type: DriftSqlType.dateTime,
  );

  @override
  List<GeneratedColumn> get $columns => [
        id, lessonId, learnerId, subject, topic, skillId, contentJson,
        interactionsJson, orderIndex, isCompleted, cachedAt, expiresAt,
      ];

  @override
  $CachedLessonsTable createAlias(String alias) {
    return $CachedLessonsTable(attachedDatabase, alias);
  }
}

// -- SyncQueueItems ----------------------------------------------------------

class $SyncQueueItemsTable extends SyncQueueItems
    with TableInfo<$SyncQueueItemsTable, SyncQueueItemData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _aliasedName;

  $SyncQueueItemsTable(this.attachedDatabase, [this._aliasedName]);

  @override
  String get aliasedName => _aliasedName ?? actualTableName;

  @override
  String get actualTableName => 'sync_queue_items';

  @override
  Set<GeneratedColumn> get $primaryKey => {id};

  @override
  SyncQueueItemData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final p = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncQueueItemData(
      id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${p}id'])!,
      actionId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}action_id'])!,
      endpoint: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}endpoint'])!,
      method: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}method'])!,
      payload: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}payload'])!,
      headers: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}headers']),
      synced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${p}synced'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}retry_count'])!,
      errorMessage: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}error_message']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}created_at'])!,
      syncedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}synced_at']),
    );
  }

  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id', aliasedName, false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'),
  );
  @override
  late final GeneratedColumn<String> actionId = GeneratedColumn<String>(
    'action_id', aliasedName, false,
    type: DriftSqlType.string,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  @override
  late final GeneratedColumn<String> endpoint = GeneratedColumn<String>(
    'endpoint', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> method = GeneratedColumn<String>(
    'method', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
    'payload', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> headers = GeneratedColumn<String>(
    'headers', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<bool> synced = GeneratedColumn<bool>(
    'synced', aliasedName, false,
    type: DriftSqlType.bool,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('CHECK ("synced" IN (0, 1))'),
    defaultValue: const Constant(false),
  );
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
    'retry_count', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<String> errorMessage = GeneratedColumn<String>(
    'error_message', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at', aliasedName, false,
    type: DriftSqlType.dateTime,
    defaultValue: currentDateAndTime,
  );
  @override
  late final GeneratedColumn<DateTime> syncedAt = GeneratedColumn<DateTime>(
    'synced_at', aliasedName, true,
    type: DriftSqlType.dateTime,
  );

  @override
  List<GeneratedColumn> get $columns => [
        id, actionId, endpoint, method, payload, headers, synced, retryCount,
        errorMessage, createdAt, syncedAt,
      ];

  @override
  $SyncQueueItemsTable createAlias(String alias) {
    return $SyncQueueItemsTable(attachedDatabase, alias);
  }
}

// -- MasteryCache ------------------------------------------------------------

class $MasteryCacheTable extends MasteryCache
    with TableInfo<$MasteryCacheTable, MasteryCacheData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _aliasedName;

  $MasteryCacheTable(this.attachedDatabase, [this._aliasedName]);

  @override
  String get aliasedName => _aliasedName ?? actualTableName;

  @override
  String get actualTableName => 'mastery_cache';

  @override
  Set<GeneratedColumn> get $primaryKey => {id};

  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
        {learnerId, skillId},
      ];

  @override
  MasteryCacheData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final p = tablePrefix != null ? '$tablePrefix.' : '';
    return MasteryCacheData(
      id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${p}id'])!,
      learnerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}learner_id'])!,
      skillId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}skill_id'])!,
      subject: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}subject'])!,
      masteryLevel: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${p}mastery_level'])!,
      totalAttempts: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}total_attempts'])!,
      correctAttempts: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}correct_attempts'])!,
      recentScores: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}recent_scores']),
      lastPracticedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}last_practiced_at']),
      nextReviewAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}next_review_at']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}updated_at'])!,
    );
  }

  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id', aliasedName, false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'),
  );
  @override
  late final GeneratedColumn<String> learnerId = GeneratedColumn<String>(
    'learner_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> skillId = GeneratedColumn<String>(
    'skill_id', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> subject = GeneratedColumn<String>(
    'subject', aliasedName, false,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<double> masteryLevel = GeneratedColumn<double>(
    'mastery_level', aliasedName, false,
    type: DriftSqlType.double,
    defaultValue: const Constant(0.0),
  );
  @override
  late final GeneratedColumn<int> totalAttempts = GeneratedColumn<int>(
    'total_attempts', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<int> correctAttempts = GeneratedColumn<int>(
    'correct_attempts', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<String> recentScores = GeneratedColumn<String>(
    'recent_scores', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<DateTime> lastPracticedAt =
      GeneratedColumn<DateTime>(
    'last_practiced_at', aliasedName, true,
    type: DriftSqlType.dateTime,
  );
  @override
  late final GeneratedColumn<DateTime> nextReviewAt =
      GeneratedColumn<DateTime>(
    'next_review_at', aliasedName, true,
    type: DriftSqlType.dateTime,
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at', aliasedName, false,
    type: DriftSqlType.dateTime,
    defaultValue: currentDateAndTime,
  );

  @override
  List<GeneratedColumn> get $columns => [
        id, learnerId, skillId, subject, masteryLevel, totalAttempts,
        correctAttempts, recentScores, lastPracticedAt, nextReviewAt, updatedAt,
      ];

  @override
  $MasteryCacheTable createAlias(String alias) {
    return $MasteryCacheTable(attachedDatabase, alias);
  }
}

// -- EngagementCache ---------------------------------------------------------

class $EngagementCacheTable extends EngagementCache
    with TableInfo<$EngagementCacheTable, EngagementCacheData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _aliasedName;

  $EngagementCacheTable(this.attachedDatabase, [this._aliasedName]);

  @override
  String get aliasedName => _aliasedName ?? actualTableName;

  @override
  String get actualTableName => 'engagement_cache';

  @override
  Set<GeneratedColumn> get $primaryKey => {id};

  @override
  EngagementCacheData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final p = tablePrefix != null ? '$tablePrefix.' : '';
    return EngagementCacheData(
      id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${p}id'])!,
      learnerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}learner_id'])!,
      totalXp: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}total_xp'])!,
      currentLevel: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}current_level'])!,
      xpToNextLevel: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}xp_to_next_level'])!,
      currentStreak: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}current_streak'])!,
      longestStreak: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}longest_streak'])!,
      aivoCoins: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${p}aivo_coins'])!,
      earnedBadges: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}earned_badges']),
      activeItems: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${p}active_items']),
      lastActivityAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}last_activity_at']),
      streakExpiresAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}streak_expires_at']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${p}updated_at'])!,
    );
  }

  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id', aliasedName, false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    defaultConstraints:
        GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'),
  );
  @override
  late final GeneratedColumn<String> learnerId = GeneratedColumn<String>(
    'learner_id', aliasedName, false,
    type: DriftSqlType.string,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  @override
  late final GeneratedColumn<int> totalXp = GeneratedColumn<int>(
    'total_xp', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<int> currentLevel = GeneratedColumn<int>(
    'current_level', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(1),
  );
  @override
  late final GeneratedColumn<int> xpToNextLevel = GeneratedColumn<int>(
    'xp_to_next_level', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(100),
  );
  @override
  late final GeneratedColumn<int> currentStreak = GeneratedColumn<int>(
    'current_streak', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<int> longestStreak = GeneratedColumn<int>(
    'longest_streak', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<int> aivoCoins = GeneratedColumn<int>(
    'aivo_coins', aliasedName, false,
    type: DriftSqlType.int,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumn<String> earnedBadges = GeneratedColumn<String>(
    'earned_badges', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<String> activeItems = GeneratedColumn<String>(
    'active_items', aliasedName, true,
    type: DriftSqlType.string,
  );
  @override
  late final GeneratedColumn<DateTime> lastActivityAt =
      GeneratedColumn<DateTime>(
    'last_activity_at', aliasedName, true,
    type: DriftSqlType.dateTime,
  );
  @override
  late final GeneratedColumn<DateTime> streakExpiresAt =
      GeneratedColumn<DateTime>(
    'streak_expires_at', aliasedName, true,
    type: DriftSqlType.dateTime,
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at', aliasedName, false,
    type: DriftSqlType.dateTime,
    defaultValue: currentDateAndTime,
  );

  @override
  List<GeneratedColumn> get $columns => [
        id, learnerId, totalXp, currentLevel, xpToNextLevel, currentStreak,
        longestStreak, aivoCoins, earnedBadges, activeItems, lastActivityAt,
        streakExpiresAt, updatedAt,
      ];

  @override
  $EngagementCacheTable createAlias(String alias) {
    return $EngagementCacheTable(attachedDatabase, alias);
  }
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

/// Central Drift database for the AIVO Learning mobile app.
///
/// Contains five tables covering offline-first caching of brain snapshots,
/// lesson content, mastery data, gamification state, and an outbound sync queue.
class AivoDatabase extends GeneratedDatabase {
  AivoDatabase(super.e);

  // Table accessors
  late final $BrainSnapshotsTable brainSnapshots =
      $BrainSnapshotsTable(this);
  late final $CachedLessonsTable cachedLessons = $CachedLessonsTable(this);
  late final $SyncQueueItemsTable syncQueueItems =
      $SyncQueueItemsTable(this);
  late final $MasteryCacheTable masteryCache = $MasteryCacheTable(this);
  late final $EngagementCacheTable engagementCache =
      $EngagementCacheTable(this);

  @override
  Iterable<TableInfo<Table, dynamic>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, dynamic>>();

  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        brainSnapshots,
        cachedLessons,
        syncQueueItems,
        masteryCache,
        engagementCache,
      ];

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (m) async {
          await m.createAll();
        },
        onUpgrade: (m, from, to) async {
          // Future schema migrations will be handled here.
        },
      );

  /// Deletes all rows from every table. Intended for use on logout.
  Future<void> clearAllData() async {
    await transaction(() async {
      for (final table in allTables) {
        await delete(table).go();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Factory
  // ---------------------------------------------------------------------------

  /// Creates the database backed by a file in the app's documents directory.
  ///
  /// The SQLite file is opened on a background isolate via
  /// [NativeDatabase.createInBackground] so the main isolate is never blocked
  /// by disk I/O.
  static AivoDatabase create() {
    return AivoDatabase(
      LazyDatabase(() async {
        final dir = await getApplicationDocumentsDirectory();
        final dbFile = File(p.join(dir.path, 'aivo_learning.sqlite'));
        return NativeDatabase.createInBackground(dbFile);
      }),
    );
  }

  /// Creates an in-memory database for unit / widget tests.
  static AivoDatabase forTesting(QueryExecutor executor) {
    return AivoDatabase(executor);
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

/// Provides the singleton [AivoDatabase] instance across the app.
///
/// Override this provider in tests with an in-memory executor.
final databaseProvider = Provider<AivoDatabase>((ref) {
  final db = AivoDatabase.create();
  ref.onDispose(() => db.close());
  return db;
});
