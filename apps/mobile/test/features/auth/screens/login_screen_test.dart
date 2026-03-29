import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/core/auth/biometric_auth.dart';
import 'package:aivo_mobile/features/auth/screens/login_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockAuthService extends Mock implements AuthService {}

class MockBiometricAuthService extends Mock implements BiometricAuthService {}

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
  late MockBiometricAuthService mockBiometric;

  setUp(() {
    mockBiometric = MockBiometricAuthService();
    when(() => mockBiometric.isBiometricEnabled())
        .thenAnswer((_) async => false);
    when(() => mockBiometric.isAvailable())
        .thenAnswer((_) async => false);
  });

  Widget buildApp({AuthState initialState = const AuthUnauthenticated()}) {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith(
          (ref) => _TestAuthNotifier(initialState),
        ),
        biometricAuthProvider.overrideWithValue(mockBiometric),
      ],
      child: const MaterialApp(
        home: LoginScreen(),
      ),
    );
  }

  group('LoginScreen', () {
    testWidgets('renders email and password fields', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.byType(TextFormField), findsAtLeast(2));
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
    });

    testWidgets('renders login button', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Login'), findsOneWidget);
    });

    testWidgets('renders Welcome Back header', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Welcome Back'), findsOneWidget);
    });

    testWidgets('shows validation error for empty email', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // Tap login without entering anything.
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Email is required'), findsOneWidget);
    });

    testWidgets('shows validation error for empty password', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      // Enter email but leave password empty.
      await tester.enterText(
        find.byType(TextFormField).first,
        'test@example.com',
      );
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Password is required'), findsOneWidget);
    });

    testWidgets('shows validation error for invalid email format', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byType(TextFormField).first,
        'not-an-email',
      );
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Enter a valid email address'), findsOneWidget);
    });

    testWidgets('displays error message from AuthError state', (tester) async {
      await tester.pumpWidget(buildApp(
        initialState: const AuthError('Invalid credentials'),
      ),);
      await tester.pumpAndSettle();

      expect(find.text('Invalid credentials'), findsOneWidget);
    });

    testWidgets('shows loading indicator during AuthLoading', (tester) async {
      await tester.pumpWidget(buildApp(
        initialState: const AuthLoading(),
      ),);
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders Create account link', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Create account'), findsOneWidget);
    });

    testWidgets('renders Forgot password link', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pumpAndSettle();

      expect(find.text('Forgot password?'), findsOneWidget);
    });
  });
}
