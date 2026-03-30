import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// Streak data model
// ---------------------------------------------------------------------------

class StreakData {
  const StreakData({
    required this.currentStreak,
    required this.longestStreak,
    required this.activeDays,
    required this.streakExpiresAt,
    required this.aivoCoins,
    required this.freezeCost,
  });

  final int currentStreak;
  final int longestStreak;
  final List<DateTime> activeDays;
  final DateTime? streakExpiresAt;
  final int aivoCoins;
  final int freezeCost;

  bool get isActive => currentStreak > 0;

  bool get isAboutToExpire {
    if (streakExpiresAt == null || currentStreak == 0) return false;
    final remaining = streakExpiresAt!.difference(DateTime.now());
    return remaining.inHours < 4 && remaining.inMinutes > 0;
  }

  factory StreakData.fromJson(Map<String, dynamic> json) {
    final activeDaysRaw = json['activeDays'] as List<dynamic>? ?? [];
    return StreakData(
      currentStreak: json['currentStreak'] as int? ?? 0,
      longestStreak: json['longestStreak'] as int? ?? 0,
      activeDays: activeDaysRaw
          .map((d) => DateTime.parse(d as String))
          .toList(),
      streakExpiresAt: json['streakExpiresAt'] != null
          ? DateTime.parse(json['streakExpiresAt'] as String)
          : null,
      aivoCoins: json['aivoCoins'] as int? ?? 0,
      freezeCost: json['freezeCost'] as int? ?? 10,
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final streakProvider = FutureProvider.autoDispose<StreakData>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';
  final response = await api.get(Endpoints.streaks(learnerId));
  return StreakData.fromJson(response.data as Map<String, dynamic>);
});

final _freezeLoadingProvider = StateProvider.autoDispose<bool>((_) => false);

// ---------------------------------------------------------------------------
// Streak widget
// ---------------------------------------------------------------------------

class StreakWidget extends ConsumerWidget {
  const StreakWidget({super.key, this.showCalendar = true});

  final bool showCalendar;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streakAsync = ref.watch(streakProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return streakAsync.when(
      loading: () => const SizedBox(height: 80),
      error: (_, __) => const SizedBox.shrink(),
      data: (streak) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: streak.isActive
                ? AivoColors.streakFlame.withValues(alpha: 0.08)
                : colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Streak header
              Row(
                children: [
                  _AnimatedFire(isActive: streak.isActive),
                  const SizedBox(width: 8),
                  Text(
                    '${streak.currentStreak}',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: streak.isActive
                          ? AivoColors.streakFlame
                          : colorScheme.outline,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    streak.currentStreak == 1 ? 'day' : 'days',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: streak.isActive
                          ? AivoColors.streakFlame
                          : colorScheme.outline,
                    ),
                  ),
                  const Spacer(),
                  if (streak.isAboutToExpire)
                    _ExpiryWarning(
                      streak: streak,
                      theme: theme,
                      colorScheme: colorScheme,
                      ref: ref,
                    ),
                ],
              ),

              // Calendar
              if (showCalendar) ...[
                const SizedBox(height: 12),
                _StreakCalendar(
                  activeDays: streak.activeDays,
                  theme: theme,
                  colorScheme: colorScheme,
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Expiry warning + freeze button
// ---------------------------------------------------------------------------

class _ExpiryWarning extends StatelessWidget {
  const _ExpiryWarning({
    required this.streak,
    required this.theme,
    required this.colorScheme,
    required this.ref,
  });

  final StreakData streak;
  final ThemeData theme;
  final ColorScheme colorScheme;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(_freezeLoadingProvider);
    final canAfford = streak.aivoCoins >= streak.freezeCost;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: colorScheme.error.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.warning_amber, size: 14, color: colorScheme.error),
              const SizedBox(width: 4),
              Text(
                'Expiring soon!',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.error,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          height: 32,
          child: OutlinedButton.icon(
            onPressed: canAfford && !isLoading
                ? () => _freezeStreak(context, ref)
                : null,
            icon: isLoading
                ? SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: colorScheme.primary,
                    ),
                  )
                : const Icon(Icons.ac_unit, size: 14),
            label: Text(
              canAfford
                  ? 'Freeze (${streak.freezeCost})'
                  : 'Need ${streak.freezeCost}',
              style: const TextStyle(fontSize: 11),
            ),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              textStyle: theme.textTheme.bodySmall,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _freezeStreak(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Freeze Streak?'),
        content: Text(
          'This will cost ${streak.freezeCost} AivoCoins to protect your '
          '${streak.currentStreak}-day streak.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Freeze'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    ref.read(_freezeLoadingProvider.notifier).state = true;
    try {
      final api = ref.read(apiClientProvider);
      final authState = ref.read(authProvider);
      final learnerId = authState is AuthAuthenticated
          ? (authState.user.learnerId ?? authState.user.id)
          : '';
      await api.post(Endpoints.streakFreeze(learnerId));
      ref.invalidate(streakProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Streak frozen successfully!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to freeze streak: $e')),
        );
      }
    } finally {
      ref.read(_freezeLoadingProvider.notifier).state = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Streak calendar (last 7 days)
// ---------------------------------------------------------------------------

class _StreakCalendar extends StatelessWidget {
  const _StreakCalendar({
    required this.activeDays,
    required this.theme,
    required this.colorScheme,
  });

  final List<DateTime> activeDays;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final days = List.generate(7, (i) {
      return DateTime(today.year, today.month, today.day - (6 - i));
    });

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: days.map((day) {
        final isActive = activeDays.any((a) =>
            a.year == day.year && a.month == day.month && a.day == day.day,);
        final isToday = day.year == today.year &&
            day.month == today.month &&
            day.day == today.day;
        final dayLabel = DateFormat('E').format(day).substring(0, 1);

        return Semantics(
          label:
              '${DateFormat('EEEE').format(day)}, ${isActive ? 'active' : 'missed'}',
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                dayLabel,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: isToday ? FontWeight.w700 : FontWeight.w400,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive
                      ? AivoColors.streakFlame
                      : colorScheme.surfaceContainerHighest,
                  border: isToday
                      ? Border.all(color: colorScheme.primary, width: 2)
                      : null,
                ),
                child: isActive
                    ? const Icon(Icons.local_fire_department,
                        size: 16, color: Colors.white,)
                    : Icon(Icons.circle,
                        size: 8, color: colorScheme.outline,),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// Animated fire icon
// ---------------------------------------------------------------------------

class _AnimatedFire extends StatefulWidget {
  const _AnimatedFire({required this.isActive});
  final bool isActive;

  @override
  State<_AnimatedFire> createState() => _AnimatedFireState();
}

class _AnimatedFireState extends State<_AnimatedFire>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    if (widget.isActive) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(covariant _AnimatedFire oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !_controller.isAnimating) {
      _controller.repeat(reverse: true);
    } else if (!widget.isActive && _controller.isAnimating) {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isActive) {
      return Icon(
        Icons.local_fire_department,
        size: 32,
        color: Theme.of(context).colorScheme.outline,
      );
    }

    return ScaleTransition(
      scale: _scaleAnimation,
      child: const Icon(
        Icons.local_fire_department,
        size: 32,
        color: AivoColors.streakFlame,
      ),
    );
  }
}
