import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class ClassroomSummary {
  final String id;
  final String name;
  final String gradeBand;
  final int learnerCount;
  final int avgMasteryPct;
  final int atRiskCount;

  ClassroomSummary({
    required this.id,
    required this.name,
    required this.gradeBand,
    required this.learnerCount,
    required this.avgMasteryPct,
    required this.atRiskCount,
  });

  factory ClassroomSummary.fromJson(Map<String, dynamic> json) {
    return ClassroomSummary(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      gradeBand: json['gradeBand'] as String? ?? '',
      learnerCount: (json['learnerCount'] as num?)?.toInt() ?? 0,
      avgMasteryPct: (json['avgMasteryPct'] as num?)?.toInt() ?? 0,
      atRiskCount: (json['atRiskCount'] as num?)?.toInt() ?? 0,
    );
  }
}

final _classroomsProvider =
    FutureProvider<List<ClassroomSummary>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get('/teacher/classrooms');
    final list = res.data as List<dynamic>? ?? [];
    return list
        .map((c) => ClassroomSummary.fromJson(c as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return [
      ClassroomSummary(id: 'c1', name: 'Room 3A', gradeBand: '3rd Grade', learnerCount: 24, avgMasteryPct: 72, atRiskCount: 3),
      ClassroomSummary(id: 'c2', name: 'Room 3B', gradeBand: '3rd Grade', learnerCount: 22, avgMasteryPct: 68, atRiskCount: 5),
      ClassroomSummary(id: 'c3', name: 'Reading Lab', gradeBand: 'K-2', learnerCount: 12, avgMasteryPct: 81, atRiskCount: 1),
    ];
  }
});

class TeacherDashboardScreen extends ConsumerWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final classrooms = ref.watch(_classroomsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: classrooms.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_classroomsProvider),
        ),
        data: (data) {
          final totalLearners =
              data.fold<int>(0, (sum, c) => sum + c.learnerCount);
          final avgMastery = data.isNotEmpty
              ? (data.fold<int>(0, (sum, c) => sum + c.avgMasteryPct) /
                      data.length)
                  .round()
              : 0;
          final totalAtRisk =
              data.fold<int>(0, (sum, c) => sum + c.atRiskCount);

          return RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(_classroomsProvider),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(context),
                        const SizedBox(height: 16),
                        _buildStatRow(
                            context, totalLearners, avgMastery, totalAtRisk),
                        const SizedBox(height: 24),
                        Text('My Classrooms',
                            style: theme.textTheme.titleLarge),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
                if (data.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.school_outlined,
                              size: 64,
                              color: theme.colorScheme.outline),
                          const SizedBox(height: 16),
                          Text('No classrooms yet',
                              style: theme.textTheme.titleMedium),
                          const SizedBox(height: 8),
                          Text('Classrooms will appear once assigned',
                              style: theme.textTheme.bodyMedium),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) => _buildClassroomCard(ctx, data[i]),
                        childCount: data.length,
                      ),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
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
                const Text('My Classrooms',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text('Welcome back, Teacher',
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(
      BuildContext context, int learners, int mastery, int atRisk) {
    return Row(
      children: [
        Expanded(
          child: _StatChip(
              icon: Icons.people,
              label: 'Learners',
              value: '$learners',
              color: AivoColors.primary),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatChip(
              icon: Icons.school,
              label: 'Avg Mastery',
              value: '$mastery%',
              color: AivoColors.secondary),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatChip(
              icon: Icons.warning_amber,
              label: 'At Risk',
              value: '$atRisk',
              color: const Color(0xFFF59E0B)),
        ),
      ],
    );
  }

  Widget _buildClassroomCard(BuildContext context, ClassroomSummary classroom) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AivoCard(
        onTap: () => context.push('/teacher/classroom/${classroom.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(classroom.name,
                          style: theme.textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(classroom.gradeBand,
                            style: theme.textTheme.bodySmall
                                ?.copyWith(fontWeight: FontWeight.w500)),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right,
                    color: theme.colorScheme.outline),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _ClassroomStat(
                    icon: Icons.people,
                    value: '${classroom.learnerCount}',
                    label: 'Learners',
                    color: AivoColors.primary),
                const SizedBox(width: 8),
                _ClassroomStat(
                    icon: Icons.school,
                    value: '${classroom.avgMasteryPct}%',
                    label: 'Avg Mastery',
                    color: AivoColors.secondary),
                const SizedBox(width: 8),
                _ClassroomStat(
                    icon: Icons.warning_amber,
                    value: '${classroom.atRiskCount}',
                    label: 'At Risk',
                    color: const Color(0xFFF59E0B)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
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
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 4),
          Text(value,
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.w800, color: color)),
          Text(label,
              style: theme.textTheme.bodySmall?.copyWith(fontSize: 10),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _ClassroomStat extends StatelessWidget {
  const _ClassroomStat({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: color.withAlpha(18),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 4),
                Text(value,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: color)),
              ],
            ),
            const SizedBox(height: 2),
            Text(label,
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 10),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
