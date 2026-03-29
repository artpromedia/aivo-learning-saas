import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';
import 'package:audioplayers/audioplayers.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// Celebration types
// ---------------------------------------------------------------------------

/// The kind of celebration to display.
enum CelebrationType {
  lessonComplete,
  quizPerfect,
  levelUp,
  badgeEarned,
  streakExtended,
  purchase,
}

// ---------------------------------------------------------------------------
// CelebrationOverlay
// ---------------------------------------------------------------------------

/// A full-screen overlay that shows a Lottie celebration animation, an
/// optional XP counter, and a congratulatory message.
///
/// Use [CelebrationOverlay.show] to push the overlay onto the current
/// navigator. The overlay auto-dismisses after a configurable delay or when
/// the user taps it.
///
/// For users at [FunctioningLevel.lowVerbal] or below:
///   * The display duration is extended (5 s instead of 3 s).
///   * Haptic feedback (heavy impact) fires on show.
class CelebrationOverlay extends ConsumerStatefulWidget {
  const CelebrationOverlay._({
    required this.type,
    required this.message,
    this.xpEarned,
    this.playCelebrationSound,
  });

  /// The celebration variant.
  final CelebrationType type;

  /// The headline message displayed on the overlay (e.g. "Lesson Complete!").
  final String message;

  /// When non-null, an animated XP counter is shown below the message.
  final int? xpEarned;

  /// Whether to play a celebration sound. Defaults to `true`.
  final bool? playCelebrationSound;

  // -----------------------------------------------------------------------
  // Static API
  // -----------------------------------------------------------------------

  /// Pushes a [CelebrationOverlay] onto the current navigator as a
  /// full-screen transparent route.
  static Future<void> show(
    BuildContext context, {
    required CelebrationType type,
    required String message,
    int? xpEarned,
    bool playCelebrationSound = true,
  }) {
    return Navigator.of(context).push<void>(
      PageRouteBuilder<void>(
        opaque: false,
        barrierDismissible: true,
        barrierColor: Colors.black54,
        transitionDuration: const Duration(milliseconds: 300),
        reverseTransitionDuration: const Duration(milliseconds: 200),
        pageBuilder: (context, animation, secondaryAnimation) {
          return FadeTransition(
            opacity: animation,
            child: CelebrationOverlay._(
              type: type,
              message: message,
              xpEarned: xpEarned,
              playCelebrationSound: playCelebrationSound,
            ),
          );
        },
      ),
    );
  }

  @override
  ConsumerState<CelebrationOverlay> createState() =>
      _CelebrationOverlayState();
}

class _CelebrationOverlayState extends ConsumerState<CelebrationOverlay>
    with SingleTickerProviderStateMixin {
  Timer? _autoDismissTimer;
  late AnimationController _xpController;
  late Animation<int> _xpAnimation;
  AudioPlayer? _audioPlayer;

  @override
  void initState() {
    super.initState();

    // XP counter animation.
    _xpController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    if (widget.xpEarned != null && widget.xpEarned! > 0) {
      _xpAnimation = IntTween(begin: 0, end: widget.xpEarned!)
          .animate(CurvedAnimation(
        parent: _xpController,
        curve: Curves.easeOutCubic,
      ),);
      _xpController.forward();
    } else {
      _xpAnimation = const AlwaysStoppedAnimation<int>(0);
    }

    // Schedule auto-dismiss and side-effects post-frame so Riverpod ref is
    // safe to read.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _onShown();
    });
  }

  void _onShown() {
    final isLowVerbal = ref.read(isLowVerbalOrBelowProvider);

    // Haptic feedback for low-verbal users.
    if (isLowVerbal) {
      HapticFeedback.heavyImpact();
    } else {
      HapticFeedback.mediumImpact();
    }

    // Auto-dismiss timer.
    final duration = isLowVerbal
        ? const Duration(seconds: 5)
        : const Duration(seconds: 3);
    _autoDismissTimer = Timer(duration, _dismiss);

    // Celebration sound.
    if (widget.playCelebrationSound == true) {
      _playCelebrationAudio();
    }
  }

  Future<void> _playCelebrationAudio() async {
    try {
      _audioPlayer = AudioPlayer();
      await _audioPlayer!.play(
        AssetSource('audio/celebration.mp3'),
      );
    } catch (_) {
      // Audio is optional -- silently ignore failures.
    }
  }

  void _dismiss() {
    if (mounted && Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _xpController.dispose();
    _audioPlayer?.dispose();
    super.dispose();
  }

  // -----------------------------------------------------------------------
  // Lottie asset path per celebration type
  // -----------------------------------------------------------------------

  String _lottieAsset() {
    switch (widget.type) {
      case CelebrationType.lessonComplete:
        return 'assets/animations/celebration_lesson.json';
      case CelebrationType.quizPerfect:
        return 'assets/animations/celebration_quiz.json';
      case CelebrationType.levelUp:
        return 'assets/animations/celebration_level_up.json';
      case CelebrationType.badgeEarned:
        return 'assets/animations/celebration_badge.json';
      case CelebrationType.streakExtended:
        return 'assets/animations/celebration_streak.json';
      case CelebrationType.purchase:
        return 'assets/animations/celebration_purchase.json';
    }
  }

  // -----------------------------------------------------------------------
  // Fallback icon per celebration type (when Lottie asset is missing)
  // -----------------------------------------------------------------------

  IconData _fallbackIcon() {
    switch (widget.type) {
      case CelebrationType.lessonComplete:
        return Icons.check_circle;
      case CelebrationType.quizPerfect:
        return Icons.star;
      case CelebrationType.levelUp:
        return Icons.arrow_upward;
      case CelebrationType.badgeEarned:
        return Icons.military_tech;
      case CelebrationType.streakExtended:
        return Icons.local_fire_department;
      case CelebrationType.purchase:
        return Icons.shopping_bag;
    }
  }

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);
    final animationSize = isLowVerbal ? 220.0 : 180.0;

    return GestureDetector(
      onTap: _dismiss,
      behavior: HitTestBehavior.opaque,
      child: Semantics(
        liveRegion: true,
        label: widget.xpEarned != null
            ? '${widget.message}. You earned ${widget.xpEarned} XP.'
            : widget.message,
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Lottie animation with fallback
                SizedBox(
                  width: animationSize,
                  height: animationSize,
                  child: Lottie.asset(
                    _lottieAsset(),
                    repeat: isLowVerbal,
                    animate: true,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        _fallbackIcon(),
                        size: animationSize * 0.6,
                        color: theme.colorScheme.primary,
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),

                // Message
                Text(
                  widget.message,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: isLowVerbal ? 28 : 24,
                  ),
                ),

                // XP counter
                if (widget.xpEarned != null && widget.xpEarned! > 0) ...[
                  const SizedBox(height: 16),
                  _XpCounter(
                    animation: _xpAnimation,
                    textStyle: theme.textTheme.headlineMedium?.copyWith(
                      color: const Color(0xFFFFD700),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],

                const SizedBox(height: 32),

                // Tap to dismiss hint
                Text(
                  'Tap to continue',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Animated XP counter that rebuilds on every animation tick.
class _XpCounter extends StatelessWidget {
  const _XpCounter({
    required this.animation,
    this.textStyle,
  });

  final Animation<int> animation;
  final TextStyle? textStyle;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.bolt,
              color: Color(0xFFFFD700),
              size: 28,
            ),
            const SizedBox(width: 6),
            Text(
              '+${animation.value} XP',
              style: textStyle,
            ),
          ],
        );
      },
    );
  }
}
