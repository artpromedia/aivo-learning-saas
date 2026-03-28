import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/features/learner/home/learner_home_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class _TestAuthNotifier extends AuthNotifier {
  _TestAuthNotifier()
      : super(authService: _FakeAuthService());

  @override
  Future<void> checkAuth() async {
    state = const AuthAuthenticated(AuthUser(
      id: 'user-1',
      email: 'learner@example.com',
      name: 'Test Learner',
      role: 'learner',
      learnerId: 'learner-1',
    ));
  }
}

class _FakeAuthService extends Fake implements AuthService {
  @override
  Future<AuthUser?> getCurrentUser() async => null;
}

void main() {
  late MockApiClient mockApi;

  setUp(() {
    mockApi = MockApiClient();
    when(() => mockApi.get(any())).thenThrow(
      DioException(requestOptions: RequestOptions(path: '')),
    );
  });

  Widget buildApp({
    bool isOnline = true,
    FunctioningLevel level = FunctioningLevel.standard,
  }) {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith((ref) => _TestAuthNotifier()),
        apiClientProvider.overrideWithValue(mockApi),
        isOnlineProvider.overrideWithValue(isOnline),
        functioningLevelProvider.overrideWith(
          (ref) => _FixedLevelNotifier(level),
        ),
        isLowVerbalOrBelowProvider.overrideWithValue(
          level.index >= FunctioningLevel.lowVerbal.index,
        ),
        isNonVerbalOrBelowProvider.overrideWithValue(
          level.index >= FunctioningLevel.nonVerbal.index,
        ),
        isPreSymbolicProvider.overrideWithValue(
          level == FunctioningLevel.preSymbolic,
        ),
      ],
      child: const MaterialApp(
        home: LearnerHomeScreen(),
      ),
    );
  }

  group('LearnerHomeScreen', () {
    testWidgets('renders bottom navigation bar', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(BottomNavigationBar), findsOneWidget);
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Quests'), findsOneWidget);
      expect(find.text('Tutors'), findsOneWidget);
      expect(find.text('Profile'), findsOneWidget);
    });

    testWidgets('shows offline banner when offline', (tester) async {
      await tester.pumpWidget(buildApp(isOnline: false));
      await tester.pump();

      expect(
        find.textContaining('offline'),
        findsAtLeast(1),
      );
    });

    testWidgets('does not show offline banner when online', (tester) async {
      await tester.pumpWidget(buildApp(isOnline: true));
      await tester.pump();

      // The _OfflineBanner widget should not be in the tree.
      expect(
        find.text('You are offline. Changes will sync when reconnected.'),
        findsNothing,
      );
    });

    testWidgets('shows parent-only mode for preSymbolic level', (tester) async {
      await tester.pumpWidget(buildApp(level: FunctioningLevel.preSymbolic));
      await tester.pump();

      expect(find.text('Parent-Only Mode'), findsOneWidget);
    });

    testWidgets('renders Scaffold with SafeArea', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(Scaffold), findsOneWidget);
      expect(find.byType(SafeArea), findsAtLeast(1));
    });
  });
}

class _FixedLevelNotifier extends FunctioningLevelNotifier {
  _FixedLevelNotifier(FunctioningLevel level)
      : super(storage: _NoopStorage()) {
    state = level;
  }
}

class _NoopStorage extends Fake implements FlutterSecureStorage {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #read) {
      return Future<String?>.value(null);
    }
    if (invocation.memberName == #write) {
      return Future<void>.value();
    }
    return super.noSuchMethod(invocation);
  }
}
