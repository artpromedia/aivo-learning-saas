import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/shared/widgets/celebration_overlay.dart';

void main() {
  Widget buildApp({
    bool isLowVerbal = false,
  }) {
    return ProviderScope(
      overrides: [
        isLowVerbalOrBelowProvider.overrideWithValue(isLowVerbal),
      ],
      child: MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: () {
                  CelebrationOverlay.show(
                    context,
                    type: CelebrationType.lessonComplete,
                    message: 'Lesson Complete!',
                    xpEarned: 25,
                    playCelebrationSound: false,
                  );
                },
                child: const Text('Show Celebration'),
              ),
            ),
          ),
        ),
      ),
    );
  }

  group('CelebrationOverlay', () {
    testWidgets('displays message when shown', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Show Celebration'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));

      expect(find.text('Lesson Complete!'), findsOneWidget);
    });

    testWidgets('displays XP earned', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Show Celebration'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));

      // The XP counter animates, so at some point it should show a value.
      // After animation completes it should show +25 XP.
      await tester.pump(const Duration(seconds: 2));
      expect(find.textContaining('XP'), findsAtLeast(1));
    });

    testWidgets('shows tap to continue hint', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Show Celebration'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));

      expect(find.text('Tap to continue'), findsOneWidget);
    });
  });

  group('CelebrationType', () {
    test('all types exist', () {
      expect(CelebrationType.values, hasLength(6));
      expect(CelebrationType.values, contains(CelebrationType.lessonComplete));
      expect(CelebrationType.values, contains(CelebrationType.quizPerfect));
      expect(CelebrationType.values, contains(CelebrationType.levelUp));
      expect(CelebrationType.values, contains(CelebrationType.badgeEarned));
      expect(CelebrationType.values, contains(CelebrationType.streakExtended));
      expect(CelebrationType.values, contains(CelebrationType.purchase));
    });
  });
}
