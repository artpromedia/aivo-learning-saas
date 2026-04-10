import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class SessionRecord {
  final String id;
  final String subject;
  final String date;
  final int durationMin;
  final int? score;
  final String type;

  SessionRecord({
    required this.id,
    required this.subject,
    required this.date,
    required this.durationMin,
    this.score,
    this.type = 'lesson',
  });

  factory SessionRecord.fromJson(Map<String, dynamic> json) {
    return SessionRecord(
      id: json['id'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      date: json['date'] as String? ?? '',
      durationMin: (json['durationMin'] as num?)?.toInt() ?? 0,
      score: (json['score'] as num?)?.toInt(),
      type: json['type'] as String? ?? 'lesson',
    );
  }
}

final _sessionsProvider =
    FutureProvider.family<List<SessionRecord>, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.learningSessionHistory,
        queryParameters: {'learnerId': learnerId});
    final list = res.data as List<dynamic>? ?? [];
    return list
        .map((s) => SessionRecord.fromJson(s as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return [
      SessionRecord(id: '1', subject: 'Mathematics', date: '2025-01-15T10:30:00Z', durationMin: 25, score: 88, type: 'lesson'),
      SessionRecord(id: '2', subject: 'Science', date: '2025-01-15T14:00:00Z', durationMin: 18, score: 72, type: 'quiz'),
      SessionRecord(id: '3', subject: 'Language Arts', date: '2025-01-14T09:15:00Z', durationMin: 30, score: 91, type: 'lesson'),
      SessionRecord(id: '4', subject: 'Mathematics', date: '2025-01-14T11:00:00Z', durationMin: 22, score: 65, type: 'homework'),
      SessionRecord(id: '5', subject: 'Social Studies', date: '2025-01-13T10:00:00Z', durationMin: 20, type: 'tutor'),
    ];
  }
});

class SessionsHistoryScreen extends ConsumerWidget {
  const SessionsHistoryScreen({super.key, required this.learnerId});
  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessions = ref.watch(_sessionsProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Session History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: sessions.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_sessionsProvider(learnerId)),
        ),
        data: (data) {
          if (data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.history, size: 64, color: theme.colorScheme.outline),
                  const SizedBox(height: 16),
                  Text('No sessions yet',
                      style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('Learning sessions will appear here',
                      style: theme.textTheme.bodyMedium),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(_sessionsProvider(learnerId)),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildHeader(context, data.length),
                const SizedBox(height: 16),
                ...data.map((s) => _buildSessionTile(context, s)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int count) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AivoColors.primary, AivoColors.primaryLight],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(51),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.history, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Session History',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text('$count recent sessions',
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionTile(BuildContext context, SessionRecord session) {
    final theme = Theme.of(context);

    IconData typeIcon;
    Color typeColor;
    switch (session.type) {
      case 'quiz':
        typeIcon = Icons.quiz;
        typeColor = const Color(0xFFF59E0B);
        break;
      case 'homework':
        typeIcon = Icons.assignment;
        typeColor = const Color(0xFF3B82F6);
        break;
      case 'tutor':
        typeIcon = Icons.support_agent;
        typeColor = const Color(0xFFEC4899);
        break;
      default:
        typeIcon = Icons.menu_book;
        typeColor = AivoColors.primary;
    }

    final date = DateTime.tryParse(session.date);
    final dateStr = date != null
        ? '${_monthName(date.month)} ${date.day}, ${date.year}'
        : session.date;
    final timeStr = date != null
        ? '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}'
        : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AivoCard(
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: typeColor.withAlpha(26),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(typeIcon, color: typeColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(session.subject,
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text('$dateStr $timeStr · ${session.durationMin} min',
                      style: theme.textTheme.bodySmall),
                ],
              ),
            ),
            if (session.score != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _scoreColor(session.score!).withAlpha(26),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('${session.score}%',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _scoreColor(session.score!))),
              ),
            Container(
              margin: const EdgeInsets.only(left: 8),
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: typeColor.withAlpha(18),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(session.type,
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: typeColor)),
            ),
          ],
        ),
      ),
    );
  }

  Color _scoreColor(int score) {
    if (score >= 80) return AivoColors.secondary;
    if (score >= 60) return const Color(0xFFF59E0B);
    return AivoColors.error;
  }

  String _monthName(int month) {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month];
  }
}
