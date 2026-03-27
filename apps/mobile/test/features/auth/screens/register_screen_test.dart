import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/features/auth/screens/register_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class _TestAuthNotifier extends AuthNotifier {
  _TestAuthNotifier(AuthState initialState)
      : _initialState = initialState,
        super(authService: _FakeAuthService());

  final AuthState _initialState;

  @override
  Future<void> checkAuth() async {
    state = _initialState;
  }
}

class _FakeAuthService extends Fake implements AuthService {
  @override
  Future<AuthUser?> getCurrentUser() async => null;
}

void main() {
  Widget buildApp({AuthState initialState = const AuthUnauthenticated()}) {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith(
          (ref) => _TestAuthNotifier(initialState),
        ),
      ],
      child: const MaterialApp(
        home: RegisterScreen(),
      ),
    );
  }

  group('RegisterScreen', () {
    testWidgets('renders all form fields', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Confirm Password'), findsOneWidget);
    });

    testWidgets('renders Create Account button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Create Account'), findsAtLeast(1));
    });

    testWidgets('renders role selection segment', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Parent'), findsOneWidget);
      expect(find.text('Teacher'), findsOneWidget);
    });

    testWidgets('shows validation errors for empty fields', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // Find and tap the Create Account button (ElevatedButton).
      final buttons = find.byType(ElevatedButton);
      await tester.tap(buttons.last);
      await tester.pumpAndSettle();

      expect(find.text('Name is required'), findsOneWidget);
      expect(find.text('Email is required'), findsOneWidget);
      expect(find.text('Password is required'), findsOneWidget);
    });

    testWidgets('shows password mismatch error', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // Enter all fields.
      final fields = find.byType(TextFormField);
      await tester.enterText(fields.at(0), 'Test User');
      await tester.enterText(fields.at(1), 'test@example.com');
      await tester.enterText(fields.at(2), 'password123');
      await tester.enterText(fields.at(3), 'different');

      final buttons = find.byType(ElevatedButton);
      await tester.tap(buttons.last);
      await tester.pumpAndSettle();

      expect(find.text('Passwords do not match'), findsOneWidget);
    });

    testWidgets('displays error banner from AuthError state', (tester) async {
      await tester.pumpWidget(buildApp(
        initialState: const AuthError('Email already registered'),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Email already registered'), findsOneWidget);
    });

    testWidgets('renders Sign in link', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Sign in'), findsOneWidget);
      expect(find.text('Already have an account?'), findsOneWidget);
    });

    testWidgets('shows password length validation', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      final fields = find.byType(TextFormField);
      await tester.enterText(fields.at(0), 'Test');
      await tester.enterText(fields.at(1), 'test@example.com');
      await tester.enterText(fields.at(2), 'short');
      await tester.enterText(fields.at(3), 'short');

      final buttons = find.byType(ElevatedButton);
      await tester.tap(buttons.last);
      await tester.pumpAndSettle();

      expect(find.text('Password must be at least 8 characters'), findsOneWidget);
    });
  });
}
