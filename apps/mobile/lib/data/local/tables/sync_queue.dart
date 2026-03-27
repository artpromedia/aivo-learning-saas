import 'package:drift/drift.dart';

/// FIFO queue of mutations made while the device was offline.
///
/// A background worker drains the queue oldest-first whenever connectivity is
/// restored, replaying each request against the remote API.
class SyncQueueItems extends Table {
  IntColumn get id => integer().autoIncrement()();

  /// Client-generated UUID for idempotency.
  TextColumn get actionId => text().unique()();

  /// Remote API path (e.g. `/api/v1/mastery`).
  TextColumn get endpoint => text()();

  /// HTTP verb: POST, PUT, or DELETE.
  TextColumn get method => text()();

  /// JSON-serialised request body.
  TextColumn get payload => text()();

  /// Optional JSON-serialised header map.
  TextColumn get headers => text().nullable()();

  BoolColumn get synced =>
      boolean().withDefault(const Constant(false))();

  IntColumn get retryCount =>
      integer().withDefault(const Constant(0))();

  TextColumn get errorMessage => text().nullable()();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  DateTimeColumn get syncedAt => dateTime().nullable()();
}
