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

  Recommendation _createRecommendation({
    String status = 'pending',
    String type = 'accommodation',
  }) {
    return Recommendation(
      id: 'rec-1',
      learnerId: 'learner-1',
      type: type,
      title: 'Extra Time on Tests',
      description: 'Provide 50% extra time for timed assessments',
      rationale: 'Based on processing speed assessment results',
      status: status,
      createdAt: DateTime.parse('2025-03-01T10:00:00.000Z'),
    );
  }

  Widget buildApp(Recommendation rec, {VoidCallback? onUpdated}) {
    return ProviderScope(
      overrides: [
        familyRepositoryProvider.overrideWithValue(mockFamilyRepo),
      ],
      child: MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: RecommendationCard(
              recommendation: rec,
              onUpdated: onUpdated,
            ),
          ),
        ),
      ),
    );
  }

  group('RecommendationCard', () {
    testWidgets('renders title and description', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation()));
      await tester.pumpAndSettle();

      expect(find.text('Extra Time on Tests'), findsOneWidget);
      expect(
        find.text('Provide 50% extra time for timed assessments'),
        findsOneWidget,
      );
    });

    testWidgets('renders type badge', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation(type: 'accommodation')));
      await tester.pumpAndSettle();

      expect(find.text('Accommodation'), findsOneWidget);
    });

    testWidgets('shows action buttons for pending status', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation(status: 'pending')));
      await tester.pumpAndSettle();

      expect(find.text('Approve'), findsOneWidget);
      expect(find.text('Decline'), findsOneWidget);
      expect(find.text('Adjust'), findsOneWidget);
    });

    testWidgets('hides action buttons for approved status', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation(status: 'approved')));
      await tester.pumpAndSettle();

      expect(find.text('Approve'), findsNothing);
      expect(find.text('Decline'), findsNothing);
      expect(find.text('Adjust'), findsNothing);
    });

    testWidgets('shows status badge for non-pending items', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation(status: 'approved')));
      await tester.pumpAndSettle();

      expect(find.text('Approved'), findsOneWidget);
    });

    testWidgets('renders View rationale toggle', (tester) async {
      await tester.pumpWidget(buildApp(_createRecommendation()));
      await tester.pumpAndSettle();

      expect(find.text('View rationale'), findsOneWidget);

      // Tap to expand.
      await tester.tap(find.text('View rationale'));
      await tester.pumpAndSettle();

      expect(find.text('Hide rationale'), findsOneWidget);
      expect(
        find.text('Based on processing speed assessment results'),
        findsOneWidget,
      );
    });

    testWidgets('approve button calls repository', (tester) async {
      when(() => mockFamilyRepo.respondToRecommendation(
            any(),
            any(),
          )).thenAnswer((_) async {});

      bool updated = false;
      await tester.pumpWidget(buildApp(
        _createRecommendation(status: 'pending'),
        onUpdated: () => updated = true,
      ));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Approve'));
      await tester.pumpAndSettle();

      verify(() => mockFamilyRepo.respondToRecommendation('rec-1', 'approved'))
          .called(1);
      expect(updated, isTrue);
    });
  });
}
