import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/i18n/translation_ext.dart';
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
    final t = ref.t;

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
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard_outlined),
            activeIcon: const Icon(Icons.dashboard),
            label: t('dashboard.dashboard'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.recommend_outlined),
            activeIcon: const Icon(Icons.recommend),
            label: t('dashboard.recommendations'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.psychology_outlined),
            activeIcon: const Icon(Icons.psychology),
            label: t('brain.brainProfile'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.settings_outlined),
            activeIcon: const Icon(Icons.settings),
            label: t('settings.settings'),
          ),
        ],
      ),
      floatingActionButton: navIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () => context.go('/onboarding/add-child'),
              icon: const Icon(Icons.person_add),
              label: Text(t('dashboard.addChild')),
              tooltip: t('dashboard.addChild'),
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
    final t = ref.t;

    return Scaffold(
      appBar: AppBar(
        title: Text(t('dashboard.dashboard')),
        actions: [
          _NotificationBell(),
        ],
      ),
      body: asyncSummary.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _ErrorBody(
          message: t('dashboard.failedToLoadLearners'),
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
                        label: t('dashboard.learningToday'),
                        value: '${summary.totalLearningTimeMinutes} min',
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _SummaryStatCard(
                        icon: Icons.check_circle_outline,
                        label: t('dashboard.lessonsDone'),
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
                    t('dashboard.yourChildren'),
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
                          t('dashboard.noChildrenYet'),
                          style: theme.textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          t('dashboard.addChildPrompt'),
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
    final t = ref.t;

    final asyncCount = ref.watch(
      FutureProvider.autoDispose<int>((ref) async {
        if (userId.isEmpty) return 0;
        return ref
            .watch(familyRepositoryProvider)
            .getUnreadNotificationCount(userId);
      }),
    );

    final count = asyncCount.value ?? 0;

    return Semantics(
      label: count > 0
          ? t('dashboard.unreadNotifications', {'count': '$count'})
          : t('dashboard.notifications'),
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
            SnackBar(content: Text(t('dashboard.notificationsComingSoon'))),
          );
        },
        tooltip: t('dashboard.notifications'),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Child card
// ---------------------------------------------------------------------------

class _ChildCard extends ConsumerWidget {
  const _ChildCard({required this.learner});

  final Learner learner;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final t = ref.t;

    return Semantics(
      button: true,
      label: '${learner.name}, ${t('dashboard.streak')} ${learner.streak} ${t('common.days')}, '
          '${learner.lessonsCompletedToday} ${t('dashboard.lessonsDone')}',
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
                        '${learner.lessonsCompletedToday} ${t('dashboard.lessonsDone')} '
                        '${learner.timeSpentTodayMinutes} min',
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: learner.masteryProgress.clamp(0.0, 1.0),
                          minHeight: 6,
                          semanticsLabel: '${t('dashboard.mastery')} '
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

class _FunctioningLevelBadge extends ConsumerWidget {
  const _FunctioningLevelBadge({required this.level});
  final String level;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final t = ref.t;

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
      label: t('dashboard.functioningLevel', {'level': level}),
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
    final learners = asyncLearners.value ?? [];
    final t = ref.t;

    if (learners.isEmpty) {
      return Scaffold(
        body: Center(child: Text(t('dashboard.addChildForBrain'))),
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

class _ErrorBody extends ConsumerWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final t = ref.t;
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
              label: Text(t('common.retry')),
            ),
          ],
        ),
      ),
    );
  }
}
