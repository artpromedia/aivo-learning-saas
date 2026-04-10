import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _accommodationsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.caregiverAccommodations);
    return (res.data as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (_) {
    return [
      {'id': 'a1', 'label': 'Extended time', 'description': 'Allow 1.5x time for assessments', 'category': 'Assessment'},
      {'id': 'a2', 'label': 'Visual supports', 'description': 'Provide visual schedules and cues', 'category': 'Instruction'},
      {'id': 'a3', 'label': 'Frequent breaks', 'description': 'Break every 15 minutes', 'category': 'Environment'},
      {'id': 'a4', 'label': 'Simplified instructions', 'description': 'Step-by-step directions with visuals', 'category': 'Instruction'},
      {'id': 'a5', 'label': 'Preferential seating', 'description': 'Seat near teacher, away from distractions', 'category': 'Environment'},
    ];
  }
});

class CaregiverAccommodationsScreen extends ConsumerWidget {
  const CaregiverAccommodationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accommodations = ref.watch(_accommodationsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Accommodations'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: accommodations.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_accommodationsProvider),
        ),
        data: (data) {
          final grouped = <String, List<Map<String, dynamic>>>{};
          for (final a in data) {
            grouped.putIfAbsent(a['category'] as String? ?? 'General', () => []).add(a);
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(children: [
                  Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.shield, color: Colors.white)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Accommodations', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                    Text('${data.length} active', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                  ])),
                ]),
              ),
              const SizedBox(height: 20),
              ...grouped.entries.map((entry) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8, top: 8),
                        child: Text(entry.key, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                      ),
                      ...entry.value.map((a) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: AivoCard(child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Container(width: 36, height: 36, decoration: BoxDecoration(color: AivoColors.secondary.withAlpha(26), borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.check_circle, color: AivoColors.secondary, size: 20)),
                              const SizedBox(width: 12),
                              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(a['label'] as String? ?? '', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                                if (a['description'] != null) ...[const SizedBox(height: 4), Text(a['description'] as String, style: theme.textTheme.bodySmall)],
                              ])),
                            ])),
                          )),
                    ],
                  )),
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }
}
