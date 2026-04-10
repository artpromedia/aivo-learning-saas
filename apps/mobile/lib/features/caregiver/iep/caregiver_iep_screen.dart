import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _iepProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.caregiverIep);
    return (res.data as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (_) {
    return [
      {'id': 'g1', 'title': 'Reading comprehension at grade level', 'progressPct': 65, 'targetDate': '2025-06-01', 'description': 'Demonstrate understanding of grade-level texts'},
      {'id': 'g2', 'title': 'Math problem solving', 'progressPct': 45, 'targetDate': '2025-06-01', 'description': 'Solve multi-step word problems independently'},
      {'id': 'g3', 'title': 'Self-regulation strategies', 'progressPct': 80, 'targetDate': '2025-05-15', 'description': 'Use calming strategies with minimal prompting'},
    ];
  }
});

class CaregiverIepScreen extends ConsumerWidget {
  const CaregiverIepScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goals = ref.watch(_iepProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('IEP Goals'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: goals.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(message: err.toString(), onRetry: () => ref.invalidate(_iepProvider)),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(children: [
                Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.flag, color: Colors.white)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('IEP Goals', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                  Text('${data.length} active goals', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                ])),
              ]),
            ),
            const SizedBox(height: 20),
            ...data.map((goal) {
              final progress = (goal['progressPct'] as num?)?.toInt() ?? 0;
              Color pColor;
              if (progress >= 75) pColor = AivoColors.secondary;
              else if (progress >= 50) pColor = const Color(0xFFF59E0B);
              else pColor = AivoColors.error;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AivoCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(child: Text(goal['title'] as String? ?? '', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600))),
                    Text('$progress%', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: pColor)),
                  ]),
                  if (goal['description'] != null) ...[const SizedBox(height: 6), Text(goal['description'] as String, style: theme.textTheme.bodySmall)],
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(value: progress / 100, minHeight: 8, backgroundColor: theme.colorScheme.surfaceContainerHighest, valueColor: AlwaysStoppedAnimation(pColor)),
                  ),
                  if (goal['targetDate'] != null) ...[
                    const SizedBox(height: 8),
                    Row(children: [
                      Icon(Icons.calendar_today, size: 12, color: theme.colorScheme.outline),
                      const SizedBox(width: 4),
                      Text('Target: ${goal['targetDate']}', style: theme.textTheme.bodySmall?.copyWith(fontSize: 11)),
                    ]),
                  ],
                ])),
              );
            }),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
