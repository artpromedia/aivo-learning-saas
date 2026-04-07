import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/data/models/break_config.dart';
import 'package:aivo_mobile/features/onboarding/screens/assessment_break_screen.dart';
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
    this.correctAnswer,
    this.imageUrlA,
    this.imageUrlB,
    this.audioUrl,
  });

  final String id;
  final String text;
  final List<BaselineOption> options;

  /// The correct answer value (for adaptive break tracking).
  final String? correctAnswer;

  /// For LOW_VERBAL picture-based questions.
  final String? imageUrlA;
  final String? imageUrlB;

  /// Optional audio narration URL.
  final String? audioUrl;

  /// Parse a question from the assessment API response.
  factory BaselineQuestion.fromApiJson(Map<String, dynamic> json) {
    return BaselineQuestion(
      id: json['id'] as String,
      text: (json['prompt'] ?? json['text']) as String,
      options: (json['options'] as List<dynamic>).map((o) {
        if (o is Map<String, dynamic>) {
          return BaselineOption(
            value: (o['value'] ?? o.toString()) as String,
            label: (o['label'] ?? o['value'] ?? o.toString()) as String,
            imageUrl: o['imageUrl'] as String?,
          );
        }
        return BaselineOption(value: o.toString(), label: o.toString());
      }).toList(),
      correctAnswer: json['correctAnswer'] as String?,
      imageUrlA: json['imageUrlA'] as String?,
      imageUrlB: json['imageUrlB'] as String?,
      audioUrl: json['audioUrl'] as String?,
    );
  }
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
              value: 'dog', label: 'Dog', imageUrl: 'assets/images/dog.png',),
          BaselineOption(
              value: 'cat', label: 'Cat', imageUrl: 'assets/images/cat.png',),
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
              imageUrl: 'assets/images/red_apple.png',),
          BaselineOption(
              value: 'green',
              label: 'Green',
              imageUrl: 'assets/images/green_leaf.png',),
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
              imageUrl: 'assets/images/ball.png',),
          BaselineOption(
              value: 'book',
              label: 'Book',
              imageUrl: 'assets/images/book.png',),
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
// Correct answers for adaptive break tracking
// ---------------------------------------------------------------------------

const Map<String, String> _correctAnswers = {
  'std_1': '8',
  'std_2': 'hat',
  'std_3': '7',
  'std_4': 'spring',
  'sup_1': '3',
  'sup_2': 'blue',
  'sup_3': 'big',
  'lv_1': 'dog',
  'lv_2': 'red',
  'lv_3': 'ball',
};

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

  // Break state
  bool _showBreak = false;
  String _breakType = 'breathing';
  int _breakTypeIndex = 0;
  int _consecutiveWrong = 0;
  int _questionsAnsweredSinceBreak = 0;
  BreakConfig _breakConfig = BreakConfig.defaults();

  /// Timer tracking for the assessment.
  final Stopwatch _stopwatch = Stopwatch();
  Timer? _timerRefresh;
  String _elapsedDisplay = '0:00';

  // API-driven assessment state.
  bool _isApiMode = false;
  bool _isOffline = false;
  String? _learnerId;
  BaselineQuestion? _currentApiQuestion;
  double _apiProgress = 0.0;

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
    _startAssessment();
  }

  String? _getLearnerId() {
    final authState = ref.read(authProvider);
    if (authState is AuthAuthenticated) {
      return authState.user.learnerId;
    }
    return null;
  }

  Future<void> _startAssessment() async {
    _learnerId = _getLearnerId();
    if (_learnerId == null) return; // fall back to local mode

    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
        Endpoints.baselineStart(_learnerId!),
      );

      final data = response.data as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _isApiMode = true;
          if (data['question'] != null) {
            _currentApiQuestion = BaselineQuestion.fromApiJson(
              data['question'] as Map<String, dynamic>,
            );
          }
          _apiProgress = (data['progress'] as num?)?.toDouble() ?? 0.0;
          if (data['breakConfig'] != null) {
            _breakConfig = BreakConfig.fromJson(
              data['breakConfig'] as Map<String, dynamic>,
            );
          }
        });
      }
    } catch (_) {
      // API unavailable — fall back to local question banks.
      if (mounted) {
        setState(() {
          _isOffline = true;
          _breakConfig = BreakConfig.defaults();
        });
      }
    }
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

    // Track consecutive wrong answers for adaptive breaks.
    // In API mode, use correctAnswer from the question; in local mode, use the map.
    String? correct;
    if (_isApiMode && _currentApiQuestion != null) {
      correct = _currentApiQuestion!.correctAnswer;
    } else {
      correct = _correctAnswers[questionId];
    }
    if (correct != null) {
      if (value == correct) {
        _consecutiveWrong = 0;
      } else {
        _consecutiveWrong++;
      }
    }
  }

  /// Submit an individual answer via API and receive the next question.
  Future<void> _submitAnswerToApi(String questionId, String answer) async {
    if (!_isApiMode || _learnerId == null) return;

    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.post(
        Endpoints.baselineAnswer(_learnerId!),
        data: {'questionId': questionId, 'answer': answer},
      );

      final result = response.data as Map<String, dynamic>;
      final correct = result['correct'] as bool? ?? true;
      final serverBreak = result['shouldBreak'] as bool? ?? false;

      // Update consecutive wrong tracking from server truth.
      if (!correct) {
        _consecutiveWrong++;
      } else {
        _consecutiveWrong = 0;
      }

      if (result['isComplete'] == true) {
        await _completeApiAssessment();
      } else if (serverBreak || _shouldTriggerBreak()) {
        _showBreakScreen();
      } else if (result['nextQuestion'] != null) {
        setState(() {
          _currentApiQuestion = BaselineQuestion.fromApiJson(
            result['nextQuestion'] as Map<String, dynamic>,
          );
          _apiProgress = (result['progress'] as num?)?.toDouble() ?? _apiProgress;
        });
      }
    } catch (_) {
      // On API error, keep the current question and show error.
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to submit answer. Please try again.';
        });
      }
    }
  }

  bool _shouldTriggerBreak() {
    _questionsAnsweredSinceBreak++;

    if (_breakConfig.adaptiveBreaks && _consecutiveWrong >= 3) {
      return true;
    }
    if (_questionsAnsweredSinceBreak > 0 &&
        _questionsAnsweredSinceBreak % _breakConfig.frequencyQuestions == 0) {
      return true;
    }
    return false;
  }

  void _showBreakScreen() {
    final isAdaptive = _breakConfig.adaptiveBreaks && _consecutiveWrong >= 3;
    setState(() {
      _showBreak = true;
      _breakType = isAdaptive ? 'breathing' : _getNextBreakType();
      _consecutiveWrong = 0;
      _questionsAnsweredSinceBreak = 0;
    });
  }

  Future<void> _completeApiAssessment() async {
    try {
      final apiClient = ref.read(apiClientProvider);
      await apiClient.post(Endpoints.baselineComplete(_learnerId!));
    } catch (_) {
      // Best-effort completion call.
    }
    if (mounted) {
      context.go('/onboarding/brain-reveal');
    }
  }

  void _goNext(FunctioningLevel level) {
    final totalCount = level == FunctioningLevel.nonVerbal
        ? _nonVerbalPrompts().length
        : _questionsForLevel(level).length;

    // Skip breaks for preSymbolic (parent checklist) — breaks don't apply.
    if (level != FunctioningLevel.preSymbolic) {
      _questionsAnsweredSinceBreak++;

      // Check for adaptive break (3+ consecutive wrong answers).
      if (_breakConfig.adaptiveBreaks && _consecutiveWrong >= 3) {
        setState(() {
          _showBreak = true;
          _breakType = 'breathing'; // calming break for frustration
          _consecutiveWrong = 0;
          _questionsAnsweredSinceBreak = 0;
        });
        return;
      }

      // Check for frequency-based break.
      if (_questionsAnsweredSinceBreak > 0 &&
          _questionsAnsweredSinceBreak % _breakConfig.frequencyQuestions == 0) {
        setState(() {
          _showBreak = true;
          _breakType = _getNextBreakType();
          _questionsAnsweredSinceBreak = 0;
        });
        return;
      }
    }

    if (_currentIndex < totalCount - 1) {
      setState(() {
        _currentIndex++;
      });
    } else {
      _submit(level);
    }
  }

  String _getNextBreakType() {
    final types = _breakConfig.preferredTypes;
    if (types.isEmpty) return 'breathing';
    final type = types[_breakTypeIndex % types.length];
    _breakTypeIndex++;
    return type;
  }

  void _onBreakComplete() {
    setState(() {
      _showBreak = false;
      _consecutiveWrong = 0;

      // Advance to the next question after the break.
      final level = ref.read(functioningLevelProvider);
      final totalCount = level == FunctioningLevel.nonVerbal
          ? _nonVerbalPrompts().length
          : _questionsForLevel(level).length;

      if (_currentIndex < totalCount - 1) {
        _currentIndex++;
      } else {
        _submit(level);
      }
    });
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

            // ---- Offline banner ----
            if (_isOffline)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                child: Semantics(
                  liveRegion: true,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDCB6E).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.wifi_off, size: 18, color: Color(0xFFF9A825)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Offline mode: using practice questions. '
                            'Full assessment requires internet.',
                            style: theme.textTheme.bodySmall,
                          ),
                        ),
                      ],
                    ),
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
    // Show break screen if triggered.
    if (_showBreak) {
      // NonVerbal: show parent-facing prompt instead of interactive break.
      if (level == FunctioningLevel.nonVerbal) {
        return NonVerbalBreakPrompt(onContinue: _onBreakComplete);
      }
      return AssessmentBreakScreen(
        breakType: _breakType,
        onComplete: _onBreakComplete,
      );
    }

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
                    ),),
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
                            color: colorScheme.primary,),
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
                    ),),
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
