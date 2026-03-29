import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/data/models/learning_session.dart';

void main() {
  final testDate = DateTime.parse('2025-03-01T10:00:00.000Z');

  Map<String, dynamic> sessionJson() => {
        'id': 'session-1',
        'learnerId': 'learner-1',
        'lessonId': 'lesson-1',
        'subject': 'math',
        'topic': 'addition',
        'skillId': 'skill-add',
        'status': 'active',
        'content': {'instruction': 'Add these numbers'},
        'interactions': [
          {
            'id': 'int-1',
            'type': 'multiple_choice',
            'prompt': 'What is 2+3?',
            'data': {'options': ['4', '5', '6']},
            'studentResponse': '5',
            'isCorrect': true,
            'feedback': 'Correct!',
            'respondedAt': '2025-03-01T10:05:00.000Z',
          }
        ],
        'score': 0.95,
        'timeSpentSeconds': 300,
        'startedAt': '2025-03-01T10:00:00.000Z',
        'completedAt': '2025-03-01T10:05:00.000Z',
      };

  group('LearningSession', () {
    test('fromJson creates correct object', () {
      final session = LearningSession.fromJson(sessionJson());

      expect(session.id, 'session-1');
      expect(session.learnerId, 'learner-1');
      expect(session.subject, 'math');
      expect(session.topic, 'addition');
      expect(session.status, 'active');
      expect(session.score, 0.95);
      expect(session.timeSpentSeconds, 300);
      expect(session.interactions.length, 1);
      expect(session.startedAt, testDate);
      expect(session.completedAt, isNotNull);
    });

    test('toJson produces valid map', () {
      final session = LearningSession.fromJson(sessionJson());
      final json = session.toJson();

      expect(json['id'], 'session-1');
      expect(json['score'], 0.95);
      expect((json['interactions'] as List).length, 1);
      expect(json['startedAt'], testDate.toIso8601String());
    });

    test('fromJson -> toJson round-trip preserves data', () {
      final original = LearningSession.fromJson(sessionJson());
      final json = original.toJson();
      final restored = LearningSession.fromJson(json);

      expect(restored.id, original.id);
      expect(restored.score, original.score);
      expect(restored.interactions.length, original.interactions.length);
    });

    test('copyWith overrides specified fields', () {
      final session = LearningSession.fromJson(sessionJson());
      final updated = session.copyWith(
        status: 'completed',
        score: () => 1.0,
      );

      expect(updated.status, 'completed');
      expect(updated.score, 1.0);
      expect(updated.id, session.id);
    });

    test('fromJson handles null optional fields', () {
      final json = sessionJson();
      json.remove('score');
      json.remove('completedAt');

      final session = LearningSession.fromJson(json);
      expect(session.score, isNull);
      expect(session.completedAt, isNull);
    });

    test('equality', () {
      final s1 = LearningSession.fromJson(sessionJson());
      final s2 = LearningSession.fromJson(sessionJson());

      expect(s1, equals(s2));
    });
  });

  group('Interaction', () {
    test('fromJson creates correct object', () {
      final interaction = Interaction.fromJson({
        'id': 'int-1',
        'type': 'fill_blank',
        'prompt': 'Fill in: 5 + __ = 8',
        'data': {'answer': '3'},
        'studentResponse': '3',
        'isCorrect': true,
        'feedback': 'Well done!',
      });

      expect(interaction.id, 'int-1');
      expect(interaction.type, 'fill_blank');
      expect(interaction.isCorrect, isTrue);
      expect(interaction.respondedAt, isNull);
    });

    test('toJson round-trip', () {
      const interaction = Interaction(
        id: 'int-2',
        type: 'drag_drop',
        prompt: 'Order these',
        data: {'items': []},
      );

      final json = interaction.toJson();
      final restored = Interaction.fromJson(json);

      expect(restored.id, interaction.id);
      expect(restored.type, interaction.type);
    });

    test('copyWith with nullable fields', () {
      const interaction = Interaction(
        id: 'int-1',
        type: 'mc',
        prompt: 'Q?',
        data: {},
      );

      final updated = interaction.copyWith(
        studentResponse: () => 'A',
        isCorrect: () => true,
        feedback: () => 'Good!',
      );

      expect(updated.studentResponse, 'A');
      expect(updated.isCorrect, isTrue);
      expect(updated.feedback, 'Good!');
    });
  });

  group('LearningPath', () {
    test('fromJson creates correct object', () {
      final path = LearningPath.fromJson({
        'items': [
          {
            'lessonId': 'L1',
            'subject': 'math',
            'topic': 'addition',
            'skillId': 'sk-1',
            'type': 'lesson',
            'isCompleted': false,
            'orderIndex': 0,
          },
        ],
        'completedToday': 2,
        'targetToday': 5,
      });

      expect(path.items.length, 1);
      expect(path.completedToday, 2);
      expect(path.targetToday, 5);
    });

    test('equality', () {
      const path1 = LearningPath(items: [], completedToday: 0, targetToday: 3);
      const path2 = LearningPath(items: [], completedToday: 0, targetToday: 3);

      expect(path1, equals(path2));
    });
  });

  group('LearningPathItem', () {
    test('fromJson creates correct object', () {
      final item = LearningPathItem.fromJson({
        'lessonId': 'L1',
        'subject': 'reading',
        'topic': 'phonics',
        'skillId': 'sk-ph',
        'type': 'review',
        'currentMastery': 0.7,
        'isCompleted': true,
        'orderIndex': 2,
      });

      expect(item.lessonId, 'L1');
      expect(item.currentMastery, 0.7);
      expect(item.isCompleted, isTrue);
      expect(item.orderIndex, 2);
    });

    test('fromJson handles null currentMastery', () {
      final item = LearningPathItem.fromJson({
        'lessonId': 'L2',
        'subject': 'math',
        'topic': 'sub',
        'skillId': 'sk-2',
        'type': 'new',
        'isCompleted': false,
        'orderIndex': 0,
      });

      expect(item.currentMastery, isNull);
    });

    test('equality', () {
      const i1 = LearningPathItem(
        lessonId: 'L1',
        subject: 's',
        topic: 't',
        skillId: 'sk',
        type: 'lesson',
        isCompleted: false,
        orderIndex: 0,
      );
      const i2 = LearningPathItem(
        lessonId: 'L1',
        subject: 's',
        topic: 't',
        skillId: 'sk',
        type: 'lesson',
        isCompleted: false,
        orderIndex: 0,
      );

      expect(i1, equals(i2));
    });
  });
}
