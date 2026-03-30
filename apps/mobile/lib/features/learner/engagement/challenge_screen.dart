import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

// ---------------------------------------------------------------------------
// Challenge model
// ---------------------------------------------------------------------------

class Challenge {
  const Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.rules,
    required this.participantCount,
    required this.maxParticipants,
    required this.endsAt,
    this.xpReward,
    this.progress,
    this.progressTarget,
    this.isJoined = false,
    this.isDaily = false,
    this.standings,
  });

  final String id;
  final String title;
  final String description;
  final String type;
  final String rules;
  final int participantCount;
  final int maxParticipants;
  final DateTime endsAt;
  final int? xpReward;
  final int? progress;
  final int? progressTarget;
  final bool isJoined;
  final bool isDaily;
  final List<Map<String, dynamic>>? standings;

  Duration get timeRemaining => endsAt.difference(DateTime.now());

  String get timeRemainingLabel {
    final remaining = timeRemaining;
    if (remaining.isNegative) return 'Ended';
    if (remaining.inDays > 0) return '${remaining.inDays}d ${remaining.inHours % 24}h';
    if (remaining.inHours > 0) return '${remaining.inHours}h ${remaining.inMinutes % 60}m';
    return '${remaining.inMinutes}m';
  }

  double get progressPercent {
    if (progressTarget == null || progressTarget == 0) return 0;
    return ((progress ?? 0) / progressTarget!).clamp(0.0, 1.0);
  }

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      type: json['type'] as String? ?? 'general',
      rules: json['rules'] as String? ?? '',
      participantCount: json['participantCount'] as int? ?? 0,
      maxParticipants: json['maxParticipants'] as int? ?? 0,
      endsAt: DateTime.parse(json['endsAt'] as String),
      xpReward: json['xpReward'] as int?,
      progress: json['progress'] as int?,
      progressTarget: json['progressTarget'] as int?,
      isJoined: json['isJoined'] as bool? ?? false,
      isDaily: json['isDaily'] as bool? ?? false,
      standings: (json['standings'] as List<dynamic>?)
          ?.map((e) => e as Map<String, dynamic>)
          .toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _challengesProvider =
    FutureProvider.autoDispose<List<Challenge>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.challenges);
  final list = response.data as List<dynamic>;
  return list
      .map((e) => Challenge.fromJson(e as Map<String, dynamic>))
      .toList();
});

final _dailyChallengesProvider =
    FutureProvider.autoDispose<List<Challenge>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.dailyChallenges);
  final list = response.data as List<dynamic>;
  return list
      .map((e) => Challenge.fromJson(e as Map<String, dynamic>))
      .toList();
});

final _joinLoadingProvider =
    StateProvider.autoDispose<String?>((_) => null);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ChallengeScreen extends ConsumerWidget {
  const ChallengeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final challengesAsync = ref.watch(_challengesProvider);
    final dailyAsync = ref.watch(_dailyChallengesProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Challenges'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_challengesProvider);
          ref.invalidate(_dailyChallengesProvider);
          await Future.wait([
            ref.read(_challengesProvider.future),
            ref.read(_dailyChallengesProvider.future),
          ]);
        },
        child: CustomScrollView(
          slivers: [
            // Daily challenges section
            SliverToBoxAdapter(
              child: _buildDailySection(theme, colorScheme, dailyAsync, ref),
            ),

            // Active challenges header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                child: Text(
                  'Active Challenges',
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),

            // Active challenges list
            challengesAsync.when(
              loading: () => SliverToBoxAdapter(
                child: _buildShimmer(context),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: _buildError(context, ref, e),
              ),
              data: (challenges) {
                if (challenges.isEmpty) {
                  return SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.flag_outlined,
                                size: 48, color: colorScheme.outline,),
                            const SizedBox(height: 16),
                            Text('No active challenges',
                                style: theme.textTheme.bodyLarge,),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                  sliver: SliverList.builder(
                    itemCount: challenges.length,
                    itemBuilder: (context, index) =>
                        _ChallengeCard(challenge: challenges[index]),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDailySection(ThemeData theme, ColorScheme colorScheme,
      AsyncValue<List<Challenge>> dailyAsync, WidgetRef ref,) {
    return dailyAsync.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(16),
        child: LinearProgressIndicator(),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (dailies) {
        if (dailies.isEmpty) return const SizedBox.shrink();
        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                colorScheme.tertiary.withValues(alpha: 0.15),
                colorScheme.tertiary.withValues(alpha: 0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: colorScheme.tertiary.withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.today,
                      color: colorScheme.tertiary, size: 24,),
                  const SizedBox(width: 8),
                  Text(
                    'Daily Challenges',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: colorScheme.tertiary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ...dailies.map((daily) => _DailyChallengeItem(
                    challenge: daily,
                    ref: ref,
                  ),),
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
      child: Column(
        children: List.generate(
          3,
          (_) => Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Container(
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 16),
            Text('Failed to load challenges',
                style: theme.textTheme.titleMedium,),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(_challengesProvider),
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
// Daily challenge item
// ---------------------------------------------------------------------------

class _DailyChallengeItem extends StatelessWidget {
  const _DailyChallengeItem({
    required this.challenge,
    required this.ref,
  });

  final Challenge challenge;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  challenge.title,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: challenge.progressPercent,
                    minHeight: 6,
                    backgroundColor: colorScheme.surfaceContainerHighest,
                    color: colorScheme.tertiary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${challenge.progress ?? 0} / ${challenge.progressTarget ?? 0}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          if (challenge.xpReward != null)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AivoColors.xpGold.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.star, size: 14, color: AivoColors.xpGold),
                  const SizedBox(width: 2),
                  Text(
                    '${challenge.xpReward} XP',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AivoColors.xpGold,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Challenge card
// ---------------------------------------------------------------------------

class _ChallengeCard extends ConsumerWidget {
  const _ChallengeCard({required this.challenge});

  final Challenge challenge;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final joinLoading = ref.watch(_joinLoadingProvider);
    final isJoining = joinLoading == challenge.id;

    return Semantics(
      label:
          '${challenge.title}, ${challenge.type}, ${challenge.participantCount} participants, '
          '${challenge.timeRemainingLabel} remaining',
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () =>
              _showChallengeDetail(context, ref, theme, colorScheme),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3,),
                      decoration: BoxDecoration(
                        color: _typeColor(colorScheme).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        challenge.type.toUpperCase(),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: _typeColor(colorScheme),
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Icon(Icons.timer_outlined,
                        size: 14, color: colorScheme.outline,),
                    const SizedBox(width: 4),
                    Text(
                      challenge.timeRemainingLabel,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: challenge.timeRemaining.inHours < 2
                            ? colorScheme.error
                            : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  challenge.title,
                  style: theme.textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.people_outline,
                        size: 14, color: colorScheme.outline,),
                    const SizedBox(width: 4),
                    Text(
                      '${challenge.participantCount}'
                      '${challenge.maxParticipants > 0 ? '/${challenge.maxParticipants}' : ''}'
                      ' participants',
                      style: theme.textTheme.bodySmall,
                    ),
                    if (challenge.xpReward != null) ...[
                      const SizedBox(width: 12),
                      const Icon(Icons.star,
                          size: 14, color: AivoColors.xpGold,),
                      const SizedBox(width: 2),
                      Text(
                        '${challenge.xpReward} XP',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AivoColors.xpGold,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    const Spacer(),
                    if (!challenge.isJoined)
                      SizedBox(
                        height: 32,
                        child: ElevatedButton(
                          onPressed:
                              isJoining ? null : () => _join(context, ref),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16,),
                            textStyle: theme.textTheme.bodySmall,
                          ),
                          child: isJoining
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,),
                                )
                              : const Text('Join'),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4,),
                        decoration: BoxDecoration(
                          color: AivoColors.questGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Joined',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AivoColors.questGreen,
                            fontWeight: FontWeight.w600,
                          ),
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

  Color _typeColor(ColorScheme cs) {
    switch (challenge.type.toLowerCase()) {
      case 'speed':
        return AivoColors.streakFlame;
      case 'accuracy':
        return cs.primary;
      case 'endurance':
        return cs.secondary;
      case 'team':
        return cs.tertiary;
      default:
        return cs.primary;
    }
  }

  Future<void> _join(BuildContext context, WidgetRef ref) async {
    ref.read(_joinLoadingProvider.notifier).state = challenge.id;
    try {
      final api = ref.read(apiClientProvider);
      await api.post(Endpoints.challengeJoin(challenge.id));
      ref.invalidate(_challengesProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Joined "${challenge.title}"!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to join: $e')),
        );
      }
    } finally {
      ref.read(_joinLoadingProvider.notifier).state = null;
    }
  }

  void _showChallengeDetail(BuildContext context, WidgetRef ref,
      ThemeData theme, ColorScheme colorScheme,) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.85,
          expand: false,
          builder: (_, scrollController) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: ListView(
                controller: scrollController,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: colorScheme.outline,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    challenge.title,
                    style: theme.textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    challenge.description,
                    style: theme.textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 16),
                  // Rules
                  if (challenge.rules.isNotEmpty) ...[
                    Text('Rules', style: theme.textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        challenge.rules,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  // Stats
                  Row(
                    children: [
                      _StatChip(
                        icon: Icons.people,
                        label:
                            '${challenge.participantCount} joined',
                        color: colorScheme.primary,
                      ),
                      const SizedBox(width: 12),
                      _StatChip(
                        icon: Icons.timer,
                        label: challenge.timeRemainingLabel,
                        color: colorScheme.tertiary,
                      ),
                      if (challenge.xpReward != null) ...[
                        const SizedBox(width: 12),
                        _StatChip(
                          icon: Icons.star,
                          label: '${challenge.xpReward} XP',
                          color: AivoColors.xpGold,
                        ),
                      ],
                    ],
                  ),
                  // Standings
                  if (challenge.standings != null &&
                      challenge.standings!.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('Current Standings',
                        style: theme.textTheme.titleMedium,),
                    const SizedBox(height: 8),
                    ...challenge.standings!
                        .take(10)
                        .map((s) => Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                children: [
                                  SizedBox(
                                    width: 28,
                                    child: Text(
                                      '${s['rank'] ?? '-'}',
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                              fontWeight: FontWeight.w700,),
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      s['name'] as String? ?? 'Unknown',
                                      style: theme.textTheme.bodyMedium,
                                    ),
                                  ),
                                  Text(
                                    '${s['score'] ?? 0}',
                                    style: theme.textTheme.bodyMedium
                                        ?.copyWith(
                                            fontWeight: FontWeight.w600,),
                                  ),
                                ],
                              ),
                            ),),
                  ],
                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Stat chip
// ---------------------------------------------------------------------------

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
