import 'dart:math';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';

// ---------------------------------------------------------------------------
// GameBreakScreen — "Pop the Bubbles / Catch the Stars"
// ---------------------------------------------------------------------------

class GameBreakScreen extends ConsumerStatefulWidget {
  const GameBreakScreen({
    super.key,
    this.onComplete,
    this.xpAwardCallback,
    this.durationSeconds = 40,
  });

  final VoidCallback? onComplete;
  final ValueChanged<int>? xpAwardCallback;
  final int durationSeconds;

  @override
  ConsumerState<GameBreakScreen> createState() => _GameBreakScreenState();
}

class _GameBreakScreenState extends ConsumerState<GameBreakScreen>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  late final AnimationController _timerController;
  final AudioPlayer _audioPlayer = AudioPlayer();

  final List<_Bubble> _bubbles = [];
  final List<_PopParticle> _particles = [];
  final _random = Random();

  int _score = 0;
  bool _completed = false;
  bool _reducedMotion = false;
  Duration _lastSpawn = Duration.zero;

  // Level-dependent config.
  late double _minRadius;
  late double _maxRadius;
  late Duration _spawnInterval;

  static const int _xpReward = 5;

  static const _bubbleColors = [
    Color(0xFF6C5CE7),
    Color(0xFF00B894),
    Color(0xFFFDCB6E),
    Color(0xFFFF6348),
    Color(0xFF74B9FF),
    Color(0xFFA29BFE),
    Color(0xFF55EFC4),
  ];

  @override
  void initState() {
    super.initState();

    _timerController = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.durationSeconds),
    );
    _timerController.addStatusListener((status) {
      if (status == AnimationStatus.completed && !_completed) {
        _onTimeUp();
      }
    });

    _ticker = createTicker(_onTick);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reducedMotion = MediaQuery.of(context).disableAnimations;

    final level = ref.read(functioningLevelProvider);
    final isSimple = level.index >= FunctioningLevel.lowVerbal.index;

    _minRadius = isSimple ? 30.0 : 20.0;
    _maxRadius = isSimple ? 45.0 : 30.0;
    _spawnInterval =
        isSimple ? const Duration(milliseconds: 1000) : const Duration(milliseconds: 500);

    if (!_ticker.isActive && !_completed) {
      _ticker.start();
      _timerController.forward();
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    _timerController.dispose();
    _audioPlayer.stop();
    _audioPlayer.dispose();
    super.dispose();
  }

  // ---------- Game loop ----------

  void _onTick(Duration elapsed) {
    if (_completed) return;

    final size = MediaQuery.of(context).size;
    const dt = 1.0 / 60.0; // assume ~60fps frame delta

    // Spawn bubbles.
    if (elapsed - _lastSpawn >= _spawnInterval) {
      _lastSpawn = elapsed;
      _spawnBubble(size);
    }

    setState(() {
      // Move bubbles upward.
      if (!_reducedMotion) {
        for (final b in _bubbles) {
          b.y -= b.speed * dt;
        }
        // Remove off-screen bubbles.
        _bubbles.removeWhere((b) => b.y + b.radius < 0);
      }

      // Animate particles.
      _particles.removeWhere((p) {
        p.life -= dt;
        if (!_reducedMotion) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        return p.life <= 0;
      });
    });
  }

  void _spawnBubble(Size size) {
    final radius = _minRadius + _random.nextDouble() * (_maxRadius - _minRadius);
    final x = radius + _random.nextDouble() * (size.width - 2 * radius);
    final y = _reducedMotion
        ? radius + _random.nextDouble() * (size.height * 0.6)
        : size.height + radius;
    final speed = 40.0 + _random.nextDouble() * 60.0; // px per second

    _bubbles.add(_Bubble(
      x: x,
      y: y,
      radius: radius,
      speed: speed,
      color: _bubbleColors[_random.nextInt(_bubbleColors.length)],
    ),);
  }

  void _onTapDown(TapDownDetails details) {
    if (_completed) return;

    final tapX = details.localPosition.dx;
    final tapY = details.localPosition.dy;

    for (var i = _bubbles.length - 1; i >= 0; i--) {
      final b = _bubbles[i];
      final dx = tapX - b.x;
      final dy = tapY - b.y;
      if (dx * dx + dy * dy <= b.radius * b.radius) {
        // Hit!
        setState(() {
          _score++;
          _spawnParticles(b);
          _bubbles.removeAt(i);
        });
        HapticFeedback.mediumImpact();
        _playPop();
        return;
      }
    }
  }

  void _spawnParticles(_Bubble bubble) {
    for (var i = 0; i < 6; i++) {
      final angle = _random.nextDouble() * 2 * pi;
      final speed = 40 + _random.nextDouble() * 80;
      _particles.add(_PopParticle(
        x: bubble.x,
        y: bubble.y,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: bubble.color,
        life: 0.5,
      ),);
    }
  }

  Future<void> _playPop() async {
    try {
      await _audioPlayer.play(AssetSource('audio/pop.mp3'));
    } catch (_) {
      // Audio asset may be missing.
    }
  }

  void _onTimeUp() {
    setState(() => _completed = true);
    HapticFeedback.heavyImpact();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _finish();
    });
  }

  void _finish() {
    _ticker.stop();
    _audioPlayer.stop();
    widget.xpAwardCallback?.call(_xpReward);
    widget.onComplete?.call();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0D0D2B), Color(0xFF1A1A40)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Timer bar
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: AnimatedBuilder(
                  animation: _timerController,
                  builder: (context, _) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: 1.0 - _timerController.value,
                        minHeight: 6,
                        color: const Color(0xFFFDCB6E),
                        backgroundColor: Colors.white.withValues(alpha: 0.15),
                      ),
                    );
                  },
                ),
              ),

              // Score
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: [
                    Semantics(
                      liveRegion: true,
                      child: Text(
                        '\u{2B50} Stars: $_score',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: const Color(0xFFFFD700),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Spacer(),
                  ],
                ),
              ),

              // Game area
              Expanded(
                child: _completed
                    ? _buildCelebration(theme)
                    : GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTapDown: _onTapDown,
                        child: CustomPaint(
                          painter: _GamePainter(
                            bubbles: _bubbles,
                            particles: _particles,
                          ),
                          size: Size.infinite,
                        ),
                      ),
              ),

              // Ready button (translucent)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                child: LargeTouchWrapper(
                  semanticLabel: "I'm Ready",
                  onTap: _finish,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3),),
                    ),
                    child: Text(
                      "I'm Ready!",
                      textAlign: TextAlign.center,
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCelebration(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('\u{1F31F}', style: TextStyle(fontSize: 72)),
          const SizedBox(height: 16),
          Text(
            'Amazing!',
            style: theme.textTheme.headlineMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You caught $_score stars!',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: const Color(0xFFFFD700),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Game models
// ---------------------------------------------------------------------------

class _Bubble {
  _Bubble({
    required this.x,
    required this.y,
    required this.radius,
    required this.speed,
    required this.color,
  });

  double x;
  double y;
  final double radius;
  final double speed;
  final Color color;
}

class _PopParticle {
  _PopParticle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.color,
    required this.life,
  });

  double x;
  double y;
  double vx;
  double vy;
  Color color;
  double life; // seconds remaining
}

// ---------------------------------------------------------------------------
// CustomPainter for bubbles and particles
// ---------------------------------------------------------------------------

class _GamePainter extends CustomPainter {
  _GamePainter({required this.bubbles, required this.particles});

  final List<_Bubble> bubbles;
  final List<_PopParticle> particles;

  @override
  void paint(Canvas canvas, Size size) {
    // Draw bubbles.
    for (final b in bubbles) {
      final paint = Paint()
        ..color = b.color.withValues(alpha: 0.8)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(b.x, b.y), b.radius, paint);

      // White highlight for 3D effect.
      final highlight = Paint()
        ..color = Colors.white.withValues(alpha: 0.3)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(
        Offset(b.x - b.radius * 0.25, b.y - b.radius * 0.25),
        b.radius * 0.3,
        highlight,
      );
    }

    // Draw particles.
    for (final p in particles) {
      final alpha = (p.life / 0.5).clamp(0.0, 1.0);
      final paint = Paint()
        ..color = p.color.withValues(alpha: alpha)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(p.x, p.y), 4, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _GamePainter oldDelegate) => true;
}
