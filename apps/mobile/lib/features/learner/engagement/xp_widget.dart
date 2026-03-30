import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// XP data model
// ---------------------------------------------------------------------------

class XpData {
  const XpData({
    required this.totalXp,
    required this.currentLevel,
    required this.xpInCurrentLevel,
    required this.xpToNextLevel,
  });

  final int totalXp;
  final int currentLevel;
  final int xpInCurrentLevel;
  final int xpToNextLevel;

  double get progressToNextLevel =>
      xpToNextLevel > 0 ? xpInCurrentLevel / xpToNextLevel : 0.0;

  factory XpData.fromJson(Map<String, dynamic> json) {
    return XpData(
      totalXp: json['totalXp'] as int? ?? 0,
      currentLevel: json['currentLevel'] as int? ?? 1,
      xpInCurrentLevel: json['xpInCurrentLevel'] as int? ?? 0,
      xpToNextLevel: json['xpToNextLevel'] as int? ?? 100,
    );
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final xpProvider = FutureProvider.autoDispose<XpData>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';
  final response = await api.get(Endpoints.xp(learnerId));
  return XpData.fromJson(response.data as Map<String, dynamic>);
});

// ---------------------------------------------------------------------------
// Compact XP widget (for app bar, home screen)
// ---------------------------------------------------------------------------

class XpWidget extends ConsumerWidget {
  const XpWidget({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final xpAsync = ref.watch(xpProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return xpAsync.when(
      loading: () => compact
          ? const SizedBox(width: 60, height: 24)
          : const SizedBox(height: 56),
      error: (_, __) => const SizedBox.shrink(),
      data: (xp) {
        if (compact) {
          return _CompactXp(xp: xp, theme: theme, colorScheme: colorScheme);
        }
        return _FullXp(xp: xp, theme: theme, colorScheme: colorScheme);
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Compact variant (app bar)
// ---------------------------------------------------------------------------

class _CompactXp extends StatelessWidget {
  const _CompactXp({
    required this.xp,
    required this.theme,
    required this.colorScheme,
  });

  final XpData xp;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          'Level ${xp.currentLevel}, ${xp.xpInCurrentLevel} of ${xp.xpToNextLevel} XP to next level',
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AivoColors.xpGold.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.star, size: 16, color: AivoColors.xpGold),
            const SizedBox(width: 4),
            Text(
              'Lv${xp.currentLevel}',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: AivoColors.xpGold,
              ),
            ),
            const SizedBox(width: 6),
            SizedBox(
              width: 40,
              child: _AnimatedXpBar(
                progress: xp.progressToNextLevel,
                height: 6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Full variant (home screen / profile)
// ---------------------------------------------------------------------------

class _FullXp extends StatelessWidget {
  const _FullXp({
    required this.xp,
    required this.theme,
    required this.colorScheme,
  });

  final XpData xp;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          'Level ${xp.currentLevel}, ${xp.totalXp} total XP, ${xp.xpInCurrentLevel} of ${xp.xpToNextLevel} to next level',
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AivoColors.xpGold.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            // Level badge
            _LevelBadge(level: xp.currentLevel),
            const SizedBox(width: 12),
            // Progress details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Level ${xp.currentLevel}',
                        style: theme.textTheme.titleMedium,
                      ),
                      Text(
                        '${xp.totalXp} XP total',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  _AnimatedXpBar(
                    progress: xp.progressToNextLevel,
                    height: 10,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${xp.xpInCurrentLevel} / ${xp.xpToNextLevel} XP to Level ${xp.currentLevel + 1}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
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
// Animated XP progress bar
// ---------------------------------------------------------------------------

class _AnimatedXpBar extends StatelessWidget {
  const _AnimatedXpBar({
    required this.progress,
    required this.height,
  });

  final double progress;
  final double height;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: TweenAnimationBuilder<double>(
        tween: Tween<double>(begin: 0, end: progress.clamp(0.0, 1.0)),
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeOutCubic,
        builder: (context, value, _) {
          return SizedBox(
            height: height,
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: AivoColors.xpGold.withValues(alpha: 0.2),
              color: AivoColors.xpGold,
              minHeight: height,
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Level badge
// ---------------------------------------------------------------------------

class _LevelBadge extends StatefulWidget {
  const _LevelBadge({required this.level});
  final int level;

  @override
  State<_LevelBadge> createState() => _LevelBadgeState();
}

class _LevelBadgeState extends State<_LevelBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  int _previousLevel = 0;

  @override
  void initState() {
    super.initState();
    _previousLevel = widget.level;
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.3), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 1),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void didUpdateWidget(covariant _LevelBadge oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.level != _previousLevel) {
      _previousLevel = widget.level;
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: const LinearGradient(
            colors: [AivoColors.xpGold, Color(0xFFFF8C00)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: AivoColors.xpGold.withValues(alpha: 0.4),
              blurRadius: 8,
            ),
          ],
        ),
        child: Center(
          child: Text(
            '${widget.level}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
        ),
      ),
    );
  }
}
