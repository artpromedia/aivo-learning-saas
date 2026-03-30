import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _learnersProvider =
    FutureProvider.autoDispose<List<Learner>>((ref) async {
  final repo = ref.watch(familyRepositoryProvider);
  final rawLearners = await repo.getLearners();
  return rawLearners.map((m) => Learner.fromJson(m)).toList();
});

final _dashboardFutureProvider =
    FutureProvider.autoDispose<DashboardSummary>((ref) async {
  final learners = await ref.watch(_learnersProvider.future);
  var totalTime = 0;
  var totalLessons = 0;
  for (final l in learners) {
    totalTime += l.timeSpentTodayMinutes;
    totalLessons += l.lessonsCompletedToday;
  }
  return DashboardSummary(
    totalLearningTimeMinutes: totalTime,
    totalLessonsCompleted: totalLessons,
    unreadNotifications: 0,
    learners: learners,
  );
});

final _selectedNavIndexProvider = StateProvider<int>((_) => 0);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ParentDashboardScreen extends ConsumerWidget {
  const ParentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final navIndex = ref.watch(_selectedNavIndexProvider);

    return Scaffold(
      body: IndexedStack(
        index: navIndex,
        children: const [
          _DashboardTab(),
          _RecommendationsNavTab(),
          _BrainNavTab(),
          _SettingsNavTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navIndex,
        onTap: (i) => ref.read(_selectedNavIndexProvider.notifier).state = i,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.recommend_outlined),
            activeIcon: Icon(Icons.recommend),
            label: 'Recommendations',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_outlined),
            activeIcon: Icon(Icons.psychology),
            label: 'Brain',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
      floatingActionButton: navIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () => context.go('/onboarding/add-child'),
              icon: const Icon(Icons.person_add),
              label: const Text('Add Child'),
              tooltip: 'Add a new child',
            )
          : null,
    );
  }
}

// ---------------------------------------------------------------------------
// Dashboard tab (main content)
// ---------------------------------------------------------------------------

class _DashboardTab extends ConsumerWidget {
  const _DashboardTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncSummary = ref.watch(_dashboardFutureProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Family Dashboard'),
        actions: [
          _NotificationBell(),
        ],
      ),
      body: asyncSummary.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _ErrorBody(
          message: 'Failed to load dashboard',
          onRetry: () => ref.invalidate(_learnersProvider),
        ),
        data: (summary) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(_learnersProvider);
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              // Summary stats
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: _SummaryStatCard(
                        icon: Icons.timer_outlined,
                        label: 'Learning Today',
                        value: '${summary.totalLearningTimeMinutes} min',
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _SummaryStatCard(
                        icon: Icons.check_circle_outline,
                        label: 'Lessons Done',
                        value: '${summary.totalLessonsCompleted}',
                        color: AivoColors.secondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Children header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Semantics(
                  header: true,
                  child: Text(
                    'Your Children',
                    style: theme.textTheme.titleLarge,
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Children cards
              if (summary.learners.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.child_care,
                            size: 64,
                            color: colorScheme.outlineVariant,),
                        const SizedBox(height: 16),
                        Text(
                          'No children added yet',
                          style: theme.textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap the "Add Child" button to get started',
                          style: theme.textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                )
              else
                ...summary.learners.map(
                  (learner) => _ChildCard(learner: learner),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Notification bell with unread count
// ---------------------------------------------------------------------------

class _NotificationBell extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final userId = authState is AuthAuthenticated ? authState.user.id : '';

    final asyncCount = ref.watch(
      FutureProvider.autoDispose<int>((ref) async {
        if (userId.isEmpty) return 0;
        return ref
            .watch(familyRepositoryProvider)
            .getUnreadNotificationCount(userId);
      }),
    );

    final count = asyncCount.valueOrNull ?? 0;

    return Semantics(
      label: count > 0
          ? '$count unread notifications'
          : 'Notifications',
      button: true,
      child: IconButton(
        icon: Badge(
          isLabelVisible: count > 0,
          label: Text(
            count > 99 ? '99+' : '$count',
            style: const TextStyle(fontSize: 10),
          ),
          child: const Icon(Icons.notifications_outlined),
        ),
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Notifications coming soon')),
          );
        },
        tooltip: 'Notifications',
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Child card
// ---------------------------------------------------------------------------

class _ChildCard extends StatelessWidget {
  const _ChildCard({required this.learner});

  final Learner learner;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      button: true,
      label: '${learner.name}, streak ${learner.streak} days, '
          '${learner.lessonsCompletedToday} lessons today',
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.go('/parent/child/${learner.id}'),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 28,
                  backgroundColor: colorScheme.primaryContainer,
                  backgroundImage: learner.avatarUrl != null
                      ? NetworkImage(learner.avatarUrl!)
                      : null,
                  child: learner.avatarUrl == null
                      ? Text(
                          learner.name.isNotEmpty
                              ? learner.name[0].toUpperCase()
                              : '?',
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: colorScheme.onPrimaryContainer,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 16),

                // Name + progress
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              learner.name,
                              style: theme.textTheme.titleMedium,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _FunctioningLevelBadge(
                            level: learner.functioningLevel,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${learner.lessonsCompletedToday} lessons '
                        '${learner.timeSpentTodayMinutes} min today',
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: learner.masteryProgress.clamp(0.0, 1.0),
                          minHeight: 6,
                          semanticsLabel: 'Mastery progress '
                              '${(learner.masteryProgress * 100).toInt()}%',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),

                // Streak
                Column(
                  children: [
                    const Icon(Icons.local_fire_department,
                        color: AivoColors.streakFlame, size: 24,),
                    Text(
                      '${learner.streak}',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: AivoColors.streakFlame,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Functioning level badge
// ---------------------------------------------------------------------------

class _FunctioningLevelBadge extends StatelessWidget {
  const _FunctioningLevelBadge({required this.level});
  final String level;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color badgeColor;
    String label;
    switch (level.toLowerCase()) {
      case 'level_1':
      case 'significant_support':
        badgeColor = AivoColors.error;
        label = 'L1';
      case 'level_2':
      case 'moderate_support':
        badgeColor = AivoColors.accent;
        label = 'L2';
      case 'level_3':
      case 'standard':
        badgeColor = AivoColors.secondary;
        label = 'L3';
      case 'level_4':
      case 'advanced':
        badgeColor = AivoColors.primary;
        label = 'L4';
      default:
        badgeColor = theme.colorScheme.outline;
        label = level.length > 3 ? level.substring(0, 3) : level;
    }

    return Semantics(
      label: 'Functioning level $level',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: badgeColor.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: badgeColor, width: 1),
        ),
        child: Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: badgeColor,
            fontWeight: FontWeight.w600,
            fontSize: 10,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------

class _SummaryStatCard extends StatelessWidget {
  const _SummaryStatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(color: color),
            ),
            const SizedBox(height: 2),
            Text(label, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Navigation tab placeholders that redirect
// ---------------------------------------------------------------------------

class _RecommendationsNavTab extends StatelessWidget {
  const _RecommendationsNavTab();

  @override
  Widget build(BuildContext context) {
    // Redirect immediately to the recommendations screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) {
        context.go('/parent/recommendations');
      }
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class _BrainNavTab extends ConsumerWidget {
  const _BrainNavTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncLearners = ref.watch(_learnersProvider);
    final learners = asyncLearners.valueOrNull ?? [];

    if (learners.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('Add a child to view their brain profile')),
      );
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) {
        context.go('/parent/brain/${learners.first.id}');
      }
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class _SettingsNavTab extends StatelessWidget {
  const _SettingsNavTab();

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) {
        context.go('/parent/settings');
      }
    });
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

// ---------------------------------------------------------------------------
// Error body
// ---------------------------------------------------------------------------

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline,
                size: 48, color: theme.colorScheme.error,),
            const SizedBox(height: 16),
            Text(message, style: theme.textTheme.bodyLarge),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
