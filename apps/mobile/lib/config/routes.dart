import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// ---------------------------------------------------------------------------
// Auth state - minimal definition so routes.dart is self-contained.
// Replace with the canonical auth provider once core/auth is implemented.
// ---------------------------------------------------------------------------

enum UserRole { learner, parent, teacher }

class AuthState {
  const AuthState({
    this.isAuthenticated = false,
    this.role,
    this.hasCompletedOnboarding = false,
  });

  final bool isAuthenticated;
  final UserRole? role;
  final bool hasCompletedOnboarding;
}

final authProvider = StateProvider<AuthState>((_) => const AuthState());

// ---------------------------------------------------------------------------
// Placeholder screens - thin wrappers until feature screens are built.
// Each returns a Scaffold with its route name so navigation can be verified.
// ---------------------------------------------------------------------------

class _Placeholder extends StatelessWidget {
  const _Placeholder(this.label, {super.key});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(label)),
      body: Center(child: Text(label, style: Theme.of(context).textTheme.headlineSmall)),
    );
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    debugLogDiagnostics: true,
    initialLocation: '/login',
    redirect: (BuildContext context, GoRouterState state) {
      final bool loggedIn = authState.isAuthenticated;
      final String location = state.matchedLocation;

      // Public paths that never require auth.
      const publicPaths = ['/login', '/register', '/forgot-password'];
      final bool isPublic = publicPaths.contains(location);

      // If not logged in and trying to access a protected route, go to login.
      if (!loggedIn && !isPublic) {
        return '/login';
      }

      // If logged in but hitting a public page, redirect to role-appropriate home.
      if (loggedIn && isPublic) {
        if (!authState.hasCompletedOnboarding) {
          return '/onboarding/add-child';
        }
        return _defaultRouteForRole(authState.role);
      }

      // If logged in but onboarding is incomplete and not already on onboarding.
      if (loggedIn && !authState.hasCompletedOnboarding && !location.startsWith('/onboarding')) {
        return '/onboarding/add-child';
      }

      return null; // no redirect
    },
    routes: [
      // ---- Auth ----
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (_, __) => const _Placeholder('Login'),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (_, __) => const _Placeholder('Register'),
      ),
      GoRoute(
        path: '/forgot-password',
        name: 'forgot-password',
        builder: (_, __) => const _Placeholder('Forgot Password'),
      ),

      // ---- Onboarding ----
      GoRoute(
        path: '/onboarding/add-child',
        name: 'onboarding-add-child',
        builder: (_, __) => const _Placeholder('Add Child'),
      ),
      GoRoute(
        path: '/onboarding/assessment',
        name: 'onboarding-assessment',
        builder: (_, __) => const _Placeholder('Assessment'),
      ),
      GoRoute(
        path: '/onboarding/iep-upload',
        name: 'onboarding-iep-upload',
        builder: (_, __) => const _Placeholder('IEP Upload'),
      ),
      GoRoute(
        path: '/onboarding/baseline',
        name: 'onboarding-baseline',
        builder: (_, __) => const _Placeholder('Baseline'),
      ),
      GoRoute(
        path: '/onboarding/brain-reveal',
        name: 'onboarding-brain-reveal',
        builder: (_, __) => const _Placeholder('Brain Reveal'),
      ),

      // ---- Learner ----
      GoRoute(
        path: '/learner/home',
        name: 'learner-home',
        builder: (_, __) => const _Placeholder('Learner Home'),
      ),
      GoRoute(
        path: '/learner/session/:id',
        name: 'learner-session',
        builder: (_, state) => _Placeholder('Session ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/learner/quiz/:id',
        name: 'learner-quiz',
        builder: (_, state) => _Placeholder('Quiz ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/learner/tutors',
        name: 'learner-tutors',
        builder: (_, __) => const _Placeholder('AI Tutors'),
      ),
      GoRoute(
        path: '/learner/tutors/chat/:id',
        name: 'learner-tutor-chat',
        builder: (_, state) => _Placeholder('Tutor Chat ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/learner/tutors/store',
        name: 'learner-tutor-store',
        builder: (_, __) => const _Placeholder('Tutor Store'),
      ),
      GoRoute(
        path: '/learner/homework',
        name: 'learner-homework',
        builder: (_, __) => const _Placeholder('Homework'),
      ),
      GoRoute(
        path: '/learner/homework/camera',
        name: 'learner-homework-camera',
        builder: (_, __) => const _Placeholder('Homework Camera'),
      ),
      GoRoute(
        path: '/learner/homework/session/:id',
        name: 'learner-homework-session',
        builder: (_, state) => _Placeholder('Homework Session ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/learner/quests',
        name: 'learner-quests',
        builder: (_, __) => const _Placeholder('Quests'),
      ),
      GoRoute(
        path: '/learner/quests/:worldId/chapter/:chapterId',
        name: 'learner-quest-chapter',
        builder: (_, state) => _Placeholder(
          'World ${state.pathParameters['worldId']} '
          'Chapter ${state.pathParameters['chapterId']}',
        ),
      ),
      GoRoute(
        path: '/learner/badges',
        name: 'learner-badges',
        builder: (_, __) => const _Placeholder('Badges'),
      ),
      GoRoute(
        path: '/learner/shop',
        name: 'learner-shop',
        builder: (_, __) => const _Placeholder('Shop'),
      ),
      GoRoute(
        path: '/learner/avatar',
        name: 'learner-avatar',
        builder: (_, __) => const _Placeholder('Avatar'),
      ),
      GoRoute(
        path: '/learner/leaderboard',
        name: 'learner-leaderboard',
        builder: (_, __) => const _Placeholder('Leaderboard'),
      ),
      GoRoute(
        path: '/learner/challenges',
        name: 'learner-challenges',
        builder: (_, __) => const _Placeholder('Challenges'),
      ),
      GoRoute(
        path: '/learner/profile',
        name: 'learner-profile',
        builder: (_, __) => const _Placeholder('Learner Profile'),
      ),

      // ---- Parent ----
      GoRoute(
        path: '/parent/dashboard',
        name: 'parent-dashboard',
        builder: (_, __) => const _Placeholder('Parent Dashboard'),
      ),
      GoRoute(
        path: '/parent/child/:id',
        name: 'parent-child',
        builder: (_, state) => _Placeholder('Child ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/parent/recommendations',
        name: 'parent-recommendations',
        builder: (_, __) => const _Placeholder('Recommendations'),
      ),
      GoRoute(
        path: '/parent/brain/:learnerId',
        name: 'parent-brain',
        builder: (_, state) => _Placeholder('Brain Map ${state.pathParameters['learnerId']}'),
      ),
      GoRoute(
        path: '/parent/iep/:learnerId',
        name: 'parent-iep',
        builder: (_, state) => _Placeholder('IEP ${state.pathParameters['learnerId']}'),
      ),
      GoRoute(
        path: '/parent/settings',
        name: 'parent-settings',
        builder: (_, __) => const _Placeholder('Parent Settings'),
      ),

      // ---- Teacher ----
      GoRoute(
        path: '/teacher/classroom',
        name: 'teacher-classroom',
        builder: (_, __) => const _Placeholder('Classroom'),
      ),
      GoRoute(
        path: '/teacher/learner/:id',
        name: 'teacher-learner',
        builder: (_, state) => _Placeholder('Teacher Learner ${state.pathParameters['id']}'),
      ),
      GoRoute(
        path: '/teacher/insight',
        name: 'teacher-insight',
        builder: (_, __) => const _Placeholder('Teacher Insights'),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(state.matchedLocation),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/login'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

String _defaultRouteForRole(UserRole? role) {
  switch (role) {
    case UserRole.learner:
      return '/learner/home';
    case UserRole.parent:
      return '/parent/dashboard';
    case UserRole.teacher:
      return '/teacher/classroom';
    case null:
      return '/login';
  }
}
