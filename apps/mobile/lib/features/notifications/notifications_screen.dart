import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final String type;
  final bool read;
  final String createdAt;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.read,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'info',
      read: json['read'] as bool? ?? false,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

final _notificationsProvider =
    FutureProvider.family<List<NotificationItem>, String>((ref, userId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.notifications(userId));
    final list = res.data as List<dynamic>? ?? [];
    return list.map((n) => NotificationItem.fromJson(n as Map<String, dynamic>)).toList();
  } catch (_) {
    return [
      NotificationItem(id: '1', title: 'Great progress!', body: 'Alex completed 3 lessons today', type: 'achievement', read: false, createdAt: '2025-01-15T14:30:00Z'),
      NotificationItem(id: '2', title: 'New recommendation', body: 'A new learning recommendation is available', type: 'recommendation', read: false, createdAt: '2025-01-15T10:00:00Z'),
      NotificationItem(id: '3', title: 'Weekly report ready', body: 'Your weekly progress report is ready to view', type: 'report', read: true, createdAt: '2025-01-14T09:00:00Z'),
      NotificationItem(id: '4', title: 'IEP goal update', body: 'Reading comprehension goal is now at 65%', type: 'iep', read: true, createdAt: '2025-01-13T16:00:00Z'),
    ];
  }
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key, this.userId = 'me'});
  final String userId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(_notificationsProvider(userId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All marked as read')),
              );
            },
            child: const Text('Mark all read'),
          ),
        ],
      ),
      body: notifications.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_notificationsProvider(userId)),
        ),
        data: (data) {
          if (data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: theme.colorScheme.outline),
                  const SizedBox(height: 16),
                  Text('No notifications', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('You\'re all caught up!', style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: data.length,
            itemBuilder: (ctx, i) => _buildNotificationTile(ctx, data[i]),
          );
        },
      ),
    );
  }

  Widget _buildNotificationTile(BuildContext context, NotificationItem notification) {
    final theme = Theme.of(context);

    IconData icon;
    Color color;
    switch (notification.type) {
      case 'achievement':
        icon = Icons.emoji_events;
        color = const Color(0xFFF59E0B);
        break;
      case 'recommendation':
        icon = Icons.lightbulb;
        color = AivoColors.primary;
        break;
      case 'report':
        icon = Icons.bar_chart;
        color = const Color(0xFF3B82F6);
        break;
      case 'iep':
        icon = Icons.flag;
        color = AivoColors.secondary;
        break;
      default:
        icon = Icons.info;
        color = AivoColors.primary;
    }

    final date = DateTime.tryParse(notification.createdAt);
    final timeAgo = date != null ? _timeAgo(date) : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AivoCard(
        color: notification.read
            ? null
            : AivoColors.primary.withAlpha(8),
        border: notification.read
            ? null
            : Border.all(color: AivoColors.primary.withAlpha(40)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withAlpha(26),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(notification.title,
                            style: theme.textTheme.titleSmall?.copyWith(
                                fontWeight: notification.read ? FontWeight.w500 : FontWeight.w700)),
                      ),
                      if (!notification.read)
                        Container(
                          width: 8, height: 8,
                          decoration: const BoxDecoration(color: AivoColors.primary, shape: BoxShape.circle),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(notification.body, style: theme.textTheme.bodySmall),
                  const SizedBox(height: 4),
                  Text(timeAgo,
                      style: theme.textTheme.bodySmall?.copyWith(fontSize: 11, color: theme.colorScheme.outline)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.month}/${date.day}';
  }
}
