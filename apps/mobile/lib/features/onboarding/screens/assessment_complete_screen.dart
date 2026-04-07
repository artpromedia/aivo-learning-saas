import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// AssessmentCompleteScreen
// ---------------------------------------------------------------------------

/// Shown between assessment submission and the brain reveal loading screen.
/// Gives the learner a brief celebration moment and an exit point.
class AssessmentCompleteScreen extends ConsumerWidget {
  const AssessmentCompleteScreen({
    super.key,
    this.questionsAnswered,
    this.durationDisplay,
  });

  /// Number of questions answered during the assessment.
  final int? questionsAnswered;

  /// Human-readable duration string, e.g. "3:24".
  final String? durationDisplay;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
          child: Column(
            children: [
              const Spacer(),

              // Celebration emoji
              const Text(
                '\u{1F389}', // 🎉
                style: TextStyle(fontSize: 72),
              ),
              const SizedBox(height: 24),

              Semantics(
                header: true,
                child: Text(
                  'Assessment Complete!',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Summary
              if (questionsAnswered != null || durationDisplay != null)
                Text(
                  _summaryText(),
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),

              const Spacer(),

              // Primary CTA — brain reveal
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/onboarding/brain-reveal'),
                  icon: const Icon(Icons.psychology),
                  label: const Text('See My Brain Profile'),
                ),
              ),
              const SizedBox(height: 8),

              // Secondary — go straight to home
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: () => _navigateToHome(context, ref),
                  child: const Text('Go to Dashboard'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  String _summaryText() {
    final parts = <String>[];
    if (questionsAnswered != null) {
      parts.add('You answered $questionsAnswered questions');
    }
    if (durationDisplay != null) {
      parts.add('in $durationDisplay');
    }
    return '${parts.join(' ')}. Great work!';
  }

  void _navigateToHome(BuildContext context, WidgetRef ref) {
    final authState = ref.read(authProvider);
    if (authState is AuthAuthenticated) {
      final role = authState.user.role.toLowerCase();
      switch (role) {
        case 'learner':
          context.go('/learner/home');
        case 'parent':
          context.go('/parent/dashboard');
        case 'teacher':
          context.go('/teacher/classroom');
        default:
          context.go('/parent/dashboard');
      }
    } else {
      context.go('/parent/dashboard');
    }
  }
}
