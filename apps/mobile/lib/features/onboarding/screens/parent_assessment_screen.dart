import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

// ---------------------------------------------------------------------------
// Assessment data model
// ---------------------------------------------------------------------------

enum AssessmentCategory { communication, motorSkills, cognitive, socialEmotional }

extension AssessmentCategoryLabel on AssessmentCategory {
  String get label {
    switch (this) {
      case AssessmentCategory.communication:
        return 'Communication';
      case AssessmentCategory.motorSkills:
        return 'Motor Skills';
      case AssessmentCategory.cognitive:
        return 'Cognitive';
      case AssessmentCategory.socialEmotional:
        return 'Social-Emotional';
    }
  }

  IconData get icon {
    switch (this) {
      case AssessmentCategory.communication:
        return Icons.chat_bubble_outline;
      case AssessmentCategory.motorSkills:
        return Icons.accessibility_new;
      case AssessmentCategory.cognitive:
        return Icons.psychology_outlined;
      case AssessmentCategory.socialEmotional:
        return Icons.favorite_border;
    }
  }
}

class AssessmentOption {
  const AssessmentOption({
    required this.value,
    required this.label,
    required this.description,
  });

  final String value;
  final String label;
  final String description;
}

class AssessmentQuestion {
  const AssessmentQuestion({
    required this.id,
    required this.category,
    required this.text,
    required this.options,
    this.branchCondition,
  });

  final String id;
  final AssessmentCategory category;
  final String text;
  final List<AssessmentOption> options;

  /// If non-null, this question is only shown when the answer to the
  /// referenced question matches [branchCondition.expectedValue].
  final BranchCondition? branchCondition;
}

class BranchCondition {
  const BranchCondition({required this.questionId, required this.expectedValues});
  final String questionId;
  final Set<String> expectedValues;
}

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

const List<AssessmentQuestion> _questionBank = [
  // -- Communication --
  AssessmentQuestion(
    id: 'comm_1',
    category: AssessmentCategory.communication,
    text: 'How does your child typically communicate their needs?',
    options: [
      AssessmentOption(
        value: 'full_sentences',
        label: 'Full sentences',
        description: 'Uses complete sentences with proper grammar most of the time.',
      ),
      AssessmentOption(
        value: 'short_phrases',
        label: 'Short phrases or keywords',
        description: 'Communicates with 2-3 word phrases or single keywords.',
      ),
      AssessmentOption(
        value: 'gestures_pictures',
        label: 'Gestures or pictures',
        description: 'Primarily uses pointing, gestures, or picture cards.',
      ),
      AssessmentOption(
        value: 'sounds_cries',
        label: 'Sounds or cries',
        description: 'Uses vocalizations, cries, or body movements to express needs.',
      ),
      AssessmentOption(
        value: 'aac_device',
        label: 'AAC device or app',
        description: 'Uses an augmentative and alternative communication device.',
      ),
    ],
  ),
  AssessmentQuestion(
    id: 'comm_2',
    category: AssessmentCategory.communication,
    text: 'How well does your child understand spoken instructions?',
    options: [
      AssessmentOption(
        value: 'multi_step',
        label: 'Multi-step instructions',
        description: 'Follows complex directions with 3+ steps independently.',
      ),
      AssessmentOption(
        value: 'simple_instructions',
        label: 'Simple instructions',
        description: 'Follows 1-2 step instructions when given clearly.',
      ),
      AssessmentOption(
        value: 'with_visual',
        label: 'With visual support',
        description: 'Needs pictures or demonstrations alongside verbal instructions.',
      ),
      AssessmentOption(
        value: 'limited',
        label: 'Limited understanding',
        description: 'Responds mainly to familiar words or tone of voice.',
      ),
    ],
  ),

  // -- Motor Skills --
  AssessmentQuestion(
    id: 'motor_1',
    category: AssessmentCategory.motorSkills,
    text: 'How does your child interact with a touchscreen device?',
    options: [
      AssessmentOption(
        value: 'independent',
        label: 'Independently',
        description: 'Taps, swipes, and navigates apps without help.',
      ),
      AssessmentOption(
        value: 'some_help',
        label: 'With some help',
        description: 'Can tap and swipe but may need guidance for navigation.',
      ),
      AssessmentOption(
        value: 'large_targets',
        label: 'Needs large targets',
        description: 'Can interact but needs very large buttons and simplified layouts.',
      ),
      AssessmentOption(
        value: 'physical_assistance',
        label: 'Needs physical assistance',
        description: 'Requires hand-over-hand support or a switch device.',
      ),
    ],
  ),
  AssessmentQuestion(
    id: 'motor_2',
    category: AssessmentCategory.motorSkills,
    text: 'Can your child use a stylus or pencil to draw or write?',
    branchCondition: BranchCondition(
      questionId: 'motor_1',
      expectedValues: {'independent', 'some_help', 'large_targets'},
    ),
    options: [
      AssessmentOption(
        value: 'writes_well',
        label: 'Writes letters/words',
        description: 'Can form recognizable letters and some words.',
      ),
      AssessmentOption(
        value: 'draws_shapes',
        label: 'Draws basic shapes',
        description: 'Can draw circles, lines, and simple shapes.',
      ),
      AssessmentOption(
        value: 'scribbles',
        label: 'Scribbles',
        description: 'Makes marks but cannot form specific shapes consistently.',
      ),
      AssessmentOption(
        value: 'cannot',
        label: 'Not yet',
        description: 'Does not hold or use a writing tool.',
      ),
    ],
  ),

  // -- Cognitive --
  AssessmentQuestion(
    id: 'cog_1',
    category: AssessmentCategory.cognitive,
    text: 'How does your child approach problem-solving activities?',
    options: [
      AssessmentOption(
        value: 'independent',
        label: 'Works independently',
        description: 'Tries different strategies and solves age-appropriate puzzles.',
      ),
      AssessmentOption(
        value: 'with_prompts',
        label: 'With verbal prompts',
        description: 'Needs reminders or hints but can complete tasks.',
      ),
      AssessmentOption(
        value: 'modeled',
        label: 'Needs modeling',
        description: 'Requires someone to demonstrate the solution first.',
      ),
      AssessmentOption(
        value: 'exploring',
        label: 'Exploratory / cause-and-effect',
        description: 'Engages through trial-and-error and sensory exploration.',
      ),
    ],
  ),
  AssessmentQuestion(
    id: 'cog_2',
    category: AssessmentCategory.cognitive,
    text: 'How long can your child stay focused on a preferred activity?',
    options: [
      AssessmentOption(
        value: 'over_15',
        label: '15+ minutes',
        description: 'Sustains attention for extended periods on preferred tasks.',
      ),
      AssessmentOption(
        value: '5_to_15',
        label: '5-15 minutes',
        description: 'Maintains focus for moderate durations with some redirection.',
      ),
      AssessmentOption(
        value: '1_to_5',
        label: '1-5 minutes',
        description: 'Short attention span; moves between activities quickly.',
      ),
      AssessmentOption(
        value: 'under_1',
        label: 'Under 1 minute',
        description: 'Very brief engagement; needs constant redirection.',
      ),
    ],
  ),

  // -- Social-Emotional --
  AssessmentQuestion(
    id: 'social_1',
    category: AssessmentCategory.socialEmotional,
    text: 'How does your child interact with peers or siblings?',
    options: [
      AssessmentOption(
        value: 'reciprocal',
        label: 'Reciprocal play',
        description: 'Engages in back-and-forth play, takes turns, and shares.',
      ),
      AssessmentOption(
        value: 'parallel',
        label: 'Parallel play',
        description: 'Plays alongside others but does not actively interact.',
      ),
      AssessmentOption(
        value: 'observer',
        label: 'Watches others',
        description: 'Prefers observing; may join briefly with encouragement.',
      ),
      AssessmentOption(
        value: 'solitary',
        label: 'Prefers solitary play',
        description: 'Engages mostly in solo activities and may resist group settings.',
      ),
    ],
  ),
  AssessmentQuestion(
    id: 'social_2',
    category: AssessmentCategory.socialEmotional,
    text: 'How does your child typically express emotions?',
    options: [
      AssessmentOption(
        value: 'verbally',
        label: 'Verbally identifies feelings',
        description: 'Can name emotions like happy, sad, angry, scared.',
      ),
      AssessmentOption(
        value: 'facial_body',
        label: 'Facial expressions / body language',
        description: 'Shows emotions through face and body but may not name them.',
      ),
      AssessmentOption(
        value: 'behavioral',
        label: 'Through behavior',
        description: 'Expresses distress through meltdowns, withdrawal, or aggression.',
      ),
      AssessmentOption(
        value: 'subtle',
        label: 'Subtle cues',
        description: 'Difficult to read; caregivers rely on context to interpret.',
      ),
    ],
  ),
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Parent assessment screen with adaptive branching questions.
class ParentAssessmentScreen extends ConsumerStatefulWidget {
  const ParentAssessmentScreen({super.key});

  @override
  ConsumerState<ParentAssessmentScreen> createState() =>
      _ParentAssessmentScreenState();
}

class _ParentAssessmentScreenState
    extends ConsumerState<ParentAssessmentScreen> {
  /// Answers keyed by question id.
  final Map<String, String> _answers = {};

  late List<AssessmentQuestion> _visibleQuestions;
  int _currentIndex = 0;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _rebuildVisibleQuestions();
  }

  void _rebuildVisibleQuestions() {
    _visibleQuestions = _questionBank.where((q) {
      if (q.branchCondition == null) return true;
      final answer = _answers[q.branchCondition!.questionId];
      return answer != null &&
          q.branchCondition!.expectedValues.contains(answer);
    }).toList();
  }

  AssessmentQuestion get _currentQuestion => _visibleQuestions[_currentIndex];

  double get _progress =>
      _visibleQuestions.isEmpty ? 0 : (_currentIndex + 1) / _visibleQuestions.length;

  void _selectOption(String value) {
    setState(() {
      _answers[_currentQuestion.id] = value;
      _rebuildVisibleQuestions();

      // Clamp index if the list shrank.
      if (_currentIndex >= _visibleQuestions.length) {
        _currentIndex = _visibleQuestions.length - 1;
      }
    });
  }

  void _goNext() {
    if (_answers[_currentQuestion.id] == null) return;

    if (_currentIndex < _visibleQuestions.length - 1) {
      setState(() {
        _currentIndex++;
        _rebuildVisibleQuestions();
      });
    } else {
      _submit();
    }
  }

  void _goBack() {
    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
      });
    }
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);
      await apiClient.post(
        '${Endpoints.learners}/assessment',
        data: {
          'answers': _answers,
          'questionCount': _visibleQuestions.length,
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final question = _currentQuestion;
    final selectedValue = _answers[question.id];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Assessment'),
        leading: _currentIndex > 0
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
            // ---- Progress indicator ----
            Semantics(
              label:
                  'Question ${_currentIndex + 1} of ${_visibleQuestions.length}',
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(question.category.icon,
                                size: 16,
                                color: colorScheme.primary,),
                            const SizedBox(width: 4),
                            Text(
                              question.category.label,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${_currentIndex + 1} / ${_visibleQuestions.length}',
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

            // ---- Question + options ----
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      header: true,
                      child: Text(
                        question.text,
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ...question.options.map(
                      (option) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Semantics(
                          selected: selectedValue == option.value,
                          child: _OptionCard(
                            option: option,
                            isSelected: selectedValue == option.value,
                            onTap: _isSubmitting
                                ? null
                                : () => _selectOption(option.value),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ---- Continue button ----
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: SizedBox(
                height: 48,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (selectedValue == null || _isSubmitting)
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
                      : Text(
                          _currentIndex < _visibleQuestions.length - 1
                              ? 'Continue'
                              : 'Complete Assessment',
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Option card widget
// ---------------------------------------------------------------------------

class _OptionCard extends StatelessWidget {
  const _OptionCard({
    required this.option,
    required this.isSelected,
    this.onTap,
  });

  final AssessmentOption option;
  final bool isSelected;
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      option.label,
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: isSelected
                            ? colorScheme.onPrimaryContainer
                            : colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      option.description,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isSelected
                            ? colorScheme.onPrimaryContainer
                            : colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                color: isSelected ? colorScheme.primary : colorScheme.outline,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
