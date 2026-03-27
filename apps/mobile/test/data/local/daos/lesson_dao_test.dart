import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart';

import 'package:aivo_mobile/data/local/daos/lesson_dao.dart';

// ---------------------------------------------------------------------------
// Note: The LessonDao depends on AivoDatabase. These tests verify the
// companion class construction and column mapping.
// ---------------------------------------------------------------------------

void main() {
  group('CachedLessonsCompanion', () {
    test('default constructor creates empty companion', () {
      const companion = CachedLessonsCompanion();

      expect(companion.lessonId.present, isFalse);
      expect(companion.learnerId.present, isFalse);
      expect(companion.subject.present, isFalse);
      expect(companion.contentJson.present, isFalse);
      expect(companion.isCompleted.present, isFalse);
    });

    test('insert constructor sets required fields', () {
      final companion = CachedLessonsCompanion.insert(
        lessonId: 'lesson-1',
        learnerId: 'learner-1',
        subject: 'math',
        topic: 'addition',
        skillId: 'skill-add',
        contentJson: '{"content":"data"}',
        expiresAt: DateTime(2025, 6, 1),
      );

      expect(companion.lessonId.present, isTrue);
      expect(companion.lessonId.value, 'lesson-1');
      expect(companion.learnerId.present, isTrue);
      expect(companion.subject.present, isTrue);
      expect(companion.subject.value, 'math');
      expect(companion.expiresAt.present, isTrue);
    });

    test('toColumns includes only present fields', () {
      const companion = CachedLessonsCompanion(
        isCompleted: Value(true),
      );

      final columns = companion.toColumns(true);
      expect(columns.length, 1);
      expect(columns.containsKey('is_completed'), isTrue);
    });

    test('toColumns generates all required insert fields', () {
      final companion = CachedLessonsCompanion.insert(
        lessonId: 'L1',
        learnerId: 'LR1',
        subject: 'reading',
        topic: 'phonics',
        skillId: 'sk-1',
        contentJson: '{}',
        expiresAt: DateTime(2025, 12, 31),
      );

      final columns = companion.toColumns(true);
      expect(columns.containsKey('lesson_id'), isTrue);
      expect(columns.containsKey('learner_id'), isTrue);
      expect(columns.containsKey('subject'), isTrue);
      expect(columns.containsKey('topic'), isTrue);
      expect(columns.containsKey('skill_id'), isTrue);
      expect(columns.containsKey('content_json'), isTrue);
      expect(columns.containsKey('expires_at'), isTrue);
    });

    test('optional orderIndex and interactionsJson', () {
      const companion = CachedLessonsCompanion(
        orderIndex: Value(3),
        interactionsJson: Value('[{"id":"i1"}]'),
      );

      final columns = companion.toColumns(true);
      expect(columns.containsKey('order_index'), isTrue);
      expect(columns.containsKey('interactions_json'), isTrue);
    });
  });

  group('LessonDao provider', () {
    test('lessonDaoProvider is defined', () {
      expect(lessonDaoProvider, isNotNull);
    });
  });
}
