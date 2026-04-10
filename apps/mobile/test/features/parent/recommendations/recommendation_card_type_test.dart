import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/data/models/recommendation.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';
import 'package:aivo_mobile/features/parent/recommendations/recommendation_card.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockFamilyRepository extends Mock implements FamilyRepository {}

void main() {
  late MockFamilyRepository mockFamilyRepo;

  setUp(() {
    mockFamilyRepo = MockFamilyRepository();
  });

  Recommendation createRec({
    required String type,
    String title = 'Test Recommendation',
    String description = 'Test description',
    Map<String, dynamic>? payload,
  }) {
    return Recommendation(
      id: 'rec-1',
      learnerId: 'learner-1',
      type: type,
      title: title,
      description: description,
      rationale: 'Test rationale',
      status: 'pending',
      payload: payload,
      createdAt: DateTime.parse('2025-03-01T10:00:00.000Z'),
    );
  }

  Widget buildApp(Recommendation rec) {
    return ProviderScope(
      overrides: [
        familyRepositoryProvider.overrideWithValue(mockFamilyRepo),
      ],
      child: MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: RecommendationCard(recommendation: rec),
          ),
        ),
      ),
    );
  }

  group('RecommendationCard contextual types', () {
    testWidgets('CURRICULUM_ADJUSTMENT shows tune icon and Learning Path label',
        (tester) async {
      await tester.pumpWidget(
          buildApp(createRec(type: 'CURRICULUM_ADJUSTMENT')),);
      await tester.pumpAndSettle();

      expect(find.text('Learning Path'), findsOneWidget);
      expect(find.byIcon(Icons.tune), findsOneWidget);
    });

    testWidgets('TUTOR_SUGGESTION shows school icon and Tutor Suggestion label',
        (tester) async {
      await tester
          .pumpWidget(buildApp(createRec(type: 'TUTOR_SUGGESTION')));
      await tester.pumpAndSettle();

      expect(find.text('Tutor Suggestion'), findsOneWidget);
      expect(find.byIcon(Icons.school), findsOneWidget);
    });

    testWidgets('IEP_GOAL_UPDATE shows flag icon and IEP Goal label',
        (tester) async {
      await tester.pumpWidget(buildApp(createRec(type: 'IEP_GOAL_UPDATE')));
      await tester.pumpAndSettle();

      expect(find.text('IEP Goal'), findsOneWidget);
      expect(find.byIcon(Icons.flag), findsOneWidget);
    });

    testWidgets(
        'ASSESSMENT_REBASELINE shows psychology icon and Brain Review label',
        (tester) async {
      await tester
          .pumpWidget(buildApp(createRec(type: 'ASSESSMENT_REBASELINE')));
      await tester.pumpAndSettle();

      expect(find.text('Brain Review'), findsOneWidget);
      expect(find.byIcon(Icons.psychology), findsOneWidget);
    });

    testWidgets(
        'REGRESSION_ALERT shows trending_down icon and Attention Needed label',
        (tester) async {
      await tester
          .pumpWidget(buildApp(createRec(type: 'REGRESSION_ALERT')));
      await tester.pumpAndSettle();

      expect(find.text('Attention Needed'), findsOneWidget);
      expect(find.byIcon(Icons.trending_down), findsOneWidget);
    });

    testWidgets('legacy accommodation type still works', (tester) async {
      await tester.pumpWidget(buildApp(createRec(type: 'accommodation')));
      await tester.pumpAndSettle();

      expect(find.text('Accommodation'), findsOneWidget);
      expect(find.byIcon(Icons.accessibility_new), findsOneWidget);
    });
  });

  group('RecommendationCard payload display', () {
    testWidgets('shows domain badge when payload contains domain',
        (tester) async {
      await tester.pumpWidget(buildApp(createRec(
        type: 'CURRICULUM_ADJUSTMENT',
        payload: {'domain': 'Mathematics'},
      ),),);
      await tester.pumpAndSettle();

      expect(find.text('Mathematics'), findsOneWidget);
    });

    testWidgets('no domain badge when payload is null', (tester) async {
      await tester.pumpWidget(
          buildApp(createRec(type: 'TUTOR_SUGGESTION', payload: null)),);
      await tester.pumpAndSettle();

      // Should not crash, just no Chip with domain
      expect(find.byIcon(Icons.subject), findsNothing);
    });
  });

  group('Recommendation model payload', () {
    test('fromJson parses payload field', () {
      final rec = Recommendation.fromJson({
        'id': 'r1',
        'learnerId': 'l1',
        'type': 'CURRICULUM_ADJUSTMENT',
        'title': 'Title',
        'description': 'Desc',
        'rationale': 'Reason',
        'status': 'pending',
        'payload': {'domain': 'Math', 'thetaScore': -0.5},
        'createdAt': '2025-03-01T10:00:00.000Z',
      });

      expect(rec.payload, isNotNull);
      expect(rec.payload!['domain'], 'Math');
      expect(rec.payload!['thetaScore'], -0.5);
    });

    test('fromJson handles missing payload', () {
      final rec = Recommendation.fromJson({
        'id': 'r1',
        'learnerId': 'l1',
        'type': 'accommodation',
        'title': 'Title',
        'description': 'Desc',
        'rationale': 'Reason',
        'status': 'pending',
        'createdAt': '2025-03-01T10:00:00.000Z',
      });

      expect(rec.payload, isNull);
    });

    test('toJson includes payload', () {
      final rec = Recommendation(
        id: 'r1',
        learnerId: 'l1',
        type: 'CURRICULUM_ADJUSTMENT',
        title: 'Title',
        description: 'Desc',
        rationale: 'Reason',
        status: 'pending',
        payload: {'domain': 'Math'},
        createdAt: DateTime.parse('2025-03-01T10:00:00.000Z'),
      );

      final json = rec.toJson();
      expect(json['payload'], {'domain': 'Math'});
    });
  });
}
