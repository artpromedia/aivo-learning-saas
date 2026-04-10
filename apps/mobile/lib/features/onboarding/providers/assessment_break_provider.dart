import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/models/break_config.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

class AssessmentBreakState {
  const AssessmentBreakState({
    this.questionsAnswered = 0,
    this.consecutiveWrong = 0,
    this.breakConfig = const BreakConfig(),
    this.shouldShowBreak = false,
    this.nextBreakType = 'breathing',
    this.breakTypeIndex = 0,
  });

  final int questionsAnswered;
  final int consecutiveWrong;
  final BreakConfig breakConfig;
  final bool shouldShowBreak;
  final String nextBreakType;

  /// Tracks rotation through [BreakConfig.preferredTypes].
  final int breakTypeIndex;

  AssessmentBreakState copyWith({
    int? questionsAnswered,
    int? consecutiveWrong,
    BreakConfig? breakConfig,
    bool? shouldShowBreak,
    String? nextBreakType,
    int? breakTypeIndex,
  }) {
    return AssessmentBreakState(
      questionsAnswered: questionsAnswered ?? this.questionsAnswered,
      consecutiveWrong: consecutiveWrong ?? this.consecutiveWrong,
      breakConfig: breakConfig ?? this.breakConfig,
      shouldShowBreak: shouldShowBreak ?? this.shouldShowBreak,
      nextBreakType: nextBreakType ?? this.nextBreakType,
      breakTypeIndex: breakTypeIndex ?? this.breakTypeIndex,
    );
  }
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class AssessmentBreakNotifier extends StateNotifier<AssessmentBreakState> {
  AssessmentBreakNotifier([BreakConfig? config])
      : super(AssessmentBreakState(
          breakConfig: config ?? const BreakConfig(),
          nextBreakType:
              (config ?? const BreakConfig()).preferredTypes.isNotEmpty
                  ? (config ?? const BreakConfig()).preferredTypes.first
                  : 'breathing',
        ),);

  /// Record that the learner answered a question.
  ///
  /// [correct] is used for adaptive break logic — three consecutive wrong
  /// answers trigger an early calming break.
  void recordAnswer(bool correct) {
    final answered = state.questionsAnswered + 1;
    final wrong = correct ? 0 : state.consecutiveWrong + 1;

    state = state.copyWith(
      questionsAnswered: answered,
      consecutiveWrong: wrong,
    );
  }

  /// Returns `true` when the assessment should pause for a break.
  bool checkShouldBreak() {
    final cfg = state.breakConfig;

    // Adaptive: 3+ consecutive wrong answers → calming break.
    if (cfg.adaptiveBreaks && state.consecutiveWrong >= 3) {
      state = state.copyWith(
        shouldShowBreak: true,
        nextBreakType: 'breathing', // calming break for frustration
      );
      return true;
    }

    // Frequency-based break.
    if (state.questionsAnswered > 0 &&
        state.questionsAnswered % cfg.frequencyQuestions == 0) {
      state = state.copyWith(
        shouldShowBreak: true,
        nextBreakType: getNextBreakType(),
      );
      return true;
    }

    return false;
  }

  /// Cycles through [BreakConfig.preferredTypes].
  String getNextBreakType() {
    final types = state.breakConfig.preferredTypes;
    if (types.isEmpty) return 'breathing';
    return types[state.breakTypeIndex % types.length];
  }

  /// Called after the break activity completes.
  void breakCompleted() {
    final nextIdx = state.breakTypeIndex + 1;
    state = state.copyWith(
      shouldShowBreak: false,
      consecutiveWrong: 0,
      breakTypeIndex: nextIdx,
      nextBreakType: state.breakConfig.preferredTypes.isNotEmpty
          ? state.breakConfig.preferredTypes[
              nextIdx % state.breakConfig.preferredTypes.length]
          : 'breathing',
    );
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final assessmentBreakProvider =
    StateNotifierProvider<AssessmentBreakNotifier, AssessmentBreakState>(
  (ref) => AssessmentBreakNotifier(),
);
