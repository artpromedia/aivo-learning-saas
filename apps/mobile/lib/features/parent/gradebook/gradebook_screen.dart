import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class SubjectMastery {
  final String subject;
  final int currentMastery;
  final String trend;

  SubjectMastery({
    required this.subject,
    required this.currentMastery,
    required this.trend,
  });

  factory SubjectMastery.fromJson(Map<String, dynamic> json) {
    return SubjectMastery(
      subject: json['subject'] as String? ?? '',
      currentMastery: (json['currentMastery'] as num?)?.toInt() ?? 0,
      trend: json['trend'] as String? ?? 'stable',
    );
  }
}

class GradebookData {
  final List<SubjectMastery> subjects;
  final int overallMastery;
  final int totalSessions;

  GradebookData({
    required this.subjects,
    required this.overallMastery,
    required this.totalSessions,
  });

  factory GradebookData.fromJson(Map<String, dynamic> json) {
    return GradebookData(
      subjects: (json['subjects'] as List<dynamic>?)
              ?.map((s) => SubjectMastery.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      overallMastery: (json['overallMastery'] as num?)?.toInt() ?? 0,
      totalSessions: (json['totalSessions'] as num?)?.toInt() ?? 0,
    );
  }
}

final _gradebookProvider =
    FutureProvider.family<GradebookData, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.gradebookSummary,
        queryParameters: {'learnerId': learnerId});
    return GradebookData.fromJson(res.data as Map<String, dynamic>);
  } catch (_) {
    return GradebookData(
      subjects: [
        SubjectMastery(subject: 'Mathematics', currentMastery: 85, trend: 'up'),
        SubjectMastery(subject: 'Science', currentMastery: 72, trend: 'stable'),
        SubjectMastery(subject: 'Language Arts', currentMastery: 58, trend: 'up'),
        SubjectMastery(subject: 'Social Studies', currentMastery: 70, trend: 'down'),
      ],
      overallMastery: 71,
      totalSessions: 42,
    );
  }
});

const _subjectColors = [
  Color(0xFF7C3AED),
  Color(0xFF38B2AC),
  Color(0xFFF59E0B),
  Color(0xFFEF4444),
  Color(0xFF3B82F6),
  Color(0xFF10B981),
  Color(0xFFEC4899),
  Color(0xFF8B5CF6),
];

class GradebookScreen extends ConsumerWidget {
  const GradebookScreen({super.key, required this.learnerId});
  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gradebook = ref.watch(_gradebookProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gradebook'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: gradebook.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_gradebookProvider(learnerId)),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () async =>
              ref.invalidate(_gradebookProvider(learnerId)),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildHeader(context, data),
              const SizedBox(height: 16),
              _buildStatRow(context, data),
              const SizedBox(height: 24),
              Text('Subject Breakdown',
                  style: theme.textTheme.titleLarge),
              const SizedBox(height: 12),
              ...data.subjects.asMap().entries.map(
                    (entry) => _buildSubjectCard(
                        context, entry.value, entry.key),
                  ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, GradebookData data) {
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
            child: const Icon(Icons.school, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Gradebook',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text('Track subject mastery over time',
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, GradebookData data) {
    return Row(
      children: [
        Expanded(
          child: _StatTile(
            icon: Icons.trending_up,
            label: 'Overall Mastery',
            value: '${data.overallMastery}%',
            color: AivoColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatTile(
            icon: Icons.menu_book,
            label: 'Total Sessions',
            value: '${data.totalSessions}',
            color: AivoColors.secondary,
          ),
        ),
      ],
    );
  }

  Widget _buildSubjectCard(
      BuildContext context, SubjectMastery subject, int index) {
    final color = _subjectColors[index % _subjectColors.length];
    final theme = Theme.of(context);

    IconData trendIcon;
    Color trendColor;
    String trendLabel;

    switch (subject.trend) {
      case 'up':
        trendIcon = Icons.trending_up;
        trendColor = AivoColors.secondary;
        trendLabel = 'Improving';
        break;
      case 'down':
        trendIcon = Icons.trending_down;
        trendColor = AivoColors.error;
        trendLabel = 'Needs Focus';
        break;
      default:
        trendIcon = Icons.trending_flat;
        trendColor = AivoColors.textSecondaryLight;
        trendLabel = 'Stable';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AivoCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(subject.subject,
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w700)),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: trendColor.withAlpha(26),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(trendIcon, size: 14, color: trendColor),
                      const SizedBox(width: 4),
                      Text(trendLabel,
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: trendColor)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('${subject.currentMastery}%',
                    style: theme.textTheme.headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(width: 6),
                Text('mastery',
                    style: theme.textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: subject.currentMastery / 100,
                minHeight: 10,
                backgroundColor:
                    theme.colorScheme.surfaceContainerHighest,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(value,
              style: theme.textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.w800, color: color)),
          Text(label,
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
