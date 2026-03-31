/// Environment configuration for the AIVO Learning mobile app.
///
/// All values are read from compile-time `--dart-define` flags with
/// sensible defaults that point at a local dev backend.
class Env {
  Env._();

  /// Base URL of the REST API (no trailing slash).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001/api',
  );

  /// WebSocket URL for real-time events.
  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'ws://localhost:3000/ws',
  );

  /// Sentry DSN for error tracking. Empty string disables Sentry.
  static const String sentryDsn = String.fromEnvironment(
    'SENTRY_DSN',
    defaultValue: '',
  );

  /// Firebase configuration passed as a JSON string via dart-define.
  /// In production builds this is populated by CI; in dev it remains empty
  /// and Firebase initialisation is skipped gracefully.
  static const String firebaseOptions = String.fromEnvironment(
    'FIREBASE_OPTIONS',
    defaultValue: '',
  );

  /// Whether the app is compiled in release / profile mode.
  static const bool isProduction = bool.fromEnvironment(
    'dart.vm.product',
    defaultValue: false,
  );

  /// Toggle for verbose network logging in debug builds.
  static const bool enableNetworkLogging = bool.fromEnvironment(
    'ENABLE_NETWORK_LOGGING',
    defaultValue: true,
  );

  /// Duration (in seconds) before an API call is considered timed-out.
  static const int apiTimeoutSeconds = int.fromEnvironment(
    'API_TIMEOUT_SECONDS',
    defaultValue: 30,
  );
}
