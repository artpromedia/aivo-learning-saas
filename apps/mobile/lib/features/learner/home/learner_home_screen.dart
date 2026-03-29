import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';
import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';
import 'package:aivo_mobile/features/learner/home/learning_path_card.dart';

// ---------------------------------------------------------------------------
// Engagement data models
// ---------------------------------------------------------------------------

class EngagementData {
  const EngagementData({
    required this.currentXp,
    required this.levelXp,
    required this.level,
    required this.streakDays,
    required this.streakActive,
  });

  final int currentXp;
  final int levelXp;
  final int level;
  final int streakDays;
  final bool streakActive;

  factory EngagementData.fromJson(Map<String, dynamic> json) {
    return EngagementData(
      currentXp: json['currentXp'] as int? ?? 0,
      levelXp: json['levelXp'] as int? ?? 100,
      level: json['level'] as int? ?? 1,
      streakDays: json['streakDays'] as int? ?? 0,
      streakActive: json['streakActive'] as bool? ?? false,
    );
  }
}

class DailyChallenge {
  const DailyChallenge({
    required this.id,
    required this.title,
    required this.description,
    required this.xpReward,
    required this.imageUrl,
    required this.isCompleted,
  });

  final String id;
  final String title;
  final String description;
  final int xpReward;
  final String? imageUrl;
  final bool isCompleted;

  factory DailyChallenge.fromJson(Map<String, dynamic> json) {
    return DailyChallenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      xpReward: json['xpReward'] as int? ?? 0,
      imageUrl: json['imageUrl'] as String?,
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}

class SpacedReviewItem {
  const SpacedReviewItem({
    required this.lessonId,
    required this.subject,
    required this.topic,
    required this.skillId,
    required this.dueAt,
  });

  final String lessonId;
  final String subject;
  final String topic;
  final String skillId;
  final DateTime dueAt;

  factory SpacedReviewItem.fromJson(Map<String, dynamic> json) {
    return SpacedReviewItem(
      lessonId: json['lessonId'] as String,
      subject: json['subject'] as String,
      topic: json['topic'] as String,
      skillId: json['skillId'] as String? ?? '',
      dueAt: DateTime.parse(json['dueAt'] as String),
    );
  }
}

// ---------------------------------------------------------------------------
// Home data aggregate
// ---------------------------------------------------------------------------

class LearnerHomeData {
  const LearnerHomeData({
    required this.engagement,
    required this.learningPath,
    required this.dailyChallenges,
    required this.spacedReview,
  });

  final EngagementData engagement;
  final LearningPath learningPath;
  final List<DailyChallenge> dailyChallenges;
  final List<SpacedReviewItem> spacedReview;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _learnerHomeDataProvider =
    FutureProvider.autoDispose<LearnerHomeData>((ref) async {
  final authState = ref.watch(authProvider);
  final api = ref.watch(apiClientProvider);

  String learnerId = '';
  if (authState is AuthAuthenticated) {
    learnerId = authState.user.learnerId ?? authState.user.id;
  }

  final results = await Future.wait([
    api.get(Endpoints.xp(learnerId)),
    api.get(Endpoints.streaks(learnerId)),
    api.get(Endpoints.learningPath),
    api.get(Endpoints.dailyChallenges),
    api.get(Endpoints.learningPathSpacedReview),
  ]);

  final xpData = results[0].data as Map<String, dynamic>;
  final streakData = results[1].data as Map<String, dynamic>;
  final pathData = results[2].data as Map<String, dynamic>;
  final challengesRaw = results[3].data as List<dynamic>;
  final reviewRaw = results[4].data as List<dynamic>;

  final engagement = EngagementData(
    currentXp: xpData['currentXp'] as int? ?? 0,
    levelXp: xpData['levelXp'] as int? ?? 100,
    level: xpData['level'] as int? ?? 1,
    streakDays: streakData['streakDays'] as int? ?? 0,
    streakActive: streakData['streakActive'] as bool? ?? false,
  );

  final learningPath = LearningPath.fromJson(pathData);

  final dailyChallenges = challengesRaw
      .map((e) => DailyChallenge.fromJson(e as Map<String, dynamic>))
      .toList();

  final spacedReview = reviewRaw
      .map((e) => SpacedReviewItem.fromJson(e as Map<String, dynamic>))
      .toList();

  return LearnerHomeData(
    engagement: engagement,
    learningPath: learningPath,
    dailyChallenges: dailyChallenges,
    spacedReview: spacedReview,
  );
});

// ---------------------------------------------------------------------------
// LearnerHomeScreen
// ---------------------------------------------------------------------------

class LearnerHomeScreen extends ConsumerStatefulWidget {
  const LearnerHomeScreen({super.key});

  @override
  ConsumerState<LearnerHomeScreen> createState() => _LearnerHomeScreenState();
}

class _LearnerHomeScreenState extends ConsumerState<LearnerHomeScreen> {
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _maybeNarrate();
    });
  }

  Future<void> _maybeNarrate() async {
    final level = ref.read(functioningLevelProvider);
    final narrator = ref.read(audioNarratorProvider);
    final authState = ref.read(authProvider);
    String name = '';
    if (authState is AuthAuthenticated) {
      name = authState.user.name;
    }
    await narrator.autoNarrateIfNeeded(
      level,
      'Home Screen',
      ['Good ${_greetingWord()}, $name!', 'Your learning path is ready.'],
    );
  }

  String _greetingWord() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  void _onTabTapped(int index) {
    setState(() => _currentTabIndex = index);
    switch (index) {
      case 0:
        break; // already on home
      case 1:
        context.go('/learner/quests');
        break;
      case 2:
        context.go('/learner/tutors');
        break;
      case 3:
        context.go('/learner/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final level = ref.watch(functioningLevelProvider);
    final isOnline = ref.watch(isOnlineProvider);
    final isNonVerbal = ref.watch(isNonVerbalOrBelowProvider);

    // PRE_SYMBOLIC: parent-only mode, show minimal fallback UI
    if (level == FunctioningLevel.preSymbolic) {
      return Scaffold(
        body: Center(
          child: Semantics(
            label: 'Parent only mode active',
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.lock_outline,
                  size: 64,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 16),
                Text(
                  'Parent-Only Mode',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'This learner profile is managed by a parent or caregiver.',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Offline banner
            if (!isOnline) _OfflineBanner(),

            // Main content
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(_learnerHomeDataProvider);
                  final syncManager = ref.read(syncManagerProvider);
                  await syncManager.drainSyncQueue();
                },
                child: _HomeBody(
                  isNonVerbal: isNonVerbal,
                  level: level,
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTabIndex,
        onTap: _onTabTapped,
        items: [
          BottomNavigationBarItem(
            icon: Semantics(
              label: 'Home tab',
              child: const Icon(Icons.home_rounded),
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Semantics(
              label: 'Quests tab',
              child: const Icon(Icons.explore_rounded),
            ),
            label: 'Quests',
          ),
          BottomNavigationBarItem(
            icon: Semantics(
              label: 'Tutors tab',
              child: const Icon(Icons.school_rounded),
            ),
            label: 'Tutors',
          ),
          BottomNavigationBarItem(
            icon: Semantics(
              label: 'Profile tab',
              child: const Icon(Icons.person_rounded),
            ),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Offline Banner
// ---------------------------------------------------------------------------

class _OfflineBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'You are offline. Some features may be unavailable.',
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        color: AivoColors.accent,
        child: Row(
          children: [
            const Icon(Icons.cloud_off, size: 18, color: Colors.black87),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'You are offline. Changes will sync when reconnected.',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.black87),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Home Body
// ---------------------------------------------------------------------------

class _HomeBody extends ConsumerWidget {
  const _HomeBody({
    required this.isNonVerbal,
    required this.level,
  });

  final bool isNonVerbal;
  final FunctioningLevel level;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeData = ref.watch(_learnerHomeDataProvider);
    final authState = ref.watch(authProvider);

    String userName = '';
    if (authState is AuthAuthenticated) {
      userName = authState.user.name.split(' ').first;
    }

    return homeData.when(
      loading: () => _buildShimmer(context),
      error: (error, stack) => _buildError(context, ref, error),
      data: (data) => _buildContent(context, ref, data, userName),
    );
  }

  Widget _buildShimmer(BuildContext context) {
    final baseColor = Theme.of(context).brightness == Brightness.dark
        ? AivoColors.surfaceVariantDark
        : AivoColors.surfaceVariantLight;
    final highlightColor = Theme.of(context).brightness == Brightness.dark
        ? AivoColors.surfaceDark
        : AivoColors.surfaceLight;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Greeting shimmer
          Container(
            height: 28,
            width: 200,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 16,
            width: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 24),
          // XP bar shimmer
          Container(
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(height: 24),
          // Challenge shimmer
          Container(
            height: 140,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          const SizedBox(height: 24),
          // Path items shimmer
          for (int i = 0; i < 4; i++) ...[
            Container(
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 24),
            Semantics(
              button: true,
              label: 'Retry loading home screen',
              child: ElevatedButton.icon(
                onPressed: () => ref.invalidate(_learnerHomeDataProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    LearnerHomeData data,
    String userName,
  ) {
    final isLowVerbal = level == FunctioningLevel.lowVerbal;
    final now = DateTime.now();
    final dateStr = DateFormat('EEEE, MMMM d').format(now);
    final hour = now.hour;
    final greeting =
        hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');

    return CustomScrollView(
      slivers: [
        // Greeting header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Semantics(
              header: true,
              label: '$greeting, $userName. $dateStr',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$greeting, $userName!',
                    style: isLowVerbal
                        ? Theme.of(context).textTheme.headlineMedium
                        : Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dateStr,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
        ),

        // XP bar and streak
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _XpStreakBar(
              engagement: data.engagement,
              isLowVerbal: isLowVerbal,
            ),
          ),
        ),

        // Daily challenges section
        if (data.dailyChallenges.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Semantics(
                header: true,
                child: Text(
                  'Daily Challenges',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: isLowVerbal ? 180 : 140,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: data.dailyChallenges.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  return _DailyChallengeCard(
                    challenge: data.dailyChallenges[index],
                    isLowVerbal: isLowVerbal,
                    isNonVerbal: isNonVerbal,
                  );
                },
              ),
            ),
          ),
        ],

        // Spaced review section
        if (data.spacedReview.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                children: [
                  const Icon(
                    Icons.replay_circle_filled,
                    size: 20,
                    color: AivoColors.secondary,
                  ),
                  const SizedBox(width: 8),
                  Semantics(
                    header: true,
                    child: Text(
                      'Spaced Review (${data.spacedReview.length} due)',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: isLowVerbal ? 100 : 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: data.spacedReview.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final item = data.spacedReview[index];
                  return LargeTouchWrapper(
                    semanticLabel:
                        'Review ${item.topic} in ${item.subject}',
                    onTap: () => context.push(
                      '/learner/session/${item.lessonId}',
                    ),
                    child: Container(
                      width: isLowVerbal ? 200 : 160,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.secondaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            item.subject,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSecondaryContainer,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.topic,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontSize: isLowVerbal ? 18 : 14,
                              color: Theme.of(context).colorScheme.onSecondaryContainer,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],

        // Today's learning path
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Row(
              children: [
                Semantics(
                  header: true,
                  child: Text(
                    "Today's Learning Path",
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                const Spacer(),
                Text(
                  '${data.learningPath.completedToday}/${data.learningPath.targetToday}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AivoColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),

        if (data.learningPath.items.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Semantics(
                  label: 'No lessons scheduled for today',
                  child: Column(
                    children: [
                      const Icon(
                        Icons.check_circle_outline,
                        size: 48,
                        color: AivoColors.secondary,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "You're all caught up!",
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList.separated(
              itemCount: data.learningPath.items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = data.learningPath.items[index];
                return LearningPathCard(
                  item: item,
                  functioningLevel: level,
                  onTap: () => context.push(
                    '/learner/session/${item.lessonId}',
                  ),
                );
              },
            ),
          ),

        // Bottom padding
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// XP & Streak Bar
// ---------------------------------------------------------------------------

class _XpStreakBar extends StatelessWidget {
  const _XpStreakBar({
    required this.engagement,
    required this.isLowVerbal,
  });

  final EngagementData engagement;
  final bool isLowVerbal;

  @override
  Widget build(BuildContext context) {
    final xpProgress = engagement.levelXp > 0
        ? (engagement.currentXp / engagement.levelXp).clamp(0.0, 1.0)
        : 0.0;

    return Semantics(
      label: 'Level ${engagement.level}, '
          '${engagement.currentXp} of ${engagement.levelXp} XP. '
          '${engagement.streakDays} day streak.',
      child: Container(
        padding: EdgeInsets.all(isLowVerbal ? 16 : 12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Level badge
            Container(
              width: isLowVerbal ? 48 : 40,
              height: isLowVerbal ? 48 : 40,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AivoColors.primary, AivoColors.primaryLight],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  '${engagement.level}',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: isLowVerbal ? 20 : 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // XP bar
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 16, color: AivoColors.xpGold),
                      const SizedBox(width: 4),
                      Text(
                        '${engagement.currentXp} / ${engagement.levelXp} XP',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: xpProgress,
                      minHeight: isLowVerbal ? 10 : 6,
                      backgroundColor: Theme.of(context)
                          .colorScheme
                          .surfaceContainerHighest,
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(AivoColors.xpGold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),

            // Streak counter
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: isLowVerbal ? 14 : 10,
                vertical: isLowVerbal ? 10 : 6,
              ),
              decoration: BoxDecoration(
                color: engagement.streakActive
                    ? AivoColors.streakFlame.withValues(alpha: 0.12)
                    : Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.local_fire_department_rounded,
                    size: isLowVerbal ? 24 : 18,
                    color: engagement.streakActive
                        ? AivoColors.streakFlame
                        : Theme.of(context).colorScheme.outline,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${engagement.streakDays}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: engagement.streakActive
                          ? AivoColors.streakFlame
                          : Theme.of(context).colorScheme.outline,
                      fontWeight: FontWeight.w700,
                      fontSize: isLowVerbal ? 18 : 14,
                    ),
                  ),
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
// Daily Challenge Card
// ---------------------------------------------------------------------------

class _DailyChallengeCard extends ConsumerWidget {
  const _DailyChallengeCard({
    required this.challenge,
    required this.isLowVerbal,
    required this.isNonVerbal,
  });

  final DailyChallenge challenge;
  final bool isLowVerbal;
  final bool isNonVerbal;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cardWidth = isLowVerbal ? 240.0 : 200.0;
    final scanKey = GlobalKey(debugLabel: 'challenge_${challenge.id}');

    Widget card = Semantics(
      button: true,
      label: challenge.isCompleted
          ? '${challenge.title}, completed'
          : '${challenge.title}, ${challenge.xpReward} XP reward',
      child: GestureDetector(
        onTap: challenge.isCompleted
            ? null
            : () => context.push('/learner/challenges'),
        child: Container(
          width: cardWidth,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: challenge.isCompleted
                ? null
                : const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AivoColors.primary, AivoColors.primaryDark],
                  ),
            color: challenge.isCompleted
                ? Theme.of(context).colorScheme.surfaceContainerHighest
                : null,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  if (challenge.isCompleted)
                    const Icon(
                      Icons.check_circle,
                      size: 20,
                      color: AivoColors.secondary,
                    )
                  else
                    const Icon(
                      Icons.bolt_rounded,
                      size: 20,
                      color: AivoColors.xpGold,
                    ),
                  const Spacer(),
                  if (!challenge.isCompleted)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4,),
                      decoration: BoxDecoration(
                        color: AivoColors.xpGold.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '+${challenge.xpReward} XP',
                        style: const TextStyle(
                          color: AivoColors.xpGold,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ),
                ],
              ),
              const Spacer(),
              Text(
                challenge.title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: challenge.isCompleted
                      ? Theme.of(context).colorScheme.onSurface
                      : Colors.white,
                  fontSize: isLowVerbal ? 18 : 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (!isLowVerbal) ...[
                const SizedBox(height: 4),
                Text(
                  challenge.description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: challenge.isCompleted
                        ? Theme.of(context).colorScheme.onSurfaceVariant
                        : Colors.white70,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );

    if (isNonVerbal) {
      final controller = ref.read(switchScanControllerProvider);
      controller.registerTarget(scanKey, challenge.title);
      card = KeyedSubtree(key: scanKey, child: card);
    }

    return card;
  }
}
