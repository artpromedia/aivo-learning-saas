import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';

// ---------------------------------------------------------------------------
// QuizScreen
// ---------------------------------------------------------------------------

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key, required this.sessionId});

  final String sessionId;

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  List<Interaction> _interactions = [];
  int _currentIndex = 0;
  int _correctCount = 0;
  int _totalAnswered = 0;
  bool _isSubmitting = false;
  bool _showFeedback = false;
  bool? _lastCorrect;
  String? _lastFeedback;
  String? _selectedAnswer;
  final _shortAnswerController = TextEditingController();
  Timer? _timer;
  int _elapsedSeconds = 0;
  bool _quizComplete = false;
  int _xpEarned = 0;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _shortAnswerController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  void setInteractions(List<Interaction> interactions) {
    if (_interactions.isEmpty && interactions.isNotEmpty) {
      _interactions = interactions;
    }
  }

  Interaction get _current => _interactions[_currentIndex];

  Future<void> _submitAnswer() async {
    if (_isSubmitting) return;
    final answer = _selectedAnswer ?? _shortAnswerController.text.trim();
    if (answer.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or type an answer')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final api = ref.read(apiClientProvider);
    final isOnline = ref.read(isOnlineProvider);
    final payload = {
      'interactionId': _current.id,
      'response': answer,
    };

    try {
      bool isCorrect = false;
      String feedback = '';

      if (isOnline) {
        final result = await api.post(
          Endpoints.learningSessionInteract(widget.sessionId),
          data: payload,
        );
        final data = result.data as Map<String, dynamic>;
        isCorrect = data['isCorrect'] as bool? ?? false;
        feedback = data['feedback'] as String? ??
            (isCorrect ? 'Correct!' : 'Incorrect');
      } else {
        final syncManager = ref.read(syncManagerProvider);
        await syncManager.queueAction(SyncAction(
          endpoint: Endpoints.learningSessionInteract(widget.sessionId),
          method: 'POST',
          payload: jsonEncode(payload),
        ));
        // Offline: cannot determine correctness
        feedback = 'Answer saved. We will check when online.';
      }

      setState(() {
        _totalAnswered++;
        if (isCorrect) _correctCount++;
        _lastCorrect = isCorrect;
        _lastFeedback = feedback;
        _showFeedback = true;
        _isSubmitting = false;
      });

      if (isCorrect) {
        HapticFeedback.lightImpact();
        final level = ref.read(functioningLevelProvider);
        if (level.index >= FunctioningLevel.lowVerbal.index) {
          final narrator = ref.read(audioNarratorProvider);
          narrator.speak('Correct! Great job!');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _nextQuestion() {
    _selectedAnswer = null;
    _shortAnswerController.clear();
    _showFeedback = false;
    _lastCorrect = null;
    _lastFeedback = null;

    if (_currentIndex + 1 >= _interactions.length) {
      _timer?.cancel();
      _xpEarned = (_correctCount * 10).clamp(0, 200);
      setState(() => _quizComplete = true);
    } else {
      setState(() => _currentIndex++);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);

    // Load interactions from route extra if provided
    final extra = GoRouterState.of(context).extra;
    if (extra is List<Interaction> && _interactions.isEmpty) {
      setInteractions(extra);
    }
    if (extra is LearningSession && _interactions.isEmpty) {
      setInteractions(extra.interactions);
    }

    if (_interactions.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Quiz')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.quiz_outlined,
                    size: 64, color: theme.colorScheme.outline),
                const SizedBox(height: 16),
                Text('No quiz questions available.',
                    style: theme.textTheme.bodyLarge),
                const SizedBox(height: 24),
                ElevatedButton(
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

    if (_quizComplete) {
      return _buildScoreSummary(theme, isLowVerbal);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz'),
        leading: Semantics(
          button: true,
          label: 'Close quiz',
          child: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () =>
                context.canPop() ? context.pop() : context.go('/learner/home'),
          ),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Semantics(
                label: 'Elapsed time: ${_formatTime(_elapsedSeconds)}',
                child: Text(
                  _formatTime(_elapsedSeconds),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    fontFeatures: [const FontFeature.tabularFigures()],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress dots
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Semantics(
              label:
                  'Question ${_currentIndex + 1} of ${_interactions.length}',
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _interactions.length > 20 ? 0 : _interactions.length,
                  (i) {
                    Color color;
                    if (i < _currentIndex) {
                      color = theme.colorScheme.primary;
                    } else if (i == _currentIndex) {
                      color = theme.colorScheme.tertiary;
                    } else {
                      color = theme.colorScheme.outline.withValues(alpha: 0.3);
                    }
                    return Container(
                      width: isLowVerbal ? 14 : 10,
                      height: isLowVerbal ? 14 : 10,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: color,
                      ),
                    );
                  },
                ),
              ),
            ),
          ),

          // Running score
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Question ${_currentIndex + 1} of ${_interactions.length}',
                  style: theme.textTheme.bodySmall,
                ),
                Semantics(
                  label: '$_correctCount correct out of $_totalAnswered answered',
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          size: 16, color: AivoColors.questGreen),
                      const SizedBox(width: 4),
                      Text('$_correctCount/$_totalAnswered',
                          style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Question content
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(isLowVerbal ? 24 : 16),
              child: _showFeedback
                  ? _buildFeedbackView(theme, isLowVerbal)
                  : _buildQuestionView(theme, isLowVerbal),
            ),
          ),

          // Action button
          Padding(
            padding: EdgeInsets.all(isLowVerbal ? 20 : 16),
            child: SizedBox(
              width: double.infinity,
              height: isLowVerbal ? 64 : 48,
              child: _showFeedback
                  ? Semantics(
                      button: true,
                      label: _currentIndex + 1 >= _interactions.length
                          ? 'See results'
                          : 'Next question',
                      child: ElevatedButton(
                        onPressed: _nextQuestion,
                        child: Text(
                          _currentIndex + 1 >= _interactions.length
                              ? 'See Results'
                              : 'Next Question',
                          style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
                        ),
                      ),
                    )
                  : Semantics(
                      button: true,
                      label: 'Submit answer',
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitAnswer,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text('Submit',
                                style:
                                    TextStyle(fontSize: isLowVerbal ? 20 : 16)),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionView(ThemeData theme, bool isLowVerbal) {
    final interaction = _current;

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
        _buildQuestionType(theme, interaction, isLowVerbal),
      ],
    );
  }

  Widget _buildQuestionType(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    switch (interaction.type) {
      case 'true_false':
        return _buildTrueFalse(theme, isLowVerbal);
      case 'short_answer':
        return _buildShortAnswer(theme, isLowVerbal);
      case 'picture_select':
        return _buildPictureSelect(theme, interaction, isLowVerbal);
      case 'multiple_choice':
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

    final display = isLowVerbal && options.length > 2
        ? options.take(2).toList()
        : options;

    return Column(
      children: display.map((option) {
        final isSelected = _selectedAnswer == option;
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Semantics(
            button: true,
            selected: isSelected,
            label: option,
            child: RadioListTile<String>(
              value: option,
              groupValue: _selectedAnswer,
              onChanged: (v) => setState(() => _selectedAnswer = v),
              title: Text(option,
                  style: TextStyle(fontSize: isLowVerbal ? 20 : 16)),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              tileColor: isSelected
                  ? theme.colorScheme.primary.withValues(alpha: 0.08)
                  : theme.colorScheme.surfaceContainerHighest,
              activeColor: theme.colorScheme.primary,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: isLowVerbal ? 20 : 12),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTrueFalse(ThemeData theme, bool isLowVerbal) {
    return Row(
      children: ['True', 'False'].map((option) {
        final isSelected = _selectedAnswer == option;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Semantics(
              button: true,
              selected: isSelected,
              label: option,
              child: ElevatedButton(
                onPressed: () => setState(() => _selectedAnswer = option),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isSelected
                      ? theme.colorScheme.primary
                      : theme.colorScheme.surfaceContainerHighest,
                  foregroundColor: isSelected
                      ? theme.colorScheme.onPrimary
                      : theme.colorScheme.onSurface,
                  minimumSize: Size(0, isLowVerbal ? 80 : 56),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(option,
                    style: TextStyle(fontSize: isLowVerbal ? 22 : 18)),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildShortAnswer(ThemeData theme, bool isLowVerbal) {
    return Semantics(
      textField: true,
      label: 'Type your answer',
      child: TextField(
        controller: _shortAnswerController,
        style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
        decoration: InputDecoration(
          hintText: 'Type your answer...',
          contentPadding: EdgeInsets.all(isLowVerbal ? 20 : 16),
        ),
        maxLines: 3,
        textInputAction: TextInputAction.done,
      ),
    );
  }

  Widget _buildPictureSelect(
      ThemeData theme, Interaction interaction, bool isLowVerbal) {
    final options = (interaction.data['options'] as List<dynamic>?)
            ?.cast<Map<String, dynamic>>() ??
        [];

    final display =
        isLowVerbal && options.length > 2 ? options.take(2).toList() : options;

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: display.map((opt) {
        final label = opt['label'] as String? ?? '';
        final imageUrl = opt['imageUrl'] as String? ?? '';
        final isSelected = _selectedAnswer == label;
        final size = isLowVerbal ? 150.0 : 120.0;

        return Semantics(
          button: true,
          selected: isSelected,
          label: label,
          child: GestureDetector(
            onTap: () => setState(() => _selectedAnswer = label),
            child: Container(
              width: size,
              decoration: BoxDecoration(
                border: Border.all(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : Colors.transparent,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(16),
                color: isSelected
                    ? theme.colorScheme.primary.withValues(alpha: 0.08)
                    : theme.colorScheme.surfaceContainerHighest,
              ),
              padding: const EdgeInsets.all(8),
              child: Column(
                children: [
                  if (imageUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        width: size - 24,
                        height: size - 24,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) =>
                            Icon(Icons.image, size: size * 0.4),
                      ),
                    ),
                  const SizedBox(height: 6),
                  Text(label,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: isLowVerbal ? 16 : 13)),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFeedbackView(ThemeData theme, bool isLowVerbal) {
    return Column(
      children: [
        Semantics(
          label: _lastCorrect == true ? 'Correct' : 'Incorrect',
          child: Icon(
            _lastCorrect == true ? Icons.check_circle : Icons.cancel,
            size: isLowVerbal ? 80 : 64,
            color: _lastCorrect == true
                ? AivoColors.questGreen
                : AivoColors.error,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          _lastCorrect == true ? 'Correct!' : 'Incorrect',
          style: theme.textTheme.headlineSmall?.copyWith(
            color: _lastCorrect == true
                ? AivoColors.questGreen
                : AivoColors.error,
          ),
        ),
        if (_lastFeedback != null && _lastFeedback!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(
            _lastFeedback!,
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildScoreSummary(ThemeData theme, bool isLowVerbal) {
    final percentage =
        _totalAnswered > 0 ? (_correctCount / _totalAnswered * 100) : 0.0;
    final isGoodScore = percentage >= 80;

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
                  child: Icon(
                    isGoodScore
                        ? Icons.emoji_events
                        : Icons.assignment_turned_in,
                    size: 80,
                    color: isGoodScore
                        ? AivoColors.xpGold
                        : theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 24),
                Semantics(
                  header: true,
                  child: Text('Quiz Complete!',
                      style: theme.textTheme.headlineMedium),
                ),
                const SizedBox(height: 16),
                Semantics(
                  label: '${percentage.toStringAsFixed(0)} percent',
                  child: Text(
                    '${percentage.toStringAsFixed(0)}%',
                    style: theme.textTheme.headlineLarge?.copyWith(
                      fontSize: 48,
                      fontWeight: FontWeight.w800,
                      color: isGoodScore
                          ? AivoColors.questGreen
                          : theme.colorScheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$_correctCount out of $_totalAnswered correct',
                  style: theme.textTheme.bodyLarge,
                ),
                const SizedBox(height: 8),
                Semantics(
                  label: 'Time taken: ${_formatTime(_elapsedSeconds)}',
                  child: Text(
                    'Time: ${_formatTime(_elapsedSeconds)}',
                    style: theme.textTheme.bodyMedium,
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
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt, color: AivoColors.xpGold),
                      const SizedBox(width: 4),
                      Semantics(
                        label: '$_xpEarned XP earned',
                        child: Text(
                          '+$_xpEarned XP',
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: AivoColors.xpGold,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: isLowVerbal ? 64 : 48,
                  child: Semantics(
                    button: true,
                    label: 'Done, return to home',
                    child: ElevatedButton(
                      onPressed: () => context.canPop()
                          ? context.pop()
                          : context.go('/learner/home'),
                      child: Text('Done',
                          style: TextStyle(fontSize: isLowVerbal ? 20 : 16)),
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

  String _formatTime(int totalSeconds) {
    final m = totalSeconds ~/ 60;
    final s = totalSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
}
