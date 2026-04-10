import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/features/learner/breaks/music_break_screen.dart';

void main() {
  Widget buildApp({
    VoidCallback? onComplete,
    ValueChanged<int>? xpAwardCallback,
    int durationSeconds = 10,
  }) {
    return ProviderScope(
      overrides: [
        functioningLevelProvider.overrideWith(
          (ref) => FunctioningLevelNotifier()..setLevel(FunctioningLevel.standard),
        ),
      ],
      child: MaterialApp(
        home: MusicBreakScreen(
          onComplete: onComplete,
          xpAwardCallback: xpAwardCallback,
          durationSeconds: durationSeconds,
        ),
      ),
    );
  }

  group('MusicBreakScreen', () {
    testWidgets('renders Calm Melody header', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.text('Calm Melody'), findsOneWidget);
    });

    testWidgets('renders I\'m Ready! button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.text("I'm Ready!"), findsOneWidget);
    });

    testWidgets('tapping I\'m Ready! calls onComplete', (tester) async {
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

    testWidgets('renders music note icon', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byIcon(Icons.music_note), findsAtLeast(1));
    });
  });
}
