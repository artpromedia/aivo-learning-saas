import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart' hide isNotNull, isNull;

import 'package:aivo_mobile/data/local/daos/sync_dao.dart';

// ---------------------------------------------------------------------------
// Note: The SyncDao requires a real AivoDatabase. These tests verify
// the companion class and provider wiring. Integration tests with an
// in-memory Drift database would be needed for full query coverage.
// ---------------------------------------------------------------------------

void main() {
  group('SyncQueueItemsCompanion', () {
    test('default constructor creates empty companion', () {
      const companion = SyncQueueItemsCompanion();

      expect(companion.id.present, isFalse);
      expect(companion.actionId.present, isFalse);
      expect(companion.endpoint.present, isFalse);
      expect(companion.method.present, isFalse);
      expect(companion.payload.present, isFalse);
      expect(companion.synced.present, isFalse);
    });

    test('insert constructor sets required fields', () {
      final companion = SyncQueueItemsCompanion.insert(
        actionId: 'action-123',
        endpoint: '/api/v1/test',
        method: 'POST',
        payload: '{"key":"value"}',
      );

      expect(companion.actionId.present, isTrue);
      expect(companion.actionId.value, 'action-123');
      expect(companion.endpoint.present, isTrue);
      expect(companion.endpoint.value, '/api/v1/test');
      expect(companion.method.present, isTrue);
      expect(companion.method.value, 'POST');
      expect(companion.payload.present, isTrue);
    });

    test('toColumns generates correct column map for insert', () {
      final companion = SyncQueueItemsCompanion.insert(
        actionId: 'act-1',
        endpoint: '/test',
        method: 'PUT',
        payload: '{}',
      );

      final columns = companion.toColumns(true);
      expect(columns.containsKey('action_id'), isTrue);
      expect(columns.containsKey('endpoint'), isTrue);
      expect(columns.containsKey('method'), isTrue);
      expect(columns.containsKey('payload'), isTrue);
    });

    test('toColumns with synced and error fields', () {
      const companion = SyncQueueItemsCompanion(
        synced: Value(true),
        errorMessage: Value('Connection timeout'),
        retryCount: Value(3),
      );

      final columns = companion.toColumns(true);
      expect(columns.containsKey('synced'), isTrue);
      expect(columns.containsKey('error_message'), isTrue);
      expect(columns.containsKey('retry_count'), isTrue);
    });

    test('toColumns excludes absent fields', () {
      const companion = SyncQueueItemsCompanion();
      final columns = companion.toColumns(true);
      expect(columns, isEmpty);
    });

    test('syncedAt can be set for marking completion', () {
      final now = DateTime.now();
      final companion = SyncQueueItemsCompanion(
        synced: const Value(true),
        syncedAt: Value(now),
      );

      expect(companion.syncedAt.present, isTrue);
      expect(companion.syncedAt.value, now);
    });
  });

  group('SyncDao provider', () {
    test('syncDaoProvider is defined', () {
      expect(syncDaoProvider, isNotNull);
    });
  });
}
