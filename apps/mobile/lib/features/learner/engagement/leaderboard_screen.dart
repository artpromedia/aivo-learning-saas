import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// Leaderboard entry model
// ---------------------------------------------------------------------------

class LeaderboardEntry {
  const LeaderboardEntry({
    required this.learnerId,
    required this.name,
    required this.avatarUrl,
    required this.xp,
    required this.level,
    required this.rank,
  });

  final String learnerId;
  final String name;
  final String? avatarUrl;
  final int xp;
  final int level;
  final int rank;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      learnerId: json['learnerId'] as String? ?? json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown',
      avatarUrl: json['avatarUrl'] as String?,
      xp: json['xp'] as int? ?? json['totalXp'] as int? ?? 0,
      level: json['level'] as int? ?? json['currentLevel'] as int? ?? 1,
      rank: json['rank'] as int? ?? json['position'] as int? ?? 0,
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

enum LeaderboardTab { global, classroom, friends }

final _leaderboardTabProvider =
    StateProvider.autoDispose<LeaderboardTab>((_) => LeaderboardTab.global);

final _leaderboardProvider = FutureProvider.autoDispose
    .family<List<LeaderboardEntry>, LeaderboardTab>((ref, tab) async {
  final api = ref.watch(apiClientProvider);
  final String endpoint;
  switch (tab) {
    case LeaderboardTab.global:
      endpoint = Endpoints.leaderboardGlobal;
    case LeaderboardTab.classroom:
      endpoint = Endpoints.leaderboardClassroom;
    case LeaderboardTab.friends:
      endpoint = Endpoints.leaderboardFriends;
  }
  final response = await api.get(endpoint);
  final list = response.data as List<dynamic>;
  return list
      .map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class LeaderboardScreen extends ConsumerWidget {
  const LeaderboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedTab = ref.watch(_leaderboardTabProvider);
    final leaderboardAsync = ref.watch(_leaderboardProvider(selectedTab));
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final authState = ref.watch(authProvider);
    final currentLearnerId = authState is AuthAuthenticated
        ? (authState.user.learnerId ?? authState.user.id)
        : '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Leaderboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _TabButton(
                  label: 'Global',
                  isSelected: selectedTab == LeaderboardTab.global,
                  onTap: () => ref
                      .read(_leaderboardTabProvider.notifier)
                      .state = LeaderboardTab.global,
                ),
                const SizedBox(width: 8),
                _TabButton(
                  label: 'Classroom',
                  isSelected: selectedTab == LeaderboardTab.classroom,
                  onTap: () => ref
                      .read(_leaderboardTabProvider.notifier)
                      .state = LeaderboardTab.classroom,
                ),
                const SizedBox(width: 8),
                _TabButton(
                  label: 'Friends',
                  isSelected: selectedTab == LeaderboardTab.friends,
                  onTap: () => ref
                      .read(_leaderboardTabProvider.notifier)
                      .state = LeaderboardTab.friends,
                ),
              ],
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_leaderboardProvider(selectedTab));
          await ref.read(_leaderboardProvider(selectedTab).future);
        },
        child: leaderboardAsync.when(
          loading: () => _buildShimmer(context),
          error: (e, _) => _buildError(context, ref, e, selectedTab),
          data: (entries) {
            if (entries.isEmpty) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.leaderboard,
                        size: 48, color: colorScheme.outline,),
                    const SizedBox(height: 16),
                    Text('No learners yet',
                        style: theme.textTheme.bodyLarge,),
                  ],
                ),
              );
            }

            final top3 =
                entries.length >= 3 ? entries.sublist(0, 3) : entries;
            final rest = entries.length > 3 ? entries.sublist(3) : <LeaderboardEntry>[];

            return CustomScrollView(
              slivers: [
                // Podium
                if (top3.length >= 3)
                  SliverToBoxAdapter(
                    child: _Podium(
                      top3: top3,
                      currentLearnerId: currentLearnerId,
                    ),
                  ),

                // Rest of the list
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  sliver: SliverList.builder(
                    itemCount: rest.length,
                    itemBuilder: (context, index) {
                      final entry = rest[index];
                      final isCurrentUser =
                          entry.learnerId == currentLearnerId;
                      return _LeaderboardRow(
                        entry: entry,
                        isCurrentUser: isCurrentUser,
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

  Widget _buildShimmer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 10,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error,
      LeaderboardTab tab,) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 16),
          Text('Failed to load leaderboard',
              style: theme.textTheme.titleMedium,),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(_leaderboardProvider(tab)),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? colorScheme.primary
                : colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: isSelected
                      ? colorScheme.onPrimary
                      : colorScheme.onSurface,
                  fontWeight:
                      isSelected ? FontWeight.w700 : FontWeight.w400,
                ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Podium (top 3)
// ---------------------------------------------------------------------------

class _Podium extends StatelessWidget {
  const _Podium({required this.top3, required this.currentLearnerId});

  final List<LeaderboardEntry> top3;
  final String currentLearnerId;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd place
          _PodiumSlot(
            entry: top3[1],
            height: 90,
            medalColor: AivoColors.badgeSilver,
            isCurrentUser: top3[1].learnerId == currentLearnerId,
          ),
          const SizedBox(width: 8),
          // 1st place
          _PodiumSlot(
            entry: top3[0],
            height: 120,
            medalColor: AivoColors.xpGold,
            isCurrentUser: top3[0].learnerId == currentLearnerId,
          ),
          const SizedBox(width: 8),
          // 3rd place
          _PodiumSlot(
            entry: top3[2],
            height: 70,
            medalColor: const Color(0xFFCD7F32),
            isCurrentUser: top3[2].learnerId == currentLearnerId,
          ),
        ],
      ),
    );
  }
}

class _PodiumSlot extends StatelessWidget {
  const _PodiumSlot({
    required this.entry,
    required this.height,
    required this.medalColor,
    required this.isCurrentUser,
  });

  final LeaderboardEntry entry;
  final double height;
  final Color medalColor;
  final bool isCurrentUser;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Avatar
          Stack(
            alignment: Alignment.bottomCenter,
            clipBehavior: Clip.none,
            children: [
              CircleAvatar(
                radius: entry.rank == 1 ? 32 : 24,
                backgroundColor: isCurrentUser
                    ? colorScheme.primary
                    : colorScheme.surfaceContainerHighest,
                child: entry.avatarUrl != null
                    ? ClipOval(
                        child: CachedNetworkImage(
                          imageUrl: entry.avatarUrl!,
                          width: entry.rank == 1 ? 60 : 44,
                          height: entry.rank == 1 ? 60 : 44,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Icon(Icons.person,
                              size: entry.rank == 1 ? 32 : 24,),
                        ),
                      )
                    : Icon(Icons.person,
                        size: entry.rank == 1 ? 32 : 24,
                        color: colorScheme.outline,),
              ),
              Positioned(
                bottom: -8,
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: medalColor,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: Center(
                    child: Text(
                      '${entry.rank}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            entry.name,
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: isCurrentUser ? colorScheme.primary : null,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            '${entry.xp} XP',
            style: theme.textTheme.bodySmall?.copyWith(
              color: AivoColors.xpGold,
              fontWeight: FontWeight.w700,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 8),
          // Podium bar
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            height: height,
            decoration: BoxDecoration(
              color: medalColor.withValues(alpha: 0.2),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(8)),
              border: Border.all(
                color: medalColor.withValues(alpha: 0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Leaderboard row (rank 4+)
// ---------------------------------------------------------------------------

class _LeaderboardRow extends StatelessWidget {
  const _LeaderboardRow({
    required this.entry,
    required this.isCurrentUser,
  });

  final LeaderboardEntry entry;
  final bool isCurrentUser;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      label:
          'Rank ${entry.rank}, ${entry.name}, ${entry.xp} XP, Level ${entry.level}',
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isCurrentUser
              ? colorScheme.primary.withValues(alpha: 0.08)
              : colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: isCurrentUser
              ? Border.all(color: colorScheme.primary, width: 1.5)
              : Border.all(
                  color: colorScheme.outline.withValues(alpha: 0.2),),
        ),
        child: Row(
          children: [
            // Rank
            SizedBox(
              width: 32,
              child: Text(
                '${entry.rank}',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isCurrentUser ? colorScheme.primary : null,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(width: 12),
            // Avatar
            CircleAvatar(
              radius: 18,
              backgroundColor: colorScheme.surfaceContainerHighest,
              child: entry.avatarUrl != null
                  ? ClipOval(
                      child: CachedNetworkImage(
                        imageUrl: entry.avatarUrl!,
                        width: 36,
                        height: 36,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) =>
                            const Icon(Icons.person, size: 18),
                      ),
                    )
                  : const Icon(Icons.person, size: 18),
            ),
            const SizedBox(width: 12),
            // Name
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    entry.name,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight:
                          isCurrentUser ? FontWeight.w700 : FontWeight.w500,
                      color: isCurrentUser ? colorScheme.primary : null,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    'Level ${entry.level}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            // XP
            Text(
              '${entry.xp} XP',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: AivoColors.xpGold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
