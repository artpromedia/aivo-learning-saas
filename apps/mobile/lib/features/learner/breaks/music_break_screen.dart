import 'dart:math';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';

// ---------------------------------------------------------------------------
// MusicBreakScreen
// ---------------------------------------------------------------------------

/// A calming music break with animated visuals — gradient background, pulsing
/// circles, floating musical note icons, and a countdown timer.
class MusicBreakScreen extends ConsumerStatefulWidget {
  const MusicBreakScreen({
    super.key,
    this.onComplete,
    this.xpAwardCallback,
    this.durationSeconds = 45,
  });

  final VoidCallback? onComplete;
  final ValueChanged<int>? xpAwardCallback;
  final int durationSeconds;

  @override
  ConsumerState<MusicBreakScreen> createState() => _MusicBreakScreenState();
}

class _MusicBreakScreenState extends ConsumerState<MusicBreakScreen>
    with TickerProviderStateMixin {
  late final AnimationController _gradientController;
  late final AnimationController _pulseController;
  late final AnimationController _countdownController;
  late final Animation<double> _pulseAnimation;

  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _reducedMotion = false;

  // Floating notes state.
  final List<_FloatingNote> _notes = [];
  final _random = Random();

  static const int _xpReward = 5;

  @override
  void initState() {
    super.initState();

    // Gradient rotation (8s loop).
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    );

    // Pulse circles (beat effect ~1.5 Hz → 667ms).
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    // Countdown timer.
    _countdownController = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.durationSeconds),
    );
    _countdownController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _finish();
      }
    });

    // Seed floating notes.
    _seedNotes();

    _playAudio();
    _countdownController.forward();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reducedMotion = MediaQuery.of(context).disableAnimations;

    if (_reducedMotion) {
      _gradientController.stop();
      _pulseController.stop();
    } else {
      _gradientController.repeat();
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _pulseController.dispose();
    _countdownController.dispose();
    _audioPlayer.stop();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _seedNotes() {
    const noteChars = ['\u{1F3B5}', '\u{266A}', '\u{266B}', '\u{1F3B6}'];
    for (var i = 0; i < 6; i++) {
      _notes.add(_FloatingNote(
        char: noteChars[_random.nextInt(noteChars.length)],
        xFraction: 0.1 + _random.nextDouble() * 0.8,
        startDelay: Duration(milliseconds: _random.nextInt(4000)),
        durationSeconds: 4 + _random.nextInt(4),
      ),);
    }
  }

  Future<void> _playAudio() async {
    try {
      await _audioPlayer.play(AssetSource('audio/calm_melody.mp3'));
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
    } catch (_) {
      // Audio asset may be missing; don't block the break.
    }
  }

  void _finish() {
    HapticFeedback.lightImpact();
    _audioPlayer.stop();
    widget.xpAwardCallback?.call(_xpReward);
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
                    const Color(0xFF55EFC4),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF55EFC4),
                    const Color(0xFF74B9FF),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF74B9FF),
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
          child: Stack(
            children: [
              // Floating notes
              if (!_reducedMotion)
                ..._notes.map((note) => _FloatingNoteWidget(note: note)),

              // Main content column
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                child: Column(
                  children: [
                    // Header with equalizer bars
                    Semantics(
                      header: true,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('\u{1F3B5}',
                              style: TextStyle(fontSize: 28),),
                          const SizedBox(width: 8),
                          Text(
                            'Calm Melody',
                            style: theme.textTheme.headlineMedium?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 12),
                          if (!_reducedMotion) _EqualizerBars(controller: _pulseController),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Pulsing circles
                    _buildPulsingCircles(theme),

                    const Spacer(),

                    // Countdown timer
                    AnimatedBuilder(
                      animation: _countdownController,
                      builder: (context, _) {
                        final remaining = widget.durationSeconds -
                            (_countdownController.value *
                                    widget.durationSeconds)
                                .round();
                        final minutes = remaining ~/ 60;
                        final seconds = remaining % 60;
                        return Semantics(
                          label:
                              'Time remaining: $minutes minutes $seconds seconds',
                          child: SizedBox(
                            width: 60,
                            height: 60,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                CircularProgressIndicator(
                                  value: 1.0 - _countdownController.value,
                                  strokeWidth: 3,
                                  color: Colors.white70,
                                  backgroundColor:
                                      Colors.white.withValues(alpha: 0.2),
                                ),
                                Text(
                                  '$minutes:${seconds.toString().padLeft(2, '0')}',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 24),

                    // Ready button
                    LargeTouchWrapper(
                      semanticLabel: "I'm Ready",
                      onTap: _finish,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          "I'm Ready!",
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
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPulsingCircles(ThemeData theme) {
    if (_reducedMotion) {
      return Container(
        width: 160,
        height: 160,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withValues(alpha: 0.25),
          border: Border.all(color: Colors.white, width: 2),
        ),
        child: const Center(
          child: Icon(Icons.music_note, size: 64, color: Colors.white),
        ),
      );
    }

    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        final scale = _pulseAnimation.value;
        return Stack(
          alignment: Alignment.center,
          children: [
            // Outer ring
            Transform.scale(
              scale: scale * 0.9,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2), width: 1,),
                ),
              ),
            ),
            // Middle ring
            Transform.scale(
              scale: scale,
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.15),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.4), width: 2,),
                ),
              ),
            ),
            // Center icon
            const Icon(Icons.music_note, size: 56, color: Colors.white),
          ],
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Floating note model & widget
// ---------------------------------------------------------------------------

class _FloatingNote {
  _FloatingNote({
    required this.char,
    required this.xFraction,
    required this.startDelay,
    required this.durationSeconds,
  });

  final String char;
  final double xFraction;
  final Duration startDelay;
  final int durationSeconds;
}

class _FloatingNoteWidget extends StatefulWidget {
  const _FloatingNoteWidget({required this.note});
  final _FloatingNote note;

  @override
  State<_FloatingNoteWidget> createState() => _FloatingNoteWidgetState();
}

class _FloatingNoteWidgetState extends State<_FloatingNoteWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.note.durationSeconds),
    );
    Future.delayed(widget.note.startDelay, () {
      if (mounted) _controller.repeat();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final t = _controller.value;
        final x = size.width * widget.note.xFraction +
            sin(t * 2 * pi) * 20; // gentle sway
        final y = size.height * (1.0 - t); // float upward
        final opacity = t < 0.1
            ? t * 10
            : t > 0.85
                ? (1.0 - t) / 0.15
                : 1.0;

        return Positioned(
          left: x,
          top: y,
          child: Opacity(
            opacity: opacity.clamp(0.0, 0.6),
            child: Text(
              widget.note.char,
              style: const TextStyle(fontSize: 28),
            ),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Equalizer bars widget
// ---------------------------------------------------------------------------

class _EqualizerBars extends StatelessWidget {
  const _EqualizerBars({required this.controller});
  final AnimationController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final t = controller.value;
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            _bar(12 + 12 * sin(t * 2 * pi)),
            const SizedBox(width: 3),
            _bar(12 + 12 * sin(t * 2 * pi + pi / 3)),
            const SizedBox(width: 3),
            _bar(12 + 12 * sin(t * 2 * pi + 2 * pi / 3)),
          ],
        );
      },
    );
  }

  Widget _bar(double height) {
    return Container(
      width: 4,
      height: height.clamp(4.0, 24.0),
      decoration: BoxDecoration(
        color: Colors.white70,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}
