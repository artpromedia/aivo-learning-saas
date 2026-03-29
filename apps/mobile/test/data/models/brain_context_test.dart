import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/data/models/brain_context.dart';

void main() {
  final testDate = DateTime.parse('2025-03-01T12:00:00.000Z');

  Map<String, dynamic> brainContextJson() => {
        'brainStateId': 'bs-1',
        'learnerId': 'learner-1',
        'functioningLevel': 'standard',
        'diagnoses': ['ADHD', 'Dyslexia'],
        'accommodations': {'extraTime': true, 'readAloud': true},
        'masteryLevels': {
          'math-add': {
            'skillId': 'math-add',
            'subject': 'math',
            'level': 0.75,
            'totalAttempts': 20,
            'correctAttempts': 15,
          },
        },
        'learningPreferences': {'modality': 'visual'},
        'strengths': ['pattern recognition'],
        'challenges': ['reading comprehension'],
        'currentGoals': [
          {
            'id': 'goal-1',
            'title': 'Master addition',
            'description': 'Add single digits',
            'progress': 0.6,
            'status': 'active',
          },
        ],
        'iepGoals': [
          {
            'id': 'iep-1',
            'goalText': 'Read at grade level',
            'area': 'reading',
            'progress': 0.3,
            'status': 'in_progress',
            'targetDate': '2025-06-01T00:00:00.000Z',
          },
        ],
        'overallProgress': 0.45,
        'lastUpdated': '2025-03-01T12:00:00.000Z',
      };

  group('BrainContext', () {
    test('fromJson creates correct object', () {
      final ctx = BrainContext.fromJson(brainContextJson());

      expect(ctx.brainStateId, 'bs-1');
      expect(ctx.learnerId, 'learner-1');
      expect(ctx.functioningLevel, 'standard');
      expect(ctx.diagnoses, ['ADHD', 'Dyslexia']);
      expect(ctx.masteryLevels.length, 1);
      expect(ctx.strengths, ['pattern recognition']);
      expect(ctx.challenges, ['reading comprehension']);
      expect(ctx.currentGoals.length, 1);
      expect(ctx.iepGoals.length, 1);
      expect(ctx.overallProgress, 0.45);
      expect(ctx.lastUpdated, testDate);
    });

    test('toJson produces valid map', () {
      final ctx = BrainContext.fromJson(brainContextJson());
      final json = ctx.toJson();

      expect(json['brainStateId'], 'bs-1');
      expect(json['diagnoses'], ['ADHD', 'Dyslexia']);
      expect(json['overallProgress'], 0.45);
      expect((json['currentGoals'] as List).length, 1);
    });

    test('fromJson -> toJson -> fromJson round-trip', () {
      final original = BrainContext.fromJson(brainContextJson());
      final json = original.toJson();
      final restored = BrainContext.fromJson(json);

      expect(restored.brainStateId, original.brainStateId);
      expect(restored.learnerId, original.learnerId);
      expect(restored.overallProgress, original.overallProgress);
    });

    test('copyWith overrides specified fields', () {
      final ctx = BrainContext.fromJson(brainContextJson());
      final updated = ctx.copyWith(
        functioningLevel: 'lowVerbal',
        overallProgress: 0.9,
      );

      expect(updated.functioningLevel, 'lowVerbal');
      expect(updated.overallProgress, 0.9);
      expect(updated.brainStateId, ctx.brainStateId);
    });

    test('equality', () {
      final ctx1 = BrainContext.fromJson(brainContextJson());
      final ctx2 = BrainContext.fromJson(brainContextJson());

      expect(ctx1, equals(ctx2));
    });
  });

  group('MasteryLevel', () {
    test('fromJson creates correct object', () {
      final ml = MasteryLevel.fromJson({
        'skillId': 'sk-1',
        'subject': 'math',
        'level': 0.85,
        'totalAttempts': 30,
        'correctAttempts': 25,
        'lastPracticedAt': '2025-02-28T10:00:00.000Z',
      });

      expect(ml.skillId, 'sk-1');
      expect(ml.subject, 'math');
      expect(ml.level, 0.85);
      expect(ml.totalAttempts, 30);
      expect(ml.correctAttempts, 25);
      expect(ml.lastPracticedAt, isNotNull);
      expect(ml.nextReviewAt, isNull);
    });

    test('toJson round-trip', () {
      const ml = MasteryLevel(
        skillId: 'sk-2',
        subject: 'reading',
        level: 0.5,
        totalAttempts: 10,
        correctAttempts: 5,
      );

      final json = ml.toJson();
      final restored = MasteryLevel.fromJson(json);

      expect(restored, equals(ml));
    });

    test('copyWith updates fields', () {
      const ml = MasteryLevel(
        skillId: 'sk-1',
        subject: 'math',
        level: 0.5,
        totalAttempts: 10,
        correctAttempts: 5,
      );

      final updated = ml.copyWith(level: 0.8, totalAttempts: 15);
      expect(updated.level, 0.8);
      expect(updated.totalAttempts, 15);
      expect(updated.skillId, 'sk-1');
    });
  });

  group('BrainGoal', () {
    test('fromJson and toJson', () {
      const json = {
        'id': 'g-1',
        'title': 'Learn fractions',
        'description': 'Understand basic fractions',
        'progress': 0.4,
        'status': 'active',
      };

      final goal = BrainGoal.fromJson(json);
      expect(goal.id, 'g-1');
      expect(goal.progress, 0.4);

      final output = goal.toJson();
      expect(output['title'], 'Learn fractions');
    });

    test('equality', () {
      const g1 = BrainGoal(
          id: 'g-1', title: 'T', description: 'D', progress: 0.5, status: 'active',);
      const g2 = BrainGoal(
          id: 'g-1', title: 'T', description: 'D', progress: 0.5, status: 'active',);

      expect(g1, equals(g2));
    });
  });

  group('IepGoal', () {
    test('fromJson with targetDate', () {
      final goal = IepGoal.fromJson({
        'id': 'iep-1',
        'goalText': 'Read fluently',
        'area': 'reading',
        'progress': 0.2,
        'status': 'in_progress',
        'targetDate': '2025-06-01T00:00:00.000Z',
      });

      expect(goal.id, 'iep-1');
      expect(goal.goalText, 'Read fluently');
      expect(goal.targetDate, isNotNull);
    });

    test('fromJson without targetDate', () {
      final goal = IepGoal.fromJson({
        'id': 'iep-2',
        'goalText': 'Write sentences',
        'area': 'writing',
        'progress': 0.0,
        'status': 'pending',
      });

      expect(goal.targetDate, isNull);
    });

    test('copyWith can nullify targetDate', () {
      const goal = IepGoal(
        id: 'iep-1',
        goalText: 'Goal',
        area: 'math',
        progress: 0.5,
        status: 'active',
        targetDate: null,
      );

      final withDate = goal.copyWith(
        targetDate: () => DateTime(2025, 12, 31),
      );
      expect(withDate.targetDate, isNotNull);

      final withoutDate = withDate.copyWith(targetDate: () => null);
      expect(withoutDate.targetDate, isNull);
    });

    test('equality', () {
      const g1 = IepGoal(
          id: 'i1', goalText: 'G', area: 'a', progress: 0.5, status: 's',);
      const g2 = IepGoal(
          id: 'i1', goalText: 'G', area: 'a', progress: 0.5, status: 's',);

      expect(g1, equals(g2));
      expect(g1.hashCode, equals(g2.hashCode));
    });
  });
}
