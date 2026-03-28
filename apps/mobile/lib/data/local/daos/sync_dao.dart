import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/connectivity/sync_types.dart';
import 'package:aivo_mobile/data/local/database.dart';

/// Drift-backed implementation of [SyncDao] that persists sync queue actions
/// to the SQLite [SyncQueueItems] table.
///
/// This replaces the in-memory fallback so that queued actions survive app
/// restarts and are visible to background isolates.
class DriftSyncDao implements SyncDao {
  final AivoDatabase _db;

  DriftSyncDao(this._db);

  @override
  Future<void> insertAction(SyncAction action) async {
    await _db.into(_db.syncQueueItems).insert(
      SyncQueueItemsCompanion.insert(
        actionId: action.id,
        endpoint: action.endpoint,
        method: action.method,
        payload: action.payload,
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  @override
  Future<List<SyncAction>> unsyncedActions() async {
    final rows = await (_db.select(_db.syncQueueItems)
          ..where((t) => t.synced.equals(false))
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .get();
    return rows
        .map((row) => SyncAction(
              id: row.actionId,
              endpoint: row.endpoint,
              method: row.method,
              payload: row.payload,
              createdAt: row.createdAt,
              synced: row.synced,
            ))
        .toList();
  }

  @override
  Future<void> markSynced(String id) async {
    await (_db.update(_db.syncQueueItems)
          ..where((t) => t.actionId.equals(id)))
        .write(SyncQueueItemsCompanion(
      synced: const Value(true),
      syncedAt: Value(DateTime.now()),
      errorMessage: const Value(null),
    ));
  }

  @override
  Future<int> pendingCount() async {
    final countExpr = _db.syncQueueItems.id.count();
    final query = _db.selectOnly(_db.syncQueueItems)
      ..addColumns([countExpr])
      ..where(_db.syncQueueItems.synced.equals(false));
    final result = await query.getSingle();
    return result.read(countExpr) ?? 0;
  }

  @override
  Future<void> cleanupSyncedActions({
    Duration olderThan = const Duration(days: 7),
  }) async {
    final threshold = DateTime.now().subtract(olderThan);
    await (_db.delete(_db.syncQueueItems)
          ..where((t) => t.synced.equals(true))
          ..where((t) => t.syncedAt.isSmallerThanValue(threshold)))
        .go();
  }
}

/// Companion class for building insert/update maps for [SyncQueueItems].
class SyncQueueItemsCompanion extends UpdateCompanion<SyncQueueItemData> {
  final Value<int> id;
  final Value<String> actionId;
  final Value<String> endpoint;
  final Value<String> method;
  final Value<String> payload;
  final Value<String?> headers;
  final Value<bool> synced;
  final Value<int> retryCount;
  final Value<String?> errorMessage;
  final Value<DateTime> createdAt;
  final Value<DateTime?> syncedAt;

  const SyncQueueItemsCompanion({
    this.id = const Value.absent(),
    this.actionId = const Value.absent(),
    this.endpoint = const Value.absent(),
    this.method = const Value.absent(),
    this.payload = const Value.absent(),
    this.headers = const Value.absent(),
    this.synced = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.syncedAt = const Value.absent(),
  });

  SyncQueueItemsCompanion.insert({
    this.id = const Value.absent(),
    required String actionId,
    required String endpoint,
    required String method,
    required String payload,
    this.headers = const Value.absent(),
    this.synced = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.syncedAt = const Value.absent(),
  })  : actionId = Value(actionId),
        endpoint = Value(endpoint),
        method = Value(method),
        payload = Value(payload);

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) map['id'] = Variable<int>(id.value);
    if (actionId.present) {
      map['action_id'] = Variable<String>(actionId.value);
    }
    if (endpoint.present) {
      map['endpoint'] = Variable<String>(endpoint.value);
    }
    if (method.present) map['method'] = Variable<String>(method.value);
    if (payload.present) map['payload'] = Variable<String>(payload.value);
    if (headers.present) map['headers'] = Variable<String>(headers.value);
    if (synced.present) map['synced'] = Variable<bool>(synced.value);
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (errorMessage.present) {
      map['error_message'] = Variable<String>(errorMessage.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (syncedAt.present) {
      map['synced_at'] = Variable<DateTime>(syncedAt.value);
    }
    return map;
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final syncDaoProvider = Provider<SyncDao>((ref) {
  final db = ref.watch(databaseProvider);
  return DriftSyncDao(db);
});
