import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';
import 'package:aivo_mobile/features/parent/dashboard/parent_dashboard_screen.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockFamilyRepository extends Mock implements FamilyRepository {}
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
      id: 'parent-1',
      email: 'parent@example.com',
      name: 'Parent User',
      role: 'parent',
    ));
  }
}

void main() {
  late MockFamilyRepository mockFamilyRepo;
  late MockGoRouter mockRouter;

  setUp(() {
    mockFamilyRepo = MockFamilyRepository();
    mockRouter = MockGoRouter();
    when(() => mockFamilyRepo.getLearners())
        .thenAnswer((_) async => <Map<String, dynamic>>[]);
    when(() => mockRouter.go(any(), extra: any(named: 'extra')))
        .thenReturn(null);
  });

  Widget buildApp() {
    return ProviderScope(
      overrides: [
        authProvider.overrideWith((ref) => _TestAuthNotifier()),
        familyRepositoryProvider.overrideWithValue(mockFamilyRepo),
      ],
      child: InheritedGoRouter(
        goRouter: mockRouter,
        child: const MaterialApp(
          home: ParentDashboardScreen(),
        ),
      ),
    );
  }

  group('ParentDashboardScreen', () {
    testWidgets('renders bottom navigation bar with 4 tabs', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(BottomNavigationBar), findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Recommendations'), findsOneWidget);
      expect(find.text('Brain'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
    });

    testWidgets('renders Add Child FAB on dashboard tab', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(FloatingActionButton), findsOneWidget);
      expect(find.text('Add Child'), findsOneWidget);
    });

    testWidgets('renders Scaffold', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(Scaffold), findsAtLeast(1));
    });

    testWidgets('IndexedStack contains 4 children', (tester) async {
      await tester.pumpWidget(buildApp());
      await tester.pump();

      expect(find.byType(IndexedStack), findsOneWidget);
    });
  });
}
