import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/data/models/break_config.dart';
import 'package:aivo_mobile/features/onboarding/providers/assessment_break_provider.dart';

void main() {
  group('AssessmentBreakNotifier', () {
    late AssessmentBreakNotifier notifier;

    setUp(() {
      notifier = AssessmentBreakNotifier(const BreakConfig(
        frequencyQuestions: 4,
        preferredTypes: ['breathing', 'music', 'puzzle'],
        adaptiveBreaks: true,
      ));
    });

    test('initial state has zero questions answered', () {
      expect(notifier.state.questionsAnswered, 0);
      expect(notifier.state.consecutiveWrong, 0);
      expect(notifier.state.shouldShowBreak, false);
    });

    test('recordAnswer increments questionsAnswered', () {
      notifier.recordAnswer(true);
      expect(notifier.state.questionsAnswered, 1);

      notifier.recordAnswer(false);
      expect(notifier.state.questionsAnswered, 2);
    });

    test('recordAnswer resets consecutiveWrong on correct answer', () {
      notifier.recordAnswer(false);
      notifier.recordAnswer(false);
      expect(notifier.state.consecutiveWrong, 2);

      notifier.recordAnswer(true);
      expect(notifier.state.consecutiveWrong, 0);
    });

    test('recordAnswer increments consecutiveWrong on wrong answer', () {
      notifier.recordAnswer(false);
      expect(notifier.state.consecutiveWrong, 1);

      notifier.recordAnswer(false);
      expect(notifier.state.consecutiveWrong, 2);
    });

    test('checkShouldBreak returns true at frequency intervals', () {
      // Answer 4 questions (frequency = 4)
      for (var i = 0; i < 4; i++) {
        notifier.recordAnswer(true);
      }
      expect(notifier.checkShouldBreak(), true);
      expect(notifier.state.shouldShowBreak, true);
    });

    test('checkShouldBreak returns false before frequency threshold', () {
      for (var i = 0; i < 3; i++) {
        notifier.recordAnswer(true);
      }
      expect(notifier.checkShouldBreak(), false);
      expect(notifier.state.shouldShowBreak, false);
    });

    test('3 consecutive wrong answers triggers adaptive break', () {
      notifier.recordAnswer(false);
      notifier.recordAnswer(false);
      notifier.recordAnswer(false);

      expect(notifier.checkShouldBreak(), true);
      expect(notifier.state.shouldShowBreak, true);
      expect(notifier.state.nextBreakType, 'breathing');
    });

    test('breakCompleted resets shouldShowBreak and advances type', () {
      // Trigger a break
      for (var i = 0; i < 4; i++) {
        notifier.recordAnswer(true);
      }
      notifier.checkShouldBreak();
      expect(notifier.state.shouldShowBreak, true);

      notifier.breakCompleted();
      expect(notifier.state.shouldShowBreak, false);
      expect(notifier.state.consecutiveWrong, 0);
    });

    test('getNextBreakType cycles through preferredTypes', () {
      expect(notifier.getNextBreakType(), 'breathing');

      // Advance by triggering and completing breaks
      for (var i = 0; i < 4; i++) {
        notifier.recordAnswer(true);
      }
      notifier.checkShouldBreak();
      notifier.breakCompleted();

      // After completion, next type should be 'music' (index 1)
      expect(notifier.state.nextBreakType, 'music');
    });

    test('getNextBreakType returns breathing for empty preferredTypes', () {
      final emptyNotifier = AssessmentBreakNotifier(const BreakConfig(
        preferredTypes: [],
      ));
      expect(emptyNotifier.getNextBreakType(), 'breathing');
    });

    test('adaptive breaks disabled does not trigger on consecutive wrong', () {
      final noAdaptive = AssessmentBreakNotifier(const BreakConfig(
        frequencyQuestions: 8,
        adaptiveBreaks: false,
      ));

      noAdaptive.recordAnswer(false);
      noAdaptive.recordAnswer(false);
      noAdaptive.recordAnswer(false);

      expect(noAdaptive.checkShouldBreak(), false);
    });
  });

  group('BreakConfig', () {
    test('defaults() has expected values', () {
      final config = BreakConfig.defaults();
      expect(config.frequencyQuestions, 8);
      expect(config.preferredTypes, ['breathing', 'music', 'puzzle', 'game']);
      expect(config.adaptiveBreaks, true);
    });

    test('fromJson parses correctly', () {
      final config = BreakConfig.fromJson({
        'frequencyQuestions': 5,
        'preferredTypes': ['music', 'breathing'],
        'adaptiveBreaks': false,
      });
      expect(config.frequencyQuestions, 5);
      expect(config.preferredTypes, ['music', 'breathing']);
      expect(config.adaptiveBreaks, false);
    });

    test('fromJson handles missing fields with defaults', () {
      final config = BreakConfig.fromJson({});
      expect(config.frequencyQuestions, 8);
      expect(config.adaptiveBreaks, true);
    });

    test('toJson roundtrip', () {
      final original = BreakConfig.defaults();
      final json = original.toJson();
      final restored = BreakConfig.fromJson(json);
      expect(restored.frequencyQuestions, original.frequencyQuestions);
      expect(restored.preferredTypes, original.preferredTypes);
      expect(restored.adaptiveBreaks, original.adaptiveBreaks);
    });
  });
}
