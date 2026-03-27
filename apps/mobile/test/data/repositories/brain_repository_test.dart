import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/brain_dao.dart';
import 'package:aivo_mobile/data/local/daos/mastery_dao.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/repositories/brain_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class MockBrainDao extends Mock implements BrainDao {}

class MockMasteryDao extends Mock implements MasteryDao {}

class MockSyncManager extends Mock implements SyncManager {}

void main() {
  late MockApiClient mockApi;
  late MockBrainDao mockBrainDao;
  late MockMasteryDao mockMasteryDao;
  late MockSyncManager mockSyncManager;

  setUp(() {
    mockApi = MockApiClient();
    mockBrainDao = MockBrainDao();
    mockMasteryDao = MockMasteryDao();
    mockSyncManager = MockSyncManager();
  });

  setUpAll(() {
    registerFallbackValue(SyncAction(
      endpoint: '/test',
      method: 'POST',
      payload: '{}',
    ));
    registerFallbackValue(BrainContext(
      brainStateId: 'bs-1',
      learnerId: 'l-1',
      functioningLevel: 'standard',
      diagnoses: const [],
      accommodations: const {},
      masteryLevels: const {},
      learningPreferences: const {},
      strengths: const [],
      challenges: const [],
      currentGoals: const [],
      iepGoals: const [],
      overallProgress: 0.0,
      lastUpdated: DateTime.now(),
    ));
  });

  BrainRepository _createRepo({bool isOnline = true}) {
    return BrainRepository(
      apiClient: mockApi,
      brainDao: mockBrainDao,
      masteryDao: mockMasteryDao,
      isOnline: isOnline,
      syncManager: mockSyncManager,
    );
  }

  final testBrainContextJson = {
    'brainStateId': 'bs-1',
    'learnerId': 'learner-1',
    'functioningLevel': 'standard',
    'diagnoses': <String>[],
    'accommodations': <String, dynamic>{},
    'masteryLevels': <String, dynamic>{},
    'learningPreferences': <String, dynamic>{},
    'strengths': <String>[],
    'challenges': <String>[],
    'currentGoals': <dynamic>[],
    'iepGoals': <dynamic>[],
    'overallProgress': 0.5,
    'lastUpdated': '2025-03-01T12:00:00.000Z',
  };

  group('getBrainContext', () {
    test('fetches from remote when online and caches locally', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: testBrainContextJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));
      when(() => mockBrainDao.upsertSnapshot(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo(isOnline: true);
      final result = await repo.getBrainContext('learner-1');

      expect(result.brainStateId, 'bs-1');
      verify(() => mockBrainDao.upsertSnapshot(any())).called(1);
    });

    test('falls back to local cache on API error when online', () async {
      when(() => mockApi.get(any()))
          .thenThrow(DioException(requestOptions: RequestOptions(path: '')));

      final localContext = BrainContext.fromJson(testBrainContextJson);
      when(() => mockBrainDao.getSnapshot('learner-1'))
          .thenAnswer((_) async => localContext);

      final repo = _createRepo(isOnline: true);
      final result = await repo.getBrainContext('learner-1');

      expect(result.brainStateId, 'bs-1');
    });

    test('reads from local cache when offline', () async {
      final localContext = BrainContext.fromJson(testBrainContextJson);
      when(() => mockBrainDao.getSnapshot('learner-1'))
          .thenAnswer((_) async => localContext);

      final repo = _createRepo(isOnline: false);
      final result = await repo.getBrainContext('learner-1');

      expect(result.brainStateId, 'bs-1');
      verifyNever(() => mockApi.get(any()));
    });

    test('throws StateError when offline and no cache', () async {
      when(() => mockBrainDao.getSnapshot('learner-1'))
          .thenAnswer((_) async => null);

      final repo = _createRepo(isOnline: false);

      expect(
        () => repo.getBrainContext('learner-1'),
        throwsA(isA<StateError>()),
      );
    });
  });

  group('syncBrainSnapshot', () {
    test('fetches from API and saves locally', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: testBrainContextJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));
      when(() => mockBrainDao.upsertSnapshot(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo();
      final result = await repo.syncBrainSnapshot('learner-1');

      expect(result.overallProgress, 0.5);
      verify(() => mockBrainDao.upsertSnapshot(any())).called(1);
    });
  });

  group('updateMastery', () {
    test('calls API when online', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final repo = _createRepo(isOnline: true);
      await repo.updateMastery('learner-1', 'skill-1', 0.85);

      verify(() => mockApi.post(any(), data: any(named: 'data'))).called(1);
      verifyNever(() => mockSyncManager.queueAction(any()));
    });

    test('queues action when offline', () async {
      when(() => mockSyncManager.queueAction(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo(isOnline: false);
      await repo.updateMastery('learner-1', 'skill-1', 0.85);

      verify(() => mockSyncManager.queueAction(any())).called(1);
      verifyNever(() => mockApi.post(any(), data: any(named: 'data')));
    });

    test('queues action when online API call fails', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenThrow(DioException(requestOptions: RequestOptions(path: '')));
      when(() => mockSyncManager.queueAction(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo(isOnline: true);
      await repo.updateMastery('learner-1', 'skill-1', 0.85);

      verify(() => mockSyncManager.queueAction(any())).called(1);
    });
  });

  group('getLocalBrainSnapshot', () {
    test('returns cached snapshot', () async {
      final ctx = BrainContext.fromJson(testBrainContextJson);
      when(() => mockBrainDao.getSnapshot('learner-1'))
          .thenAnswer((_) async => ctx);

      final repo = _createRepo();
      final result = await repo.getLocalBrainSnapshot('learner-1');

      expect(result, isNotNull);
      expect(result!.brainStateId, 'bs-1');
    });
  });
}
