import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/local/database.dart';

/// Data access object for the offline sync queue.
///
/// Queued items represent mutations that were made while the device was offline
/// and need to be replayed against the remote API when connectivity returns.
class SyncDao {
  final AivoDatabase _db;

  SyncDao(this._db);

  /// Returns all items that have not yet been synced, ordered oldest-first.
  Future<List<SyncQueueItemData>> getUnsyncedItems() {
    return (_db.select(_db.syncQueueItems)
          ..where((t) => t.synced.equals(false))
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .get();
  }

  /// Enqueues a new action for later synchronisation.
  Future<int> addToQueue(SyncQueueItemsCompanion companion) {
    return _db.into(_db.syncQueueItems).insert(companion);
  }

  /// Marks the queue item identified by [actionId] as successfully synced.
  Future<int> markSynced(String actionId) {
    return (_db.update(_db.syncQueueItems)
          ..where((t) => t.actionId.equals(actionId)))
        .write(SyncQueueItemsCompanion(
      synced: const Value(true),
      syncedAt: Value(DateTime.now()),
      errorMessage: const Value(null),
    ));
  }

  /// Marks the queue item as failed with a descriptive [errorMessage].
  Future<int> markFailed(String actionId, String errorMessage) {
    return (_db.update(_db.syncQueueItems)
          ..where((t) => t.actionId.equals(actionId)))
        .write(SyncQueueItemsCompanion(
      errorMessage: Value(errorMessage),
    ));
  }

  /// Increments the retry counter for the given [actionId] by one.
  Future<void> incrementRetry(String actionId) async {
    final row = await (_db.select(_db.syncQueueItems)
          ..where((t) => t.actionId.equals(actionId))
          ..limit(1))
        .getSingleOrNull();
    if (row == null) return;

    await (_db.update(_db.syncQueueItems)
          ..where((t) => t.actionId.equals(actionId)))
        .write(SyncQueueItemsCompanion(
      retryCount: Value(row.retryCount + 1),
    ));
  }

  /// Deletes synced items whose [syncedAt] timestamp is older than
  /// [olderThan].
  ///
  /// Returns the number of rows deleted.
  Future<int> deleteOldSyncedItems(DateTime olderThan) {
    return (_db.delete(_db.syncQueueItems)
          ..where((t) => t.synced.equals(true))
          ..where((t) => t.syncedAt.isSmallerThanValue(olderThan)))
        .go();
  }

  /// Returns the total number of unsynced items in the queue.
  Future<int> getQueueCount() async {
    final countExpr = _db.syncQueueItems.id.count();
    final query = _db.selectOnly(_db.syncQueueItems)
      ..addColumns([countExpr])
      ..where(_db.syncQueueItems.synced.equals(false));
    final result = await query.getSingle();
    return result.read(countExpr) ?? 0;
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
  return SyncDao(db);
});
