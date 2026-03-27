import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';
import 'package:aivo_mobile/data/repositories/learning_repository.dart';
import 'package:aivo_mobile/shared/widgets/celebration_overlay.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _sessionProvider = FutureProvider.autoDispose
    .family<LearningSession, String>((ref, lessonId) async {
  final repo = ref.watch(learningRepositoryProvider);
  return repo.startSession(lessonId);
});

// ---------------------------------------------------------------------------
// LessonScreen
// ---------------------------------------------------------------------------

class LessonScreen extends ConsumerStatefulWidget {
  const LessonScreen({super.key, required this.lessonId});

  final String lessonId;

  @override
  ConsumerState<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends ConsumerState<LessonScreen> {
  int _currentStep = 0;
  bool _isSubmitting = false;
  bool _isCompleted = false;
  String? _selectedChoice;
  final _fillInController = TextEditingController();
  final Map<String, String> _matchingAnswers = {};
  Timer? _autoPauseTimer;
  bool _isPaused = false;

  @override
  void dispose() {
    _fillInController.dispose();
    _autoPauseTimer?.cancel();
    super.dispose();
  }

  void _startAutoPauseTimer() {
    _autoPauseTimer?.cancel();
    final isLowVerbal = ref.read(isLowVerbalOrBelowProvider);
    if (!isLowVerbal) return;
    _autoPauseTimer = Timer(const Duration(minutes: 5), () {
      if (mounted && !_isPaused) {
        setState(() => _isPaused = true);
        HapticFeedback.mediumImpact();
      }
    });
  }

  void _resetAutoPauseTimer() {
    if (_isPaused) return;
    _startAutoPauseTimer();
  }

  List<Map<String, dynamic>> _getSections(LearningSession session) {
    final raw = session.content['sections'];
    if (raw is List) {
      return raw.cast<Map<String, dynamic>>();
    }
    return [session.content];
  }

  List<Interaction> _getInteractions(LearningSession session) {
    return session.interactions;
  }

  int _totalSteps(LearningSession session) {
    return _getSections(session).length + _getInteractions(session).length;
  }

  bool _isInteractionStep(LearningSession session) {
    return _currentStep >= _getSections(session).length;
  }

  Interaction? _currentInteraction(LearningSession session) {
    final sections = _getSections(session);
    if (_currentStep >= sections.length) {
      final idx = _currentStep - sections.length;
      final interactions = _getInteractions(session);
      if (idx < interactions.length) return interactions[idx];
    }
    return null;
  }

  Map<String, dynamic>? _currentSection(LearningSession session) {
    final sections = _getSections(session);
    if (_currentStep < sections.length) return sections[_currentStep];
    return null;
  }

  Future<void> _submitInteraction(LearningSession session, String response) async {
    final interaction = _currentInteraction(session);
    if (interaction == null || _isSubmitting) return;

    setState(() => _isSubmitting = true);

    try {
      final repo = ref.read(learningRepositoryProvider);
      await repo.submitInteraction(session.id, interaction.id, response);
      _advanceStep(session);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _advanceStep(LearningSession session) {
    _selectedChoice = null;
    _fillInController.clear();
    _matchingAnswers.clear();
    _resetAutoPauseTimer();

    if (_currentStep + 1 >= _totalSteps(session)) {
      _completeLesson(session);
    } else {
      setState(() => _currentStep++);
      _narrateCurrentStep(session);
    }
  }

  Future<void> _completeLesson(LearningSession session) async {
    final repo = ref.read(learningRepositoryProvider);
    try {
      await repo.completeSession(session.id, score: session.score);
    } catch (_) {
      // Already queued offline if needed
    }

    setState(() => _isCompleted = true);

    if (!mounted) return;

    final xp = (session.content['xpReward'] as num?)?.toInt() ?? 25;
    await CelebrationOverlay.show(
      context,
      type: CelebrationType.lessonComplete,
      message: 'Lesson Complete!',
      xpEarned: xp,
    );

    if (mounted) {
      context.canPop() ? context.pop() : context.go('/learner/home');
    }
  }

  void _narrateCurrentStep(LearningSession session) {
    final narrator = ref.read(audioNarratorProvider);
    final level = ref.read(functioningLevelProvider);
    if (level.index < FunctioningLevel.lowVerbal.index) return;

    final section = _currentSection(session);
    if (section != null) {
      final title = section['title'] as String? ?? '';
      final text = section['text'] as String? ?? '';
      narrator.autoNarrateIfNeeded(level, title, [text]);
    }

    final interaction = _currentInteraction(session);
    if (interaction != null) {
      narrator.autoNarrateIfNeeded(level, interaction.prompt, []);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(_sessionProvider(widget.lessonId));
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);
    final isNonVerbal = ref.watch(isNonVerbalOrBelowProvider);

    return Scaffold(
      body: sessionAsync.when(
        loading: () => SafeArea(
          child: Column(
            children: [
              const LinearProgressIndicator(),
              const SizedBox(height: 16),
              Expanded(child: LoadingShimmer.text(lines: 6)),
            ],
          ),
        ),
        error: (error, _) => SafeArea(
          child: ErrorView.fullScreen(
            message: 'Failed to load lesson.\n$error',
            onRetry: () => ref.invalidate(_sessionProvider(widget.lessonId)),
          ),
        ),
        data: (session) {
          if (_isPaused) {
            return _buildPauseScreen(theme, session);
          }
          return _buildLessonContent(theme, session, isLowVerbal, isNonVerbal);
        },
      ),
    );
  }

  Widget _buildPauseScreen(ThemeData theme, LearningSession session) {
    return SafeArea(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.pause_circle_filled,
                size: 80, color: theme.colorScheme.primary),
            const SizedBox(height: 24),
            Text(
              'Time for a break!',
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Text(
              "You've been learning for 5 minutes.",
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                setState(() => _isPaused = false);
                _startAutoPauseTimer();
              },
              icon: const Icon(Icons.play_arrow),
              label: const Text('Continue Learning'),
              style: ElevatedButton.styleFrom(
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonContent(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal) {
    final total = _totalSteps(session);
    final progress = total > 0 ? (_currentStep + 1) / total : 0.0;

    return SafeArea(
      child: Column(
        children: [
          // App bar area
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Exit lesson',
                  onPressed: () => context.canPop()
                      ? context.pop()
                      : context.go('/learner/home'),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        'Step ${_currentStep + 1} of $total',
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: isLowVerbal ? 10 : 6,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 48),
              ],
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(isLowVerbal ? 24 : 16),
              child: _isInteractionStep(session)
                  ? _buildInteraction(
                      theme, session, isLowVerbal, isNonVerbal)
                  : _buildSection(
                      theme, session, isLowVerbal, isNonVerbal),
            ),
          ),

          // Navigation
          Padding(
            padding: EdgeInsets.all(isLowVerbal ? 20 : 16),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() => _currentStep--);
                        _resetAutoPauseTimer();
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Previous'),
                      style: OutlinedButton.styleFrom(
                        minimumSize:
                            Size(0, isLowVerbal ? 64 : 48),
                      ),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  child: _buildNextButton(theme, session, isLowVerbal),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNextButton(
      ThemeData theme, LearningSession session, bool isLowVerbal) {
    final isLastStep = _currentStep + 1 >= _totalSteps(session);
    final isInteraction = _isInteractionStep(session);

    if (isInteraction) {
      return ElevatedButton.icon(
        onPressed: _isSubmitting
            ? null
            : () {
                final response = _selectedChoice ??
                    _fillInController.text.trim();
                if (response.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Please provide an answer')),
                  );
                  return;
                }
                _submitInteraction(session, response);
              },
        icon: _isSubmitting
            ? const SizedBox(
                width: 18,
                height: 18,
                child:
                    CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(isLastStep ? Icons.check : Icons.send),
        label: Text(isLastStep ? 'Submit & Finish' : 'Submit'),
        style: ElevatedButton.styleFrom(
          minimumSize: Size(0, isLowVerbal ? 64 : 48),
        ),
      );
    }

    return ElevatedButton.icon(
      onPressed: () => _advanceStep(session),
      icon: Icon(isLastStep ? Icons.check : Icons.arrow_forward),
      label: Text(isLastStep ? 'Complete' : 'Next'),
      style: ElevatedButton.styleFrom(
        minimumSize: Size(0, isLowVerbal ? 64 : 48),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Content section rendering
  // -------------------------------------------------------------------------

  Widget _buildSection(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal) {
    final section = _currentSection(session);
    if (section == null) return const SizedBox.shrink();

    final title = section['title'] as String? ?? '';
    final text = section['text'] as String? ?? '';
    final imageUrl = section['imageUrl'] as String?;
    final explanationStyle = isLowVerbal
        ? theme.textTheme.titleLarge
        : theme.textTheme.bodyLarge;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title.isNotEmpty) ...[
          Text(
            title,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontSize: isLowVerbal ? 28 : 24,
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (imageUrl != null && imageUrl.isNotEmpty) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              width: double.infinity,
              fit: BoxFit.contain,
              placeholder: (_, __) => const SizedBox(
                height: 200,
                child: Center(child: CircularProgressIndicator()),
              ),
              errorWidget: (_, __, ___) => const SizedBox(
                height: 200,
                child: Center(child: Icon(Icons.broken_image, size: 48)),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (text.isNotEmpty)
          Text(text, style: explanationStyle),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Interaction rendering
  // -------------------------------------------------------------------------

  Widget _buildInteraction(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal) {
    final interaction = _currentInteraction(session);
    if (interaction == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Prompt
        Text(
          interaction.prompt,
          style: theme.textTheme.titleLarge?.copyWith(
            fontSize: isLowVerbal ? 24 : 20,
          ),
        ),
        const SizedBox(height: 24),

        // Type-specific interaction
        _buildInteractionByType(
            theme, interaction, isLowVerbal, isNonVerbal),
      ],
    );
  }

  Widget _buildInteractionByType(ThemeData theme, Interaction interaction,
      bool isLowVerbal, bool isNonVerbal) {
    switch (interaction.type) {
      case 'multiple_choice':
        return _buildMultipleChoice(theme, interaction, isLowVerbal);
      case 'fill_in_blank':
        return _buildFillInBlank(theme, interaction, isLowVerbal);
      case 'matching':
        return _buildMatching(theme, interaction, isLowVerbal);
      case 'picture_select':
        return _buildPictureSelect(theme, interaction, isLowVerbal);
      default:
        return _buildMultipleChoice(theme, interaction, isLowVerbal);
    }
  }

  Widget _buildMultipleChoice(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    final options = (interaction.data['options'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];

    final displayOptions = isLowVerbal && options.length > 2
        ? options.take(2).toList()
        : options;

    final imageUrls =
        (interaction.data['imageUrls'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [];

    return Column(
      children: displayOptions.asMap().entries.map((entry) {
        final idx = entry.key;
        final option = entry.value;
        final isSelected = _selectedChoice == option;
        final hasImage = idx < imageUrls.length && imageUrls[idx].isNotEmpty;

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Material(
            color: isSelected
                ? theme.colorScheme.primary.withAlpha(30)
                : theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => setState(() => _selectedChoice = option),
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(isLowVerbal ? 20 : 16),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isSelected
                        ? theme.colorScheme.primary
                        : Colors.transparent,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    if (hasImage) ...[
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: CachedNetworkImage(
                          imageUrl: imageUrls[idx],
                          width: isLowVerbal ? 80 : 60,
                          height: isLowVerbal ? 80 : 60,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) =>
                              const Icon(Icons.image, size: 40),
                        ),
                      ),
                      const SizedBox(width: 16),
                    ],
                    Expanded(
                      child: Text(
                        option,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontSize: isLowVerbal ? 20 : 16,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ),
                    Icon(
                      isSelected
                          ? Icons.radio_button_checked
                          : Icons.radio_button_off,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.outline,
                      size: isLowVerbal ? 32 : 24,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFillInBlank(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    return TextField(
      controller: _fillInController,
      style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
      decoration: InputDecoration(
        hintText: 'Type your answer here...',
        hintStyle: TextStyle(fontSize: isLowVerbal ? 20 : 16),
        contentPadding: EdgeInsets.all(isLowVerbal ? 20 : 16),
      ),
      maxLines: 3,
      textInputAction: TextInputAction.done,
    );
  }

  Widget _buildMatching(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    final leftItems =
        (interaction.data['left'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [];
    final rightItems =
        (interaction.data['right'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Match each item on the left with one on the right:',
            style: theme.textTheme.bodyMedium),
        const SizedBox(height: 16),
        ...leftItems.map((left) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(left,
                        style: TextStyle(fontSize: isLowVerbal ? 18 : 14)),
                  ),
                ),
                const SizedBox(width: 12),
                const Icon(Icons.arrow_forward, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _matchingAnswers[left],
                    hint: const Text('Select'),
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    items: rightItems.map((right) {
                      return DropdownMenuItem(
                        value: right,
                        child: Text(right,
                            style: TextStyle(
                                fontSize: isLowVerbal ? 18 : 14)),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        if (value != null) {
                          _matchingAnswers[left] = value;
                          _selectedChoice =
                              _matchingAnswers.entries
                                  .map((e) => '${e.key}:${e.value}')
                                  .join(',');
                        }
                      });
                    },
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPictureSelect(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    final options = (interaction.data['options'] as List<dynamic>?)
            ?.cast<Map<String, dynamic>>() ??
        [];

    final displayOptions = isLowVerbal && options.length > 2
        ? options.take(2).toList()
        : options;

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: displayOptions.map((option) {
        final label = option['label'] as String? ?? '';
        final imageUrl = option['imageUrl'] as String? ?? '';
        final isSelected = _selectedChoice == label;

        return GestureDetector(
          onTap: () => setState(() => _selectedChoice = label),
          child: Container(
            width: isLowVerbal ? 160 : 140,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isSelected
                  ? theme.colorScheme.primary.withAlpha(30)
                  : theme.colorScheme.surfaceContainerHighest,
              border: Border.all(
                color: isSelected
                    ? theme.colorScheme.primary
                    : Colors.transparent,
                width: 3,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                if (imageUrl.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      width: isLowVerbal ? 120 : 100,
                      height: isLowVerbal ? 120 : 100,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) =>
                          const Icon(Icons.image, size: 48),
                    ),
                  ),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: isLowVerbal ? 18 : 14,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
