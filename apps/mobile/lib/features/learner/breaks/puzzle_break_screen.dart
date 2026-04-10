import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';

// ---------------------------------------------------------------------------
// PuzzleBreakScreen — Memory card matching game
// ---------------------------------------------------------------------------

class PuzzleBreakScreen extends ConsumerStatefulWidget {
  const PuzzleBreakScreen({
    super.key,
    this.onComplete,
    this.xpAwardCallback,
    this.durationSeconds = 60,
  });

  final VoidCallback? onComplete;
  final ValueChanged<int>? xpAwardCallback;
  final int durationSeconds;

  @override
  ConsumerState<PuzzleBreakScreen> createState() => _PuzzleBreakScreenState();
}

class _PuzzleBreakScreenState extends ConsumerState<PuzzleBreakScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _timerController;

  late List<_Card> _cards;
  int? _firstFlippedIndex;
  bool _busy = false; // locked while checking a pair
  int _matchCount = 0;
  int _totalPairs = 0;
  bool _completed = false;
  bool _reducedMotion = false;

  static const int _xpReward = 10;

  // Emoji icons for cards — child-friendly and colourful.
  static const _allEmojis = [
    '\u{1F436}', // 🐶
    '\u{1F431}', // 🐱
    '\u{1F31F}', // 🌟
    '\u{26A1}', // ⚡
    '\u{1F388}', // 🎈
    '\u{1F308}', // 🌈
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
        _autoCompleteRemaining();
      }
    });

    // Cards are built in didChangeDependencies once the provider is available.
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reducedMotion = MediaQuery.of(context).disableAnimations;

    // Build cards if not yet built.
    if (!_timerController.isAnimating && !_completed) {
      final level = ref.read(functioningLevelProvider);
      _buildCards(level);
      _timerController.forward();
    }
  }

  void _buildCards(FunctioningLevel level) {
    final isSimple = level.index >= FunctioningLevel.lowVerbal.index;
    final pairCount = isSimple ? 2 : 6;
    _totalPairs = pairCount;

    final emojis = List<String>.from(_allEmojis)..shuffle(Random());
    final selected = emojis.take(pairCount).toList();
    final pairs = [...selected, ...selected]..shuffle(Random());

    _cards = pairs
        .map((emoji) => _Card(emoji: emoji))
        .toList(growable: false);
  }

  @override
  void dispose() {
    _timerController.dispose();
    super.dispose();
  }

  void _onCardTap(int index) {
    if (_busy || _completed) return;
    final card = _cards[index];
    if (card.isMatched || card.isFaceUp) return;

    setState(() => card.isFaceUp = true);
    HapticFeedback.selectionClick();

    if (_firstFlippedIndex == null) {
      _firstFlippedIndex = index;
      return;
    }

    // Second card flipped — check for match.
    _busy = true;
    final firstIdx = _firstFlippedIndex!;
    _firstFlippedIndex = null;

    if (_cards[firstIdx].emoji == _cards[index].emoji) {
      // Match!
      setState(() {
        _cards[firstIdx].isMatched = true;
        _cards[index].isMatched = true;
        _matchCount++;
      });
      HapticFeedback.mediumImpact();
      _busy = false;

      if (_matchCount == _totalPairs) {
        _onAllMatched();
      }
    } else {
      // No match — flip back after 1s.
      Timer(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            _cards[firstIdx].isFaceUp = false;
            _cards[index].isFaceUp = false;
          });
          _busy = false;
        }
      });
    }
  }

  void _autoCompleteRemaining() {
    setState(() {
      for (final card in _cards) {
        card.isFaceUp = true;
        card.isMatched = true;
      }
      _matchCount = _totalPairs;
    });
    _onAllMatched();
  }

  void _onAllMatched() {
    setState(() => _completed = true);
    HapticFeedback.heavyImpact();
    // Brief pause for the celebration, then complete.
    Timer(const Duration(seconds: 2), () {
      if (mounted) _finish();
    });
  }

  void _finish() {
    widget.xpAwardCallback?.call(_xpReward);
    widget.onComplete?.call();
  }

  // ---------- Grid layout ----------

  int get _crossAxisCount {
    final level = ref.read(functioningLevelProvider);
    final isSimple = level.index >= FunctioningLevel.lowVerbal.index;
    return isSimple ? 2 : 4; // 2x2 vs 4x3
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final level = ref.watch(functioningLevelProvider);
    final isSimple = level.index >= FunctioningLevel.lowVerbal.index;
    final cardSize = isSimple ? 80.0 : 48.0;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF6C5CE7), Color(0xFF4834D4)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              children: [
                // Timer bar
                AnimatedBuilder(
                  animation: _timerController,
                  builder: (context, _) {
                    return Semantics(
                      label:
                          'Time remaining: ${((1.0 - _timerController.value) * widget.durationSeconds).round()} seconds',
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: 1.0 - _timerController.value,
                          minHeight: 6,
                          color: Colors.white,
                          backgroundColor: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 16),

                // Match counter
                Semantics(
                  liveRegion: true,
                  child: Text(
                    'Matches: $_matchCount/$_totalPairs',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Card grid
                Expanded(
                  child: Center(
                    child: _completed
                        ? _buildCelebration(theme)
                        : GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: _crossAxisCount,
                              mainAxisSpacing: 12,
                              crossAxisSpacing: 12,
                            ),
                            itemCount: _cards.length,
                            itemBuilder: (context, index) {
                              return _CardWidget(
                                card: _cards[index],
                                minSize: cardSize,
                                reducedMotion: _reducedMotion,
                                onTap: () => _onCardTap(index),
                              );
                            },
                          ),
                  ),
                ),

                const SizedBox(height: 16),

                // Skip button
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
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCelebration(ThemeData theme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('\u{1F389}', style: TextStyle(fontSize: 72)),
        const SizedBox(height: 16),
        Text(
          'Great Job!',
          style: theme.textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'You matched all the cards!',
          style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white70),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Card model
// ---------------------------------------------------------------------------

class _Card {
  _Card({required this.emoji});
  final String emoji;
  bool isFaceUp = false;
  bool isMatched = false;
}

// ---------------------------------------------------------------------------
// Card widget with flip animation
// ---------------------------------------------------------------------------

class _CardWidget extends StatelessWidget {
  const _CardWidget({
    required this.card,
    required this.minSize,
    required this.reducedMotion,
    this.onTap,
  });

  final _Card card;
  final double minSize;
  final bool reducedMotion;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isFace = card.isFaceUp || card.isMatched;

    return Semantics(
      button: !card.isMatched,
      label: card.isMatched
          ? '${card.emoji} matched'
          : isFace
              ? card.emoji
              : 'Hidden card',
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedSwitcher(
          duration: reducedMotion
              ? Duration.zero
              : const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) {
            return ScaleTransition(scale: animation, child: child);
          },
          child: Container(
            key: ValueKey(isFace ? 'face_${card.emoji}' : 'back'),
            constraints: BoxConstraints(
              minWidth: minSize,
              minHeight: minSize,
            ),
            decoration: BoxDecoration(
              color: isFace
                  ? (card.isMatched
                      ? const Color(0xFF00B894).withValues(alpha: 0.3)
                      : Colors.white.withValues(alpha: 0.2))
                  : Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: card.isMatched
                    ? const Color(0xFF00B894)
                    : Colors.white.withValues(alpha: 0.4),
                width: card.isMatched ? 3 : 1.5,
              ),
            ),
            child: Center(
              child: isFace
                  ? Text(card.emoji, style: const TextStyle(fontSize: 32))
                  : const Icon(Icons.question_mark,
                      color: Colors.white54, size: 28,),
            ),
          ),
        ),
      ),
    );
  }
}
