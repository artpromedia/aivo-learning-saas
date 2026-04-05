import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// SensoryBreakState
// ---------------------------------------------------------------------------

/// Immutable state emitted by [SensoryBreakTimerNotifier].
class SensoryBreakState {
  const SensoryBreakState({
    this.elapsedSeconds = 0,
    this.isBreakCue = false,
    this.isHardPause = false,
    this.isOnBreak = false,
  });

  /// Seconds elapsed in the current learning session.
  final int elapsedSeconds;

  /// True when a soft cue has been triggered (user may dismiss).
  final bool isBreakCue;

  /// True when a hard pause has been triggered (learning must stop).
  final bool isHardPause;

  /// True when the user is currently taking a break.
  final bool isOnBreak;

  SensoryBreakState copyWith({
    int? elapsedSeconds,
    bool? isBreakCue,
    bool? isHardPause,
    bool? isOnBreak,
  }) {
    return SensoryBreakState(
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      isBreakCue: isBreakCue ?? this.isBreakCue,
      isHardPause: isHardPause ?? this.isHardPause,
      isOnBreak: isOnBreak ?? this.isOnBreak,
    );
  }
}

// ---------------------------------------------------------------------------
// Break thresholds per functioning level (in seconds)
// ---------------------------------------------------------------------------

/// Returns (cueSeconds, hardPauseSeconds) for the given level.
/// Returns null for levels that do not require automatic breaks.
({int cue, int hardPause})? _thresholds(FunctioningLevel level) {
  switch (level) {
    case FunctioningLevel.lowVerbal:
      return (cue: 180, hardPause: 300); // 3 min cue, 5 min hard
    case FunctioningLevel.nonVerbal:
      return (cue: 120, hardPause: 180); // 2 min cue, 3 min hard
    case FunctioningLevel.standard:
    case FunctioningLevel.supported:
    case FunctioningLevel.preSymbolic:
      return null;
  }
}

// ---------------------------------------------------------------------------
// SensoryBreakTimerNotifier
// ---------------------------------------------------------------------------

class SensoryBreakTimerNotifier extends StateNotifier<SensoryBreakState> {
  SensoryBreakTimerNotifier(this._level) : super(const SensoryBreakState());

  final FunctioningLevel _level;
  Timer? _timer;

  /// Start tracking session time. Automatically emits break cues and hard
  /// pauses based on the current functioning level.
  void startSession() {
    _timer?.cancel();
    state = const SensoryBreakState();

    final thresholds = _thresholds(_level);
    if (thresholds == null) return;

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      final next = state.elapsedSeconds + 1;
      bool cue = state.isBreakCue;
      bool hard = state.isHardPause;

      if (next >= thresholds.hardPause && !state.isOnBreak) {
        hard = true;
        cue = false;
      } else if (next >= thresholds.cue && !cue && !state.isOnBreak) {
        cue = true;
      }

      state = state.copyWith(
        elapsedSeconds: next,
        isBreakCue: cue,
        isHardPause: hard,
      );
    });
  }

  /// Dismiss the soft cue so the user can continue for now.
  void dismissCue() {
    state = state.copyWith(isBreakCue: false);
  }

  /// Enter break mode (resets timers on completion).
  void startBreak() {
    _timer?.cancel();
    state = state.copyWith(
      isBreakCue: false,
      isHardPause: false,
      isOnBreak: true,
    );
  }

  /// End break and restart session tracking.
  void endBreak() {
    state = const SensoryBreakState();
    startSession();
  }

  /// Stop all tracking.
  void stopSession() {
    _timer?.cancel();
    state = const SensoryBreakState();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final sensoryBreakTimerProvider =
    StateNotifierProvider<SensoryBreakTimerNotifier, SensoryBreakState>((ref) {
  final level = ref.watch(functioningLevelProvider);
  final notifier = SensoryBreakTimerNotifier(level);
  ref.onDispose(() => notifier.dispose());
  return notifier;
});
