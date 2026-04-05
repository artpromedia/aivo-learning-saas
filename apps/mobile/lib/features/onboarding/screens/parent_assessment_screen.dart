import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';

// ---------------------------------------------------------------------------
// Data models – mirrors the backend ParentAssessmentQuestion shape
// ---------------------------------------------------------------------------

class _Question {
  _Question({
    required this.id,
    required this.questionText,
    required this.questionType,
    required this.required_,
    this.options,
    this.scaleMin,
    this.scaleMax,
    this.scaleLabels,
    this.helpText,
  });

  factory _Question.fromJson(Map<String, dynamic> json) {
    return _Question(
      id: json['id'] as String,
      questionText: json['questionText'] as String,
      questionType: json['questionType'] as String,
      required_: json['required'] as bool? ?? false,
      options: (json['options'] as List?)?.cast<String>(),
      scaleMin: json['scaleMin'] as int?,
      scaleMax: json['scaleMax'] as int?,
      scaleLabels: json['scaleLabels'] != null
          ? {
              'min': json['scaleLabels']['min'] as String,
              'max': json['scaleLabels']['max'] as String,
            }
          : null,
      helpText: json['helpText'] as String?,
    );
  }

  final String id;
  final String questionText;
  final String questionType; // multiple_choice | multi_select | rating_scale | open_ended | yes_no
  final bool required_;
  final List<String>? options;
  final int? scaleMin;
  final int? scaleMax;
  final Map<String, String>? scaleLabels;
  final String? helpText;
}

class _Category {
  _Category({required this.key, required this.label, required this.questions});

  factory _Category.fromJson(Map<String, dynamic> json) {
    return _Category(
      key: json['key'] as String,
      label: json['label'] as String,
      questions: (json['questions'] as List)
          .map((q) => _Question.fromJson(q as Map<String, dynamic>))
          .toList(),
    );
  }

  final String key;
  final String label;
  final List<_Question> questions;
}

// ---------------------------------------------------------------------------
// Category icons
// ---------------------------------------------------------------------------

IconData _categoryIcon(String key) {
  switch (key) {
    case 'learning_style':
      return Icons.school_outlined;
    case 'strengths':
      return Icons.star_outline;
    case 'challenges':
      return Icons.warning_amber_outlined;
    case 'behavior':
      return Icons.psychology_outlined;
    case 'preferences':
      return Icons.tune_outlined;
    case 'social_emotional':
      return Icons.favorite_border;
    case 'functioning_level':
      return Icons.accessibility_new;
    case 'sensory_accessibility':
      return Icons.visibility_outlined;
    case 'communication_needs':
      return Icons.chat_bubble_outline;
    case 'input_method':
      return Icons.touch_app_outlined;
    case 'support_needs':
      return Icons.support_outlined;
    default:
      return Icons.help_outline;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Parent assessment screen — fetches questions from the API and walks the
/// parent through 11 categories of questions to build a learner profile.
class ParentAssessmentScreen extends ConsumerStatefulWidget {
  const ParentAssessmentScreen({super.key});

  @override
  ConsumerState<ParentAssessmentScreen> createState() =>
      _ParentAssessmentScreenState();
}

class _ParentAssessmentScreenState
    extends ConsumerState<ParentAssessmentScreen> {
  // All categories of questions fetched from the API.
  List<_Category> _categories = [];

  // Current category index.
  int _categoryIndex = 0;

  // Current question index within the current category.
  int _questionIndex = 0;

  // Answers keyed by question id. Values are String for single-select,
  // List<String> for multi_select, int for rating_scale, or String for open_ended.
  final Map<String, dynamic> _answers = {};

  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  // For open-ended questions.
  final _openEndedController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchQuestions();
  }

  @override
  void dispose() {
    _openEndedController.dispose();
    super.dispose();
  }

  Future<void> _fetchQuestions() async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.get(Endpoints.parentAssessmentQuestions);
      final data = response.data as Map<String, dynamic>;
      final categoriesJson = data['categories'] as List;

      setState(() {
        _categories = categoriesJson
            .map((c) => _Category.fromJson(c as Map<String, dynamic>))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load questions. Please try again.';
          _isLoading = false;
        });
      }
    }
  }

  _Question get _currentQuestion =>
      _categories[_categoryIndex].questions[_questionIndex];

  _Category get _currentCategory => _categories[_categoryIndex];

  int get _totalQuestions =>
      _categories.fold(0, (sum, c) => sum + c.questions.length);

  int get _answeredSoFar {
    int count = 0;
    for (var i = 0; i < _categoryIndex; i++) {
      count += _categories[i].questions.length;
    }
    count += _questionIndex;
    return count;
  }

  double get _progress =>
      _totalQuestions == 0 ? 0 : (_answeredSoFar + 1) / _totalQuestions;

  bool get _isLastQuestion =>
      _categoryIndex == _categories.length - 1 &&
      _questionIndex == _currentCategory.questions.length - 1;

  bool get _canProceed {
    final question = _currentQuestion;
    if (!question.required_) return true;
    final answer = _answers[question.id];
    if (answer == null) return false;
    if (answer is String && answer.isEmpty) return false;
    if (answer is List && answer.isEmpty) return false;
    return true;
  }

  void _goNext() {
    // Save open-ended text if applicable.
    if (_currentQuestion.questionType == 'open_ended') {
      _answers[_currentQuestion.id] = _openEndedController.text;
    }

    if (!_canProceed) return;

    if (_isLastQuestion) {
      _submit();
      return;
    }

    setState(() {
      if (_questionIndex < _currentCategory.questions.length - 1) {
        _questionIndex++;
      } else {
        _categoryIndex++;
        _questionIndex = 0;
      }
      _syncOpenEndedController();
    });
  }

  void _goBack() {
    // Save current open-ended text before moving.
    if (_currentQuestion.questionType == 'open_ended') {
      _answers[_currentQuestion.id] = _openEndedController.text;
    }

    setState(() {
      if (_questionIndex > 0) {
        _questionIndex--;
      } else if (_categoryIndex > 0) {
        _categoryIndex--;
        _questionIndex = _categories[_categoryIndex].questions.length - 1;
      }
      _syncOpenEndedController();
    });
  }

  void _syncOpenEndedController() {
    final q = _currentQuestion;
    if (q.questionType == 'open_ended') {
      _openEndedController.text = (_answers[q.id] as String?) ?? '';
    }
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);
      final storage = ref.read(secureStorageProvider);
      final learnerId = await storage.getLearnerId();

      if (learnerId == null) {
        setState(() {
          _errorMessage = 'Learner not found. Please go back and add your child first.';
          _isSubmitting = false;
        });
        return;
      }

      await apiClient.post(
        Endpoints.parentAssessmentSubmit,
        data: {
          'learnerId': learnerId,
          'answers': _answers,
        },
      );

      if (mounted) {
        context.go('/onboarding/iep-upload');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to submit assessment. Please try again.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Parent Assessment')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_categories.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Parent Assessment')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(_errorMessage ?? 'No questions available.',
                    textAlign: TextAlign.center,),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _isLoading = true;
                      _errorMessage = null;
                    });
                    _fetchQuestions();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final question = _currentQuestion;
    final category = _currentCategory;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Assessment'),
        leading: (_categoryIndex > 0 || _questionIndex > 0)
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _goBack,
                tooltip: 'Previous question',
              )
            : null,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ---- Progress ----
            Semantics(
              label:
                  'Question ${_answeredSoFar + 1} of $_totalQuestions',
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(_categoryIcon(category.key),
                                size: 16, color: colorScheme.primary,),
                            const SizedBox(width: 4),
                            Text(
                              category.label,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${_answeredSoFar + 1} / $_totalQuestions',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _progress,
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ---- Error banner ----
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Semantics(
                  liveRegion: true,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: colorScheme.errorContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline,
                            color: colorScheme.onErrorContainer, size: 20,),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onErrorContainer,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // ---- Question content ----
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      header: true,
                      child: Text(
                        question.questionText,
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                    if (question.helpText != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        question.helpText!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    _buildQuestionInput(question, theme, colorScheme),
                  ],
                ),
              ),
            ),

            // ---- Continue / Skip button ----
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: Column(
                children: [
                  SizedBox(
                    height: 48,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (_isSubmitting || (!_canProceed && question.required_))
                          ? null
                          : _goNext,
                      child: _isSubmitting
                          ? SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: colorScheme.onPrimary,
                              ),
                            )
                          : Text(_isLastQuestion ? 'Complete Assessment' : 'Continue'),
                    ),
                  ),
                  if (!question.required_ && _answers[question.id] == null)
                    TextButton(
                      onPressed: _isSubmitting ? null : _goNext,
                      child: const Text('Skip'),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Question type renderers
  // ---------------------------------------------------------------------------

  Widget _buildQuestionInput(
      _Question question, ThemeData theme, ColorScheme colorScheme,) {
    switch (question.questionType) {
      case 'multiple_choice':
      case 'yes_no':
        return _buildMultipleChoice(question, theme, colorScheme);
      case 'multi_select':
        return _buildMultiSelect(question, theme, colorScheme);
      case 'rating_scale':
        return _buildRatingScale(question, theme, colorScheme);
      case 'open_ended':
        return _buildOpenEnded(question, theme, colorScheme);
      default:
        return Text('Unsupported question type: ${question.questionType}');
    }
  }

  Widget _buildMultipleChoice(
      _Question question, ThemeData theme, ColorScheme colorScheme,) {
    final selected = _answers[question.id] as String?;
    return Column(
      children: (question.options ?? []).map((option) {
        final isSelected = selected == option;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Semantics(
            selected: isSelected,
            child: _OptionCard(
              label: option,
              isSelected: isSelected,
              onTap: _isSubmitting
                  ? null
                  : () => setState(() => _answers[question.id] = option),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMultiSelect(
      _Question question, ThemeData theme, ColorScheme colorScheme,) {
    final selected = (_answers[question.id] as List<String>?) ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Select all that apply',
            style: theme.textTheme.bodySmall
                ?.copyWith(color: colorScheme.onSurfaceVariant),),
        const SizedBox(height: 12),
        ...(question.options ?? []).map((option) {
          final isSelected = selected.contains(option);
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _OptionCard(
              label: option,
              isSelected: isSelected,
              isCheckbox: true,
              onTap: _isSubmitting
                  ? null
                  : () {
                      setState(() {
                        final list =
                            List<String>.from((_answers[question.id] as List<String>?) ?? []);
                        if (isSelected) {
                          list.remove(option);
                        } else {
                          list.add(option);
                        }
                        _answers[question.id] = list;
                      });
                    },
            ),
          );
        }),
      ],
    );
  }

  Widget _buildRatingScale(
      _Question question, ThemeData theme, ColorScheme colorScheme,) {
    final value = (_answers[question.id] as int?) ??
        question.scaleMin ??
        1;
    final min = question.scaleMin ?? 1;
    final max = question.scaleMax ?? 5;

    return Column(
      children: [
        if (question.scaleLabels != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(question.scaleLabels!['min'] ?? '',
                      style: theme.textTheme.bodySmall,),
                ),
                Flexible(
                  child: Text(question.scaleLabels!['max'] ?? '',
                      style: theme.textTheme.bodySmall,
                      textAlign: TextAlign.right,),
                ),
              ],
            ),
          ),
        Slider(
          value: value.toDouble(),
          min: min.toDouble(),
          max: max.toDouble(),
          divisions: max - min,
          label: value.toString(),
          onChanged: _isSubmitting
              ? null
              : (v) => setState(() => _answers[question.id] = v.round()),
        ),
        Text(
          '$value / $max',
          style: theme.textTheme.headlineSmall?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildOpenEnded(
      _Question question, ThemeData theme, ColorScheme colorScheme,) {
    // Sync controller when first displaying.
    if (_openEndedController.text != ((_answers[question.id] as String?) ?? '')) {
      _openEndedController.text = (_answers[question.id] as String?) ?? '';
    }

    return TextField(
      controller: _openEndedController,
      maxLines: 4,
      textCapitalization: TextCapitalization.sentences,
      decoration: InputDecoration(
        hintText: 'Type your answer here...',
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: colorScheme.surfaceContainerLow,
      ),
      onChanged: (text) => _answers[question.id] = text,
      enabled: !_isSubmitting,
    );
  }
}

// ---------------------------------------------------------------------------
// Option card widget
// ---------------------------------------------------------------------------

class _OptionCard extends StatelessWidget {
  const _OptionCard({
    required this.label,
    required this.isSelected,
    this.isCheckbox = false,
    this.onTap,
  });

  final String label;
  final bool isSelected;
  final bool isCheckbox;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Material(
      color: isSelected ? colorScheme.primaryContainer : colorScheme.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? colorScheme.primary : colorScheme.outline,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: isSelected
                        ? colorScheme.onPrimaryContainer
                        : colorScheme.onSurface,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Icon(
                isCheckbox
                    ? (isSelected
                        ? Icons.check_box
                        : Icons.check_box_outline_blank)
                    : (isSelected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked),
                color: isSelected ? colorScheme.primary : colorScheme.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
