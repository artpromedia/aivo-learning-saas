import 'dart:math' as math;

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';
import 'package:aivo_mobile/features/learner/breaks/sensory_break_timer.dart';

// ---------------------------------------------------------------------------
// SensoryBreakScreen
// ---------------------------------------------------------------------------

/// A calming full-screen break experience with gradient animation, optional
/// nature sounds, a breathing exercise, and an accessible "Ready to continue?"
/// button. Awards 5 XP on completion.
class SensoryBreakScreen extends ConsumerStatefulWidget {
  const SensoryBreakScreen({
    super.key,
    this.onComplete,
    this.xpAwardCallback,
  });

  /// Called when the user completes the break.
  final VoidCallback? onComplete;

  /// Called to award XP. Receives the number of XP to grant.
  final ValueChanged<int>? xpAwardCallback;

  @override
  ConsumerState<SensoryBreakScreen> createState() =>
      _SensoryBreakScreenState();
}

class _SensoryBreakScreenState extends ConsumerState<SensoryBreakScreen>
    with TickerProviderStateMixin {
  late final AnimationController _gradientController;
  late final AnimationController _breathingController;
  late final Animation<double> _breathingAnimation;

  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlayingAudio = false;
  bool _reducedMotion = false;

  static const int _xpReward = 5;

  @override
  void initState() {
    super.initState();

    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    );

    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    );

    _breathingAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _breathingController, curve: Curves.easeInOut),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reducedMotion = MediaQuery.of(context).disableAnimations;

    if (_reducedMotion) {
      _gradientController.stop();
      _breathingController.stop();
    } else {
      _gradientController.repeat();
      _breathingController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _breathingController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _toggleAudio() async {
    if (_isPlayingAudio) {
      await _audioPlayer.stop();
      setState(() => _isPlayingAudio = false);
    } else {
      await _audioPlayer.play(AssetSource('audio/nature_sounds.mp3'));
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      setState(() => _isPlayingAudio = true);
    }
  }

  void _onReadyToContinue() {
    _audioPlayer.stop();
    widget.xpAwardCallback?.call(_xpReward);
    ref.read(sensoryBreakTimerProvider.notifier).endBreak();
    widget.onComplete?.call();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: AnimatedBuilder(
        animation: _gradientController,
        builder: (context, child) {
          final t = _reducedMotion ? 0.0 : _gradientController.value;
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color.lerp(
                    const Color(0xFF6C5CE7),
                    const Color(0xFF74B9FF),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF74B9FF),
                    const Color(0xFF55EFC4),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF55EFC4),
                    const Color(0xFF6C5CE7),
                    t,
                  )!,
                ],
              ),
            ),
            child: child,
          );
        },
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: Column(
              children: [
                const Spacer(),
                // Breathing exercise
                _buildBreathingCircle(theme),
                const SizedBox(height: 32),
                Text(
                  'Take a deep breath',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                AnimatedBuilder(
                  animation: _breathingAnimation,
                  builder: (context, _) {
                    final breatheIn = _reducedMotion
                        ? true
                        : _breathingAnimation.value > 0.8;
                    return Text(
                      breatheIn ? 'Breathe in...' : 'Breathe out...',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white70,
                      ),
                    );
                  },
                ),
                const Spacer(),
                // Audio toggle
                OutlinedButton.icon(
                  onPressed: _toggleAudio,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  icon: Icon(
                    _isPlayingAudio ? Icons.volume_off : Icons.volume_up,
                  ),
                  label: Text(
                    _isPlayingAudio ? 'Stop Sounds' : 'Play Nature Sounds',
                  ),
                ),
                const SizedBox(height: 24),
                // Ready to continue
                LargeTouchWrapper(
                  semanticLabel: 'Ready to continue',
                  onTap: _onReadyToContinue,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      'Ready to Continue',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: const Color(0xFF6C5CE7),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBreathingCircle(ThemeData theme) {
    if (_reducedMotion) {
      return Container(
        width: 160,
        height: 160,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(0.3),
          border: Border.all(color: Colors.white, width: 3),
        ),
        child: const Center(
          child: Icon(Icons.self_improvement, size: 64, color: Colors.white),
        ),
      );
    }

    return AnimatedBuilder(
      animation: _breathingAnimation,
      builder: (context, child) {
        final scale = _breathingAnimation.value;
        return Transform.scale(
          scale: scale,
          child: Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.2 + 0.15 * scale),
              border: Border.all(color: Colors.white, width: 3),
            ),
            child: const Center(
              child:
                  Icon(Icons.self_improvement, size: 64, color: Colors.white),
            ),
          ),
        );
      },
    );
  }
}
