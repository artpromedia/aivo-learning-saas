import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/connectivity/sync_manager.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockDio extends Mock implements Dio {}

class MockSyncDao extends Mock implements SyncDao {}

void main() {
  late MockDio mockDio;
  late MockSyncDao mockDao;
  late SyncManager syncManager;

  setUp(() {
    mockDio = MockDio();
    mockDao = MockSyncDao();
    syncManager = SyncManager(dao: mockDao, dio: mockDio);
  });

  setUpAll(() {
    registerFallbackValue(SyncAction(
      endpoint: '/test',
      method: 'POST',
      payload: '{}',
    ),);
    registerFallbackValue(RequestOptions(path: ''));
  });

  SyncAction makeAction({
    String id = 'action-1',
    String endpoint = '/api/v1/test',
    String method = 'POST',
    Map<String, dynamic> payload = const {'key': 'value'},
  }) {
    return SyncAction(
      id: id,
      endpoint: endpoint,
      method: method,
      payload: jsonEncode(payload),
    );
  }

  group('SyncManager.drainSyncQueue', () {
    test('syncs all unsynced POST actions', () async {
      final actions = [
        makeAction(id: 'a1', endpoint: '/endpoint1'),
        makeAction(id: 'a2', endpoint: '/endpoint2'),
      ];

      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => actions);
      when(() => mockDio.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);
      when(() => mockDao.markSynced(any())).thenAnswer((_) async {});

      await syncManager.drainSyncQueue();

      verify(() => mockDao.markSynced('a1')).called(1);
      verify(() => mockDao.markSynced('a2')).called(1);
    });

    test('syncs PUT actions correctly', () async {
      final action = makeAction(id: 'put-1', method: 'PUT');

      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => [action]);
      when(() => mockDio.put(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);
      when(() => mockDao.markSynced(any())).thenAnswer((_) async {});

      await syncManager.drainSyncQueue();

      verify(() => mockDio.put(any(), data: any(named: 'data'))).called(1);
      verify(() => mockDao.markSynced('put-1')).called(1);
    });

    test('leaves failed actions unsynced', () async {
      final action = makeAction(id: 'fail-1');

      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => [action]);
      when(() => mockDio.post(any(), data: any(named: 'data')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        type: DioExceptionType.connectionTimeout,
      ),);

      await syncManager.drainSyncQueue();

      verifyNever(() => mockDao.markSynced(any()));
    });

    test('continues syncing remaining actions when one fails', () async {
      final actions = [
        makeAction(id: 'fail-1', endpoint: '/fail'),
        makeAction(id: 'success-1', endpoint: '/success'),
      ];

      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => actions);

      var callCount = 0;
      when(() => mockDio.post(any(), data: any(named: 'data')))
          .thenAnswer((invocation) async {
        callCount++;
        if (callCount == 1) {
          throw DioException(
            requestOptions: RequestOptions(path: ''),
          );
        }
        return Response(
          data: {},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );
      });
      when(() => mockDao.markSynced(any())).thenAnswer((_) async {});

      await syncManager.drainSyncQueue();

      verifyNever(() => mockDao.markSynced('fail-1'));
      verify(() => mockDao.markSynced('success-1')).called(1);
    });

    test('handles empty queue gracefully', () async {
      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => []);

      await syncManager.drainSyncQueue();

      verifyNever(() => mockDio.post(any(), data: any(named: 'data')));
      verifyNever(() => mockDao.markSynced(any()));
    });

    test('skips actions with unknown HTTP methods', () async {
      final action = makeAction(id: 'del-1', method: 'DELETE');

      when(() => mockDao.unsyncedActions()).thenAnswer((_) async => [action]);

      await syncManager.drainSyncQueue();

      verifyNever(() => mockDao.markSynced(any()));
      verifyNever(() => mockDio.post(any(), data: any(named: 'data')));
      verifyNever(() => mockDio.put(any(), data: any(named: 'data')));
    });
  });

  group('SyncManager.queueAction', () {
    test('delegates to dao.insertAction', () async {
      final action = makeAction();
      when(() => mockDao.insertAction(any())).thenAnswer((_) async {});

      await syncManager.queueAction(action);

      verify(() => mockDao.insertAction(action)).called(1);
    });
  });

  group('InMemorySyncDao', () {
    late InMemorySyncDao dao;

    setUp(() {
      dao = InMemorySyncDao();
    });

    test('insertAction and unsyncedActions round-trip', () async {
      final action = makeAction(id: 'mem-1');
      await dao.insertAction(action);

      final unsynced = await dao.unsyncedActions();
      expect(unsynced, hasLength(1));
      expect(unsynced.first.id, 'mem-1');
    });

    test('markSynced removes action from unsynced list', () async {
      final action = makeAction(id: 'mem-2');
      await dao.insertAction(action);
      await dao.markSynced('mem-2');

      final unsynced = await dao.unsyncedActions();
      expect(unsynced, isEmpty);
    });

    test('unsyncedActions returns actions ordered by createdAt', () async {
      final now = DateTime.now();
      final action1 = SyncAction(
        id: 'first',
        endpoint: '/a',
        method: 'POST',
        payload: '{}',
        createdAt: now.subtract(const Duration(minutes: 5)),
      );
      final action2 = SyncAction(
        id: 'second',
        endpoint: '/b',
        method: 'POST',
        payload: '{}',
        createdAt: now,
      );

      await dao.insertAction(action2);
      await dao.insertAction(action1);

      final unsynced = await dao.unsyncedActions();
      expect(unsynced.first.id, 'first');
      expect(unsynced.last.id, 'second');
    });
  });

  group('SyncAction', () {
    test('toMap and fromMap round-trip', () {
      final action = SyncAction(
        id: 'test-id',
        endpoint: '/test',
        method: 'POST',
        payload: '{"key":"value"}',
        createdAt: DateTime.parse('2025-01-15T10:30:00.000'),
        synced: false,
      );

      final map = action.toMap();
      final restored = SyncAction.fromMap(map);

      expect(restored.id, action.id);
      expect(restored.endpoint, action.endpoint);
      expect(restored.method, action.method);
      expect(restored.payload, action.payload);
      expect(restored.synced, action.synced);
    });

    test('copyWith updates synced field', () {
      final action = makeAction();
      expect(action.synced, isFalse);

      final updated = action.copyWith(synced: true);
      expect(updated.synced, isTrue);
      expect(updated.id, action.id);
    });
  });
}
