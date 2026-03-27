import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/data/repositories/tutor_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late MockApiClient mockApi;
  late TutorRepository repo;

  setUp(() {
    mockApi = MockApiClient();
    repo = TutorRepository(apiClient: mockApi);
  });

  final tutorSessionJson = {
    'id': 'ts-1',
    'learnerId': 'learner-1',
    'tutorId': 'tutor-1',
    'tutorName': 'Math Buddy',
    'tutorAvatar': 'https://example.com/avatar.png',
    'subject': 'math',
    'status': 'active',
    'messages': <dynamic>[],
    'startedAt': '2025-03-01T10:00:00.000Z',
  };

  group('getTutorCatalog', () {
    test('returns list of tutors from API', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'tutors': [
                    {
                      'id': 't-1',
                      'name': 'Math Buddy',
                      'description': 'Helps with math',
                      'subjects': ['math'],
                      'avatar': 'https://example.com/t.png',
                      'personality': 'friendly',
                    },
                  ],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final catalog = await repo.getTutorCatalog();
      expect(catalog.length, 1);
    });
  });

  group('subscribe', () {
    test('calls API with tutorId', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      await repo.subscribe('tutor-1');

      verify(() => mockApi.post(any(), data: {'tutorId': 'tutor-1'})).called(1);
    });
  });

  group('startSession', () {
    test('returns TutorSession from API', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: tutorSessionJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final session = await repo.startSession('tutor-1', subject: 'math');

      expect(session.id, 'ts-1');
      expect(session.tutorName, 'Math Buddy');
    });

    test('starts session without subject', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: tutorSessionJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final session = await repo.startSession('tutor-1');

      expect(session.id, 'ts-1');
    });
  });

  group('endSession', () {
    test('calls API to end session', () async {
      when(() => mockApi.post(any()))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      await repo.endSession('ts-1');

      verify(() => mockApi.post(any())).called(1);
    });
  });

  group('getSessionHistory', () {
    test('returns list of past sessions', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'sessions': [tutorSessionJson],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final sessions = await repo.getSessionHistory();

      expect(sessions.length, 1);
      expect(sessions.first.id, 'ts-1');
    });
  });

  group('cancelSubscription', () {
    test('calls delete API', () async {
      when(() => mockApi.delete(any()))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      await repo.cancelSubscription('sub-1');

      verify(() => mockApi.delete(any())).called(1);
    });
  });
}
