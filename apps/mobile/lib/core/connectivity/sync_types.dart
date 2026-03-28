import 'package:uuid/uuid.dart';

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

/// Abstract DAO contract so the SyncManager is testable without a real DB.
abstract class SyncDao {
  Future<void> insertAction(SyncAction action);
  Future<List<SyncAction>> unsyncedActions();
  Future<void> markSynced(String id);
  Future<int> pendingCount();
  Future<void> cleanupSyncedActions({Duration olderThan = const Duration(days: 7)});
}

/// Fallback in-memory implementation used only in tests.
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

  @override
  Future<int> pendingCount() async {
    return _store.where((a) => !a.synced).length;
  }

  @override
  Future<void> cleanupSyncedActions({Duration olderThan = const Duration(days: 7)}) async {
    final threshold = DateTime.now().subtract(olderThan);
    _store.removeWhere((a) => a.synced && a.createdAt.isBefore(threshold));
  }
}
