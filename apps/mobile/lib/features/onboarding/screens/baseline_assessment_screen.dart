import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/features/onboarding/widgets/picture_question.dart';
import 'package:aivo_mobile/features/onboarding/widgets/partner_assisted.dart';
import 'package:aivo_mobile/features/onboarding/widgets/observational_checklist.dart';

// ---------------------------------------------------------------------------
// Baseline question model
// ---------------------------------------------------------------------------

class BaselineQuestion {
  const BaselineQuestion({
    required this.id,
    required this.text,
    required this.options,
    this.imageUrlA,
    this.imageUrlB,
    this.audioUrl,
  });

  final String id;
  final String text;
  final List<BaselineOption> options;

  /// For LOW_VERBAL picture-based questions.
  final String? imageUrlA;
  final String? imageUrlB;

  /// Optional audio narration URL.
  final String? audioUrl;
}

class BaselineOption {
  const BaselineOption({
    required this.value,
    required this.label,
    this.imageUrl,
  });

  final String value;
  final String label;
  final String? imageUrl;
}

// ---------------------------------------------------------------------------
// Sample question banks per functioning level
// ---------------------------------------------------------------------------

List<BaselineQuestion> _standardQuestions() => const [
      BaselineQuestion(
        id: 'std_1',
        text: 'Which number comes after 7?',
        options: [
          BaselineOption(value: '6', label: '6'),
          BaselineOption(value: '8', label: '8'),
          BaselineOption(value: '9', label: '9'),
          BaselineOption(value: '5', label: '5'),
        ],
      ),
      BaselineQuestion(
        id: 'std_2',
        text: 'Which word rhymes with "cat"?',
        options: [
          BaselineOption(value: 'dog', label: 'Dog'),
          BaselineOption(value: 'hat', label: 'Hat'),
          BaselineOption(value: 'cup', label: 'Cup'),
          BaselineOption(value: 'sun', label: 'Sun'),
        ],
      ),
      BaselineQuestion(
        id: 'std_3',
        text: 'What is 3 + 4?',
        options: [
          BaselineOption(value: '5', label: '5'),
          BaselineOption(value: '6', label: '6'),
          BaselineOption(value: '7', label: '7'),
          BaselineOption(value: '8', label: '8'),
        ],
      ),
      BaselineQuestion(
        id: 'std_4',
        text: 'Which season comes after winter?',
        options: [
          BaselineOption(value: 'summer', label: 'Summer'),
          BaselineOption(value: 'autumn', label: 'Autumn'),
          BaselineOption(value: 'spring', label: 'Spring'),
          BaselineOption(value: 'winter', label: 'Winter'),
        ],
      ),
    ];

List<BaselineQuestion> _supportedQuestions() => const [
      BaselineQuestion(
        id: 'sup_1',
        text: 'Tap the picture that shows the number 3.',
        audioUrl: 'assets/audio/number_three.mp3',
        options: [
          BaselineOption(value: '2', label: '2'),
          BaselineOption(value: '3', label: '3'),
          BaselineOption(value: '5', label: '5'),
        ],
      ),
      BaselineQuestion(
        id: 'sup_2',
        text: 'Which color is the sky?',
        audioUrl: 'assets/audio/sky_color.mp3',
        options: [
          BaselineOption(value: 'red', label: 'Red'),
          BaselineOption(value: 'blue', label: 'Blue'),
          BaselineOption(value: 'green', label: 'Green'),
        ],
      ),
      BaselineQuestion(
        id: 'sup_3',
        text: 'Point to the big circle.',
        audioUrl: 'assets/audio/big_circle.mp3',
        options: [
          BaselineOption(value: 'small', label: 'Small circle'),
          BaselineOption(value: 'big', label: 'Big circle'),
        ],
      ),
    ];

List<BaselineQuestion> _lowVerbalQuestions() => const [
      BaselineQuestion(
        id: 'lv_1',
        text: 'Which one is a dog?',
        imageUrlA: 'assets/images/dog.png',
        imageUrlB: 'assets/images/cat.png',
        options: [
          BaselineOption(
              value: 'dog', label: 'Dog', imageUrl: 'assets/images/dog.png'),
          BaselineOption(
              value: 'cat', label: 'Cat', imageUrl: 'assets/images/cat.png'),
        ],
      ),
      BaselineQuestion(
        id: 'lv_2',
        text: 'Which one is red?',
        imageUrlA: 'assets/images/red_apple.png',
        imageUrlB: 'assets/images/green_leaf.png',
        options: [
          BaselineOption(
              value: 'red',
              label: 'Red',
              imageUrl: 'assets/images/red_apple.png'),
          BaselineOption(
              value: 'green',
              label: 'Green',
              imageUrl: 'assets/images/green_leaf.png'),
        ],
      ),
      BaselineQuestion(
        id: 'lv_3',
        text: 'Which one is a ball?',
        imageUrlA: 'assets/images/ball.png',
        imageUrlB: 'assets/images/book.png',
        options: [
          BaselineOption(
              value: 'ball',
              label: 'Ball',
              imageUrl: 'assets/images/ball.png'),
          BaselineOption(
              value: 'book',
              label: 'Book',
              imageUrl: 'assets/images/book.png'),
        ],
      ),
    ];

List<PartnerAssistedPrompt> _nonVerbalPrompts() => const [
      PartnerAssistedPrompt(
        id: 'nv_1',
        instruction:
            'Show your child two familiar objects (e.g. a cup and a ball). '
            'Ask them to look at or reach for the cup.',
        question: 'Does your child look at or reach for the requested object?',
      ),
      PartnerAssistedPrompt(
        id: 'nv_2',
        instruction:
            'Call your child\'s name from across the room.',
        question: 'Does your child turn toward your voice?',
      ),
      PartnerAssistedPrompt(
        id: 'nv_3',
        instruction:
            'Place a toy slightly out of reach. Observe if your child '
            'attempts to obtain it.',
        question: 'Does your child attempt to reach or move toward the toy?',
      ),
    ];

List<ChecklistItem> _preSymbolicItems() => const [
      ChecklistItem(
        id: 'ps_sensory_1',
        category: 'Sensory',
        description: 'Responds to auditory stimulation (sounds, music)',
      ),
      ChecklistItem(
        id: 'ps_sensory_2',
        category: 'Sensory',
        description: 'Tracks objects visually across midline',
      ),
      ChecklistItem(
        id: 'ps_motor_1',
        category: 'Motor',
        description: 'Grasps objects when placed in hand',
      ),
      ChecklistItem(
        id: 'ps_motor_2',
        category: 'Motor',
        description: 'Activates a switch or button with physical prompt',
      ),
      ChecklistItem(
        id: 'ps_comm_1',
        category: 'Communication',
        description: 'Vocalizes in response to interaction',
      ),
      ChecklistItem(
        id: 'ps_comm_2',
        category: 'Communication',
        description: 'Shows preference between two items via gaze or gesture',
      ),
      ChecklistItem(
        id: 'ps_social_1',
        category: 'Social',
        description: 'Smiles or shows positive affect during interaction',
      ),
      ChecklistItem(
        id: 'ps_social_2',
        category: 'Social',
        description: 'Attends to familiar person for at least 5 seconds',
      ),
    ];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Adaptive baseline assessment that renders different UIs based on
/// the child's functioning level determined from the parent assessment.
class BaselineAssessmentScreen extends ConsumerStatefulWidget {
  const BaselineAssessmentScreen({super.key});

  @override
  ConsumerState<BaselineAssessmentScreen> createState() =>
      _BaselineAssessmentScreenState();
}

class _BaselineAssessmentScreenState
    extends ConsumerState<BaselineAssessmentScreen> {
  final Map<String, String> _answers = {};
  int _currentIndex = 0;
  bool _isSubmitting = false;
  String? _errorMessage;

  /// Timer tracking for the assessment.
  final Stopwatch _stopwatch = Stopwatch();
  Timer? _timerRefresh;
  String _elapsedDisplay = '0:00';

  // For partner-assisted / observational checklist modes.
  final Map<String, String> _partnerAnswers = {};
  final Map<String, bool> _checklistChecked = {};
  final Map<String, String> _checklistNotes = {};
  final List<String> _freeTextObservations = [];

  @override
  void initState() {
    super.initState();
    _stopwatch.start();
    _timerRefresh = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          final elapsed = _stopwatch.elapsed;
          _elapsedDisplay =
              '${elapsed.inMinutes}:${(elapsed.inSeconds % 60).toString().padLeft(2, '0')}';
        });
      }
    });
  }

  @override
  void dispose() {
    _stopwatch.stop();
    _timerRefresh?.cancel();
    super.dispose();
  }

  List<BaselineQuestion> _questionsForLevel(FunctioningLevel level) {
    switch (level) {
      case FunctioningLevel.standard:
        return _standardQuestions();
      case FunctioningLevel.supported:
        return _supportedQuestions();
      case FunctioningLevel.lowVerbal:
        return _lowVerbalQuestions();
      case FunctioningLevel.nonVerbal:
      case FunctioningLevel.preSymbolic:
        return []; // handled separately
    }
  }

  double _progress(FunctioningLevel level) {
    switch (level) {
      case FunctioningLevel.standard:
      case FunctioningLevel.supported:
      case FunctioningLevel.lowVerbal:
        final questions = _questionsForLevel(level);
        return questions.isEmpty ? 0 : (_currentIndex + 1) / questions.length;
      case FunctioningLevel.nonVerbal:
        final prompts = _nonVerbalPrompts();
        return prompts.isEmpty ? 0 : (_currentIndex + 1) / prompts.length;
      case FunctioningLevel.preSymbolic:
        final items = _preSymbolicItems();
        final checked =
            _checklistChecked.values.where((v) => v).length;
        return items.isEmpty ? 0 : checked / items.length;
    }
  }

  void _selectAnswer(String questionId, String value) {
    setState(() {
      _answers[questionId] = value;
    });
  }

  void _goNext(FunctioningLevel level) {
    final totalCount = level == FunctioningLevel.nonVerbal
        ? _nonVerbalPrompts().length
        : _questionsForLevel(level).length;

    if (_currentIndex < totalCount - 1) {
      setState(() {
        _currentIndex++;
      });
    } else {
      _submit(level);
    }
  }

  void _skip(FunctioningLevel level) {
    final totalCount = level == FunctioningLevel.nonVerbal
        ? _nonVerbalPrompts().length
        : _questionsForLevel(level).length;

    if (_currentIndex < totalCount - 1) {
      setState(() {
        _currentIndex++;
      });
    } else {
      _submit(level);
    }
  }

  Future<void> _submit(FunctioningLevel level) async {
    _stopwatch.stop();

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);

      final Map<String, dynamic> payload = {
        'functioningLevel': level.name,
        'durationSeconds': _stopwatch.elapsed.inSeconds,
      };

      switch (level) {
        case FunctioningLevel.standard:
        case FunctioningLevel.supported:
        case FunctioningLevel.lowVerbal:
          payload['answers'] = _answers;
        case FunctioningLevel.nonVerbal:
          payload['partnerAnswers'] = _partnerAnswers;
        case FunctioningLevel.preSymbolic:
          payload['checklist'] = _checklistChecked;
          payload['notes'] = _checklistNotes;
          payload['observations'] = _freeTextObservations;
      }

      await apiClient.post(
        '${Endpoints.learners}/baseline',
        data: payload,
      );

      if (mounted) {
        context.go('/onboarding/brain-reveal');
      }
    } catch (e) {
      if (mounted) {
        _stopwatch.start();
        setState(() {
          _errorMessage = 'Failed to submit. Please try again.';
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
    final level = ref.watch(functioningLevelProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Baseline Assessment'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Semantics(
                label: 'Time elapsed: $_elapsedDisplay',
                child: Text(
                  _elapsedDisplay,
                  style: theme.textTheme.bodyMedium,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ---- Progress bar ----
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: _progress(level),
                  minHeight: 6,
                ),
              ),
            ),

            // ---- Error banner ----
            if (_errorMessage != null)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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
                            color: colorScheme.onErrorContainer, size: 20),
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

            // ---- Content ----
            Expanded(
              child: _isSubmitting
                  ? const Center(
                      child: CircularProgressIndicator(),
                    )
                  : _buildContent(level, theme, colorScheme),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    FunctioningLevel level,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    switch (level) {
      case FunctioningLevel.standard:
        return _buildStandardView(theme, colorScheme);
      case FunctioningLevel.supported:
        return _buildSupportedView(theme, colorScheme);
      case FunctioningLevel.lowVerbal:
        return _buildLowVerbalView(theme, colorScheme);
      case FunctioningLevel.nonVerbal:
        return _buildNonVerbalView(theme, colorScheme);
      case FunctioningLevel.preSymbolic:
        return _buildPreSymbolicView(theme, colorScheme);
    }
  }

  // ---- STANDARD: quiz-style ----
  Widget _buildStandardView(ThemeData theme, ColorScheme colorScheme) {
    final questions = _standardQuestions();
    if (_currentIndex >= questions.length) return const SizedBox.shrink();
    final q = questions[_currentIndex];
    final selected = _answers[q.id];

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Semantics(
                  header: true,
                  child: Text(q.text, style: theme.textTheme.titleLarge),
                ),
                const SizedBox(height: 24),
                ...q.options.map((opt) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _QuizOption(
                        label: opt.label,
                        isSelected: selected == opt.value,
                        onTap: () => _selectAnswer(q.id, opt.value),
                      ),
                    )),
              ],
            ),
          ),
        ),
        _buildBottomBar(
          colorScheme,
          canContinue: selected != null,
          onContinue: () => _goNext(FunctioningLevel.standard),
          onSkip: () => _skip(FunctioningLevel.standard),
        ),
      ],
    );
  }

  // ---- SUPPORTED: simplified with audio hint ----
  Widget _buildSupportedView(ThemeData theme, ColorScheme colorScheme) {
    final questions = _supportedQuestions();
    if (_currentIndex >= questions.length) return const SizedBox.shrink();
    final q = questions[_currentIndex];
    final selected = _answers[q.id];

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Semantics(
                        header: true,
                        child:
                            Text(q.text, style: theme.textTheme.titleLarge),
                      ),
                    ),
                    if (q.audioUrl != null)
                      IconButton(
                        icon: Icon(Icons.volume_up,
                            color: colorScheme.primary),
                        onPressed: () {
                          // Audio playback would be handled by audioplayers.
                          // The URL is stored in q.audioUrl.
                        },
                        tooltip: 'Listen to question',
                        iconSize: 32,
                      ),
                  ],
                ),
                const SizedBox(height: 24),
                ...q.options.map((opt) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _QuizOption(
                        label: opt.label,
                        isSelected: selected == opt.value,
                        onTap: () => _selectAnswer(q.id, opt.value),
                        large: true,
                      ),
                    )),
              ],
            ),
          ),
        ),
        _buildBottomBar(
          colorScheme,
          canContinue: selected != null,
          onContinue: () => _goNext(FunctioningLevel.supported),
          onSkip: () => _skip(FunctioningLevel.supported),
        ),
      ],
    );
  }

  // ---- LOW_VERBAL: picture-based 2-choice ----
  Widget _buildLowVerbalView(ThemeData theme, ColorScheme colorScheme) {
    final questions = _lowVerbalQuestions();
    if (_currentIndex >= questions.length) return const SizedBox.shrink();
    final q = questions[_currentIndex];
    final selected = _answers[q.id];

    return Column(
      children: [
        Expanded(
          child: PictureQuestion(
            questionText: q.text,
            optionA: PictureOption(
              value: q.options[0].value,
              label: q.options[0].label,
              imageAsset: q.options[0].imageUrl ?? '',
            ),
            optionB: PictureOption(
              value: q.options[1].value,
              label: q.options[1].label,
              imageAsset: q.options[1].imageUrl ?? '',
            ),
            selectedValue: selected,
            onSelect: (value) => _selectAnswer(q.id, value),
          ),
        ),
        _buildBottomBar(
          colorScheme,
          canContinue: selected != null,
          onContinue: () => _goNext(FunctioningLevel.lowVerbal),
          onSkip: () => _skip(FunctioningLevel.lowVerbal),
        ),
      ],
    );
  }

  // ---- NON_VERBAL: partner-assisted ----
  Widget _buildNonVerbalView(ThemeData theme, ColorScheme colorScheme) {
    final prompts = _nonVerbalPrompts();
    if (_currentIndex >= prompts.length) return const SizedBox.shrink();
    final prompt = prompts[_currentIndex];
    final selected = _partnerAnswers[prompt.id];

    return Column(
      children: [
        Expanded(
          child: PartnerAssisted(
            prompt: prompt,
            selectedValue: selected,
            onSelect: (value) {
              setState(() {
                _partnerAnswers[prompt.id] = value;
              });
            },
          ),
        ),
        _buildBottomBar(
          colorScheme,
          canContinue: selected != null,
          onContinue: () => _goNext(FunctioningLevel.nonVerbal),
          onSkip: () => _skip(FunctioningLevel.nonVerbal),
        ),
      ],
    );
  }

  // ---- PRE_SYMBOLIC: observational checklist ----
  Widget _buildPreSymbolicView(ThemeData theme, ColorScheme colorScheme) {
    return Column(
      children: [
        Expanded(
          child: ObservationalChecklist(
            items: _preSymbolicItems(),
            checkedItems: _checklistChecked,
            notes: _checklistNotes,
            freeTextObservations: _freeTextObservations,
            onCheckChanged: (id, checked) {
              setState(() {
                _checklistChecked[id] = checked;
              });
            },
            onNoteChanged: (id, note) {
              setState(() {
                _checklistNotes[id] = note;
              });
            },
            onAddObservation: (text) {
              setState(() {
                _freeTextObservations.add(text);
              });
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: SizedBox(
            height: 48,
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting
                  ? null
                  : () => _submit(FunctioningLevel.preSymbolic),
              child: const Text('Complete Assessment'),
            ),
          ),
        ),
      ],
    );
  }

  // ---- Shared bottom bar ----
  Widget _buildBottomBar(
    ColorScheme colorScheme, {
    required bool canContinue,
    required VoidCallback onContinue,
    required VoidCallback onSkip,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
      child: Row(
        children: [
          TextButton(
            onPressed: onSkip,
            child: const Text('Skip'),
          ),
          const Spacer(),
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: canContinue ? onContinue : null,
              child: const Text('Continue'),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Quiz option tile (standard / supported)
// ---------------------------------------------------------------------------

class _QuizOption extends StatelessWidget {
  const _QuizOption({
    required this.label,
    required this.isSelected,
    this.onTap,
    this.large = false,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      selected: isSelected,
      button: true,
      child: Material(
        color:
            isSelected ? colorScheme.primaryContainer : colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: EdgeInsets.all(large ? 20 : 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color:
                    isSelected ? colorScheme.primary : colorScheme.outline,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    style: (large
                            ? theme.textTheme.titleMedium
                            : theme.textTheme.bodyLarge)
                        ?.copyWith(
                      color: isSelected
                          ? colorScheme.onPrimaryContainer
                          : colorScheme.onSurface,
                    ),
                  ),
                ),
                Icon(
                  isSelected
                      ? Icons.radio_button_checked
                      : Icons.radio_button_unchecked,
                  color: isSelected
                      ? colorScheme.primary
                      : colorScheme.outline,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
