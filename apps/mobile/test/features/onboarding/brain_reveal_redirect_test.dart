import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/features/onboarding/screens/brain_reveal_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockGoRouter extends Mock implements GoRouter {}

class MockApiClient extends Mock implements ApiClient {}

class _LearnerAuthNotifier extends AuthNotifier {
  @override
  AuthState build() {
    checkAuth();
    return const AuthInitial();
  }

  @override
  Future<void> checkAuth() async {
    state = const AuthAuthenticated(AuthUser(
      id: 'learner-1',
      email: 'learner@example.com',
      name: 'Test Learner',
      role: 'learner',
      learnerId: 'learner-1',
    ),);
  }
}

class _ParentAuthNotifier extends AuthNotifier {
  @override
  AuthState build() {
    checkAuth();
    return const AuthInitial();
  }

  @override
  Future<void> checkAuth() async {
    state = const AuthAuthenticated(AuthUser(
      id: 'parent-1',
      email: 'parent@example.com',
      name: 'Test Parent',
      role: 'parent',
    ),);
  }
}

void main() {
  late MockGoRouter mockRouter;
  late MockApiClient mockApiClient;

  setUp(() {
    mockRouter = MockGoRouter();
    mockApiClient = MockApiClient();
    when(() => mockRouter.go(any(), extra: any(named: 'extra')))
        .thenReturn(null);
  });

  Widget buildApp({required AuthNotifier Function() authNotifierBuilder}) {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith(authNotifierBuilder),
        apiClientProvider.overrideWithValue(mockApiClient),
      ],
      child: InheritedGoRouter(
        goRouter: mockRouter,
        child: const MaterialApp(
          home: BrainRevealScreen(),
        ),
      ),
    );
  }

  group('BrainRevealScreen role-aware buttons', () {
    testWidgets('learner role shows "Start Learning!" button', (tester) async {
      // The screen loads profile from API which will fail in test,
      // showing the error view with "Skip to Home" button.
      when(() => mockApiClient.get(any()))
          .thenThrow(Exception('test'));

      await tester.pumpWidget(
        buildApp(authNotifierBuilder: () => _LearnerAuthNotifier()),
      );
      await tester.pumpAndSettle();

      // Error view has "Skip to Home" button that calls _navigateToHome
      expect(find.text('Skip to Home'), findsOneWidget);

      // Tap Skip to Home and verify learner routing
      await tester.tap(find.text('Skip to Home'));
      await tester.pumpAndSettle();

      verify(() => mockRouter.go('/learner/home', extra: any(named: 'extra')))
          .called(1);
    });

    testWidgets('parent role navigates to dashboard on skip', (tester) async {
      when(() => mockApiClient.get(any()))
          .thenThrow(Exception('test'));

      await tester.pumpWidget(
        buildApp(authNotifierBuilder: () => _ParentAuthNotifier()),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Skip to Home'));
      await tester.pumpAndSettle();

      verify(() =>
              mockRouter.go('/parent/dashboard', extra: any(named: 'extra')),)
          .called(1);
    });
  });
}
