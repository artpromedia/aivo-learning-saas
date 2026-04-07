import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/features/learner/breaks/puzzle_break_screen.dart';

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
        home: PuzzleBreakScreen(
          onComplete: onComplete,
          xpAwardCallback: xpAwardCallback,
          durationSeconds: 60,
        ),
      ),
    );
  }

  group('PuzzleBreakScreen', () {
    testWidgets('renders match counter', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      // Standard mode: 6 pairs
      expect(find.textContaining('Matches:'), findsOneWidget);
    });

    testWidgets('renders I\'m Ready! button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.text("I'm Ready!"), findsOneWidget);
    });

    testWidgets('I\'m Ready! calls onComplete to skip', (tester) async {
      bool completed = false;
      await tester.pumpWidget(buildApp(onComplete: () => completed = true));
      await tester.pump();

      await tester.tap(find.text("I'm Ready!"));
      await tester.pumpAndSettle();

      expect(completed, true);
    });

    testWidgets('xpAwardCallback receives 10 on skip', (tester) async {
      int? xpReceived;
      await tester.pumpWidget(buildApp(
        xpAwardCallback: (xp) => xpReceived = xp,
        onComplete: () {},
      ));
      await tester.pump();

      await tester.tap(find.text("I'm Ready!"));
      await tester.pumpAndSettle();

      expect(xpReceived, 10);
    });

    testWidgets('lowVerbal shows fewer cards', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.lowVerbal));
      await tester.pump();

      // lowVerbal: 2 pairs = 4 cards. The match counter shows /2.
      expect(find.text('Matches: 0/2'), findsOneWidget);
    });

    testWidgets('standard shows 6 pairs', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.standard));
      await tester.pump();

      expect(find.text('Matches: 0/6'), findsOneWidget);
    });

    testWidgets('renders question mark icons for face-down cards',
        (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      // All cards start face down with question mark icons
      expect(find.byIcon(Icons.question_mark), findsAtLeast(1));
    });
  });
}
