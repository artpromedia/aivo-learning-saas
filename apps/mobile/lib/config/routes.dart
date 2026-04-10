import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/features/onboarding/screens/add_child_screen.dart';
import 'package:aivo_mobile/features/onboarding/screens/assessment_complete_screen.dart';
import 'package:aivo_mobile/features/onboarding/screens/baseline_assessment_screen.dart';
import 'package:aivo_mobile/features/onboarding/screens/brain_reveal_screen.dart';
import 'package:aivo_mobile/features/onboarding/screens/parent_assessment_screen.dart';
import 'package:aivo_mobile/features/learner/home/learner_home_screen.dart';
import 'package:aivo_mobile/features/learner/pin/pin_gate_screen.dart';
import 'package:aivo_mobile/features/parent/brain/brain_profile_screen.dart';
import 'package:aivo_mobile/features/parent/brain/functioning_level_screen.dart';
import 'package:aivo_mobile/features/parent/dashboard/parent_dashboard_screen.dart';
import 'package:aivo_mobile/features/parent/dashboard/child_detail_screen.dart';
import 'package:aivo_mobile/features/parent/recommendations/recommendation_list_screen.dart';
import 'package:aivo_mobile/features/parent/settings/family_settings_screen.dart';
import 'package:aivo_mobile/features/parent/gradebook/gradebook_screen.dart';
import 'package:aivo_mobile/features/parent/sessions/sessions_history_screen.dart';
import 'package:aivo_mobile/features/parent/collaboration/collaboration_screen.dart';
import 'package:aivo_mobile/features/teacher/dashboard/teacher_dashboard_screen.dart';
import 'package:aivo_mobile/features/teacher/classroom_detail/classroom_detail_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_hub_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_brain_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_accommodations_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_iep_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_gradebook_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_sessions_screen.dart';
import 'package:aivo_mobile/features/teacher/learner_detail/teacher_learner_family_screen.dart';
import 'package:aivo_mobile/features/teacher/reports/teacher_reports_screen.dart';
import 'package:aivo_mobile/features/teacher/settings/teacher_settings_screen.dart';
import 'package:aivo_mobile/features/caregiver/dashboard/caregiver_dashboard_screen.dart';
import 'package:aivo_mobile/features/caregiver/brain/caregiver_brain_screen.dart';
import 'package:aivo_mobile/features/caregiver/accommodations/caregiver_accommodations_screen.dart';
import 'package:aivo_mobile/features/caregiver/iep/caregiver_iep_screen.dart';
import 'package:aivo_mobile/features/caregiver/gradebook/caregiver_gradebook_screen.dart';
import 'package:aivo_mobile/features/caregiver/sessions/caregiver_sessions_screen.dart';
import 'package:aivo_mobile/features/notifications/notifications_screen.dart';

enum UserRole { learner, parent, teacher, caregiver }

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

class _Placeholder extends StatelessWidget {
  const _Placeholder(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(label)),
      body: Center(child: Text(label, style: Theme.of(context).textTheme.headlineSmall)),
    );
  }
}

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

      const publicPaths = ['/login', '/register', '/forgot-password'];
      final bool isPublic = publicPaths.contains(location);

      if (!loggedIn && !isPublic) {
        return '/login';
      }

      if (loggedIn && isPublic) {
        if (!authState.hasCompletedOnboarding) {
          return '/onboarding/add-child';
        }
        return _defaultRouteForRole(authState.role);
      }

      if (loggedIn && !authState.hasCompletedOnboarding && !location.startsWith('/onboarding')) {
        return '/onboarding/add-child';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', name: 'login', builder: (_, __) => const _Placeholder('Login')),
      GoRoute(path: '/register', name: 'register', builder: (_, __) => const _Placeholder('Register')),
      GoRoute(path: '/forgot-password', name: 'forgot-password', builder: (_, __) => const _Placeholder('Forgot Password')),

      GoRoute(path: '/onboarding/add-child', name: 'onboarding-add-child', builder: (_, __) => const AddChildScreen()),
      GoRoute(path: '/onboarding/assessment', name: 'onboarding-assessment', builder: (_, __) => const ParentAssessmentScreen()),
      GoRoute(path: '/onboarding/iep-upload', name: 'onboarding-iep-upload', builder: (_, __) => const _Placeholder('IEP Upload')),
      GoRoute(path: '/onboarding/baseline', name: 'onboarding-baseline', builder: (_, __) => const BaselineAssessmentScreen()),
      GoRoute(path: '/onboarding/assessment-complete', name: 'onboarding-assessment-complete', builder: (_, __) => const AssessmentCompleteScreen()),
      GoRoute(path: '/onboarding/brain-reveal', name: 'onboarding-brain-reveal', builder: (_, __) => const BrainRevealScreen()),

      GoRoute(path: '/learner/pin/:learnerId', name: 'learner-pin-gate', builder: (_, state) => PinGateScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/learner/home', name: 'learner-home', builder: (_, __) => const LearnerHomeScreen()),
      GoRoute(path: '/learner/session/:id', name: 'learner-session', builder: (_, state) => _Placeholder('Session ${state.pathParameters['id']}')),
      GoRoute(path: '/learner/quiz/:id', name: 'learner-quiz', builder: (_, state) => _Placeholder('Quiz ${state.pathParameters['id']}')),
      GoRoute(path: '/learner/tutors', name: 'learner-tutors', builder: (_, __) => const _Placeholder('AI Tutors')),
      GoRoute(path: '/learner/tutors/chat/:id', name: 'learner-tutor-chat', builder: (_, state) => _Placeholder('Tutor Chat ${state.pathParameters['id']}')),
      GoRoute(path: '/learner/tutors/store', name: 'learner-tutor-store', builder: (_, __) => const _Placeholder('Tutor Store')),
      GoRoute(path: '/learner/homework', name: 'learner-homework', builder: (_, __) => const _Placeholder('Homework')),
      GoRoute(path: '/learner/homework/camera', name: 'learner-homework-camera', builder: (_, __) => const _Placeholder('Homework Camera')),
      GoRoute(path: '/learner/homework/session/:id', name: 'learner-homework-session', builder: (_, state) => _Placeholder('Homework Session ${state.pathParameters['id']}')),
      GoRoute(path: '/learner/quests', name: 'learner-quests', builder: (_, __) => const _Placeholder('Quests')),
      GoRoute(path: '/learner/quests/:worldId/chapter/:chapterId', name: 'learner-quest-chapter', builder: (_, state) => _Placeholder('World ${state.pathParameters['worldId']} Chapter ${state.pathParameters['chapterId']}')),
      GoRoute(path: '/learner/badges', name: 'learner-badges', builder: (_, __) => const _Placeholder('Badges')),
      GoRoute(path: '/learner/shop', name: 'learner-shop', builder: (_, __) => const _Placeholder('Shop')),
      GoRoute(path: '/learner/avatar', name: 'learner-avatar', builder: (_, __) => const _Placeholder('Avatar')),
      GoRoute(path: '/learner/leaderboard', name: 'learner-leaderboard', builder: (_, __) => const _Placeholder('Leaderboard')),
      GoRoute(path: '/learner/challenges', name: 'learner-challenges', builder: (_, __) => const _Placeholder('Challenges')),
      GoRoute(path: '/learner/profile', name: 'learner-profile', builder: (_, __) => const _Placeholder('Learner Profile')),

      GoRoute(path: '/parent/dashboard', name: 'parent-dashboard', builder: (_, __) => const ParentDashboardScreen()),
      GoRoute(path: '/parent/child/:id', name: 'parent-child', builder: (_, state) => ChildDetailScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/parent/recommendations', name: 'parent-recommendations', builder: (_, __) => const RecommendationListScreen()),
      GoRoute(path: '/parent/brain/:learnerId', name: 'parent-brain', builder: (_, state) => BrainProfileScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/parent/functioning-level/:learnerId', name: 'parent-functioning-level', builder: (_, state) => FunctioningLevelScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/parent/iep/:learnerId', name: 'parent-iep', builder: (_, state) => _Placeholder('IEP ${state.pathParameters['learnerId']}')),
      GoRoute(path: '/parent/gradebook/:learnerId', name: 'parent-gradebook', builder: (_, state) => GradebookScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/parent/sessions/:learnerId', name: 'parent-sessions', builder: (_, state) => SessionsHistoryScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/parent/collaboration/:learnerId', name: 'parent-collaboration', builder: (_, state) => CollaborationScreen(learnerId: state.pathParameters['learnerId']!)),
      GoRoute(path: '/parent/settings', name: 'parent-settings', builder: (_, __) => const FamilySettingsScreen()),
      GoRoute(path: '/parent/notifications', name: 'parent-notifications', builder: (_, __) => const NotificationsScreen()),

      GoRoute(path: '/teacher/dashboard', name: 'teacher-dashboard', builder: (_, __) => const TeacherDashboardScreen()),
      GoRoute(path: '/teacher/classroom', name: 'teacher-classroom', builder: (_, __) => const TeacherDashboardScreen()),
      GoRoute(path: '/teacher/classroom/:id', name: 'teacher-classroom-detail', builder: (_, state) => ClassroomDetailScreen(classroomId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id', name: 'teacher-learner', builder: (_, state) => TeacherLearnerHubScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/brain', name: 'teacher-learner-brain', builder: (_, state) => TeacherLearnerBrainScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/accommodations', name: 'teacher-learner-accommodations', builder: (_, state) => TeacherLearnerAccommodationsScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/iep', name: 'teacher-learner-iep', builder: (_, state) => TeacherLearnerIepScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/gradebook', name: 'teacher-learner-gradebook', builder: (_, state) => TeacherLearnerGradebookScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/sessions', name: 'teacher-learner-sessions', builder: (_, state) => TeacherLearnerSessionsScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/learner/:id/family', name: 'teacher-learner-family', builder: (_, state) => TeacherLearnerFamilyScreen(learnerId: state.pathParameters['id']!)),
      GoRoute(path: '/teacher/reports', name: 'teacher-reports', builder: (_, __) => const TeacherReportsScreen()),
      GoRoute(path: '/teacher/settings', name: 'teacher-settings', builder: (_, __) => const TeacherSettingsScreen()),
      GoRoute(path: '/teacher/insight', name: 'teacher-insight', builder: (_, __) => const _Placeholder('Teacher Insights')),

      GoRoute(path: '/caregiver/dashboard', name: 'caregiver-dashboard', builder: (_, __) => const CaregiverDashboardScreen()),
      GoRoute(path: '/caregiver/brain', name: 'caregiver-brain', builder: (_, __) => const CaregiverBrainScreen()),
      GoRoute(path: '/caregiver/accommodations', name: 'caregiver-accommodations', builder: (_, __) => const CaregiverAccommodationsScreen()),
      GoRoute(path: '/caregiver/iep', name: 'caregiver-iep', builder: (_, __) => const CaregiverIepScreen()),
      GoRoute(path: '/caregiver/gradebook', name: 'caregiver-gradebook', builder: (_, __) => const CaregiverGradebookScreen()),
      GoRoute(path: '/caregiver/sessions', name: 'caregiver-sessions', builder: (_, __) => const CaregiverSessionsScreen()),

      GoRoute(path: '/notifications', name: 'notifications', builder: (_, __) => const NotificationsScreen()),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Page not found', style: Theme.of(context).textTheme.headlineSmall),
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

String _defaultRouteForRole(UserRole? role) {
  switch (role) {
    case UserRole.learner:
      return '/learner/home';
    case UserRole.parent:
      return '/parent/dashboard';
    case UserRole.teacher:
      return '/teacher/classroom';
    case UserRole.caregiver:
      return '/caregiver/dashboard';
    case null:
      return '/login';
  }
}
