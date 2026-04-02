import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

// ---------------------------------------------------------------------------
// Emotion zone enum
// ---------------------------------------------------------------------------

enum EmotionZone { calm, happy, worried, frustrated, sad }

// ---------------------------------------------------------------------------
// EmotionCheckInWidget
// ---------------------------------------------------------------------------

class EmotionCheckInWidget extends StatefulWidget {
  const EmotionCheckInWidget({
    super.key,
    this.learnerName,
    required this.onComplete,
  });

  final String? learnerName;
  final ValueChanged<EmotionZone> onComplete;

  @override
  State<EmotionCheckInWidget> createState() => _EmotionCheckInWidgetState();
}

class _EmotionCheckInWidgetState extends State<EmotionCheckInWidget>
    with TickerProviderStateMixin {
  static const _emotions = [
    (zone: EmotionZone.calm, emoji: '\u{1F60C}', label: 'Calm', color: Color(0xFF81C784)),
    (zone: EmotionZone.happy, emoji: '\u{1F60A}', label: 'Happy', color: Color(0xFFFFD54F)),
    (zone: EmotionZone.worried, emoji: '\u{1F61F}', label: 'Worried', color: Color(0xFF64B5F6)),
    (zone: EmotionZone.frustrated, emoji: '\u{1F624}', label: 'Frustrated', color: Color(0xFFFFB74D)),
    (zone: EmotionZone.sad, emoji: '\u{1F622}', label: 'Sad', color: Color(0xFFCE93D8)),
  ];

  // Lavender theme color for Harmony
  static const _lavender = Color(0xFFB39DDB);
  static const _lavenderLight = Color(0xFFEDE7F6);

  // Staggered entrance animations
  late final List<AnimationController> _entranceControllers;
  late final List<Animation<double>> _entranceFades;

  // Selection animation
  late final AnimationController _selectionController;
  late final Animation<double> _selectionScale;

  EmotionZone? _selected;

  @override
  void initState() {
    super.initState();

    // Staggered entrance: each circle fades in 100ms apart
    _entranceControllers = List.generate(
      _emotions.length,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 400),
      ),
    );
    _entranceFades = _entranceControllers
        .map((c) => CurvedAnimation(parent: c, curve: Curves.easeOut))
        .toList();

    // Kick off staggered entrance
    for (var i = 0; i < _emotions.length; i++) {
      Future.delayed(Duration(milliseconds: 100 * i), () {
        if (mounted) _entranceControllers[i].forward();
      });
    }

    // Spring-like selection scale
    _selectionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _selectionScale = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _selectionController, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    for (final c in _entranceControllers) {
      c.dispose();
    }
    _selectionController.dispose();
    super.dispose();
  }

  void _onEmotionTapped(EmotionZone zone) {
    if (_selected != null) return; // Already selected

    setState(() => _selected = zone);
    _selectionController.forward();

    SemanticsService.announce(
      'You selected ${zone.name}',
      TextDirection.ltr,
    );

    // Delay before completing
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) widget.onComplete(zone);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = widget.learnerName;

    return Semantics(
      label: 'Select how you\'re feeling',
      child: Card(
        color: _lavenderLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: _lavender.withValues(alpha: 0.3)),
        ),
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                name != null && name.isNotEmpty
                    ? 'Hey $name! How are you feeling right now?'
                    : 'Hey! How are you feeling right now?',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF4A148C),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              ExcludeSemantics(
                child: Text(
                  'Every feeling is welcome here \u{1F331}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF7B1FA2),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_emotions.length, (i) {
                    final emotion = _emotions[i];
                    final isSelected = _selected == emotion.zone;
                    final isOther = _selected != null && !isSelected;

                    return FadeTransition(
                      opacity: _entranceFades[i],
                      child: AnimatedOpacity(
                        opacity: isOther ? 0.5 : 1.0,
                        duration: const Duration(milliseconds: 200),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: _EmotionCircle(
                            zone: emotion.zone,
                            emoji: emotion.emoji,
                            label: emotion.label,
                            color: emotion.color,
                            isSelected: isSelected,
                            scaleAnimation: isSelected ? _selectionScale : null,
                            onTap: () => _onEmotionTapped(emotion.zone),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Individual emotion circle
// ---------------------------------------------------------------------------

class _EmotionCircle extends StatelessWidget {
  const _EmotionCircle({
    required this.zone,
    required this.emoji,
    required this.label,
    required this.color,
    required this.isSelected,
    this.scaleAnimation,
    required this.onTap,
  });

  final EmotionZone zone;
  final String emoji;
  final String label;
  final Color color;
  final bool isSelected;
  final Animation<double>? scaleAnimation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget circle = Semantics(
      label: '$label - tap if you\'re feeling ${label.toLowerCase()}',
      button: true,
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: color.withValues(alpha: 0.5),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
              alignment: Alignment.center,
              child: ExcludeSemantics(
                child: Text(
                  emoji,
                  style: const TextStyle(fontSize: 28),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: const Color(0xFF4A148C),
              ),
            ),
          ],
        ),
      ),
    );

    if (scaleAnimation != null) {
      circle = ScaleTransition(
        scale: scaleAnimation!,
        child: circle,
      );
    }

    return circle;
  }
}
