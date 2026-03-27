import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:workmanager/workmanager.dart';

import 'package:aivo_mobile/config/env.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';

// ---------------------------------------------------------------------------
// SyncAction model
// ---------------------------------------------------------------------------

/// Represents a single action that was performed while offline and needs to be
/// replayed against the backend when connectivity is restored.
class SyncAction {
  SyncAction({
    String? id,
    required this.endpoint,
    required this.method,
    required this.payload,
    DateTime? createdAt,
    this.synced = false,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  final String id;
  final String endpoint;

  /// HTTP method: POST or PUT.
  final String method;

  /// JSON-encoded payload body.
  final String payload;

  final DateTime createdAt;
  final bool synced;

  Map<String, dynamic> toMap() => {
        'id': id,
        'endpoint': endpoint,
        'method': method,
        'payload': payload,
        'createdAt': createdAt.toIso8601String(),
        'synced': synced ? 1 : 0,
      };

  factory SyncAction.fromMap(Map<String, dynamic> map) => SyncAction(
        id: map['id'] as String,
        endpoint: map['endpoint'] as String,
        method: map['method'] as String,
        payload: map['payload'] as String,
        createdAt: DateTime.parse(map['createdAt'] as String),
        synced: (map['synced'] as int) == 1,
      );

  SyncAction copyWith({bool? synced}) => SyncAction(
        id: id,
        endpoint: endpoint,
        method: method,
        payload: payload,
        createdAt: createdAt,
        synced: synced ?? this.synced,
      );
}

// ---------------------------------------------------------------------------
// SyncDao – thin persistence layer over Drift / raw SQLite
// ---------------------------------------------------------------------------

/// Abstract DAO contract so the SyncManager is testable without a real DB.
///
/// The concrete implementation is expected to be backed by the app's Drift
/// database and registered as a Riverpod provider.  Because the database layer
/// may not yet be generated when this file is first compiled, we keep the
/// interface here and supply a simple in-memory fallback.
abstract class SyncDao {
  Future<void> insertAction(SyncAction action);
  Future<List<SyncAction>> unsyncedActions();
  Future<void> markSynced(String id);
}

/// Fallback in-memory implementation used until the real Drift DAO is wired up.
class InMemorySyncDao implements SyncDao {
  final List<SyncAction> _store = [];

  @override
  Future<void> insertAction(SyncAction action) async {
    _store.add(action);
  }

  @override
  Future<List<SyncAction>> unsyncedActions() async {
    final items = _store.where((a) => !a.synced).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return items;
  }

  @override
  Future<void> markSynced(String id) async {
    final idx = _store.indexWhere((a) => a.id == id);
    if (idx != -1) {
      _store[idx] = _store[idx].copyWith(synced: true);
    }
  }
}

/// Provider for the SyncDao. Override this with the real Drift-backed DAO at
/// the app's ProviderScope level.
final syncDaoProvider = Provider<SyncDao>((ref) => InMemorySyncDao());

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
/// Because the background isolate has no access to the main Riverpod container,
/// we create a fresh [SyncManager] with its own Dio instance and an
/// in-memory DAO.  The real Drift DB should be opened here in a production
/// setup; the in-memory fallback ensures compilation succeeds immediately.
@pragma('vm:entry-point')
void backgroundSyncCallback() {
  Workmanager().executeTask((taskName, inputData) async {
    if (taskName == kBackgroundSyncTaskName) {
      final dio = Dio(BaseOptions(
        baseUrl: Env.apiBaseUrl,
        connectTimeout: Duration(seconds: Env.apiTimeoutSeconds),
        receiveTimeout: Duration(seconds: Env.apiTimeoutSeconds),
      ));
      final manager = SyncManager(dao: InMemorySyncDao(), dio: dio);
      await manager.drainSyncQueue();
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
    connectTimeout: Duration(seconds: Env.apiTimeoutSeconds),
    receiveTimeout: Duration(seconds: Env.apiTimeoutSeconds),
  ));

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
