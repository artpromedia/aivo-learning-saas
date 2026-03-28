import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/eye_gaze_controller.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/large_touch_wrapper.dart';
import 'package:aivo_mobile/core/accessibility/scan_target_wrapper.dart';
import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';
import 'package:aivo_mobile/features/learner/breaks/sensory_break_timer.dart';

// ---------------------------------------------------------------------------
// LessonContent model
// ---------------------------------------------------------------------------

/// Represents a single screen/page of lesson content.
class LessonContent {
  const LessonContent({
    required this.title,
    required this.textContent,
    this.imageUrl,
    this.audioUrl,
    this.choices = const [],
    this.facilitatorGuide,
    this.parentActivities = const [],
    this.observationChecklist = const [],
    this.milestones = const [],
  });

  final String title;
  final String textContent;
  final String? imageUrl;
  final String? audioUrl;
  final List<LessonChoice> choices;
  final String? facilitatorGuide;
  final List<String> parentActivities;
  final List<String> observationChecklist;
  final List<String> milestones;

  /// Splits long text into single-sentence chunks for LOW_VERBAL mode.
  List<String> get sentences {
    final raw = textContent
        .split(RegExp(r'(?<=[.!?])\s+'))
        .where((s) => s.trim().isNotEmpty)
        .toList();
    return raw.isEmpty ? [textContent] : raw;
  }
}

/// A selectable choice in a lesson.
class LessonChoice {
  const LessonChoice({
    required this.key,
    required this.label,
    this.imageUrl,
  });

  final String key;
  final String label;
  final String? imageUrl;
}

// ---------------------------------------------------------------------------
// AdaptiveLessonRenderer
// ---------------------------------------------------------------------------

/// Renders lesson content adaptively based on [FunctioningLevel].
///
/// - **STANDARD / SUPPORTED**: Full content with standard touch targets.
/// - **LOW_VERBAL**: Max 1 sentence per screen, picture+text, audio auto-play,
///   2 choices only (large picture cards), celebration on every interaction,
///   sensory break cue at 5 minutes.
/// - **NON_VERBAL**: Dual output (learner view + facilitator guide), switch
///   scan or eye-gaze input, cause-and-effect format, engagement tracking.
/// - **PRE_SYMBOLIC**: No screen learning; parent sees daily activities,
///   observational checklists, and milestone tracking.
class AdaptiveLessonRenderer extends ConsumerStatefulWidget {
  const AdaptiveLessonRenderer({
    super.key,
    required this.content,
    required this.onChoiceSelected,
    this.onEngagementSignal,
  });

  final LessonContent content;
  final ValueChanged<String> onChoiceSelected;
  final VoidCallback? onEngagementSignal;

  @override
  ConsumerState<AdaptiveLessonRenderer> createState() =>
      _AdaptiveLessonRendererState();
}

class _AdaptiveLessonRendererState
    extends ConsumerState<AdaptiveLessonRenderer> {
  int _currentSentenceIndex = 0;
  bool _showCelebration = false;

  @override
  void initState() {
    super.initState();
    _autoNarrate();
  }

  Future<void> _autoNarrate() async {
    final level = ref.read(functioningLevelProvider);
    final narrator = ref.read(audioNarratorProvider);
    await narrator.autoNarrateIfNeeded(
      level,
      widget.content.title,
      [widget.content.textContent],
    );
  }

  void _onChoiceTapped(String key) {
    final level = ref.read(functioningLevelProvider);

    if (level == FunctioningLevel.lowVerbal ||
        level == FunctioningLevel.nonVerbal) {
      setState(() => _showCelebration = true);
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted) {
          setState(() => _showCelebration = false);
          widget.onChoiceSelected(key);
        }
      });
    } else {
      widget.onChoiceSelected(key);
    }
  }

  @override
  Widget build(BuildContext context) {
    final level = ref.watch(functioningLevelProvider);
    final breakState = ref.watch(sensoryBreakTimerProvider);

    if (breakState.isHardPause) {
      return const _BreakRequiredMessage();
    }

    return Stack(
      children: [
        switch (level) {
          FunctioningLevel.standard ||
          FunctioningLevel.supported =>
            _buildStandardLayout(context),
          FunctioningLevel.lowVerbal => _buildLowVerbalLayout(context),
          FunctioningLevel.nonVerbal => _buildNonVerbalLayout(context),
          FunctioningLevel.preSymbolic => _buildPreSymbolicLayout(context),
        },
        if (breakState.isBreakCue) _buildBreakCueOverlay(context),
        if (_showCelebration) _buildCelebration(context),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // STANDARD / SUPPORTED
  // -----------------------------------------------------------------------

  Widget _buildStandardLayout(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.content.title,
            style: theme.textTheme.headlineMedium,
          ),
          const SizedBox(height: 16),
          if (widget.content.imageUrl != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.content.imageUrl!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: 200,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            widget.content.textContent,
            style: theme.textTheme.bodyLarge,
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: widget.content.choices.map((choice) {
              return LargeTouchWrapper(
                semanticLabel: choice.label,
                onTap: () => _onChoiceTapped(choice.key),
                child: Chip(
                  label: Text(choice.label),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // LOW_VERBAL
  // -----------------------------------------------------------------------

  Widget _buildLowVerbalLayout(BuildContext context) {
    final theme = Theme.of(context);
    final sentences = widget.content.sentences;
    final currentSentence = _currentSentenceIndex < sentences.length
        ? sentences[_currentSentenceIndex]
        : sentences.last;

    final visibleChoices = widget.content.choices.take(2).toList();

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (widget.content.imageUrl != null) ...[
            Expanded(
              flex: 2,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.network(
                  widget.content.imageUrl!,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          Text(
            currentSentence,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          if (sentences.length > 1)
            Text(
              '${_currentSentenceIndex + 1} of ${sentences.length}',
              style: theme.textTheme.bodySmall,
            ),
          const Spacer(),
          if (visibleChoices.isNotEmpty)
            Row(
              children: visibleChoices.map((choice) {
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: LargeTouchWrapper(
                      semanticLabel: choice.label,
                      onTap: () => _onChoiceTapped(choice.key),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (choice.imageUrl != null)
                                Image.network(
                                  choice.imageUrl!,
                                  height: 80,
                                  width: 80,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(Icons.image, size: 80),
                                ),
                              const SizedBox(height: 8),
                              Text(
                                choice.label,
                                style: theme.textTheme.titleLarge,
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          const SizedBox(height: 16),
          if (sentences.length > 1 &&
              _currentSentenceIndex < sentences.length - 1)
            LargeTouchWrapper(
              semanticLabel: 'Next sentence',
              onTap: () {
                setState(() => _currentSentenceIndex++);
                _autoNarrate();
              },
              child: const Icon(Icons.arrow_forward_rounded, size: 40),
            ),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // NON_VERBAL
  // -----------------------------------------------------------------------

  Widget _buildNonVerbalLayout(BuildContext context) {
    final theme = Theme.of(context);
    final visibleChoices = widget.content.choices.take(2).toList();

    return Column(
      children: [
        // Facilitator guide strip
        if (widget.content.facilitatorGuide != null)
          Container(
            width: double.infinity,
            color: theme.colorScheme.tertiaryContainer,
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Icon(Icons.person, color: theme.colorScheme.onTertiaryContainer),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.content.facilitatorGuide!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onTertiaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
        // Learner view: cause-and-effect
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.content.imageUrl != null)
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: () {
                        widget.onEngagementSignal?.call();
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.network(
                          widget.content.imageUrl!,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) =>
                              const SizedBox.shrink(),
                        ),
                      ),
                    ),
                  ),
                const Spacer(),
                if (visibleChoices.length == 2)
                  TwoChoiceEyeGazeLayout(
                    leftLabel: visibleChoices[0].label,
                    rightLabel: visibleChoices[1].label,
                    onSelectLeft: () =>
                        _onChoiceTapped(visibleChoices[0].key),
                    onSelectRight: () =>
                        _onChoiceTapped(visibleChoices[1].key),
                    leftChild: _buildChoiceContent(visibleChoices[0], theme),
                    rightChild: _buildChoiceContent(visibleChoices[1], theme),
                  )
                else
                  ...visibleChoices.map((choice) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: ScanTargetWrapper(
                        label: choice.label,
                        child: LargeTouchWrapper(
                          semanticLabel: choice.label,
                          onTap: () => _onChoiceTapped(choice.key),
                          child: _buildChoiceContent(choice, theme),
                        ),
                      ),
                    );
                  }),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildChoiceContent(LessonChoice choice, ThemeData theme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (choice.imageUrl != null)
          Image.network(
            choice.imageUrl!,
            height: 60,
            width: 60,
            fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 60),
          ),
        const SizedBox(height: 4),
        Text(
          choice.label,
          style: theme.textTheme.titleMedium,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // PRE_SYMBOLIC
  // -----------------------------------------------------------------------

  Widget _buildPreSymbolicLayout(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header for parent/caregiver
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.family_restroom,
                        color: theme.colorScheme.onPrimaryContainer),
                    const SizedBox(width: 8),
                    Text(
                      'Parent / Caregiver Guide',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: theme.colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  widget.content.title,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Daily activities
          if (widget.content.parentActivities.isNotEmpty) ...[
            Text('Daily Activities', style: theme.textTheme.titleLarge),
            const SizedBox(height: 8),
            ...widget.content.parentActivities.map((activity) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Card(
                  child: ListTile(
                    leading: const Icon(Icons.play_circle_outline),
                    title: Text(activity),
                  ),
                ),
              );
            }),
            const SizedBox(height: 16),
          ],

          // Observation checklist
          if (widget.content.observationChecklist.isNotEmpty) ...[
            Text('Observation Checklist', style: theme.textTheme.titleLarge),
            const SizedBox(height: 8),
            ...widget.content.observationChecklist
                .asMap()
                .entries
                .map((entry) {
              return CheckboxListTile(
                value: false,
                onChanged: (_) {},
                title: Text(entry.value),
                controlAffinity: ListTileControlAffinity.leading,
              );
            }),
            const SizedBox(height: 16),
          ],

          // Milestone tracking
          if (widget.content.milestones.isNotEmpty) ...[
            Text('Milestone Tracking', style: theme.textTheme.titleLarge),
            const SizedBox(height: 8),
            ...widget.content.milestones.map((milestone) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Card(
                  child: ListTile(
                    leading: const Icon(Icons.flag_outlined),
                    title: Text(milestone),
                  ),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Break cue overlay
  // -----------------------------------------------------------------------

  Widget _buildBreakCueOverlay(BuildContext context) {
    return Positioned.fill(
      child: Container(
        color: Colors.black26,
        child: Center(
          child: Card(
            margin: const EdgeInsets.all(32),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.self_improvement, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    'Time for a break?',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You have been learning for a while. '
                    'A short break can help you feel refreshed.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      OutlinedButton(
                        onPressed: () {
                          ref
                              .read(sensoryBreakTimerProvider.notifier)
                              .dismissCue();
                        },
                        child: const Text('Keep Going'),
                      ),
                      const SizedBox(width: 12),
                      FilledButton(
                        onPressed: () {
                          ref
                              .read(sensoryBreakTimerProvider.notifier)
                              .startBreak();
                        },
                        child: const Text('Take a Break'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Celebration
  // -----------------------------------------------------------------------

  Widget _buildCelebration(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: Center(
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            builder: (context, value, child) {
              return Opacity(
                opacity: value < 0.8 ? value : (1.0 - (value - 0.8) * 5),
                child: Transform.scale(
                  scale: 0.5 + value * 0.5,
                  child: child,
                ),
              );
            },
            child: const Icon(
              Icons.star_rounded,
              size: 120,
              color: Color(0xFFFFD700),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// _BreakRequiredMessage
// ---------------------------------------------------------------------------

class _BreakRequiredMessage extends StatelessWidget {
  const _BreakRequiredMessage();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.pause_circle_filled, size: 64),
            const SizedBox(height: 16),
            Text(
              'Break Time',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'It is time for a sensory break. '
              'Please take a moment to rest before continuing.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}
