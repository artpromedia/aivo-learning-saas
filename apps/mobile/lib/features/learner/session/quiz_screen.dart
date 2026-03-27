import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';
import 'package:aivo_mobile/data/repositories/learning_repository.dart';
import 'package:aivo_mobile/shared/widgets/celebration_overlay.dart';

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

    try {
      final repo = ref.read(learningRepositoryProvider);
      final result = await repo.submitInteraction(
        widget.sessionId,
        _current.id,
        answer,
      );

      final isCorrect = result.isCorrect ?? false;
      final feedback = result.feedback ?? (isCorrect ? 'Correct!' : 'Incorrect');

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
      setState(() => _quizComplete = true);
      _showCompletionIfNeeded();
    } else {
      setState(() => _currentIndex++);
    }
  }

  Future<void> _showCompletionIfNeeded() async {
    final percentage =
        _totalAnswered > 0 ? (_correctCount / _totalAnswered * 100) : 0.0;
    final xp = (_correctCount * 10).clamp(0, 200);

    if (percentage >= 80 && mounted) {
      await CelebrationOverlay.show(
        context,
        type: CelebrationType.quizPerfect,
        message: 'Great Score!',
        xpEarned: xp,
      );
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
        body: const Center(child: Text('No quiz questions available.')),
      );
    }

    if (_quizComplete) {
      return _buildScoreSummary(theme, isLowVerbal);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Text(
                _formatTime(_elapsedSeconds),
                style: theme.textTheme.bodyMedium,
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
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_interactions.length, (i) {
                Color color;
                if (i < _currentIndex) {
                  color = theme.colorScheme.primary;
                } else if (i == _currentIndex) {
                  color = theme.colorScheme.tertiary;
                } else {
                  color = theme.colorScheme.outline.withAlpha(80);
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
              }),
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
                Row(
                  children: [
                    const Icon(Icons.check_circle,
                        size: 16, color: AivoColors.questGreen),
                    const SizedBox(width: 4),
                    Text('$_correctCount/$_totalAnswered',
                        style: theme.textTheme.bodySmall),
                  ],
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
                  ? ElevatedButton(
                      onPressed: _nextQuestion,
                      child: Text(
                          _currentIndex + 1 >= _interactions.length
                              ? 'See Results'
                              : 'Next Question'),
                    )
                  : ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitAnswer,
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2),
                            )
                          : const Text('Submit'),
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
        Text(
          interaction.prompt,
          style: theme.textTheme.titleLarge?.copyWith(
            fontSize: isLowVerbal ? 24 : 20,
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
          child: RadioListTile<String>(
            value: option,
            groupValue: _selectedAnswer,
            onChanged: (v) => setState(() => _selectedAnswer = v),
            title: Text(option,
                style: TextStyle(fontSize: isLowVerbal ? 20 : 16)),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            tileColor: isSelected
                ? theme.colorScheme.primary.withAlpha(20)
                : theme.colorScheme.surfaceContainerHighest,
            activeColor: theme.colorScheme.primary,
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
        );
      }).toList(),
    );
  }

  Widget _buildShortAnswer(ThemeData theme, bool isLowVerbal) {
    return TextField(
      controller: _shortAnswerController,
      style: TextStyle(fontSize: isLowVerbal ? 20 : 16),
      decoration: InputDecoration(
        hintText: 'Type your answer...',
        contentPadding: EdgeInsets.all(isLowVerbal ? 20 : 16),
      ),
      maxLines: 3,
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

        return GestureDetector(
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
                  ? theme.colorScheme.primary.withAlpha(20)
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
                    style:
                        TextStyle(fontSize: isLowVerbal ? 16 : 13)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildFeedbackView(ThemeData theme, bool isLowVerbal) {
    return Column(
      children: [
        Icon(
          _lastCorrect == true ? Icons.check_circle : Icons.cancel,
          size: isLowVerbal ? 80 : 64,
          color: _lastCorrect == true
              ? AivoColors.questGreen
              : AivoColors.error,
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
    final xp = (_correctCount * 10).clamp(0, 200);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  percentage >= 80 ? Icons.emoji_events : Icons.assignment_turned_in,
                  size: 80,
                  color: percentage >= 80
                      ? AivoColors.xpGold
                      : theme.colorScheme.primary,
                ),
                const SizedBox(height: 24),
                Text('Quiz Complete!',
                    style: theme.textTheme.headlineMedium),
                const SizedBox(height: 16),
                Text(
                  '${percentage.toStringAsFixed(0)}%',
                  style: theme.textTheme.headlineLarge?.copyWith(
                    fontSize: 48,
                    fontWeight: FontWeight.w800,
                    color: percentage >= 80
                        ? AivoColors.questGreen
                        : theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$_correctCount out of $_totalAnswered correct',
                  style: theme.textTheme.bodyLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Time: ${_formatTime(_elapsedSeconds)}',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bolt, color: AivoColors.xpGold),
                    const SizedBox(width: 4),
                    Text(
                      '+$xp XP',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: AivoColors.xpGold,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: isLowVerbal ? 64 : 48,
                  child: ElevatedButton(
                    onPressed: () => context.canPop()
                        ? context.pop()
                        : context.go('/learner/home'),
                    child: const Text('Done'),
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
