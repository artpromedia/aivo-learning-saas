import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class ClassroomLearner {
  final String id;
  final String name;
  final String functioningLevel;
  final int masteryPct;
  final bool atRisk;

  ClassroomLearner({
    required this.id,
    required this.name,
    required this.functioningLevel,
    required this.masteryPct,
    required this.atRisk,
  });

  factory ClassroomLearner.fromJson(Map<String, dynamic> json) {
    return ClassroomLearner(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      functioningLevel: json['functioningLevel'] as String? ?? 'STANDARD',
      masteryPct: (json['masteryPct'] as num?)?.toInt() ?? 0,
      atRisk: json['atRisk'] as bool? ?? false,
    );
  }
}

class ClassroomDetail {
  final String id;
  final String name;
  final String gradeBand;
  final List<ClassroomLearner> learners;

  ClassroomDetail({
    required this.id,
    required this.name,
    required this.gradeBand,
    required this.learners,
  });

  factory ClassroomDetail.fromJson(Map<String, dynamic> json) {
    return ClassroomDetail(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      gradeBand: json['gradeBand'] as String? ?? '',
      learners: (json['learners'] as List<dynamic>?)
              ?.map((l) => ClassroomLearner.fromJson(l as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

final _classroomDetailProvider =
    FutureProvider.family<ClassroomDetail, String>((ref, classroomId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get('/teacher/classrooms/$classroomId');
    return ClassroomDetail.fromJson(res.data as Map<String, dynamic>);
  } catch (_) {
    return ClassroomDetail(
      id: classroomId,
      name: 'Room 3A',
      gradeBand: '3rd Grade',
      learners: [
        ClassroomLearner(id: 'l1', name: 'Jamie Rivera', functioningLevel: 'SUPPORTED', masteryPct: 72, atRisk: false),
        ClassroomLearner(id: 'l2', name: 'Alex Johnson', functioningLevel: 'STANDARD', masteryPct: 85, atRisk: false),
        ClassroomLearner(id: 'l3', name: 'Sam Chen', functioningLevel: 'LOW_VERBAL', masteryPct: 45, atRisk: true),
        ClassroomLearner(id: 'l4', name: 'Taylor Kim', functioningLevel: 'SUPPORTED', masteryPct: 58, atRisk: true),
        ClassroomLearner(id: 'l5', name: 'Jordan Lee', functioningLevel: 'STANDARD', masteryPct: 91, atRisk: false),
      ],
    );
  }
});

class ClassroomDetailScreen extends ConsumerWidget {
  const ClassroomDetailScreen({super.key, required this.classroomId});
  final String classroomId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detail = ref.watch(_classroomDetailProvider(classroomId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Classroom'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bar_chart),
            onPressed: () => context.push('/teacher/reports'),
            tooltip: 'Reports',
          ),
        ],
      ),
      body: detail.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () =>
              ref.invalidate(_classroomDetailProvider(classroomId)),
        ),
        data: (data) {
          final sorted = List.of(data.learners)
            ..sort((a, b) {
              if (a.atRisk && !b.atRisk) return -1;
              if (!a.atRisk && b.atRisk) return 1;
              return a.name.compareTo(b.name);
            });

          return RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(_classroomDetailProvider(classroomId)),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildHeader(context, data),
                const SizedBox(height: 16),
                Text('Learners (${sorted.length})',
                    style: theme.textTheme.titleLarge),
                const SizedBox(height: 12),
                ...sorted.map((l) => _buildLearnerTile(context, l)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ClassroomDetail data) {
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
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(51),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.class_, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(data.name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text(data.gradeBand,
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
                Text('${data.learners.length} learners',
                    style: TextStyle(
                        color: Colors.white.withAlpha(153), fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLearnerTile(BuildContext context, ClassroomLearner learner) {
    final theme = Theme.of(context);

    Color masteryColor;
    if (learner.masteryPct >= 80) {
      masteryColor = AivoColors.secondary;
    } else if (learner.masteryPct >= 60) {
      masteryColor = const Color(0xFFF59E0B);
    } else {
      masteryColor = AivoColors.error;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AivoCard(
        onTap: () => context.push('/teacher/learner/${learner.id}'),
        child: Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: AivoColors.primary.withAlpha(26),
              child: Text(
                learner.name.isNotEmpty ? learner.name[0].toUpperCase() : '?',
                style: const TextStyle(
                    color: AivoColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 18),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(learner.name,
                            style: theme.textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w600),
                            overflow: TextOverflow.ellipsis),
                      ),
                      if (learner.atRisk) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withAlpha(26),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.warning_amber,
                                  size: 10,
                                  color: Color(0xFFF59E0B)),
                              SizedBox(width: 3),
                              Text('At Risk',
                                  style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFFF59E0B))),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(_levelLabel(learner.functioningLevel),
                      style: theme.textTheme.bodySmall),
                ],
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: masteryColor.withAlpha(26),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('${learner.masteryPct}%',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: masteryColor)),
            ),
            const SizedBox(width: 4),
            Icon(Icons.chevron_right,
                size: 20, color: theme.colorScheme.outline),
          ],
        ),
      ),
    );
  }

  String _levelLabel(String level) {
    const labels = {
      'STANDARD': 'Standard',
      'SUPPORTED': 'Supported',
      'LOW_VERBAL': 'Low Verbal',
      'NON_VERBAL': 'Non-Verbal',
      'PRE_SYMBOLIC': 'Pre-Symbolic',
    };
    return labels[level] ?? level;
  }
}
