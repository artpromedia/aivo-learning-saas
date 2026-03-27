import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const String _androidChannelId = 'aivo_learning';
const String _androidChannelName = 'AIVO Learning';
const String _androidChannelDescription = 'Notifications from AIVO Learning';

// ---------------------------------------------------------------------------
// Deep-link route mapping
// ---------------------------------------------------------------------------

/// Maps a notification `type` field to a GoRouter path.
String _routeForType(String type, Map<String, dynamic> data) {
  switch (type) {
    case 'recommendation':
      return '/parent/recommendations';
    case 'badge':
      return '/learner/badges';
    case 'lesson':
      final sessionId = data['sessionId'] ?? data['id'] ?? '';
      return '/learner/session/$sessionId';
    case 'streak':
      return '/learner/home';
    case 'homework':
      return '/learner/homework';
    case 'message':
      return '/parent/messages';
    case 'report':
      return '/parent/reports';
    case 'achievement':
      return '/learner/achievements';
    default:
      return '/';
  }
}

// ---------------------------------------------------------------------------
// NotificationHandler
// ---------------------------------------------------------------------------

/// Displays local notifications on behalf of FCM foreground messages and
/// handles tap-based deep linking via GoRouter.
class NotificationHandler {
  NotificationHandler({
    required this.router,
  });

  final GoRouter router;

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;

  // -----------------------------------------------------------------------
  // Initialisation
  // -----------------------------------------------------------------------

  /// Initialises `flutter_local_notifications` with platform-specific settings
  /// and creates the Android notification channel.
  ///
  /// Safe to call multiple times; subsequent calls are no-ops.
  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false, // handled by PushService via FCM
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationResponse,
    );

    // Create the Android notification channel.
    final androidPlugin =
        _localNotifications.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(
        const AndroidNotificationChannel(
          _androidChannelId,
          _androidChannelName,
          description: _androidChannelDescription,
          importance: Importance.high,
        ),
      );
    }
  }

  // -----------------------------------------------------------------------
  // Show a local notification (foreground)
  // -----------------------------------------------------------------------

  /// Displays a local notification built from a [RemoteMessage].
  ///
  /// The message's `data` map is JSON-encoded and passed as the notification
  /// payload so it can be read back when the user taps the notification.
  Future<void> showNotification(RemoteMessage message) async {
    await initialize();

    final notification = message.notification;
    final title = notification?.title ?? 'AIVO Learning';
    final body = notification?.body ?? '';

    final payload = jsonEncode(message.data);

    const androidDetails = AndroidNotificationDetails(
      _androidChannelId,
      _androidChannelName,
      channelDescription: _androidChannelDescription,
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Use a hash of the message ID as the int notification ID.
    final notificationId = message.messageId.hashCode;

    await _localNotifications.show(notificationId, title, body, details,
        payload: payload);
  }

  // -----------------------------------------------------------------------
  // Handle taps
  // -----------------------------------------------------------------------

  /// Called when the user taps a local notification.
  void _onNotificationResponse(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null && payload.isNotEmpty) {
      handleNotificationTap(payload);
    }
  }

  /// Parses the [payload] JSON, determines the target route, and navigates
  /// using GoRouter.
  void handleNotificationTap(String payload) {
    try {
      Map<String, dynamic> data;

      // The payload may be JSON or a URI-encoded key=value string.
      if (payload.startsWith('{')) {
        data = jsonDecode(payload) as Map<String, dynamic>;
      } else {
        // Decode the URI-encoded key=value pairs produced by PushService.
        final decoded = Uri.decodeFull(payload);
        data = Uri.splitQueryString(decoded);
      }

      final type = (data['type'] as String?) ?? '';
      final route = _routeForType(type, data);

      debugPrint('[NotificationHandler] Navigating to $route');
      router.go(route);
    } catch (e) {
      debugPrint('[NotificationHandler] Failed to parse notification payload: $e');
    }
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

/// Provider for the app-wide [GoRouter] instance.
///
/// This must be overridden at the [ProviderScope] level with the real router.
final goRouterProvider = Provider<GoRouter>((ref) {
  throw UnimplementedError(
    'goRouterProvider must be overridden with the app GoRouter instance.',
  );
});

final notificationHandlerProvider = Provider<NotificationHandler>((ref) {
  final router = ref.watch(goRouterProvider);
  return NotificationHandler(router: router);
});
