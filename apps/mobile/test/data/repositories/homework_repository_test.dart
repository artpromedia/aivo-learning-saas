import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/data/repositories/homework_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late MockApiClient mockApi;
  late HomeworkRepository repo;

  setUp(() {
    mockApi = MockApiClient();
    repo = HomeworkRepository(apiClient: mockApi);
  });

  final homeworkJson = {
    'id': 'hw-1',
    'learnerId': 'learner-1',
    'status': 'processed',
    'detectedSubject': 'math',
    'extractedText': '2+3=?',
    'questions': <dynamic>[],
    'createdAt': '2025-03-01T10:00:00.000Z',
  };

  final sessionJson = {
    'id': 'ts-hw-1',
    'learnerId': 'learner-1',
    'tutorId': 'homework-tutor',
    'tutorName': 'Homework Helper',
    'tutorAvatar': 'https://example.com/hw.png',
    'subject': 'math',
    'status': 'active',
    'messages': <dynamic>[],
    'startedAt': '2025-03-01T10:00:00.000Z',
  };

  group('uploadHomework', () {
    test('emits uploading, processing, and complete stages', () async {
      when(() => mockApi.upload<Map<String, dynamic>>(
            any(),
            filePath: any(named: 'filePath'),
            fieldName: any(named: 'fieldName'),
            fields: any(named: 'fields'),
            onSendProgress: any(named: 'onSendProgress'),
          )).thenAnswer((_) async => Response(
                data: {'homework': homeworkJson},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final events = <HomeworkUploadProgress>[];
      await for (final event in repo.uploadHomework('/path/to/file.jpg')) {
        events.add(event);
      }

      expect(events.length, greaterThanOrEqualTo(3));
      expect(events.first.stage, 'uploading');
      expect(events.last.stage, 'complete');
    });

    test('emits error stage on failure', () async {
      when(() => mockApi.upload<Map<String, dynamic>>(
            any(),
            filePath: any(named: 'filePath'),
            fieldName: any(named: 'fieldName'),
            fields: any(named: 'fields'),
            onSendProgress: any(named: 'onSendProgress'),
          )).thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        type: DioExceptionType.connectionTimeout,
      ));

      final events = <HomeworkUploadProgress>[];
      await for (final event in repo.uploadHomework('/path/to/file.jpg')) {
        events.add(event);
      }

      expect(events.any((e) => e.stage == 'error'), isTrue);
    });
  });

  group('getHomework', () {
    test('returns homework from API', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: homeworkJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final hw = await repo.getHomework('hw-1');

      expect(hw.id, 'hw-1');
      expect(hw.detectedSubject, 'math');
    });

    test('handles nested homework response', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {'homework': homeworkJson},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final hw = await repo.getHomework('hw-1');

      expect(hw.id, 'hw-1');
    });
  });

  group('startHomeworkSession', () {
    test('returns TutorSession from API', () async {
      when(() => mockApi.post(any()))
          .thenAnswer((_) async => Response(
                data: sessionJson,
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      final session = await repo.startHomeworkSession('hw-1');

      expect(session.id, 'ts-hw-1');
      expect(session.tutorName, 'Homework Helper');
    });
  });

  group('endHomeworkSession', () {
    test('calls API to end session', () async {
      when(() => mockApi.post(any()))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ));

      await repo.endHomeworkSession('hw-1');

      verify(() => mockApi.post(any())).called(1);
    });
  });
}
