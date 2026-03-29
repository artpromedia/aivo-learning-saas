import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/shared/widgets/aivo_button.dart';

void main() {
  Widget buildApp(
    Widget child, {
    bool isLowVerbal = false,
  }) {
    return ProviderScope(
      overrides: [
        isLowVerbalOrBelowProvider.overrideWithValue(isLowVerbal),
      ],
      child: MaterialApp(
        home: Scaffold(body: Center(child: child)),
      ),
    );
  }

  group('AivoButton', () {
    testWidgets('renders primary variant with label', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Submit',
          onPressed: () {},
          variant: AivoButtonVariant.primary,
        ),
      ),);

      expect(find.text('Submit'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('renders secondary variant', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Cancel',
          onPressed: () {},
          variant: AivoButtonVariant.secondary,
        ),
      ),);

      expect(find.text('Cancel'), findsOneWidget);
    });

    testWidgets('renders outlined variant', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Outline',
          onPressed: () {},
          variant: AivoButtonVariant.outlined,
        ),
      ),);

      expect(find.text('Outline'), findsOneWidget);
    });

    testWidgets('renders text variant', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Text Button',
          onPressed: () {},
          variant: AivoButtonVariant.text,
        ),
      ),);

      expect(find.text('Text Button'), findsOneWidget);
    });

    testWidgets('renders danger variant', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Delete',
          onPressed: () {},
          variant: AivoButtonVariant.danger,
        ),
      ),);

      expect(find.text('Delete'), findsOneWidget);
    });

    testWidgets('shows loading spinner when isLoading', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Loading',
          onPressed: () {},
          isLoading: true,
        ),
      ),);

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      // Label text should not be visible when loading.
      expect(find.text('Loading'), findsNothing);
    });

    testWidgets('onPressed not called when disabled', (tester) async {
      var tapped = false;
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Disabled',
          onPressed: () => tapped = true,
          isDisabled: true,
        ),
      ),);

      await tester.tap(find.byType(ElevatedButton));
      expect(tapped, isFalse);
    });

    testWidgets('onPressed not called when loading', (tester) async {
      var tapped = false;
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Loading',
          onPressed: () => tapped = true,
          isLoading: true,
        ),
      ),);

      await tester.tap(find.byType(ElevatedButton));
      expect(tapped, isFalse);
    });

    testWidgets('calls onPressed when tapped', (tester) async {
      var tapped = false;
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Tap Me',
          onPressed: () => tapped = true,
        ),
      ),);

      await tester.tap(find.byType(ElevatedButton));
      expect(tapped, isTrue);
    });

    testWidgets('renders icon when provided', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Add',
          onPressed: () {},
          icon: Icons.add,
        ),
      ),);

      expect(find.byIcon(Icons.add), findsOneWidget);
      expect(find.text('Add'), findsOneWidget);
    });

    testWidgets('has semantics label', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Custom',
          onPressed: () {},
          semanticsLabel: 'Custom action button',
        ),
      ),);

      expect(
        find.bySemanticsLabel('Custom action button'),
        findsOneWidget,
      );
    });

    testWidgets('adjusts size for low verbal mode', (tester) async {
      await tester.pumpWidget(buildApp(
        AivoButton(
          label: 'Big Button',
          onPressed: () {},
          size: AivoButtonSize.medium,
        ),
        isLowVerbal: true,
      ),);

      // Button should be rendered (exact size depends on constraints).
      expect(find.text('Big Button'), findsOneWidget);
    });
  });
}
