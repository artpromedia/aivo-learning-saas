import 'dart:async';

import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/config/env.dart';
import 'package:aivo_mobile/core/push/notification_handler.dart';

// ---------------------------------------------------------------------------
// PushService
// ---------------------------------------------------------------------------

/// Manages Firebase Cloud Messaging: token registration, permission requests,
/// and message routing to [NotificationHandler].
class PushService {
  PushService({
    required this.notificationHandler,
    required this.dio,
  });

  final NotificationHandler notificationHandler;
  final Dio dio;

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  StreamSubscription<String>? _tokenRefreshSub;

  /// Call once during app startup (after Firebase.initializeApp).
  ///
  /// 1. Requests notification permissions.
  /// 2. Retrieves the current FCM token and registers it with comms-svc.
  /// 3. Starts listening for token refreshes.
  /// 4. Wires up foreground / background / terminated message handlers.
  Future<void> initialize() async {
    // Request permissions (iOS / macOS prompt; no-op on Android 12-).
    final settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('[PushService] Notification permissions denied by user.');
      return;
    }

    // Get and register the FCM token.
    final token = await _messaging.getToken();
    if (token != null) {
      await _registerToken(token);
    }

    // Listen for future token refreshes.
    _tokenRefreshSub = _messaging.onTokenRefresh.listen(_registerToken);

    // Wire up message handlers.
    setupMessageHandlers();
  }

  /// Sends the FCM token to comms-svc so the backend can target this device.
  Future<void> _registerToken(String token) async {
    try {
      await dio.post(
        '${Env.apiBaseUrl}/comms/push/register',
        data: {'token': token},
      );
      debugPrint('[PushService] FCM token registered.');
    } catch (e) {
      debugPrint('[PushService] Failed to register FCM token: $e');
    }
  }

  /// Configures Firebase message handlers for all three app states.
  void setupMessageHandlers() {
    // Foreground messages: display a local notification.
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      notificationHandler.showNotification(message);
    });

    // Background tap: user taps notification while app was in background.
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      final payload = _extractPayload(message);
      notificationHandler.handleNotificationTap(payload);
    });

    // Terminated state: app was killed, user tapped a notification to open it.
    _messaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        final payload = _extractPayload(message);
        notificationHandler.handleNotificationTap(payload);
      }
    });
  }

  /// Extracts a JSON-encoded payload string from the [RemoteMessage] data map.
  String _extractPayload(RemoteMessage message) {
    // The data map is already Map<String, dynamic>; we JSON-encode it so that
    // it can travel through the local notifications payload channel as a String.
    return Uri.encodeFull(
      message.data.entries.map((e) => '${e.key}=${e.value}').join('&'),
    );
  }

  /// Tears down listeners. Call when the service is no longer needed.
  void dispose() {
    _tokenRefreshSub?.cancel();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final pushServiceProvider = Provider<PushService>((ref) {
  final handler = ref.watch(notificationHandlerProvider);
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
    receiveTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
  ),);

  final service = PushService(notificationHandler: handler, dio: dio);
  ref.onDispose(service.dispose);
  return service;
});
