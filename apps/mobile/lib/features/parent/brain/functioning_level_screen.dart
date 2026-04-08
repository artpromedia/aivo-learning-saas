import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _functioningLevelProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, String>((ref, learnerId) async {
  final repo = ref.watch(familyRepositoryProvider);
  return repo.getFunctioningLevel(learnerId);
});

// ---------------------------------------------------------------------------
// Level metadata helpers
// ---------------------------------------------------------------------------

const _kLevelMeta = {
  'STANDARD': (
    label: 'Standard',
    description:
        'Grade-level curriculum with standard expectations and regular progress checks.',
    adaptations: [
      '📚 Full grade-level text complexity',
      '🎯 Up to 4 answer choices',
      '🔊 Audio cues available',
    ],
  ),
  'SUPPORTED': (
    label: 'Supported',
    description:
        'Moderate support with visual scaffolding, simplified language, and frequent check-ins.',
    adaptations: [
      '🔤 Simplified language',
      '🖼️ Visual scaffolding enabled',
      '🎯 Up to 4 answer choices',
      '🔊 Audio cues available',
    ],
  ),
  'LOW_VERBAL': (
    label: 'Low Verbal',
    description:
        'Picture-based support with minimal text, audio narration, and up to 3 choices.',
    adaptations: [
      '🖼️ Picture-based support',
      '🎯 Up to 3 answer choices',
      '🔊 Audio narration required',
    ],
  ),
  'NON_VERBAL': (
    label: 'Non-Verbal',
    description:
        'Symbol-based communication with partner support and up to 2 choices.',
    adaptations: [
      '🔣 Symbol-based communication',
      '🤝 Communication partner support',
      '🎯 Up to 2 answer choices',
      '🔊 Audio narration required',
    ],
  ),
  'PRE_SYMBOLIC': (
    label: 'Pre-Symbolic',
    description:
        'Sensory-only engagement; adult-directed sessions with full partner assistance.',
    adaptations: [
      '🌟 Sensory-only content',
      '👩‍🏫 Adult-directed sessions',
      '🔊 Audio narration required',
    ],
  ),
};

Color _levelColor(String level) {
  switch (level.toUpperCase()) {
    case 'STANDARD':
      return AivoColors.secondary;
    case 'SUPPORTED':
      return AivoColors.primary;
    case 'LOW_VERBAL':
      return AivoColors.accent;
    case 'NON_VERBAL':
      return AivoColors.error;
    case 'PRE_SYMBOLIC':
      return AivoColors.errorDark;
    default:
      return AivoColors.primary;
  }
}

String _triggerLabel(String trigger) {
  const labels = {
    'assessment': 'Initial assessment',
    'parent_questionnaire': 'Parent questionnaire',
    'manual': 'Manual update',
    'baseline_assessment': 'Baseline assessment',
    'ai_recommendation': 'AI recommendation',
  };
  return labels[trigger] ?? trigger;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class FunctioningLevelScreen extends ConsumerWidget {
  const FunctioningLevelScreen({super.key, required this.learnerId});

  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(_functioningLevelProvider(learnerId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Functioning Level'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/parent/brain/$learnerId'),
          tooltip: 'Back to Brain Profile',
        ),
      ),
      body: asyncData.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(_functioningLevelProvider(learnerId)),
        ),
        data: (data) {
          final current = (data['current'] as String? ?? 'STANDARD').toUpperCase();
          final history = (data['history'] as List<dynamic>?) ?? [];
          final meta = _kLevelMeta[current];
          final color = _levelColor(current);

          return RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(_functioningLevelProvider(learnerId)),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── Current level card ──────────────────────────────────────
                _SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _SectionTitle(
                        icon: Icons.psychology,
                        title: 'Current Level',
                        color: color,
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          meta?.label ?? current,
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: color,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        meta?.description ??
                            'Functioning level: $current',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // ── Active adaptations card ─────────────────────────────────
                if (meta != null) ...[
                  _SectionCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _SectionTitle(
                          icon: Icons.tune,
                          title: 'Active Adaptations',
                          color: color,
                        ),
                        const SizedBox(height: 12),
                        ...meta.adaptations.map(
                          (a) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Text(
                              a,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // ── History card ─────────────────────────────────────────────
                if (history.isNotEmpty)
                  _SectionCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _SectionTitle(
                          icon: Icons.history,
                          title: 'Level History',
                          color: color,
                        ),
                        const SizedBox(height: 12),
                        ...history.asMap().entries.map((entry) {
                          final i = entry.key;
                          final item =
                              entry.value as Map<String, dynamic>;
                          final entryLevel =
                              (item['level'] as String? ?? '').toUpperCase();
                          final entryColor = _levelColor(entryLevel);
                          final entryLabel =
                              _kLevelMeta[entryLevel]?.label ?? entryLevel;
                          final setAt = item['setAt'] as String? ?? '';
                          final trigger =
                              _triggerLabel(item['trigger'] as String? ?? '');

                          DateTime? date;
                          try {
                            date = DateTime.parse(setAt);
                          } catch (_) {}

                          return IntrinsicHeight(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Timeline column
                                SizedBox(
                                  width: 24,
                                  child: Column(
                                    children: [
                                      Container(
                                        width: 12,
                                        height: 12,
                                        decoration: BoxDecoration(
                                          color: entryColor,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      if (i < history.length - 1)
                                        Expanded(
                                          child: Container(
                                            width: 2,
                                            color: Colors.grey.shade300,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Padding(
                                    padding: EdgeInsets.only(
                                        bottom:
                                            i < history.length - 1 ? 12 : 0),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color:
                                                entryColor.withOpacity(0.12),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            entryLabel,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: entryColor,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${date != null ? DateFormat.yMMMd().format(date) : setAt} · $trigger',
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall
                                              ?.copyWith(
                                                color: Colors.grey.shade600,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared sub-widgets
// ---------------------------------------------------------------------------

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: child,
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.icon,
    required this.title,
    required this.color,
  });

  final IconData icon;
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _ErrorRetry extends StatelessWidget {
  const _ErrorRetry({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AivoColors.error),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
