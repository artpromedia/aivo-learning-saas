import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:drift/drift.dart' hide isNotNull, isNull;

import 'package:aivo_mobile/data/local/database.dart';
import 'package:aivo_mobile/data/local/daos/brain_dao.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockAivoDatabase extends Mock implements AivoDatabase {}

class MockBrainSnapshots extends Mock implements $BrainSnapshotsTable {}

class MockSelectStatement extends Mock
    implements SimpleSelectStatement<$BrainSnapshotsTable, BrainSnapshotData> {}

class MockInsertStatement extends Mock
    implements InsertStatement<$BrainSnapshotsTable, BrainSnapshotData> {}

class MockDeleteStatement extends Mock
    implements DeleteStatement<$BrainSnapshotsTable, BrainSnapshotData> {}

// Note: Testing DAOs that depend on Drift's internal query builder is complex
// without a real in-memory database. These tests verify the DAO layer's
// structural correctness and the companion class behavior.

void main() {
  group('BrainSnapshotsCompanion', () {
    test('default constructor creates empty companion', () {
      const companion = BrainSnapshotsCompanion();

      expect(companion.id.present, isFalse);
      expect(companion.learnerId.present, isFalse);
      expect(companion.brainStateId.present, isFalse);
    });

    test('insert constructor sets required fields', () {
      final companion = BrainSnapshotsCompanion.insert(
        learnerId: 'learner-1',
        brainStateId: 'brain-state-1',
        functioningLevel: 'standard',
        lastSyncedAt: DateTime(2025, 1, 15),
      );

      expect(companion.learnerId.present, isTrue);
      expect(companion.learnerId.value, 'learner-1');
      expect(companion.brainStateId.present, isTrue);
      expect(companion.brainStateId.value, 'brain-state-1');
      expect(companion.functioningLevel.present, isTrue);
      expect(companion.functioningLevel.value, 'standard');
      expect(companion.lastSyncedAt.present, isTrue);
    });

    test('toColumns generates correct column map', () {
      final companion = BrainSnapshotsCompanion.insert(
        learnerId: 'learner-1',
        brainStateId: 'brain-state-1',
        functioningLevel: 'supported',
        lastSyncedAt: DateTime(2025, 3, 1),
      );

      final columns = companion.toColumns(true);
      expect(columns.containsKey('learner_id'), isTrue);
      expect(columns.containsKey('brain_state_id'), isTrue);
      expect(columns.containsKey('functioning_level'), isTrue);
      expect(columns.containsKey('last_synced_at'), isTrue);
    });

    test('toColumns excludes absent fields', () {
      const companion = BrainSnapshotsCompanion();
      final columns = companion.toColumns(true);
      expect(columns, isEmpty);
    });

    test('optional fields are present only when set', () {
      const companion = BrainSnapshotsCompanion(
        diagnoses: Value('["ADHD"]'),
        accommodations: Value('{"key": "value"}'),
        overallProgress: Value(0.75),
      );

      expect(companion.diagnoses.present, isTrue);
      expect(companion.accommodations.present, isTrue);
      expect(companion.overallProgress.present, isTrue);
      expect(companion.strengths.present, isFalse);

      final columns = companion.toColumns(true);
      expect(columns.containsKey('diagnoses'), isTrue);
      expect(columns.containsKey('accommodations'), isTrue);
      expect(columns.containsKey('overall_progress'), isTrue);
      expect(columns.containsKey('strengths'), isFalse);
    });
  });

  group('BrainDao provider', () {
    test('brainDaoProvider is defined', () {
      expect(brainDaoProvider, isNotNull);
    });
  });
}
