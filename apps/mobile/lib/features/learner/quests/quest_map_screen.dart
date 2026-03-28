import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/quest.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _questWorldsProvider =
    FutureProvider.autoDispose<List<QuestWorld>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.questWorlds);
  final list = response.data as List<dynamic>;
  return list
      .map((e) => QuestWorld.fromJson(e as Map<String, dynamic>))
      .toList();
});

final _questProgressProvider =
    FutureProvider.autoDispose<QuestProgress>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.questProgress);
  return QuestProgress.fromJson(response.data as Map<String, dynamic>);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class QuestMapScreen extends ConsumerWidget {
  const QuestMapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final worldsAsync = ref.watch(_questWorldsProvider);
    final progressAsync = ref.watch(_questProgressProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quest Map'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_questWorldsProvider);
          ref.invalidate(_questProgressProvider);
          await Future.wait([
            ref.read(_questWorldsProvider.future),
            ref.read(_questProgressProvider.future),
          ]);
        },
        child: worldsAsync.when(
          loading: () => _buildShimmer(context),
          error: (e, _) => _buildError(context, ref, e),
          data: (worlds) {
            return CustomScrollView(
              slivers: [
                // Progress header
                SliverToBoxAdapter(
                  child: _buildProgressHeader(
                      theme, colorScheme, progressAsync, worlds),
                ),
                // Worlds list
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  sliver: SliverList.builder(
                    itemCount: worlds.length,
                    itemBuilder: (context, index) {
                      final world = worlds[index];
                      final isCurrent = progressAsync.whenOrNull(
                            data: (p) => p.currentWorldId == world.id,
                          ) ??
                          false;
                      return _WorldCard(
                        world: world,
                        isCurrent: isCurrent,
                        index: index,
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildProgressHeader(
    ThemeData theme,
    ColorScheme colorScheme,
    AsyncValue<QuestProgress> progressAsync,
    List<QuestWorld> worlds,
  ) {
    return progressAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(16),
        child: LinearProgressIndicator(),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (progress) {
        final worldProgress = progress.totalWorlds > 0
            ? progress.worldsCompleted / progress.totalWorlds
            : 0.0;
        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                colorScheme.primary,
                colorScheme.primary.withValues(alpha: 0.7),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.explore, color: colorScheme.onPrimary, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Quest Progress',
                      style: theme.textTheme.titleLarge
                          ?.copyWith(color: colorScheme.onPrimary),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star, color: AivoColors.xpGold, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '${progress.chaptersCompleted}/${progress.totalChapters}',
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: worldProgress,
                  minHeight: 10,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  color: AivoColors.questGreen,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${progress.worldsCompleted} of ${progress.totalWorlds} worlds completed',
                style: theme.textTheme.bodySmall
                    ?.copyWith(color: Colors.white.withValues(alpha: 0.8)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildShimmer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Container(
            height: 140,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 16),
            Text('Failed to load quests', style: theme.textTheme.titleMedium),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(_questWorldsProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// World card
// ---------------------------------------------------------------------------

class _WorldCard extends StatelessWidget {
  const _WorldCard({
    required this.world,
    required this.isCurrent,
    required this.index,
  });

  final QuestWorld world;
  final bool isCurrent;
  final int index;

  Color _subjectColor(ColorScheme cs) {
    final s = world.subject.toLowerCase();
    if (s.contains('math')) return AivoColors.primary;
    if (s.contains('science')) return AivoColors.secondary;
    if (s.contains('english') || s.contains('reading')) return AivoColors.accent;
    return AivoColors.questGreen;
  }

  IconData get _subjectIcon {
    final s = world.subject.toLowerCase();
    if (s.contains('math')) return Icons.calculate;
    if (s.contains('science')) return Icons.science;
    if (s.contains('english') || s.contains('reading')) return Icons.menu_book;
    if (s.contains('history') || s.contains('social')) return Icons.public;
    return Icons.auto_awesome;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final subjectColor = _subjectColor(colorScheme);
    final completedChapters = world.chapters.where((c) => c.status == 'completed').length;
    final totalChapters = world.chapters.length;
    final progress = totalChapters > 0
        ? completedChapters / totalChapters
        : 0.0;

    return Semantics(
      label:
          '${world.name}, ${world.subject}, $completedChapters of $totalChapters chapters'
          '${world.isUnlocked ? '' : ', locked'}',
      button: world.isUnlocked,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: isCurrent
                ? Border.all(color: subjectColor, width: 2.5)
                : null,
            boxShadow: isCurrent
                ? [
                    BoxShadow(
                      color: subjectColor.withValues(alpha: 0.35),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ]
                : null,
          ),
          child: Card(
            margin: EdgeInsets.zero,
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: world.isUnlocked
                  ? () => context.push(
                      '/learner/quests/${world.id}/chapter/${world.id}')
                  : null,
              child: Opacity(
                opacity: world.isUnlocked ? 1.0 : 0.5,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // Icon
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: subjectColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: world.isUnlocked
                            ? Icon(_subjectIcon, size: 32, color: subjectColor)
                            : Icon(Icons.lock, size: 32, color: colorScheme.outline),
                      ),
                      const SizedBox(width: 16),
                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    world.name,
                                    style: theme.textTheme.titleMedium,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (isCurrent)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color:
                                          subjectColor.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      'CURRENT',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                        color: subjectColor,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              world.subject,
                              style: theme.textTheme.bodySmall,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              world.description,
                              style: theme.textTheme.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: progress,
                                      minHeight: 6,
                                      backgroundColor: colorScheme
                                          .surfaceContainerHighest,
                                      color: subjectColor,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '$completedChapters/$totalChapters',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (world.isUnlocked)
                        Icon(Icons.chevron_right, color: colorScheme.outline),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
