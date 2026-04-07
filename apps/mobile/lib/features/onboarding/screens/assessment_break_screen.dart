import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';
import 'package:aivo_mobile/features/learner/breaks/sensory_break_screen.dart';

// ---------------------------------------------------------------------------
// AssessmentBreakScreen
// ---------------------------------------------------------------------------

/// Full-screen intermediate shown between assessment questions.
///
/// Renders the correct break activity based on [breakType]. For Sprint M1 all
/// types fall back to [SensoryBreakScreen]; Sprint M2 will add dedicated
/// music, puzzle, and game break screens.
class AssessmentBreakScreen extends ConsumerStatefulWidget {
  const AssessmentBreakScreen({
    super.key,
    required this.breakType,
    required this.onComplete,
    this.xpAwardCallback,
  });

  final String breakType;
  final VoidCallback onComplete;
  final ValueChanged<int>? xpAwardCallback;

  @override
  ConsumerState<AssessmentBreakScreen> createState() =>
      _AssessmentBreakScreenState();
}

class _AssessmentBreakScreenState extends ConsumerState<AssessmentBreakScreen>
    with SingleTickerProviderStateMixin {
  bool _showIntro = true;
  late final AnimationController _introController;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _introController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _introController,
      curve: Curves.easeIn,
    );
    _scaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _introController, curve: Curves.elasticOut),
    );
    _introController.forward();

    // Transition from intro to break activity after 2 seconds.
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _showIntro = false);
      }
    });
  }

  @override
  void dispose() {
    _introController.dispose();
    super.dispose();
  }

  void _onBreakComplete() {
    _awardXp();
    widget.onComplete();
  }

  Future<void> _awardXp() async {
    const xp = 5;
    widget.xpAwardCallback?.call(xp);

    // POST to engagement API to persist XP award.
    try {
      final apiClient = ref.read(apiClientProvider);
      await apiClient.post(Endpoints.selBreak, data: {'xp': xp});
    } catch (_) {
      // Best-effort; don't block the assessment flow.
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('+5 XP! \u2B50'),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_showIntro) {
      return _buildIntro(context);
    }
    return _buildBreakActivity();
  }

  // ---------- Intro screen ----------

  Widget _buildIntro(BuildContext context) {
    final theme = Theme.of(context);
    final reducedMotion = MediaQuery.of(context).disableAnimations;

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF6C5CE7), Color(0xFF00B894)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: reducedMotion
                ? _introContent(theme)
                : FadeTransition(
                    opacity: _fadeAnimation,
                    child: ScaleTransition(
                      scale: _scaleAnimation,
                      child: _introContent(theme),
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _introContent(ThemeData theme) {
    return Semantics(
      liveRegion: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '\uD83C\uDF89', // 🎉
            style: const TextStyle(fontSize: 64),
          ),
          const SizedBox(height: 16),
          Text(
            'Time for a break!',
            style: theme.textTheme.headlineMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // ---------- Break activity ----------

  Widget _buildBreakActivity() {
    switch (widget.breakType) {
      case 'breathing':
      case 'stretch':
        return SensoryBreakScreen(
          onComplete: _onBreakComplete,
        );

      // TODO(Sprint M2): Implement dedicated MusicBreakScreen.
      case 'music':
        return SensoryBreakScreen(
          onComplete: _onBreakComplete,
        );

      // TODO(Sprint M2): Implement dedicated PuzzleBreakScreen.
      case 'puzzle':
        return SensoryBreakScreen(
          onComplete: _onBreakComplete,
        );

      // TODO(Sprint M2): Implement dedicated GameBreakScreen.
      case 'game':
        return SensoryBreakScreen(
          onComplete: _onBreakComplete,
        );

      default:
        return SensoryBreakScreen(
          onComplete: _onBreakComplete,
        );
    }
  }
}

// ---------------------------------------------------------------------------
// NonVerbalBreakPrompt
// ---------------------------------------------------------------------------

/// A parent-facing prompt used during NON_VERBAL assessments to suggest
/// giving the child a short break. This is not an interactive break screen —
/// it simply displays a message and a continue button.
class NonVerbalBreakPrompt extends StatelessWidget {
  const NonVerbalBreakPrompt({
    super.key,
    required this.onContinue,
  });

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF6C5CE7), Color(0xFF74B9FF)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: Column(
              children: [
                const Spacer(),
                const Icon(
                  Icons.self_improvement,
                  size: 80,
                  color: Colors.white,
                ),
                const SizedBox(height: 24),
                Semantics(
                  header: true,
                  child: Text(
                    'Give your child a short break',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Let them stretch, move around, or do something '
                  'calming for a minute before continuing.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                  ),
                ),
                const Spacer(),
                LargeTouchWrapper(
                  semanticLabel: 'Ready to continue',
                  onTap: onContinue,
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
}
