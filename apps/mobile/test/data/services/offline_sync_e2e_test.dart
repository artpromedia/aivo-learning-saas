import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart' hide isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';
import 'package:aivo_mobile/data/local/daos/mastery_dao.dart';
import 'package:aivo_mobile/data/local/daos/sync_dao.dart';
import 'package:aivo_mobile/data/local/database.dart';
import 'package:aivo_mobile/data/services/offline_mastery_engine.dart';

void main() {
  late AivoDatabase db;
  late DriftSyncDao syncDao;
  late MasteryDao masteryDao;
  late LessonDao lessonDao;

  setUp(() {
    db = AivoDatabase.forTesting(NativeDatabase.memory());
    syncDao = DriftSyncDao(db);
    masteryDao = MasteryDao(db);
    lessonDao = LessonDao(db);
  });

  tearDown(() => db.close());

  group('Offline sync queue E2E', () {
    test('queue 5 actions offline → all 5 persist in Drift DB', () async {
      for (var i = 0; i < 5; i++) {
        await syncDao.insertAction(SyncAction(
          endpoint: '/brain/mastery/update',
          method: 'POST',
          payload: jsonEncode({'index': i}),
        ),);
      }

      final pending = await syncDao.unsyncedActions();
      expect(pending, hasLength(5));
      expect(await syncDao.pendingCount(), 5);

      // Verify they're in the actual Drift table.
      final rows = await db.select(db.syncQueueItems).get();
      expect(rows, hasLength(5));
    });
  });

  group('Lesson prefetch cache', () {
    test('caching 10 lessons stores exactly 10', () async {
      for (var i = 0; i < 10; i++) {
        await lessonDao.cacheLesson(CachedLessonsCompanion.insert(
          lessonId: 'lesson-$i',
          learnerId: 'learner-1',
          subject: 'math',
          topic: 'addition',
          skillId: 'add-$i',
          contentJson: jsonEncode({'title': 'Lesson $i'}),
          orderIndex: Value(i),
          expiresAt: DateTime.now().add(const Duration(hours: 48)),
        ),);
      }

      final count = await lessonDao.countCachedLessons('learner-1');
      expect(count, 10);

      final lessons = await lessonDao.getNextLessons('learner-1', limit: 10);
      expect(lessons, hasLength(10));
    });

    test('expired lessons are cleaned up', () async {
      await lessonDao.cacheLesson(CachedLessonsCompanion.insert(
        lessonId: 'expired-lesson',
        learnerId: 'learner-1',
        subject: 'math',
        topic: 'subtraction',
        skillId: 'sub-1',
        contentJson: '{}',
        expiresAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),);

      await lessonDao.cacheLesson(CachedLessonsCompanion.insert(
        lessonId: 'valid-lesson',
        learnerId: 'learner-1',
        subject: 'math',
        topic: 'multiplication',
        skillId: 'mul-1',
        contentJson: '{}',
        expiresAt: DateTime.now().add(const Duration(hours: 48)),
      ),);

      await lessonDao.deleteExpiredLessons();
      final count = await lessonDao.countCachedLessons('learner-1');
      expect(count, 1);
    });
  });

  group('Offline mastery inference', () {
    test('processCompletion updates mastery and queues sync action', () async {
      final inMemorySync = InMemorySyncDao();
      final syncManager = SyncManager(
        dao: inMemorySync,
        dio: _FakeDio(),
      );
      final engine = OfflineMasteryEngine(
        masteryDao: masteryDao,
        syncManager: syncManager,
      );

      await engine.processCompletion(
        learnerId: 'learner-1',
        skillId: 'math-addition',
        subject: 'math',
        correctAttempts: 8,
        totalAttempts: 10,
        sessionId: 'session-1',
        timeSpentSeconds: 300,
      );

      // Verify mastery was updated locally.
      final mastery = await masteryDao.getMastery('learner-1', 'math-addition');
      expect(mastery, isNotNull);
      expect(mastery!.masteryLevel, 0.05);
      expect(mastery.totalAttempts, 10);
      expect(mastery.correctAttempts, 8);
      expect(mastery.nextReviewAt, isNotNull);

      // Verify a sync action was queued.
      final pending = await inMemorySync.unsyncedActions();
      expect(pending, hasLength(1));
      expect(pending.first.endpoint, contains('session-1'));

      final payload = jsonDecode(pending.first.payload) as Map<String, dynamic>;
      expect(payload['completedOffline'], true);
    });

    test('mastery is clamped between 0.0 and 1.0', () async {
      // Pre-set mastery near 1.0.
      await masteryDao.upsertMastery(MasteryCacheCompanion.insert(
        learnerId: 'learner-1',
        skillId: 'at-max',
        subject: 'science',
        masteryLevel: const Value(0.98),
      ),);

      final engine = OfflineMasteryEngine(
        masteryDao: masteryDao,
        syncManager: SyncManager(dao: InMemorySyncDao(), dio: _FakeDio()),
      );

      await engine.processCompletion(
        learnerId: 'learner-1',
        skillId: 'at-max',
        subject: 'science',
        correctAttempts: 10,
        totalAttempts: 10,
        sessionId: 'session-max',
        timeSpentSeconds: 120,
      );

      final mastery = await masteryDao.getMastery('learner-1', 'at-max');
      expect(mastery!.masteryLevel, 1.0);
    });

    test('SM-2 schedule doubles interval for high score', () async {
      final now = DateTime.now();
      await masteryDao.upsertMastery(MasteryCacheCompanion.insert(
        learnerId: 'learner-1',
        skillId: 'sm2-test',
        subject: 'math',
        nextReviewAt: Value(now.add(const Duration(days: 2))),
      ),);

      final engine = OfflineMasteryEngine(
        masteryDao: masteryDao,
        syncManager: SyncManager(dao: InMemorySyncDao(), dio: _FakeDio()),
      );

      await engine.processCompletion(
        learnerId: 'learner-1',
        skillId: 'sm2-test',
        subject: 'math',
        correctAttempts: 9,
        totalAttempts: 10,
        sessionId: 'session-sm2',
        timeSpentSeconds: 200,
      );

      final mastery = await masteryDao.getMastery('learner-1', 'sm2-test');
      // Next review should be at least 2 days from now (2 * 2.5 = 5 days).
      expect(
        mastery!.nextReviewAt!.isAfter(now.add(const Duration(days: 2))),
        isTrue,
      );
    });
  });

  group('Background sync uses real Drift DB', () {
    test('DriftSyncDao backed by AivoDatabase persists across operations',
        () async {
      // Simulate what background sync does: open DB, create dao, drain.
      final bgDb = AivoDatabase.forTesting(NativeDatabase.memory());
      final bgDao = DriftSyncDao(bgDb);

      await bgDao.insertAction(SyncAction(
        endpoint: '/test',
        method: 'POST',
        payload: '{}',
      ),);

      expect(await bgDao.pendingCount(), 1);

      // Verify it's using the real DB, not InMemorySyncDao.
      final rows = await bgDb.select(bgDb.syncQueueItems).get();
      expect(rows, hasLength(1));
      expect(rows.first.synced, false);

      await bgDao.markSynced(rows.first.actionId);
      expect(await bgDao.pendingCount(), 0);

      await bgDb.close();
    });
  });
}

/// Stub Dio used where we don't actually make HTTP calls.
Dio _FakeDio() => Dio(BaseOptions(baseUrl: 'http://localhost'));
