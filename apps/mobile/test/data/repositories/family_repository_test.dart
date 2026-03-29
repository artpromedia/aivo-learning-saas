import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

void main() {
  late MockApiClient mockApi;
  late FamilyRepository repo;

  setUp(() {
    mockApi = MockApiClient();
    repo = FamilyRepository(apiClient: mockApi);
  });

  group('getDashboardSummary', () {
    test('returns dashboard data from API', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'totalLearningTimeMinutes': 120,
                  'totalLessonsCompleted': 15,
                  'unreadNotifications': 3,
                  'learners': <dynamic>[],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final data = await repo.getDashboardSummary('learner-1');

      expect(data['totalLearningTimeMinutes'], 120);
    });
  });

  group('getRecommendations', () {
    test('returns list of recommendations', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'recommendations': [
                    {
                      'id': 'rec-1',
                      'learnerId': 'learner-1',
                      'type': 'accommodation',
                      'title': 'Extra time on tests',
                      'description': 'Provide extended time',
                      'rationale': 'Based on assessment',
                      'status': 'pending',
                      'createdAt': '2025-03-01T10:00:00.000Z',
                    },
                  ],
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final recs = await repo.getRecommendations('learner-1');

      expect(recs.length, 1);
      expect(recs.first.type, 'accommodation');
    });

    test('handles direct list response', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: [
                  {
                    'id': 'rec-1',
                    'learnerId': 'learner-1',
                    'type': 'goal',
                    'title': 'Goal rec',
                    'description': 'A goal',
                    'rationale': 'Reason',
                    'status': 'pending',
                    'createdAt': '2025-03-01T10:00:00.000Z',
                  },
                ],
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final recs = await repo.getRecommendations('learner-1');

      expect(recs.length, 1);
    });
  });

  group('respondToRecommendation', () {
    test('calls API with response and adjustments', () async {
      when(() => mockApi.post(any(), data: any(named: 'data')))
          .thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      await repo.respondToRecommendation(
        'rec-1',
        'approved',
      );

      verify(() => mockApi.post(
            any(),
            data: {'response': 'approved'},
          ),).called(1);
    });
  });

  group('getBrainProfile', () {
    test('returns BrainContext from API', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'brainStateId': 'bs-1',
                  'learnerId': 'learner-1',
                  'functioningLevel': 'supported',
                  'diagnoses': <String>[],
                  'accommodations': <String, dynamic>{},
                  'masteryLevels': <String, dynamic>{},
                  'learningPreferences': <String, dynamic>{},
                  'strengths': <String>[],
                  'challenges': <String>[],
                  'currentGoals': <dynamic>[],
                  'iepGoals': <dynamic>[],
                  'overallProgress': 0.3,
                  'lastUpdated': '2025-03-01T12:00:00.000Z',
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final profile = await repo.getBrainProfile('learner-1');

      expect(profile.functioningLevel, 'supported');
    });
  });

  group('uploadIep', () {
    test('calls upload API', () async {
      when(() => mockApi.upload(
            any(),
            filePath: any(named: 'filePath'),
            fieldName: any(named: 'fieldName'),
          ),).thenAnswer((_) async => Response(
                data: {},
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      await repo.uploadIep('/path/to/iep.pdf');

      verify(() => mockApi.upload(
            any(),
            filePath: '/path/to/iep.pdf',
            fieldName: 'file',
          ),).called(1);
    });
  });

  group('getSettings', () {
    test('returns settings map from API', () async {
      when(() => mockApi.get(any()))
          .thenAnswer((_) async => Response(
                data: {
                  'learnerId': 'learner-1',
                  'functioningLevel': 'standard',
                  'useDyslexicFont': false,
                },
                statusCode: 200,
                requestOptions: RequestOptions(path: ''),
              ),);

      final settings = await repo.getSettings('learner-1');

      expect(settings['functioningLevel'], 'standard');
    });
  });
}
