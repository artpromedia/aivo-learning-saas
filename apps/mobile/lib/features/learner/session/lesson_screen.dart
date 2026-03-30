import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';
import 'package:aivo_mobile/data/services/lesson_prefetch_service.dart';
import 'package:aivo_mobile/data/services/offline_mastery_engine.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _sessionProvider = FutureProvider.autoDispose
    .family<LearningSession, String>((ref, lessonId) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.post(
    Endpoints.learningSessionStart,
    data: {'lessonId': lessonId},
  );
  return LearningSession.fromJson(response.data as Map<String, dynamic>);
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
  String? _selectedChoice;
  final _fillInController = TextEditingController();
  final Map<String, String> _matchingAnswers = {};
  Timer? _autoPauseTimer;
  bool _isPaused = false;
  bool _isCompleted = false;
  int _xpEarned = 0;
  int _correctAttempts = 0;
  int _totalAttempts = 0;

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

  Future<void> _submitInteraction(
      LearningSession session, String response,) async {
    final interaction = _currentInteraction(session);
    if (interaction == null || _isSubmitting) return;

    setState(() => _isSubmitting = true);

    final api = ref.read(apiClientProvider);
    final isOnline = ref.read(isOnlineProvider);

    final payload = {
      'interactionId': interaction.id,
      'response': response,
    };

    try {
      _totalAttempts++;
      if (isOnline) {
        final result = await api.post(
          Endpoints.learningSessionInteract(session.id),
          data: payload,
        );
        final data = result.data as Map<String, dynamic>;
        final isCorrect = data['isCorrect'] as bool? ?? false;

        if (isCorrect) {
          _correctAttempts++;
          HapticFeedback.lightImpact();
          final level = ref.read(functioningLevelProvider);
          if (level.index >= FunctioningLevel.lowVerbal.index) {
            final narrator = ref.read(audioNarratorProvider);
            narrator.speak('Great job!');
          }
        }
      } else {
        // Assume correct for offline (server will re-evaluate on sync).
        _correctAttempts++;
        final syncManager = ref.read(syncManagerProvider);
        await syncManager.queueAction(SyncAction(
          endpoint: Endpoints.learningSessionInteract(session.id),
          method: 'POST',
          payload: jsonEncode(payload),
        ),);
      }
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
    _autoPauseTimer?.cancel();
    final api = ref.read(apiClientProvider);
    final isOnline = ref.read(isOnlineProvider);

    final payload = {
      'timeSpentSeconds': session.timeSpentSeconds,
    };

    int xp = 25;
    if (isOnline) {
      try {
        final response = await api.post(
          Endpoints.learningSessionComplete(session.id),
          data: payload,
        );
        final data = response.data as Map<String, dynamic>;
        xp = data['xpEarned'] as int? ?? 25;
      } catch (_) {
        // Best effort
      }
      // Mark lesson completed in cache and refill buffer.
      final lessonDao = ref.read(lessonDaoProvider);
      await lessonDao.markLessonCompleted(session.lessonId);
      final prefetcher = ref.read(lessonPrefetchServiceProvider);
      await prefetcher.refillAfterCompletion(session.learnerId);
    } else {
      // Process offline mastery inference and queue for sync.
      final engine = ref.read(offlineMasteryEngineProvider);
      await engine.processCompletion(
        learnerId: session.learnerId,
        skillId: session.skillId,
        subject: session.subject,
        correctAttempts: _correctAttempts,
        totalAttempts: _totalAttempts,
        sessionId: session.id,
        timeSpentSeconds: session.timeSpentSeconds,
      );
      final lessonDao = ref.read(lessonDaoProvider);
      await lessonDao.markLessonCompleted(session.lessonId);
    }

    if (mounted) {
      setState(() {
        _isCompleted = true;
        _xpEarned = xp;
      });
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

    if (_isCompleted) {
      return _CelebrationScreen(
        xpEarned: _xpEarned,
        isLowVerbal: isLowVerbal,
        onDone: () =>
            context.canPop() ? context.pop() : context.go('/learner/home'),
      );
    }

    return Scaffold(
      body: sessionAsync.when(
        loading: () => _buildLoadingState(theme),
        error: (error, _) => _buildErrorState(theme, error),
        data: (session) {
          if (_isPaused) {
            return _buildPauseScreen(theme, session);
          }
          return _buildLessonContent(theme, session, isLowVerbal, isNonVerbal);
        },
      ),
    );
  }

  Widget _buildLoadingState(ThemeData theme) {
    final baseColor = theme.brightness == Brightness.dark
        ? AivoColors.surfaceVariantDark
        : AivoColors.surfaceVariantLight;
    final highlightColor = theme.brightness == Brightness.dark
        ? AivoColors.surfaceDark
        : AivoColors.surfaceLight;

    return SafeArea(
      child: Column(
        children: [
          const LinearProgressIndicator(),
          const SizedBox(height: 16),
          Expanded(
            child: Shimmer.fromColors(
              baseColor: baseColor,
              highlightColor: highlightColor,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (int i = 0; i < 6; i++) ...[
                      Container(
                        height: 16,
                        width: i == 0 ? 200 : double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(ThemeData theme, Object error) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 16),
              Text(
                'Failed to load lesson',
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: theme.textTheme.bodySmall,
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 24),
              Semantics(
                button: true,
                label: 'Retry loading lesson',
                child: ElevatedButton.icon(
                  onPressed: () =>
                      ref.invalidate(_sessionProvider(widget.lessonId)),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.canPop()
                    ? context.pop()
                    : context.go('/learner/home'),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPauseScreen(ThemeData theme, LearningSession session) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Semantics(
                label: 'Break time',
                child: Icon(Icons.pause_circle_filled,
                    size: 80, color: theme.colorScheme.primary,),
              ),
              const SizedBox(height: 24),
              Text(
                'Time for a Break!',
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text(
                "You've been learning for 5 minutes.\nWould you like to take a rest or keep going?",
                style: theme.textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: Semantics(
                  button: true,
                  label: 'Continue learning',
                  child: ElevatedButton.icon(
                    onPressed: () {
                      setState(() => _isPaused = false);
                      _startAutoPauseTimer();
                    },
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('Continue Learning',
                        style: TextStyle(fontSize: 18),),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: Semantics(
                  button: true,
                  label: 'End lesson',
                  child: OutlinedButton(
                    onPressed: () => _completeLesson(session),
                    child:
                        const Text('End Lesson', style: TextStyle(fontSize: 18)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLessonContent(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal,) {
    final total = _totalSteps(session);
    final progress = total > 0 ? (_currentStep + 1) / total : 0.0;
    final isOffline = !ref.watch(isOnlineProvider);

    return SafeArea(
      child: Column(
        children: [
          if (isOffline)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 4),
              color: theme.colorScheme.tertiaryContainer,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.cloud_off, size: 14,
                      color: theme.colorScheme.onTertiaryContainer,),
                  const SizedBox(width: 6),
                  Text('Offline Mode',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onTertiaryContainer,
                        fontWeight: FontWeight.w600,
                      ),),
                ],
              ),
            ),
          // App bar area
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                Semantics(
                  button: true,
                  label: 'Exit lesson',
                  child: IconButton(
                    icon: const Icon(Icons.close),
                    tooltip: 'Exit lesson',
                    onPressed: () => _showExitConfirmation(session),
                  ),
                ),
                Expanded(
                  child: Semantics(
                    label: 'Step ${_currentStep + 1} of $total',
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
                ),
                // Timer display
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Semantics(
                    label: 'Session timer',
                    child: const _SessionTimer(),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(isLowVerbal ? 24 : 16),
              child: _isInteractionStep(session)
                  ? _buildInteraction(theme, session, isLowVerbal, isNonVerbal)
                  : _buildSection(theme, session, isLowVerbal, isNonVerbal),
            ),
          ),

          // Navigation
          Padding(
            padding: EdgeInsets.all(isLowVerbal ? 20 : 16),
            child: Row(
              children: [
                if (_currentStep > 0 && !_isInteractionStep(session))
                  Expanded(
                    child: Semantics(
                      button: true,
                      label: 'Go to previous step',
                      child: OutlinedButton.icon(
                        onPressed: () {
                          setState(() => _currentStep--);
                          _resetAutoPauseTimer();
                        },
                        icon: const Icon(Icons.arrow_back),
                        label: const Text('Previous'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: Size(0, isLowVerbal ? 64 : 48),
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 0 && !_isInteractionStep(session))
                  const SizedBox(width: 12),
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
      ThemeData theme, LearningSession session, bool isLowVerbal,) {
    final isLastStep = _currentStep + 1 >= _totalSteps(session);
    final isInteraction = _isInteractionStep(session);

    if (isInteraction) {
      return Semantics(
        button: true,
        label: isLastStep ? 'Submit and finish' : 'Submit answer',
        child: ElevatedButton.icon(
          onPressed: _isSubmitting
              ? null
              : () {
                  final response =
                      _selectedChoice ?? _fillInController.text.trim();
                  if (response.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please provide an answer')),
                    );
                    return;
                  }
                  _submitInteraction(session, response);
                },
          icon: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Icon(isLastStep ? Icons.check : Icons.send),
          label: Text(isLastStep ? 'Submit & Finish' : 'Submit'),
          style: ElevatedButton.styleFrom(
            minimumSize: Size(0, isLowVerbal ? 64 : 48),
          ),
        ),
      );
    }

    return Semantics(
      button: true,
      label: isLastStep ? 'Complete lesson' : 'Next step',
      child: ElevatedButton.icon(
        onPressed: () => _advanceStep(session),
        icon: Icon(isLastStep ? Icons.check : Icons.arrow_forward),
        label: Text(isLastStep ? 'Complete' : 'Next'),
        style: ElevatedButton.styleFrom(
          minimumSize: Size(0, isLowVerbal ? 64 : 48),
        ),
      ),
    );
  }

  Future<void> _showExitConfirmation(LearningSession session) async {
    final shouldExit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Leave Lesson?'),
        content: const Text(
          'Your progress in this lesson will not be saved if you leave now.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Stay'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Leave'),
          ),
        ],
      ),
    );
    if (shouldExit == true && mounted) {
      context.canPop() ? context.pop() : context.go('/learner/home');
    }
  }

  // -------------------------------------------------------------------------
  // Content section rendering
  // -------------------------------------------------------------------------

  Widget _buildSection(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal,) {
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
          Semantics(
            header: true,
            child: Text(
              title,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontSize: isLowVerbal ? 28 : 24,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (imageUrl != null && imageUrl.isNotEmpty) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Semantics(
              image: true,
              label: title.isNotEmpty ? title : 'Lesson image',
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                width: double.infinity,
                fit: BoxFit.contain,
                placeholder: (_, __) => const SizedBox(
                  height: 200,
                  child: Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (_, __, ___) => SizedBox(
                  height: 200,
                  child: Center(
                    child: Icon(Icons.broken_image,
                        size: 48, color: theme.colorScheme.outline,),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (text.isNotEmpty)
          Semantics(
            label: text,
            child: Text(text, style: explanationStyle),
          ),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Interaction rendering
  // -------------------------------------------------------------------------

  Widget _buildInteraction(ThemeData theme, LearningSession session,
      bool isLowVerbal, bool isNonVerbal,) {
    final interaction = _currentInteraction(session);
    if (interaction == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Semantics(
          label: interaction.prompt,
          child: Text(
            interaction.prompt,
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: isLowVerbal ? 24 : 20,
            ),
          ),
        ),
        const SizedBox(height: 24),
        _buildInteractionByType(theme, interaction, isLowVerbal, isNonVerbal),
      ],
    );
  }

  Widget _buildInteractionByType(ThemeData theme, Interaction interaction,
      bool isLowVerbal, bool isNonVerbal,) {
    switch (interaction.type) {
      case 'multiple_choice':
        return _buildMultipleChoice(theme, interaction, isLowVerbal);
      case 'fill_in_blank':
        return _buildFillInBlank(theme, interaction, isLowVerbal);
      case 'matching':
        return _buildMatching(theme, interaction, isLowVerbal);
      case 'drag_drop':
        return _buildDragDrop(theme, interaction, isLowVerbal);
      case 'picture_select':
        return _buildPictureSelect(theme, interaction, isLowVerbal);
      default:
        return _buildMultipleChoice(theme, interaction, isLowVerbal);
    }
  }

  Widget _buildMultipleChoice(
      ThemeData theme, Interaction interaction, bool isLowVerbal,) {
    final options = (interaction.data['options'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];

    final displayOptions = isLowVerbal && options.length > 2
        ? options.take(2).toList()
        : options;

    final imageUrls = (interaction.data['imageUrls'] as List<dynamic>?)
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
          child: Semantics(
            button: true,
            selected: isSelected,
            label: option,
            child: Material(
              color: isSelected
                  ? theme.colorScheme.primary.withValues(alpha: 0.12)
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
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFillInBlank(
      ThemeData theme, Interaction interaction, bool isLowVerbal,) {
    return Semantics(
      textField: true,
      label: 'Type your answer',
      child: TextField(
        controller: _fillInController,
        style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
        decoration: InputDecoration(
          hintText: 'Type your answer here...',
          hintStyle: TextStyle(fontSize: isLowVerbal ? 20 : 16),
          contentPadding: EdgeInsets.all(isLowVerbal ? 20 : 16),
        ),
        maxLines: 3,
        textInputAction: TextInputAction.done,
      ),
    );
  }

  Widget _buildMatching(
      ThemeData theme, Interaction interaction, bool isLowVerbal,) {
    final leftItems = (interaction.data['left'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    final rightItems = (interaction.data['right'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Match each item on the left with one on the right:',
            style: theme.textTheme.bodyMedium,),
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
                        style: TextStyle(fontSize: isLowVerbal ? 18 : 14),),
                  ),
                ),
                const SizedBox(width: 12),
                Icon(Icons.arrow_forward,
                    size: 20, color: theme.colorScheme.outline,),
                const SizedBox(width: 12),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _matchingAnswers[left],
                    hint: const Text('Select'),
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8,),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),),
                    ),
                    items: rightItems.map((right) {
                      return DropdownMenuItem(
                        value: right,
                        child: Text(right,
                            style: TextStyle(fontSize: isLowVerbal ? 18 : 14),),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        if (value != null) {
                          _matchingAnswers[left] = value;
                          _selectedChoice = _matchingAnswers.entries
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

  Widget _buildDragDrop(
      ThemeData theme, Interaction interaction, bool isLowVerbal,) {
    // Simplified drag-drop: tap items in order
    final items = (interaction.data['items'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    final selectedOrder = _selectedChoice?.split(', ') ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tap items in the correct order:',
            style: theme.textTheme.bodyMedium,),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: items.map((item) {
            final isUsed = selectedOrder.contains(item);
            return Semantics(
              button: true,
              label: item,
              child: GestureDetector(
                onTap: () {
                  final current = _selectedChoice ?? '';
                  final updated =
                      current.isEmpty ? item : '$current, $item';
                  setState(() => _selectedChoice = updated);
                },
                child: Chip(
                  label: Text(item,
                      style: TextStyle(fontSize: isLowVerbal ? 18 : 14),),
                  backgroundColor: isUsed
                      ? theme.colorScheme.primaryContainer
                      : null,
                ),
              ),
            );
          }).toList(),
        ),
        if (_selectedChoice != null && _selectedChoice!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Order: $_selectedChoice',
                  style: theme.textTheme.bodySmall
                      ?.copyWith(fontStyle: FontStyle.italic),
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _selectedChoice = null),
                child: const Text('Clear'),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildPictureSelect(
      ThemeData theme, Interaction interaction, bool isLowVerbal,) {
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

        return Semantics(
          button: true,
          selected: isSelected,
          label: label,
          child: GestureDetector(
            onTap: () => setState(() => _selectedChoice = label),
            child: Container(
              width: isLowVerbal ? 160 : 140,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected
                    ? theme.colorScheme.primary.withValues(alpha: 0.12)
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
          ),
        );
      }).toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// Session Timer
// ---------------------------------------------------------------------------

class _SessionTimer extends StatefulWidget {
  const _SessionTimer();

  @override
  State<_SessionTimer> createState() => _SessionTimerState();
}

class _SessionTimerState extends State<_SessionTimer> {
  Timer? _timer;
  int _seconds = 0;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final m = (_seconds ~/ 60).toString().padLeft(2, '0');
    final s = (_seconds % 60).toString().padLeft(2, '0');
    return Text(
      '$m:$s',
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
        fontWeight: FontWeight.w600,
        fontFeatures: [const FontFeature.tabularFigures()],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Celebration screen
// ---------------------------------------------------------------------------

class _CelebrationScreen extends StatelessWidget {
  const _CelebrationScreen({
    required this.xpEarned,
    required this.isLowVerbal,
    required this.onDone,
  });

  final int xpEarned;
  final bool isLowVerbal;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.elasticOut,
                  builder: (context, value, child) {
                    return Transform.scale(scale: value, child: child);
                  },
                  child: Container(
                    width: isLowVerbal ? 120 : 96,
                    height: isLowVerbal ? 120 : 96,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AivoColors.xpGold, AivoColors.accent],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.star_rounded,
                      size: isLowVerbal ? 64 : 48,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Semantics(
                  header: true,
                  child: Text(
                    'Lesson Complete!',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      fontSize: isLowVerbal ? 28 : 24,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeOut,
                  builder: (context, value, child) {
                    return Opacity(opacity: value, child: child);
                  },
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: AivoColors.xpGold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded, color: AivoColors.xpGold),
                        const SizedBox(width: 8),
                        Semantics(
                          label: '$xpEarned XP earned',
                          child: Text(
                            '+$xpEarned XP',
                            style: theme.textTheme.titleLarge?.copyWith(
                              color: AivoColors.accentDark,
                              fontWeight: FontWeight.w700,
                              fontSize: isLowVerbal ? 24 : 20,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: isLowVerbal ? 60 : 48,
                  child: Semantics(
                    button: true,
                    label: 'Continue to home',
                    child: ElevatedButton(
                      onPressed: onDone,
                      child: Text(
                        'Continue',
                        style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
                      ),
                    ),
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
