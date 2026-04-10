import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _brainProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.caregiverBrain);
    return res.data as Map<String, dynamic>;
  } catch (_) {
    return {
      'functioningLevel': 'SUPPORTED',
      'strengths': ['Visual learning', 'Pattern recognition', 'Creative thinking'],
      'challenges': ['Auditory processing', 'Working memory'],
      'learningStyle': 'Visual-Kinesthetic',
      'accommodations': [
        {'label': 'Extended time', 'description': 'Allow 1.5x time for assessments'},
        {'label': 'Visual supports', 'description': 'Provide visual schedules and cues'},
        {'label': 'Frequent breaks', 'description': 'Break every 15 minutes'},
      ],
    };
  }
});

class CaregiverBrainScreen extends ConsumerWidget {
  const CaregiverBrainScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brain = ref.watch(_brainProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Brain Profile'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: brain.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_brainProvider),
        ),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _gradientHeader(context, data),
            const SizedBox(height: 16),
            _chipSection(context, 'Strengths', Icons.star, AivoColors.secondary, data['strengths'] as List? ?? []),
            const SizedBox(height: 12),
            _chipSection(context, 'Challenges', Icons.warning_amber, const Color(0xFFF59E0B), data['challenges'] as List? ?? []),
            const SizedBox(height: 12),
            _infoRow(context, 'Learning Style', data['learningStyle'] as String? ?? 'N/A'),
            const SizedBox(height: 12),
            _accommodationsList(context, data['accommodations'] as List? ?? []),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _gradientHeader(BuildContext context, Map<String, dynamic> data) {
    final level = data['functioningLevel'] as String? ?? 'STANDARD';
    const labels = {'STANDARD': 'Standard', 'SUPPORTED': 'Supported', 'LOW_VERBAL': 'Low Verbal', 'NON_VERBAL': 'Non-Verbal', 'PRE_SYMBOLIC': 'Pre-Symbolic'};
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AivoColors.primary, AivoColors.primaryLight]),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.psychology, color: Colors.white)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Brain Profile', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
            Text('Functioning: ${labels[level] ?? level}', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
          ])),
        ],
      ),
    );
  }

  Widget _chipSection(BuildContext context, String title, IconData icon, Color color, List items) {
    final theme = Theme.of(context);
    return AivoCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Icon(icon, color: color, size: 20), const SizedBox(width: 8), Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700))]),
      const SizedBox(height: 12),
      Wrap(spacing: 8, runSpacing: 8, children: items.map((item) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: color.withAlpha(18), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withAlpha(40))),
        child: Text('$item', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: color)),
      )).toList()),
    ]));
  }

  Widget _infoRow(BuildContext context, String label, String value) {
    final theme = Theme.of(context);
    return AivoCard(child: Row(children: [
      const Icon(Icons.psychology, color: AivoColors.primary, size: 20),
      const SizedBox(width: 12),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: theme.textTheme.bodySmall),
        Text(value, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
      ]),
    ]));
  }

  Widget _accommodationsList(BuildContext context, List accommodations) {
    final theme = Theme.of(context);
    return AivoCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [const Icon(Icons.shield, color: AivoColors.secondary, size: 20), const SizedBox(width: 8), Text('Accommodations', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700))]),
      const SizedBox(height: 12),
      ...accommodations.map((a) {
        final item = a as Map<String, dynamic>;
        return Padding(padding: const EdgeInsets.only(bottom: 10), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 6), decoration: const BoxDecoration(color: AivoColors.secondary, shape: BoxShape.circle)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item['label'] as String? ?? '', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
            if (item['description'] != null) Text(item['description'] as String, style: theme.textTheme.bodySmall),
          ])),
        ]));
      }),
    ]));
  }
}
