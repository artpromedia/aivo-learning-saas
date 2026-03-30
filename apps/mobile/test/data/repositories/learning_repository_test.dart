import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';
import 'package:aivo_mobile/data/repositories/learning_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class MockLessonDao extends Mock implements LessonDao {}

class MockSyncManager extends Mock implements SyncManager {}

void main() {
  late MockApiClient mockApi;
  late MockLessonDao mockLessonDao;
  late MockSyncManager mockSyncManager;

  setUp(() {
    mockApi = MockApiClient();
    mockLessonDao = MockLessonDao();
    mockSyncManager = MockSyncManager();
  });

  setUpAll(() {
    registerFallbackValue(SyncAction(
      endpoint: '/test',
      method: 'POST',
      payload: '{}',
    ),);
    registerFallbackValue(CachedLessonsCompanion.insert(
      lessonId: '',
      learnerId: '',
      subject: '',
      topic: '',
      skillId: '',
      contentJson: '',
      expiresAt: DateTime(2025),
    ),);
  });

  LearningRepository createRepo({bool isOnline = true}) {
    return LearningRepository(
      apiClient: mockApi,
      lessonDao: mockLessonDao,
      isOnline: isOnline,
      syncManager: mockSyncManager,
    );
  }

  final sessionJson = {
    'id': 'session-1',
    'learnerId': 'learner-1',
    'lessonId': 'lesson-1',
    'subject': 'math',
    'topic': 'addition',
    'skillId': 'sk-1',
    'status': 'active',
    'content': <String, dynamic>{},
    'interactions': <dynamic>[],
    'timeSpentSeconds': 0,
    'startedAt': '2025-03-01T10:00:00.000Z',
  };

  group('getLearningPath', () {
    test('returns learning path from API', () async {
      when(() => mockApi.get(any(), queryParameters: any(named: 'queryParameters')))
          .thenAnswer((_) async => Response(
                data: {
                  'items': <dynamic>[],
                  'completedToday': 2,
                  'targetToday': 5,
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo();
      final path = await repo.getLearningPath('learner-1');

      expect(path.completedToday, 2);
      expect(path.targetToday, 5);
    });
  });

  group('startSession', () {
    test('starts session from API when online', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: sessionJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo(isOnline: true);
      final session = await repo.startSession('lesson-1');

      expect(session.id, 'session-1');
      expect(session.status, 'active');
    });

    test('throws StateError when offline and no cached lesson', () async {
      when(() => mockLessonDao.getCachedLesson('lesson-1'))
          .thenAnswer((_) async => null);

      final repo = createRepo(isOnline: false);

      expect(
        () => repo.startSession('lesson-1'),
        throwsA(isA<StateError>()),
      );
    });
  });

  group('submitInteraction', () {
    test('submits to API when online', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {
                  'id': 'int-1',
                  'type': 'mc',
                  'prompt': 'Q?',
                  'data': <String, dynamic>{},
                  'studentResponse': 'A',
                  'isCorrect': true,
                  'feedback': 'Correct!',
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo(isOnline: true);
      final interaction =
          await repo.submitInteraction('session-1', 'int-1', 'A');

      expect(interaction.isCorrect, isTrue);
    });

    test('queues offline and returns provisional interaction', () async {
      when(() => mockSyncManager.queueAction(any()))
          .thenAnswer((_) async {});

      final repo = createRepo(isOnline: false);
      final interaction =
          await repo.submitInteraction('session-1', 'int-1', 'A');

      expect(interaction.type, 'pending');
      expect(interaction.studentResponse, 'A');
      verify(() => mockSyncManager.queueAction(any())).called(1);
    });
  });

  group('completeSession', () {
    test('completes via API when online', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {
                  ...sessionJson,
                  'status': 'completed',
                  'score': 0.9,
                  'completedAt': '2025-03-01T10:30:00.000Z',
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo(isOnline: true);
      final session = await repo.completeSession('session-1', score: 0.9);

      expect(session.status, 'completed');
    });

    test('queues offline and returns provisional session', () async {
      when(() => mockSyncManager.queueAction(any()))
          .thenAnswer((_) async {});

      final repo = createRepo(isOnline: false);
      final session = await repo.completeSession('session-1');

      expect(session.status, 'completed_offline');
      verify(() => mockSyncManager.queueAction(any())).called(1);
    });
  });

  group('getSessionHistory', () {
    test('returns list of sessions', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'sessions': [sessionJson],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo();
      final sessions = await repo.getSessionHistory();

      expect(sessions.length, 1);
      expect(sessions.first.id, 'session-1');
    });
  });

  group('preCacheLessons', () {
    test('fetches learning path and caches each lesson', () async {
      when(() => mockApi.get(any(), queryParameters: any(named: 'queryParameters')))
          .thenAnswer((_) async => Response(
                data: {
                  'items': [
                    {
                      'lessonId': 'L1',
                      'subject': 'math',
                      'topic': 'add',
                      'skillId': 'sk-1',
                    },
                  ],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {'content': 'lesson data'},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);
      when(() => mockLessonDao.cacheLesson(any()))
          .thenAnswer((_) async => 1);

      final repo = createRepo(isOnline: true);
      await repo.preCacheLessons('learner-1', count: 1);

      verify(() => mockLessonDao.cacheLesson(any())).called(1);
    });
  });

  group('getNextLesson', () {
    test('returns next learning path item from API', () async {
      when(() => mockApi.get(any(), queryParameters: any(named: 'queryParameters')))
          .thenAnswer((_) async => Response(
                data: {
                  'lessonId': 'L-next',
                  'subject': 'reading',
                  'topic': 'phonics',
                  'skillId': 'sk-ph',
                  'type': 'lesson',
                  'isCompleted': false,
                  'orderIndex': 0,
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final repo = createRepo();
      final item = await repo.getNextLesson('learner-1');

      expect(item.lessonId, 'L-next');
    });
  });
}
