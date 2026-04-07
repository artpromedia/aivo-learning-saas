import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/features/onboarding/screens/baseline_assessment_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class MockGoRouter extends Mock implements GoRouter {}

class _FakeAuthService extends Fake implements AuthService {
  @override
  Future<AuthUser?> getCurrentUser() async => null;
}

class _TestAuthNotifier extends AuthNotifier {
  _TestAuthNotifier() : super(authService: _FakeAuthService());

  @override
  Future<void> checkAuth() async {
    state = const AuthAuthenticated(AuthUser(
      id: 'learner-1',
      email: 'learner@example.com',
      name: 'Learner',
      role: 'learner',
      learnerId: 'learner-1',
    ));
  }
}

void main() {
  late MockApiClient mockApiClient;
  late MockGoRouter mockRouter;

  setUp(() {
    mockApiClient = MockApiClient();
    mockRouter = MockGoRouter();

    // API start call will fail → offline fallback
    when(() => mockApiClient.post(any(), data: any(named: 'data')))
        .thenThrow(Exception('offline'));
    when(() => mockRouter.go(any(), extra: any(named: 'extra')))
        .thenReturn(null);
  });

  Widget buildApp({
    FunctioningLevel level = FunctioningLevel.standard,
  }) {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith((ref) => _TestAuthNotifier()),
        apiClientProvider.overrideWithValue(mockApiClient),
        functioningLevelProvider.overrideWith(
          (ref) => FunctioningLevelNotifier()..setLevel(level),
        ),
      ],
      child: InheritedGoRouter(
        goRouter: mockRouter,
        child: const MaterialApp(
          home: BaselineAssessmentScreen(),
        ),
      ),
    );
  }

  group('Baseline assessment break integration', () {
    testWidgets('renders first question in standard mode', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // First standard question
      expect(find.text('Which number comes after 7?'), findsOneWidget);
    });

    testWidgets('shows offline banner when API unavailable', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.textContaining('Offline mode'), findsOneWidget);
    });

    testWidgets('timer displays in AppBar', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('0:00'), findsOneWidget);
    });

    testWidgets('progress bar is visible', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.byType(LinearProgressIndicator), findsOneWidget);
    });

    testWidgets('selecting an answer enables Continue button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // Tap answer "8"
      await tester.tap(find.text('8'));
      await tester.pumpAndSettle();

      // Continue button should now be enabled
      final continueButton = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Continue'),
      );
      expect(continueButton.onPressed, isNotNull);
    });

    testWidgets('no breaks in preSymbolic mode', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.preSymbolic));
      await tester.pumpAndSettle();

      // PreSymbolic shows observational checklist with Complete Assessment button
      expect(find.text('Complete Assessment'), findsOneWidget);
      // No break-related content
      expect(find.text('Time for a break!'), findsNothing);
    });

    testWidgets('Skip button is visible', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Skip'), findsOneWidget);
    });

    testWidgets('tapping Skip advances to next question', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Which number comes after 7?'), findsOneWidget);

      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Should now show second question
      expect(find.text('Which word rhymes with "cat"?'), findsOneWidget);
    });
  });
}
