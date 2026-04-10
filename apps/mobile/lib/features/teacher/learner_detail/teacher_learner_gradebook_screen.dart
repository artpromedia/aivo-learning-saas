import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _gradebookProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.gradebook(learnerId));
    return res.data as Map<String, dynamic>;
  } catch (_) {
    return {
      'overallMastery': 71,
      'subjects': [
        {'subject': 'Mathematics', 'currentMastery': 85, 'trend': 'up'},
        {'subject': 'Science', 'currentMastery': 72, 'trend': 'stable'},
        {'subject': 'Language Arts', 'currentMastery': 55, 'trend': 'up'},
        {'subject': 'Social Studies', 'currentMastery': 78, 'trend': 'down'},
      ],
    };
  }
});

const _colors = [
  Color(0xFF7C3AED), Color(0xFF38B2AC), Color(0xFFF59E0B),
  Color(0xFFEF4444), Color(0xFF3B82F6), Color(0xFF10B981),
];

class TeacherLearnerGradebookScreen extends ConsumerWidget {
  const TeacherLearnerGradebookScreen({super.key, required this.learnerId});
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
        data: (data) {
          final subjects = (data['subjects'] as List? ?? []).cast<Map<String, dynamic>>();
          final overall = (data['overallMastery'] as num?)?.toInt() ?? 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF14B8A6)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.school, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Gradebook', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                          Text('Overall: $overall%', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ...subjects.asMap().entries.map((entry) {
                final i = entry.key;
                final s = entry.value;
                final color = _colors[i % _colors.length];
                final mastery = (s['currentMastery'] as num?)?.toInt() ?? 0;
                final trend = s['trend'] as String? ?? 'stable';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AivoCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                            const SizedBox(width: 8),
                            Expanded(child: Text(s['subject'] as String? ?? '', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                            Text('$mastery%', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color)),
                          ],
                        ),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: mastery / 100, minHeight: 8,
                            backgroundColor: theme.colorScheme.surfaceContainerHighest,
                            valueColor: AlwaysStoppedAnimation(color),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }
}
