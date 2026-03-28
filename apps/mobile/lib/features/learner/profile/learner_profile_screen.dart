import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/app.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart'
    show authProvider, AuthAuthenticated;
import 'package:aivo_mobile/features/learner/engagement/xp_widget.dart';
import 'package:aivo_mobile/features/learner/engagement/streak_widget.dart';
import 'package:aivo_mobile/features/learner/engagement/badge_collection_screen.dart'
    show Badge;

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _profileDataProvider =
    FutureProvider.autoDispose<_ProfileData>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  if (authState is! AuthAuthenticated) {
    throw Exception('Not authenticated');
  }
  final user = authState.user;
  final learnerId = user.learnerId ?? user.id;

  final results = await Future.wait([
    api.get(Endpoints.xp(learnerId)),
    api.get(Endpoints.streaks(learnerId)),
    api.get(Endpoints.badgesEarned(learnerId)),
    api.get(Endpoints.gradebookSummary),
  ]);

  final xpData = results[0].data as Map<String, dynamic>;
  final streakData = results[1].data as Map<String, dynamic>;
  final badgesData = results[2].data as List<dynamic>;
  final gradebook = results[3].data as Map<String, dynamic>;

  return _ProfileData(
    name: user.name,
    email: user.email,
    avatarUrl: null,
    level: xpData['currentLevel'] as int? ?? 1,
    totalXp: xpData['totalXp'] as int? ?? 0,
    currentStreak: streakData['currentStreak'] as int? ?? 0,
    recentBadges: badgesData
        .take(5)
        .map((e) => Badge.fromJson(e as Map<String, dynamic>))
        .toList(),
    subjectProgress: _parseSubjectProgress(gradebook),
  );
});

Map<String, double> _parseSubjectProgress(Map<String, dynamic> gradebook) {
  final subjects = gradebook['subjects'] as Map<String, dynamic>? ?? {};
  final result = <String, double>{};
  for (final entry in subjects.entries) {
    final data = entry.value as Map<String, dynamic>;
    result[entry.key] =
        ((data['averageMastery'] as num?)?.toDouble() ?? 0.0) / 100.0;
  }
  return result;
}

class _ProfileData {
  const _ProfileData({
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.level,
    required this.totalXp,
    required this.currentStreak,
    required this.recentBadges,
    required this.subjectProgress,
  });

  final String name;
  final String email;
  final String? avatarUrl;
  final int level;
  final int totalXp;
  final int currentStreak;
  final List<Badge> recentBadges;
  final Map<String, double> subjectProgress;
}

// Settings providers
final _audioNarrationProvider = StateProvider<bool>((_) => false);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class LearnerProfileScreen extends ConsumerWidget {
  const LearnerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(_profileDataProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _buildError(context, ref, e, theme),
        data: (profile) => _buildProfile(context, ref, theme, colorScheme, profile),
      ),
    );
  }

  Widget _buildError(
      BuildContext context, WidgetRef ref, Object error, ThemeData theme,) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 16),
          Text('Failed to load profile', style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(_profileDataProvider),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfile(BuildContext context, WidgetRef ref, ThemeData theme,
      ColorScheme colorScheme, _ProfileData profile,) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + name + level
          _buildHeader(theme, colorScheme, profile),
          const SizedBox(height: 20),

          // XP widget
          const XpWidget(compact: false),
          const SizedBox(height: 16),

          // Streak
          const StreakWidget(showCalendar: true),
          const SizedBox(height: 20),

          // Subject progress
          if (profile.subjectProgress.isNotEmpty) ...[
            Text('Subject Progress', style: theme.textTheme.titleLarge),
            const SizedBox(height: 12),
            ...profile.subjectProgress.entries.map(
              (entry) => _SubjectProgressBar(
                subject: entry.key,
                progress: entry.value,
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Recent badges
          if (profile.recentBadges.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Badges', style: theme.textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.push('/learner/badges'),
                  child: const Text('See all'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 70,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: profile.recentBadges.length,
                itemBuilder: (context, index) {
                  final badge = profile.recentBadges[index];
                  return Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: Semantics(
                      label: badge.name,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color:
                                  badge.rarityColor.withValues(alpha: 0.15),
                              border: Border.all(
                                  color: badge.rarityColor, width: 2,),
                            ),
                            child: Icon(
                              Icons.emoji_events,
                              size: 22,
                              color: badge.rarityColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          SizedBox(
                            width: 56,
                            child: Text(
                              badge.name,
                              style: theme.textTheme.bodySmall
                                  ?.copyWith(fontSize: 10),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Settings section
          Text('Settings', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          _buildSettings(context, ref, theme, colorScheme),
          const SizedBox(height: 24),

          // Logout
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _handleLogout(context, ref),
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: OutlinedButton.styleFrom(
                foregroundColor: colorScheme.error,
                side: BorderSide(color: colorScheme.error),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(
      ThemeData theme, ColorScheme colorScheme, _ProfileData profile,) {
    return Center(
      child: Column(
        children: [
          // Avatar
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: colorScheme.primaryContainer,
                child: profile.avatarUrl != null
                    ? ClipOval(
                        child: CachedNetworkImage(
                          imageUrl: profile.avatarUrl!,
                          width: 92,
                          height: 92,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Icon(
                            Icons.person,
                            size: 48,
                            color: colorScheme.onPrimaryContainer,
                          ),
                        ),
                      )
                    : Icon(
                        Icons.person,
                        size: 48,
                        color: colorScheme.onPrimaryContainer,
                      ),
              ),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colorScheme.surface,
                ),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AivoColors.xpGold, Color(0xFFFF8C00)],
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '${profile.level}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            profile.name,
            style: theme.textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          Text(
            '${profile.totalXp} XP total',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AivoColors.xpGold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettings(BuildContext context, WidgetRef ref, ThemeData theme,
      ColorScheme colorScheme,) {
    final themeMode = ref.watch(themeModeProvider);
    final isDarkMode = themeMode == ThemeMode.dark;
    final useDyslexicFont = ref.watch(dyslexicFontProvider);
    final audioNarration = ref.watch(_audioNarrationProvider);

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorScheme.outline.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          // Accessibility header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                Icon(Icons.accessibility_new,
                    size: 18, color: colorScheme.primary,),
                const SizedBox(width: 8),
                Text(
                  'Accessibility',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
          // OpenDyslexic toggle
          Semantics(
            label: 'OpenDyslexic font toggle',
            toggled: useDyslexicFont,
            child: SwitchListTile(
              title: const Text('OpenDyslexic Font'),
              subtitle: const Text('Easier to read font for dyslexia'),
              secondary: const Icon(Icons.font_download),
              value: useDyslexicFont,
              onChanged: (value) =>
                  ref.read(dyslexicFontProvider.notifier).state = value,
            ),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          // Dark mode toggle
          Semantics(
            label: 'Dark mode toggle',
            toggled: isDarkMode,
            child: SwitchListTile(
              title: const Text('Dark Mode'),
              subtitle: const Text('Reduce eye strain in low light'),
              secondary: const Icon(Icons.dark_mode),
              value: isDarkMode,
              onChanged: (value) =>
                  ref.read(themeModeProvider.notifier).state =
                      value ? ThemeMode.dark : ThemeMode.light,
            ),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          // Audio narration toggle
          Semantics(
            label: 'Audio narration toggle',
            toggled: audioNarration,
            child: SwitchListTile(
              title: const Text('Audio Narration'),
              subtitle: const Text('Read content aloud'),
              secondary: const Icon(Icons.volume_up),
              value: audioNarration,
              onChanged: (value) =>
                  ref.read(_audioNarrationProvider.notifier).state = value,
            ),
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          // Notifications
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: const Text('Notifications'),
            subtitle: const Text('Manage notification preferences'),
            trailing:
                Icon(Icons.chevron_right, color: colorScheme.outline),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Notification settings coming soon'),),
              );
            },
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          // Font size
          ListTile(
            leading: const Icon(Icons.text_fields),
            title: const Text('Text Size'),
            subtitle: Text(
                'Level ${ref.watch(functioningLevelProvider)} '
                '(adjust for comfort)'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline, size: 20),
                  onPressed: () {
                    final current = ref.read(functioningLevelProvider);
                    if (current < 4) {
                      ref
                          .read(functioningLevelProvider.notifier)
                          .state = current + 1;
                    }
                  },
                  tooltip: 'Decrease text size',
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline, size: 20),
                  onPressed: () {
                    final current = ref.read(functioningLevelProvider);
                    if (current > 1) {
                      ref
                          .read(functioningLevelProvider.notifier)
                          .state = current - 1;
                    }
                  },
                  tooltip: 'Increase text size',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
              foregroundColor: Theme.of(ctx).colorScheme.onError,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref
        .read(authProvider.notifier)
        .logout();

    if (context.mounted) {
      context.go('/login');
    }
  }
}

// ---------------------------------------------------------------------------
// Subject progress bar
// ---------------------------------------------------------------------------

class _SubjectProgressBar extends StatelessWidget {
  const _SubjectProgressBar({
    required this.subject,
    required this.progress,
  });

  final String subject;
  final double progress;

  Color get _subjectColor {
    final s = subject.toLowerCase();
    if (s.contains('math')) return AivoColors.primary;
    if (s.contains('science')) return AivoColors.secondary;
    if (s.contains('english') || s.contains('reading')) return AivoColors.accent;
    return AivoColors.questGreen;
  }

  IconData get _subjectIcon {
    final s = subject.toLowerCase();
    if (s.contains('math')) return Icons.calculate;
    if (s.contains('science')) return Icons.science;
    if (s.contains('english') || s.contains('reading')) return Icons.menu_book;
    if (s.contains('history') || s.contains('social')) return Icons.public;
    return Icons.subject;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      label: '$subject, ${(progress * 100).round()}% mastery',
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Icon(_subjectIcon, size: 20, color: _subjectColor),
            const SizedBox(width: 10),
            SizedBox(
              width: 80,
              child: Text(
                subject,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: TweenAnimationBuilder<double>(
                  tween:
                      Tween<double>(begin: 0, end: progress.clamp(0.0, 1.0)),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeOutCubic,
                  builder: (context, value, _) {
                    return LinearProgressIndicator(
                      value: value,
                      minHeight: 8,
                      backgroundColor: colorScheme.surfaceContainerHighest,
                      color: _subjectColor,
                    );
                  },
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${(progress * 100).round()}%',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
