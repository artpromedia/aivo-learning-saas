import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:uuid/uuid.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/homework.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _homeworkDetailProvider =
    FutureProvider.autoDispose.family<Homework, String>((ref, id) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.tutorHomeworkDetail(id));
  return Homework.fromJson(response.data as Map<String, dynamic>);
});

// ---------------------------------------------------------------------------
// Help chat message model
// ---------------------------------------------------------------------------

class _HelpMessage {
  _HelpMessage({
    required this.id,
    required this.role,
    required this.content,
    this.isStreaming = false,
  });

  final String id;
  final String role;
  String content;
  bool isStreaming;
}

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------

class _SessionState {
  _SessionState({
    this.homework,
    this.currentQuestionIndex = 0,
    this.answers = const {},
    this.helpMessages = const [],
    this.isCompleted = false,
    this.score,
    this.isSendingHelp = false,
  });

  final Homework? homework;
  final int currentQuestionIndex;
  final Map<String, String> answers;
  final List<_HelpMessage> helpMessages;
  final bool isCompleted;
  final double? score;
  final bool isSendingHelp;

  _SessionState copyWith({
    Homework? homework,
    int? currentQuestionIndex,
    Map<String, String>? answers,
    List<_HelpMessage>? helpMessages,
    bool? isCompleted,
    double? Function()? score,
    bool? isSendingHelp,
  }) {
    return _SessionState(
      homework: homework ?? this.homework,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      answers: answers ?? this.answers,
      helpMessages: helpMessages ?? this.helpMessages,
      isCompleted: isCompleted ?? this.isCompleted,
      score: score != null ? score() : this.score,
      isSendingHelp: isSendingHelp ?? this.isSendingHelp,
    );
  }
}

// ---------------------------------------------------------------------------
// Session notifier
// ---------------------------------------------------------------------------

final _sessionProvider = StateNotifierProvider.autoDispose
    .family<_SessionNotifier, _SessionState, String>((ref, homeworkId) {
  return _SessionNotifier(
    api: ref.watch(apiClientProvider),
    homeworkId: homeworkId,
  );
});

class _SessionNotifier extends StateNotifier<_SessionState> {
  _SessionNotifier({required ApiClient api, required this.homeworkId})
      : _api = api,
        super(_SessionState()) {
    _loadHomework();
  }

  final ApiClient _api;
  final String homeworkId;
  final _uuid = const Uuid();

  Future<void> _loadHomework() async {
    try {
      final response = await _api.get(Endpoints.tutorHomeworkDetail(homeworkId));
      final homework =
          Homework.fromJson(response.data as Map<String, dynamic>);
      state = state.copyWith(homework: homework);
    } catch (_) {
      // Error state handled by parent FutureProvider.
    }
  }

  void answerQuestion(String questionId, String answer) {
    final newAnswers = Map<String, String>.from(state.answers);
    newAnswers[questionId] = answer;
    state = state.copyWith(answers: newAnswers);
  }

  void goToQuestion(int index) {
    final questions = state.homework?.questions ?? [];
    if (index >= 0 && index < questions.length) {
      state = state.copyWith(currentQuestionIndex: index);
    }
  }

  Future<void> askForHelp(String question) async {
    final userMsg = _HelpMessage(
      id: _uuid.v4(),
      role: 'user',
      content: question,
    );
    final assistantMsg = _HelpMessage(
      id: _uuid.v4(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    );

    state = state.copyWith(
      helpMessages: [...state.helpMessages, userMsg, assistantMsg],
      isSendingHelp: true,
    );

    try {
      final response = await _api.stream(
        Endpoints.tutorHomeworkSessionMessage(homeworkId),
        data: {
          'message': question,
          'questionId': state.homework?.questions.isNotEmpty == true
              ? state.homework!.questions[state.currentQuestionIndex].id
              : null,
        },
      );

      final stream = response.data!.stream;
      final buffer = StringBuffer();

      await for (final chunk in stream) {
        final decoded = utf8.decode(chunk, allowMalformed: true);
        buffer.write(decoded);

        // Update the streaming message.
        final msgs = List<_HelpMessage>.from(state.helpMessages);
        final lastIdx =
            msgs.lastIndexWhere((m) => m.id == assistantMsg.id);
        if (lastIdx != -1) {
          msgs[lastIdx].content = buffer.toString();
        }
        if (mounted) {
          state = state.copyWith(helpMessages: msgs);
        }
      }

      // Mark streaming complete.
      final msgs = List<_HelpMessage>.from(state.helpMessages);
      final lastIdx = msgs.lastIndexWhere((m) => m.id == assistantMsg.id);
      if (lastIdx != -1) {
        msgs[lastIdx].isStreaming = false;
      }
      if (mounted) {
        state = state.copyWith(helpMessages: msgs, isSendingHelp: false);
      }
    } catch (e) {
      final msgs = List<_HelpMessage>.from(state.helpMessages);
      final lastIdx = msgs.lastIndexWhere((m) => m.id == assistantMsg.id);
      if (lastIdx != -1) {
        msgs[lastIdx].content =
            'Sorry, I could not get help right now. Please try again.';
        msgs[lastIdx].isStreaming = false;
      }
      if (mounted) {
        state = state.copyWith(helpMessages: msgs, isSendingHelp: false);
      }
    }
  }

  Future<void> completeSession() async {
    try {
      final response = await _api.post(
        Endpoints.tutorHomeworkSessionEnd(homeworkId),
        data: {'answers': state.answers},
      );
      final data = response.data as Map<String, dynamic>;
      final score = (data['score'] as num?)?.toDouble();
      state = state.copyWith(
        isCompleted: true,
        score: () => score,
      );
    } catch (_) {
      // Calculate locally as fallback.
      final questions = state.homework?.questions ?? [];
      int correct = 0;
      for (final q in questions) {
        if (state.answers[q.id] != null) {
          final correctAnswer =
              q.data['correctAnswer'] as String? ?? q.data['answer'] as String?;
          if (correctAnswer != null &&
              state.answers[q.id]?.trim().toLowerCase() ==
                  correctAnswer.trim().toLowerCase()) {
            correct++;
          }
        }
      }
      final score =
          questions.isNotEmpty ? (correct / questions.length) * 100 : 0.0;
      state = state.copyWith(isCompleted: true, score: () => score);
    }
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class HomeworkSessionScreen extends ConsumerStatefulWidget {
  const HomeworkSessionScreen({super.key, required this.homeworkId});

  final String homeworkId;

  @override
  ConsumerState<HomeworkSessionScreen> createState() =>
      _HomeworkSessionScreenState();
}

class _HomeworkSessionScreenState
    extends ConsumerState<HomeworkSessionScreen> {
  final _helpController = TextEditingController();
  final _helpScrollController = ScrollController();
  final _pageController = PageController();

  @override
  void dispose() {
    _helpController.dispose();
    _helpScrollController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final sessionState = ref.watch(_sessionProvider(widget.homeworkId));
    final homework = sessionState.homework;

    if (homework == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Homework Session')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (sessionState.isCompleted) {
      return _buildSummary(context, theme, colorScheme, sessionState, homework);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(homework.detectedSubject ?? 'Homework Session'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/homework'),
          tooltip: 'Back',
        ),
        actions: [
          if (homework.questions.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${sessionState.currentQuestionIndex + 1}/${homework.questions.length}',
                  style: theme.textTheme.titleMedium,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Original image thumbnail + subject badge
          _buildHeader(theme, colorScheme, homework),

          // Questions
          if (homework.questions.isNotEmpty)
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: homework.questions.length,
                onPageChanged: (index) {
                  ref
                      .read(_sessionProvider(widget.homeworkId).notifier)
                      .goToQuestion(index);
                },
                itemBuilder: (context, index) {
                  return _buildQuestion(
                    theme,
                    colorScheme,
                    homework.questions[index],
                    sessionState.answers,
                  );
                },
              ),
            )
          else
            Expanded(
              child: Center(
                child: Text(
                  'No questions adapted yet.',
                  style: theme.textTheme.bodyLarge,
                ),
              ),
            ),

          // Help chat
          _buildHelpChat(theme, colorScheme, sessionState),

          // Navigation + complete
          _buildBottomBar(theme, colorScheme, sessionState, homework),
        ],
      ),
    );
  }

  Widget _buildHeader(
      ThemeData theme, ColorScheme colorScheme, Homework homework) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Thumbnail
          if (homework.imageUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: homework.imageUrl!,
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  width: 48,
                  height: 48,
                  color: colorScheme.surfaceContainerHighest,
                  child: const Icon(Icons.image, size: 24),
                ),
                errorWidget: (_, __, ___) => Container(
                  width: 48,
                  height: 48,
                  color: colorScheme.surfaceContainerHighest,
                  child: const Icon(Icons.broken_image, size: 24),
                ),
              ),
            )
          else if (homework.pdfUrl != null)
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: colorScheme.errorContainer.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.picture_as_pdf,
                  color: colorScheme.error, size: 24),
            ),
          const SizedBox(width: 12),
          // Subject badge
          if (homework.detectedSubject != null)
            Chip(
              avatar:
                  Icon(_subjectIcon(homework.detectedSubject!), size: 16),
              label: Text(homework.detectedSubject!),
            ),
          const Spacer(),
        ],
      ),
    );
  }

  Widget _buildQuestion(
    ThemeData theme,
    ColorScheme colorScheme,
    HomeworkQuestion question,
    Map<String, String> answers,
  ) {
    final currentAnswer = answers[question.id] ?? '';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question text
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              question.questionText,
              style: theme.textTheme.bodyLarge,
            ),
          ),
          const SizedBox(height: 16),

          // Question image
          if (question.imageUrl != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: question.imageUrl!,
                fit: BoxFit.contain,
                placeholder: (_, __) => const SizedBox(
                  height: 150,
                  child: Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Answer input based on type
          if (question.type == 'multiple_choice')
            _buildMultipleChoice(
                theme, colorScheme, question, currentAnswer)
          else
            _buildFreeTextAnswer(theme, colorScheme, question, currentAnswer),

          // Feedback display (for completed homework)
          if (question.feedback != null) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: question.isCorrect == true
                    ? colorScheme.secondary.withValues(alpha: 0.1)
                    : colorScheme.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: question.isCorrect == true
                      ? colorScheme.secondary
                      : colorScheme.error,
                  width: 1,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    question.isCorrect == true
                        ? Icons.check_circle
                        : Icons.info_outline,
                    color: question.isCorrect == true
                        ? colorScheme.secondary
                        : colorScheme.error,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      question.feedback!,
                      style: theme.textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMultipleChoice(
    ThemeData theme,
    ColorScheme colorScheme,
    HomeworkQuestion question,
    String currentAnswer,
  ) {
    final options =
        (question.data['options'] as List<dynamic>?)?.cast<String>() ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Select your answer:', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        ...options.map((option) {
          final isSelected = currentAnswer == option;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Semantics(
              label: option,
              selected: isSelected,
              child: InkWell(
                onTap: () => ref
                    .read(_sessionProvider(widget.homeworkId).notifier)
                    .answerQuestion(question.id, option),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? colorScheme.primary.withValues(alpha: 0.12)
                        : colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? colorScheme.primary
                          : colorScheme.outline,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Text(
                    option,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildFreeTextAnswer(
    ThemeData theme,
    ColorScheme colorScheme,
    HomeworkQuestion question,
    String currentAnswer,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Your answer:', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: currentAnswer.isNotEmpty ? currentAnswer : null,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Type your answer here...',
          ),
          onChanged: (value) => ref
              .read(_sessionProvider(widget.homeworkId).notifier)
              .answerQuestion(question.id, value),
        ),
      ],
    );
  }

  Widget _buildHelpChat(
      ThemeData theme, ColorScheme colorScheme, _SessionState sessionState) {
    if (sessionState.helpMessages.isEmpty && !sessionState.isSendingHelp) {
      // Collapsed help bar
      return Container(
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerHighest,
          border: Border(top: BorderSide(color: colorScheme.outline)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Icon(Icons.help_outline, size: 20, color: colorScheme.primary),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _helpController,
                decoration: InputDecoration(
                  hintText: 'Ask the tutor for help...',
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                  contentPadding: EdgeInsets.zero,
                  isDense: true,
                  hintStyle: theme.textTheme.bodyMedium
                      ?.copyWith(color: colorScheme.outlineVariant),
                ),
                style: theme.textTheme.bodyMedium,
                onSubmitted: _sendHelp,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.send),
              iconSize: 20,
              onPressed: () => _sendHelp(_helpController.text),
              tooltip: 'Send',
            ),
          ],
        ),
      );
    }

    // Expanded help chat
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        border: Border(top: BorderSide(color: colorScheme.outline)),
      ),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _helpScrollController,
              padding: const EdgeInsets.all(8),
              itemCount: sessionState.helpMessages.length,
              itemBuilder: (context, index) {
                final msg = sessionState.helpMessages[index];
                final isUser = msg.role == 'user';
                return Align(
                  alignment:
                      isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.7,
                    ),
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isUser
                          ? colorScheme.primary
                          : colorScheme.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: msg.isStreaming && msg.content.isEmpty
                        ? SizedBox(
                            height: 16,
                            width: 40,
                            child: _TypingIndicator(color: colorScheme.primary),
                          )
                        : Text(
                            msg.content,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: isUser
                                  ? colorScheme.onPrimary
                                  : colorScheme.onSurface,
                            ),
                          ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _helpController,
                    decoration: InputDecoration(
                      hintText: 'Ask for help...',
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    style: theme.textTheme.bodyMedium,
                    onSubmitted: _sendHelp,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: sessionState.isSendingHelp
                      ? null
                      : () => _sendHelp(_helpController.text),
                  tooltip: 'Send',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _sendHelp(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    _helpController.clear();
    ref
        .read(_sessionProvider(widget.homeworkId).notifier)
        .askForHelp(trimmed);
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_helpScrollController.hasClients) {
        _helpScrollController.animateTo(
          _helpScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Widget _buildBottomBar(ThemeData theme, ColorScheme colorScheme,
      _SessionState sessionState, Homework homework) {
    if (homework.questions.isEmpty) return const SizedBox.shrink();
    final isLast =
        sessionState.currentQuestionIndex >= homework.questions.length - 1;
    final isFirst = sessionState.currentQuestionIndex <= 0;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        child: Row(
          children: [
            if (!isFirst)
              OutlinedButton(
                onPressed: () {
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
                child: const Text('Previous'),
              ),
            const Spacer(),
            if (isLast)
              ElevatedButton(
                onPressed: () => ref
                    .read(_sessionProvider(widget.homeworkId).notifier)
                    .completeSession(),
                child: const Text('Complete'),
              )
            else
              ElevatedButton(
                onPressed: () {
                  _pageController.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
                child: const Text('Next'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummary(BuildContext context, ThemeData theme,
      ColorScheme colorScheme, _SessionState sessionState, Homework homework) {
    final score = sessionState.score ?? 0.0;
    final answeredCount = sessionState.answers.length;
    final totalCount = homework.questions.length;

    return Scaffold(
      appBar: AppBar(title: const Text('Session Complete')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                score >= 70 ? Icons.emoji_events : Icons.school,
                size: 80,
                color: score >= 70
                    ? colorScheme.tertiary
                    : colorScheme.primary,
              ),
              const SizedBox(height: 24),
              Text(
                score >= 90
                    ? 'Excellent!'
                    : score >= 70
                        ? 'Great job!'
                        : score >= 50
                            ? 'Good effort!'
                            : 'Keep practicing!',
                style: theme.textTheme.headlineMedium,
              ),
              const SizedBox(height: 16),
              Text(
                '${score.round()}%',
                style: theme.textTheme.headlineLarge?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 56,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '$answeredCount of $totalCount questions answered',
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/learner/homework'),
                  child: const Text('Back to Homework'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.go('/learner/home'),
                  child: const Text('Go Home'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _subjectIcon(String subject) {
    final s = subject.toLowerCase();
    if (s.contains('math')) return Icons.calculate;
    if (s.contains('science')) return Icons.science;
    if (s.contains('english') || s.contains('reading')) return Icons.menu_book;
    if (s.contains('history') || s.contains('social')) return Icons.public;
    return Icons.assignment;
  }
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------

class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator({required this.color});
  final Color color;

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final delay = i * 0.2;
            final value = ((_controller.value + delay) % 1.0);
            final opacity = (value < 0.5) ? value * 2 : 2 - value * 2;
            return Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: widget.color.withValues(alpha: 0.3 + opacity * 0.7),
                shape: BoxShape.circle,
              ),
            );
          }),
        );
      },
    );
  }
}
