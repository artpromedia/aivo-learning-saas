import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _classroomProvider =
    FutureProvider.autoDispose<ClassroomSummary>((ref) {
  return ref.watch(familyRepositoryProvider).getClassroom();
});

final _searchQueryProvider = StateProvider<String>((_) => '');

enum _SortMode { name, progress, lastActive }

final _sortModeProvider = StateProvider<_SortMode>((_) => _SortMode.name);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ClassroomScreen extends ConsumerWidget {
  const ClassroomScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncClassroom = ref.watch(_classroomProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Classroom'),
      ),
      body: asyncClassroom.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: 'Failed to load classroom',
          onRetry: () => ref.invalidate(_classroomProvider),
        ),
        data: (summary) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(_classroomProvider);
            },
            child: CustomScrollView(
              slivers: [
                // Summary stats
                SliverToBoxAdapter(
                  child: _ClassSummaryBar(summary: summary),
                ),

                // Search and sort bar
                SliverToBoxAdapter(
                  child: _SearchSortBar(),
                ),

                // Student list
                _StudentList(students: summary.students),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Class summary bar
// ---------------------------------------------------------------------------

class _ClassSummaryBar extends StatelessWidget {
  const _ClassSummaryBar({required this.summary});
  final ClassroomSummary summary;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _StatPill(
              icon: Icons.bar_chart,
              label: 'Avg',
              value: '${(summary.classAverage * 100).toInt()}%',
              color: AivoColors.primary,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatPill(
              icon: Icons.warning_amber,
              label: 'At Risk',
              value: '${summary.studentsAtRisk}',
              color: AivoColors.error,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _StatPill(
              icon: Icons.emoji_events,
              label: 'Top',
              value: '${summary.topPerformers}',
              color: AivoColors.xpGold,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  const _StatPill({
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
        padding: const EdgeInsets.symmetric(
            horizontal: 12, vertical: 10,),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: theme.textTheme.titleMedium
                        ?.copyWith(color: color),
                  ),
                  Text(label, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Search and sort bar
// ---------------------------------------------------------------------------

class _SearchSortBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final sortMode = ref.watch(_sortModeProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Search field
          Semantics(
            label: 'Search students',
            textField: true,
            child: TextField(
              onChanged: (v) =>
                  ref.read(_searchQueryProvider.notifier).state = v,
              decoration: const InputDecoration(
                hintText: 'Search students...',
                prefixIcon: Icon(Icons.search),
                isDense: true,
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Sort chips
          Row(
            children: [
              Text('Sort by:', style: theme.textTheme.bodySmall),
              const SizedBox(width: 8),
              _SortChip(
                label: 'Name',
                selected: sortMode == _SortMode.name,
                onTap: () => ref
                    .read(_sortModeProvider.notifier)
                    .state = _SortMode.name,
              ),
              const SizedBox(width: 4),
              _SortChip(
                label: 'Progress',
                selected: sortMode == _SortMode.progress,
                onTap: () => ref
                    .read(_sortModeProvider.notifier)
                    .state = _SortMode.progress,
              ),
              const SizedBox(width: 4),
              _SortChip(
                label: 'Last Active',
                selected: sortMode == _SortMode.lastActive,
                onTap: () => ref
                    .read(_sortModeProvider.notifier)
                    .state = _SortMode.lastActive,
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

class _SortChip extends StatelessWidget {
  const _SortChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        showCheckmark: false,
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Student list (sliver)
// ---------------------------------------------------------------------------

class _StudentList extends ConsumerWidget {
  const _StudentList({required this.students});
  final List<ClassroomStudent> students;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final query = ref.watch(_searchQueryProvider).toLowerCase();
    final sortMode = ref.watch(_sortModeProvider);

    var filtered = students.where((s) {
      if (query.isEmpty) return true;
      return s.name.toLowerCase().contains(query);
    }).toList();

    switch (sortMode) {
      case _SortMode.name:
        filtered.sort(
            (a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()),);
      case _SortMode.progress:
        filtered
            .sort((a, b) => b.todayProgress.compareTo(a.todayProgress));
      case _SortMode.lastActive:
        filtered.sort((a, b) {
          final aTime = a.lastActiveAt ?? DateTime(2000);
          final bTime = b.lastActiveAt ?? DateTime(2000);
          return bTime.compareTo(aTime);
        });
    }

    if (filtered.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.search_off,
                  size: 48,
                  color: Theme.of(context).colorScheme.outlineVariant,),
              const SizedBox(height: 16),
              Text(
                query.isNotEmpty
                    ? 'No students match "$query"'
                    : 'No students in classroom',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          return _StudentCard(student: filtered[index]);
        },
        childCount: filtered.length,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Student card
// ---------------------------------------------------------------------------

class _StudentCard extends StatelessWidget {
  const _StudentCard({required this.student});
  final ClassroomStudent student;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final pct = (student.todayProgress * 100).clamp(0.0, 100.0);

    return Semantics(
      button: true,
      label: '${student.name}, progress ${pct.toInt()} percent'
          '${student.atRisk ? ", at risk" : ""}',
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () =>
              context.go('/teacher/learner/${student.id}'),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 24,
                  backgroundColor: colorScheme.primaryContainer,
                  backgroundImage: student.avatarUrl != null
                      ? NetworkImage(student.avatarUrl!)
                      : null,
                  child: student.avatarUrl == null
                      ? Text(
                          student.name.isNotEmpty
                              ? student.name[0].toUpperCase()
                              : '?',
                          style: theme.textTheme.titleMedium?.copyWith(
                            color: colorScheme.onPrimaryContainer,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 12),

                // Name, level, progress
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              student.name,
                              style: theme.textTheme.titleMedium,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (student.atRisk) ...[
                            const SizedBox(width: 6),
                            Semantics(
                              label: 'At risk indicator',
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2,),
                                decoration: BoxDecoration(
                                  color: AivoColors.error
                                      .withValues(alpha: 0.12),
                                  borderRadius:
                                      BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'At Risk',
                                  style: theme.textTheme.bodySmall
                                      ?.copyWith(
                                    color: AivoColors.error,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      _FunctioningLevelBadge(
                          level: student.functioningLevel,),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(
                          value: student.todayProgress.clamp(0.0, 1.0),
                          minHeight: 5,
                          semanticsLabel:
                              'Today progress ${pct.toInt()}%',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Progress percentage
                Text(
                  '${pct.toInt()}%',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(Icons.chevron_right,
                    color: colorScheme.outline,),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Functioning level badge (shared pattern)
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

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
      decoration: BoxDecoration(
        color: badgeColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: badgeColor,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error retry
// ---------------------------------------------------------------------------

class _ErrorRetry extends StatelessWidget {
  const _ErrorRetry({required this.message, required this.onRetry});
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
