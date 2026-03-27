import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/engagement_dao.dart';
import 'package:aivo_mobile/data/models/engagement.dart';
import 'package:aivo_mobile/data/repositories/engagement_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class MockEngagementDao extends Mock implements EngagementDao {}

class MockSyncManager extends Mock implements SyncManager {}

void main() {
  late MockApiClient mockApi;
  late MockEngagementDao mockEngagementDao;
  late MockSyncManager mockSyncManager;

  setUp(() {
    mockApi = MockApiClient();
    mockEngagementDao = MockEngagementDao();
    mockSyncManager = MockSyncManager();
  });

  setUpAll(() {
    registerFallbackValue(SyncAction(
      endpoint: '/test',
      method: 'POST',
      payload: '{}',
    ));
    registerFallbackValue(const EngagementSummary(
      totalXp: 0, currentLevel: 1, xpToNextLevel: 100, xpProgress: 0,
      currentStreak: 0, longestStreak: 0, aivoCoins: 0,
    ));
  });

  EngagementRepository _createRepo({bool isOnline = true}) {
    return EngagementRepository(
      apiClient: mockApi,
      engagementDao: mockEngagementDao,
      isOnline: isOnline,
      syncManager: mockSyncManager,
    );
  }

  group('getXpSummary', () {
    test('fetches from API when online and caches', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'totalXp': 500,
                  'currentLevel': 3,
                  'xpToNextLevel': 200,
                  'xpProgress': 100,
                  'currentStreak': 5,
                  'longestStreak': 10,
                  'aivoCoins': 50,
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));
      when(() => mockEngagementDao.upsertSummary(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo(isOnline: true);
      final summary = await repo.getXpSummary('learner-1');

      expect(summary.totalXp, 500);
      verify(() => mockEngagementDao.upsertSummary(any())).called(1);
    });

    test('falls back to local cache when offline', () async {
      const cached = EngagementSummary(
        totalXp: 300, currentLevel: 2, xpToNextLevel: 150, xpProgress: 50,
        currentStreak: 3, longestStreak: 7, aivoCoins: 20,
      );
      when(() => mockEngagementDao.getSummary('learner-1'))
          .thenAnswer((_) async => cached);

      final repo = _createRepo(isOnline: false);
      final summary = await repo.getXpSummary('learner-1');

      expect(summary.totalXp, 300);
      verifyNever(() => mockApi.get(any()));
    });

    test('throws StateError when offline and no cache', () async {
      when(() => mockEngagementDao.getSummary('learner-1'))
          .thenAnswer((_) async => null);

      final repo = _createRepo(isOnline: false);

      expect(
        () => repo.getXpSummary('learner-1'),
        throwsA(isA<StateError>()),
      );
    });
  });

  group('getEarnedBadges', () {
    test('returns badges from API when online', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'badges': [
                    {
                      'slug': 'first-lesson',
                      'name': 'First Lesson',
                      'description': 'Complete first lesson',
                      'iconUrl': 'https://example.com/b.png',
                      'rarity': 'common',
                      'isEarned': true,
                      'progress': 1.0,
                    },
                  ],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final repo = _createRepo(isOnline: true);
      final badges = await repo.getEarnedBadges('learner-1');

      expect(badges.length, 1);
      expect(badges.first.slug, 'first-lesson');
    });

    test('returns empty list when offline', () async {
      final repo = _createRepo(isOnline: false);
      final badges = await repo.getEarnedBadges('learner-1');

      expect(badges, isEmpty);
    });
  });

  group('purchaseItem', () {
    test('calls API with itemId', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final repo = _createRepo();
      await repo.purchaseItem('item-1');

      verify(() => mockApi.post(any(), data: {'itemId': 'item-1'})).called(1);
    });
  });

  group('getLeaderboard', () {
    test('returns entries for global type', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'entries': [
                    {
                      'odometer': 'o-1',
                      'learnerName': 'Alice',
                      'xp': 1000,
                      'rank': 1,
                      'isCurrentUser': false,
                    },
                  ],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final repo = _createRepo();
      final entries = await repo.getLeaderboard('global');

      expect(entries.length, 1);
      expect(entries.first.learnerName, 'Alice');
    });
  });

  group('freezeStreak', () {
    test('queues action when offline', () async {
      when(() => mockSyncManager.queueAction(any()))
          .thenAnswer((_) async {});

      final repo = _createRepo(isOnline: false);
      await repo.freezeStreak('learner-1');

      verify(() => mockSyncManager.queueAction(any())).called(1);
    });
  });
}
