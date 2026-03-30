import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockAuthService extends Mock implements AuthService {}

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  AuthNotifier createNotifier() {
    return AuthNotifier(authService: mockAuthService);
  }

  const testUser = AuthUser(
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'learner',
    learnerId: 'learner-1',
    functioningLevel: 'standard',
  );

  group('AuthNotifier', () {
    test('initial state transitions through AuthLoading then resolves', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);

      final notifier = createNotifier();

      // The constructor calls checkAuth() which sets AuthLoading first.
      // We need to let the future complete.
      await Future.delayed(Duration.zero);
      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('checkAuth sets AuthAuthenticated when valid user exists', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => testUser);

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      expect(notifier.state, isA<AuthAuthenticated>());
      final state = notifier.state as AuthAuthenticated;
      expect(state.user.id, 'user-1');
      expect(state.user.email, 'test@example.com');
    });

    test('checkAuth sets AuthUnauthenticated when no user', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('checkAuth sets AuthUnauthenticated on exception', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenThrow(Exception('Storage error'));

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('login success sets AuthAuthenticated', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);
      when(() => mockAuthService.login('test@example.com', 'password123'))
          .thenAnswer((_) async => testUser);

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      await notifier.login('test@example.com', 'password123');

      expect(notifier.state, isA<AuthAuthenticated>());
      final state = notifier.state as AuthAuthenticated;
      expect(state.user.email, 'test@example.com');
    });

    test('login failure sets AuthError with friendly message', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);
      when(() => mockAuthService.login('bad@example.com', 'wrong'))
          .thenThrow(Exception('Invalid credentials'));

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      await notifier.login('bad@example.com', 'wrong');

      expect(notifier.state, isA<AuthError>());
      final state = notifier.state as AuthError;
      expect(state.message, isNotEmpty);
    });

    test('register success sets AuthAuthenticated', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);
      when(() => mockAuthService.register(
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
            role: 'parent',
          ),).thenAnswer((_) async => testUser);

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      await notifier.register(
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'parent',
      );

      expect(notifier.state, isA<AuthAuthenticated>());
    });

    test('logout sets AuthUnauthenticated even when service throws', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => testUser);
      when(() => mockAuthService.logout()).thenThrow(Exception('Network error'));

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);
      expect(notifier.state, isA<AuthAuthenticated>());

      await notifier.logout();

      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('logout calls service logout and transitions to unauthenticated', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => testUser);
      when(() => mockAuthService.logout()).thenAnswer((_) async {});

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      await notifier.logout();

      verify(() => mockAuthService.logout()).called(1);
      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('forgotPassword returns to AuthUnauthenticated on success', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);
      when(() => mockAuthService.forgotPassword('test@example.com'))
          .thenAnswer((_) async {});

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      await notifier.forgotPassword('test@example.com');

      expect(notifier.state, isA<AuthUnauthenticated>());
      verify(() => mockAuthService.forgotPassword('test@example.com')).called(1);
    });

    test('forceLogout immediately sets AuthUnauthenticated', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => testUser);

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);
      expect(notifier.state, isA<AuthAuthenticated>());

      notifier.forceLogout();

      expect(notifier.state, isA<AuthUnauthenticated>());
    });

    test('login sets AuthLoading before completing', () async {
      when(() => mockAuthService.getCurrentUser())
          .thenAnswer((_) async => null);

      when(() => mockAuthService.login(any(), any()))
          .thenAnswer((_) async {
        return testUser;
      });

      final notifier = createNotifier();
      await Future.delayed(Duration.zero);

      // Before login completes, state should transition through AuthLoading.
      final loginFuture = notifier.login('test@example.com', 'pass');
      expect(notifier.state, isA<AuthLoading>());
      await loginFuture;
      expect(notifier.state, isA<AuthAuthenticated>());
    });
  });
}
