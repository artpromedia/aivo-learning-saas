import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

/// Repository for push notifications, in-app notification feeds, read status,
/// and notification preference management.
class NotificationRepository {
  const NotificationRepository({
    required ApiClient apiClient,
  }) : _api = apiClient;

  final ApiClient _api;

  // ---------------------------------------------------------------------------
  // Notification feed
  // ---------------------------------------------------------------------------

  /// Returns a paginated list of notifications for the user.
  Future<List<Map<String, dynamic>>> getNotifications(
    String userId, {
    int page = 1,
  }) async {
    final response = await _api.get(
      Endpoints.notifications(userId),
      queryParameters: {'page': page},
    );
    final data = response.data as Map<String, dynamic>;
    return (data['notifications'] as List<dynamic>?)
            ?.map((e) => e as Map<String, dynamic>)
            .toList() ??
        [];
  }

  // ---------------------------------------------------------------------------
  // Read status
  // ---------------------------------------------------------------------------

  /// Marks a single notification as read.
  Future<void> markAsRead(String notificationId) async {
    await _api.post(Endpoints.notificationRead(notificationId));
  }

  /// Marks all notifications for a user as read.
  Future<void> markAllAsRead(String userId) async {
    await _api.post(Endpoints.notificationsReadAll(userId));
  }

  // ---------------------------------------------------------------------------
  // Preferences
  // ---------------------------------------------------------------------------

  /// Returns the user's notification preferences.
  Future<Map<String, dynamic>> getPreferences(String userId) async {
    final response =
        await _api.get(Endpoints.notificationPreferences(userId));
    return response.data as Map<String, dynamic>;
  }

  /// Updates the user's notification preferences.
  Future<void> updatePreferences(
      String userId, Map<String, dynamic> prefs,) async {
    await _api.put(
      Endpoints.notificationPreferences(userId),
      data: prefs,
    );
  }

  // ---------------------------------------------------------------------------
  // Push registration
  // ---------------------------------------------------------------------------

  /// Registers a device for push notifications.
  Future<void> registerDevice(String token, String platform) async {
    await _api.post(
      Endpoints.pushRegister,
      data: {
        'token': token,
        'platform': platform,
      },
    );
  }

  /// Unregisters a device from push notifications.
  Future<void> unregisterDevice(String deviceId) async {
    await _api.delete(Endpoints.pushRegisterDevice(deviceId));
  }
}

/// Riverpod provider for [NotificationRepository].
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(
    apiClient: ref.watch(apiClientProvider),
  );
});
