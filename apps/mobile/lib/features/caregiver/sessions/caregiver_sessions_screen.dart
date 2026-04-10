import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _sessionsProvider =
    FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.caregiverSessions);
    return (res.data as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
  } catch (_) {
    return [
      {'id': '1', 'subject': 'Mathematics', 'date': '2025-01-15', 'durationMin': 25, 'score': 88},
      {'id': '2', 'subject': 'Science', 'date': '2025-01-15', 'durationMin': 18, 'score': 72},
      {'id': '3', 'subject': 'Language Arts', 'date': '2025-01-14', 'durationMin': 30, 'score': 91},
      {'id': '4', 'subject': 'Mathematics', 'date': '2025-01-13', 'durationMin': 22, 'score': 65},
    ];
  }
});

class CaregiverSessionsScreen extends ConsumerWidget {
  const CaregiverSessionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessions = ref.watch(_sessionsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sessions'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: sessions.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(message: err.toString(), onRetry: () => ref.invalidate(_sessionsProvider)),
        data: (data) {
          if (data.isEmpty) {
            return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.history, size: 64, color: theme.colorScheme.outline),
              const SizedBox(height: 16),
              Text('No sessions yet', style: theme.textTheme.titleMedium),
            ]));
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(children: [
                  Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.schedule, color: Colors.white)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Sessions', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                    Text('${data.length} recent sessions', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                  ])),
                ]),
              ),
              const SizedBox(height: 16),
              ...data.map((s) {
                final score = (s['score'] as num?)?.toInt();
                final dur = (s['durationMin'] as num?)?.toInt() ?? 0;
                Color scoreColor = AivoColors.secondary;
                if (score != null) {
                  if (score < 60) scoreColor = AivoColors.error;
                  else if (score < 80) scoreColor = const Color(0xFFF59E0B);
                }
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: AivoCard(child: Row(children: [
                    Container(width: 40, height: 40, decoration: BoxDecoration(color: AivoColors.primary.withAlpha(26), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.menu_book, color: AivoColors.primary, size: 20)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(s['subject'] as String? ?? '', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                      Text('${s['date']} · $dur min', style: theme.textTheme.bodySmall),
                    ])),
                    if (score != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: scoreColor.withAlpha(26), borderRadius: BorderRadius.circular(20)),
                        child: Text('$score%', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: scoreColor)),
                      ),
                  ])),
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
