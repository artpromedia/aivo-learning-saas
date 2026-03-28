import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';

void main() {
  group('LargeTouchWrapper', () {
    Widget buildApp({
      required FunctioningLevel level,
      Widget? child,
      VoidCallback? onTap,
    }) {
      return ProviderScope(
        overrides: [
          functioningLevelProvider.overrideWith(
            (ref) => _TestFunctioningLevelNotifier(level),
          ),
        ],
        child: MaterialApp(
          home: Scaffold(
            body: Center(
              child: LargeTouchWrapper(
                semanticLabel: 'Test button',
                onTap: onTap ?? () {},
                child: child ?? const Text('Tap me'),
              ),
            ),
          ),
        ),
      );
    }

    testWidgets('STANDARD level produces 48px minimum touch target',
        (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.standard));
      await tester.pumpAndSettle();

      final constrainedBox = tester.widget<ConstrainedBox>(
        find.byType(ConstrainedBox),
      );
      expect(constrainedBox.constraints.minWidth, 48.0);
      expect(constrainedBox.constraints.minHeight, 48.0);
    });

    testWidgets('SUPPORTED level produces 48px minimum touch target',
        (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.supported));
      await tester.pumpAndSettle();

      final constrainedBox = tester.widget<ConstrainedBox>(
        find.byType(ConstrainedBox),
      );
      expect(constrainedBox.constraints.minWidth, 48.0);
      expect(constrainedBox.constraints.minHeight, 48.0);
    });

    testWidgets('LOW_VERBAL level produces 80px minimum touch target',
        (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.lowVerbal));
      await tester.pumpAndSettle();

      final constrainedBox = tester.widget<ConstrainedBox>(
        find.byType(ConstrainedBox),
      );
      expect(constrainedBox.constraints.minWidth, 80.0);
      expect(constrainedBox.constraints.minHeight, 80.0);
    });

    testWidgets('NON_VERBAL level produces 80px minimum touch target',
        (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.nonVerbal));
      await tester.pumpAndSettle();

      final constrainedBox = tester.widget<ConstrainedBox>(
        find.byType(ConstrainedBox),
      );
      expect(constrainedBox.constraints.minWidth, 80.0);
      expect(constrainedBox.constraints.minHeight, 80.0);
    });

    testWidgets('PRE_SYMBOLIC level produces 80px minimum touch target',
        (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.preSymbolic));
      await tester.pumpAndSettle();

      final constrainedBox = tester.widget<ConstrainedBox>(
        find.byType(ConstrainedBox),
      );
      expect(constrainedBox.constraints.minWidth, 80.0);
      expect(constrainedBox.constraints.minHeight, 80.0);
    });

    testWidgets('all levels meet WCAG 2.5.8 minimum of 24px', (tester) async {
      for (final level in FunctioningLevel.values) {
        await tester.pumpWidget(buildApp(level: level));
        await tester.pumpAndSettle();

        final constrainedBox = tester.widget<ConstrainedBox>(
          find.byType(ConstrainedBox),
        );
        expect(
          constrainedBox.constraints.minWidth >= 24.0,
          true,
          reason: '$level should have minWidth >= 24px',
        );
        expect(
          constrainedBox.constraints.minHeight >= 24.0,
          true,
          reason: '$level should have minHeight >= 24px',
        );
      }
    });

    testWidgets('LOW_VERBAL level adds extra padding', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.lowVerbal));
      await tester.pumpAndSettle();

      final paddings = tester.widgetList<Padding>(find.byType(Padding));
      final hasPadding = paddings.any((p) {
        final insets = p.padding.resolve(TextDirection.ltr);
        return insets.left == 8.0 &&
            insets.right == 8.0 &&
            insets.top == 8.0 &&
            insets.bottom == 8.0;
      });
      expect(hasPadding, true);
    });

    testWidgets('onTap callback fires', (tester) async {
      var tapped = false;
      await tester.pumpWidget(
        buildApp(
          level: FunctioningLevel.standard,
          onTap: () => tapped = true,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Tap me'));
      expect(tapped, true);
    });
  });
}

class _TestFunctioningLevelNotifier extends FunctioningLevelNotifier {
  _TestFunctioningLevelNotifier(FunctioningLevel initial) : super() {
    state = initial;
  }
}
