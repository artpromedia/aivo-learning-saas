import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/features/learner/breaks/game_break_screen.dart';

void main() {
  Widget buildApp({
    FunctioningLevel level = FunctioningLevel.standard,
    VoidCallback? onComplete,
    ValueChanged<int>? xpAwardCallback,
  }) {
    return ProviderScope(
      overrides: [
        functioningLevelProvider.overrideWith(
          (ref) => FunctioningLevelNotifier()..setLevel(level),
        ),
      ],
      child: MaterialApp(
        home: GameBreakScreen(
          onComplete: onComplete,
          xpAwardCallback: xpAwardCallback,
          durationSeconds: 10,
        ),
      ),
    );
  }

  group('GameBreakScreen', () {
    testWidgets('renders score counter', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.textContaining('Stars: 0'), findsOneWidget);
    });

    testWidgets('renders I\'m Ready! button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.text("I'm Ready!"), findsOneWidget);
    });

    testWidgets('I\'m Ready! calls onComplete', (tester) async {
      bool completed = false;
      await tester.pumpWidget(buildApp(onComplete: () => completed = true));
      await tester.pump();

      await tester.tap(find.text("I'm Ready!"));
      await tester.pumpAndSettle();

      expect(completed, true);
    });

    testWidgets('xpAwardCallback receives 5 on completion', (tester) async {
      int? xpReceived;
      await tester.pumpWidget(buildApp(
        xpAwardCallback: (xp) => xpReceived = xp,
        onComplete: () {},
      ),);
      await tester.pump();

      await tester.tap(find.text("I'm Ready!"));
      await tester.pumpAndSettle();

      expect(xpReceived, 5);
    });

    testWidgets('renders CustomPaint for bubble game', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      // After a frame, bubbles spawn and CustomPaint renders them
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.byType(CustomPaint), findsAtLeast(1));
    });

    testWidgets('renders with lowVerbal level without crash', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.lowVerbal));
      await tester.pump();

      expect(find.textContaining('Stars:'), findsOneWidget);
    });
  });
}
