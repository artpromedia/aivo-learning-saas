import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/sync_dao.dart';
import 'package:aivo_mobile/data/local/database.dart';

void main() {
  late AivoDatabase db;
  late DriftSyncDao dao;

  setUp(() {
    db = AivoDatabase.forTesting(NativeDatabase.memory());
    dao = DriftSyncDao(db);
  });

  tearDown(() => db.close());

  group('DriftSyncDao integration', () {
    test('insertAction persists to real Drift DB', () async {
      final action = SyncAction(
        endpoint: '/brain/mastery/update',
        method: 'POST',
        payload: '{"learnerId":"abc","skillId":"math-1","score":0.9}',
      );
      await dao.insertAction(action);

      final pending = await dao.unsyncedActions();
      expect(pending, hasLength(1));
      expect(pending.first.id, action.id);
      expect(pending.first.endpoint, '/brain/mastery/update');
      expect(pending.first.synced, false);
    });

    test('unsyncedActions returns items in FIFO order', () async {
      for (var i = 0; i < 5; i++) {
        await dao.insertAction(SyncAction(
          endpoint: '/test/$i',
          method: 'POST',
          payload: '{}',
        ),);
      }

      final pending = await dao.unsyncedActions();
      expect(pending, hasLength(5));
      for (var i = 0; i < 4; i++) {
        expect(
          pending[i].createdAt.isBefore(pending[i + 1].createdAt) ||
              pending[i].createdAt.isAtSameMomentAs(pending[i + 1].createdAt),
          isTrue,
        );
      }
    });

    test('markSynced removes action from unsynced list', () async {
      final action = SyncAction(
        endpoint: '/test',
        method: 'POST',
        payload: '{}',
      );
      await dao.insertAction(action);
      expect(await dao.pendingCount(), 1);

      await dao.markSynced(action.id);
      expect(await dao.pendingCount(), 0);
      expect(await dao.unsyncedActions(), isEmpty);
    });

    test('pendingCount returns correct count', () async {
      expect(await dao.pendingCount(), 0);

      for (var i = 0; i < 3; i++) {
        await dao.insertAction(SyncAction(
          endpoint: '/test/$i',
          method: 'POST',
          payload: '{}',
        ),);
      }
      expect(await dao.pendingCount(), 3);

      final actions = await dao.unsyncedActions();
      await dao.markSynced(actions.first.id);
      expect(await dao.pendingCount(), 2);
    });

    test('cleanupSyncedActions deletes old synced items', () async {
      final action = SyncAction(
        endpoint: '/old',
        method: 'POST',
        payload: '{}',
      );
      await dao.insertAction(action);
      await dao.markSynced(action.id);

      // Manually backdate the syncedAt to 8 days ago.
      final eightDaysAgo = DateTime.now().subtract(const Duration(days: 8));
      await (db.update(db.syncQueueItems)
            ..where((t) => t.actionId.equals(action.id)))
          .write(SyncQueueItemsCompanion(
        syncedAt: Value(eightDaysAgo),
      ),);

      await dao.cleanupSyncedActions();

      final remaining = await db.select(db.syncQueueItems).get();
      expect(remaining, isEmpty);
    });

    test('queue 5 actions → mark all synced → verify all drained', () async {
      final actions = <SyncAction>[];
      for (var i = 0; i < 5; i++) {
        final a = SyncAction(
          endpoint: '/brain/mastery/update',
          method: 'POST',
          payload: '{"index":$i}',
        );
        actions.add(a);
        await dao.insertAction(a);
      }
      expect(await dao.pendingCount(), 5);

      for (final a in actions) {
        await dao.markSynced(a.id);
      }
      expect(await dao.pendingCount(), 0);
      expect(await dao.unsyncedActions(), isEmpty);
    });

    test('DriftSyncDao uses real Drift DB (not InMemorySyncDao)', () async {
      expect(dao, isA<DriftSyncDao>());
      expect(dao, isNot(isA<InMemorySyncDao>()));

      await dao.insertAction(SyncAction(
        endpoint: '/test',
        method: 'POST',
        payload: '{}',
      ),);

      // Verify the data exists in the actual database table.
      final rows = await db.select(db.syncQueueItems).get();
      expect(rows, hasLength(1));
      expect(rows.first.endpoint, '/test');
    });
  });
}
