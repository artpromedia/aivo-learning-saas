import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:workmanager/workmanager.dart';

import 'package:aivo_mobile/config/env.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_types.dart';
import 'package:aivo_mobile/data/local/daos/sync_dao.dart';
import 'package:aivo_mobile/data/local/database.dart';

export 'package:aivo_mobile/core/connectivity/sync_types.dart';

// ---------------------------------------------------------------------------
// SyncManager
// ---------------------------------------------------------------------------

/// Unique name for the Workmanager periodic background-sync task.
const String kBackgroundSyncTaskName = 'com.aivo.learning.backgroundSync';

/// Manages an offline action queue.
///
/// * When the device comes back online the manager automatically drains all
///   queued actions and replays them against the API.
/// * Callers use [queueAction] to persist an action while offline.
/// * [registerBackgroundSync] schedules a Workmanager periodic task that drains
///   the queue every 15 minutes even when the app is backgrounded.
class SyncManager {
  SyncManager({
    required this.dao,
    required this.dio,
  });

  final SyncDao dao;
  final Dio dio;

  /// Replays every un-synced action in FIFO order.
  ///
  /// Each action is POSTed/PUT to `Env.apiBaseUrl + action.endpoint`.  On
  /// success the action is marked as synced; on failure it remains in the queue
  /// for the next drain attempt.
  Future<void> drainSyncQueue() async {
    final actions = await dao.unsyncedActions();
    for (final action in actions) {
      try {
        final url = '${Env.apiBaseUrl}${action.endpoint}';
        final data = jsonDecode(action.payload);

        switch (action.method.toUpperCase()) {
          case 'POST':
            await dio.post(url, data: data);
            break;
          case 'PUT':
            await dio.put(url, data: data);
            break;
          default:
            debugPrint('[SyncManager] Unknown method ${action.method} for action ${action.id}');
            continue;
        }

        await dao.markSynced(action.id);
      } catch (e) {
        // Leave the action un-synced so the next drain picks it up.
        debugPrint('[SyncManager] Failed to sync action ${action.id}: $e');
      }
    }
  }

  /// Enqueues an action for later replay.
  Future<void> queueAction(SyncAction action) async {
    await dao.insertAction(action);
  }

  // -------------------------------------------------------------------------
  // Background sync registration
  // -------------------------------------------------------------------------

  /// Registers a Workmanager periodic task that drains the queue every 15
  /// minutes when the app is in the background.
  static Future<void> registerBackgroundSync() async {
    await Workmanager().initialize(
      backgroundSyncCallback,
      isInDebugMode: !Env.isProduction,
    );

    await Workmanager().registerPeriodicTask(
      kBackgroundSyncTaskName,
      kBackgroundSyncTaskName,
      frequency: const Duration(minutes: 15),
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
      existingWorkPolicy: ExistingWorkPolicy.keep,
    );
  }
}

/// Top-level callback invoked by Workmanager in a background isolate.
///
/// Opens a real Drift database so queued actions persisted by the main isolate
/// are visible and can be drained.  The DB file path matches the one used by
/// [AivoDatabase.create] so both isolates share the same SQLite file.
@pragma('vm:entry-point')
void backgroundSyncCallback() {
  Workmanager().executeTask((taskName, inputData) async {
    if (taskName == kBackgroundSyncTaskName) {
      final db = AivoDatabase.create();
      try {
        final dao = DriftSyncDao(db);
        final dio = Dio(BaseOptions(
          baseUrl: Env.apiBaseUrl,
          connectTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
          receiveTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
        ),);
        final manager = SyncManager(dao: dao, dio: dio);
        await manager.drainSyncQueue();
        await dao.cleanupSyncedActions();
      } finally {
        await db.close();
      }
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final syncManagerProvider = Provider<SyncManager>((ref) {
  final dao = ref.watch(syncDaoProvider);
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
    receiveTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
  ),);

  final manager = SyncManager(dao: dao, dio: dio);

  // Reactively drain the queue whenever connectivity transitions to online.
  ref.listen<AsyncValue<ConnectivityStatus>>(
    connectivityProvider,
    (previous, next) {
      final wasOffline = previous?.valueOrNull != ConnectivityStatus.online;
      final isNowOnline = next.valueOrNull == ConnectivityStatus.online;
      if (wasOffline && isNowOnline) {
        manager.drainSyncQueue();
      }
    },
  );

  return manager;
});
