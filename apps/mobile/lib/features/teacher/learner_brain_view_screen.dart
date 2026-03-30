import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _brainProvider = FutureProvider.autoDispose
    .family<BrainContext, String>((ref, learnerId) {
  return ref.watch(familyRepositoryProvider).getBrainProfile(learnerId);
});

final _insightsProvider = FutureProvider.autoDispose
    .family<List<TeacherInsight>, String>((ref, learnerId) {
  return ref
      .watch(familyRepositoryProvider)
      .getInsightsForLearner(learnerId);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class LearnerBrainViewScreen extends ConsumerWidget {
  const LearnerBrainViewScreen({super.key, required this.learnerId});

  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBrain = ref.watch(_brainProvider(learnerId));
    final asyncInsights = ref.watch(_insightsProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Learner Brain Profile'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/teacher/insight?learnerId=$learnerId'),
        icon: const Icon(Icons.edit_note),
        label: const Text('Submit Insight'),
        tooltip: 'Submit a teacher observation',
      ),
      body: asyncBrain.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: 'Failed to load brain profile',
          onRetry: () =>
              ref.invalidate(_brainProvider(learnerId)),
        ),
        data: (brain) {
          final insights = asyncInsights.value ?? [];

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(_brainProvider(learnerId));
              ref.invalidate(_insightsProvider(learnerId));
            },
            child: ListView(
              padding: const EdgeInsets.fromLTRB(0, 16, 0, 80),
              children: [
                // Functioning level
                _ReadOnlySection(
                  icon: Icons.psychology,
                  title: 'Functioning Level',
                  child: Text(
                    _functioningLevelDisplay(brain.functioningLevel),
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

                // Diagnoses
                if (brain.diagnoses.isNotEmpty)
                  _ReadOnlySection(
                    icon: Icons.medical_information,
                    title: 'Diagnoses',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: brain.diagnoses
                          .map((d) => Chip(label: Text(d)))
                          .toList(),
                    ),
                  ),

                // Accommodations
                _ReadOnlySection(
                  icon: Icons.accessibility_new,
                  title: 'Accommodations',
                  child: brain.accommodations.isEmpty
                      ? Text('None active',
                          style: theme.textTheme.bodyMedium,)
                      : Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          children:
                              brain.accommodations.entries.where((e) {
                            return e.value == true ||
                                (e.value is String &&
                                    e.value.toString().toLowerCase() !=
                                        'false');
                          }).map((e) {
                            return Chip(
                              label: Text(_formatKey(e.key)),
                              avatar: Icon(_accommodationIcon(e.key),
                                  size: 16,),
                            );
                          }).toList(),
                        ),
                ),

                // Mastery
                _ReadOnlySection(
                  icon: Icons.bar_chart,
                  title: 'Mastery Overview',
                  child: _MasteryList(
                      masteryLevels: brain.masteryLevels,),
                ),

                // IEP goals
                if (brain.iepGoals.isNotEmpty)
                  _ReadOnlySection(
                    icon: Icons.flag,
                    title: 'IEP Goals',
                    child: Column(
                      children: brain.iepGoals
                          .map((g) => _GoalProgress(goal: g))
                          .toList(),
                    ),
                  ),

                // Strengths & challenges
                _ReadOnlySection(
                  icon: Icons.thumbs_up_down,
                  title: 'Strengths & Challenges',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (brain.strengths.isNotEmpty) ...[
                        Text('Strengths',
                            style: theme.textTheme.labelLarge,),
                        const SizedBox(height: 4),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: brain.strengths.map((s) {
                            return Chip(
                              label: Text(s),
                              backgroundColor: AivoColors.secondary
                                  .withValues(alpha: 0.12),
                              labelStyle:
                                  theme.textTheme.bodySmall?.copyWith(
                                color: AivoColors.secondaryDark,
                              ),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 12),
                      ],
                      if (brain.challenges.isNotEmpty) ...[
                        Text('Challenges',
                            style: theme.textTheme.labelLarge,),
                        const SizedBox(height: 4),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: brain.challenges.map((c) {
                            return Chip(
                              label: Text(c),
                              backgroundColor: AivoColors.accent
                                  .withValues(alpha: 0.15),
                              labelStyle:
                                  theme.textTheme.bodySmall?.copyWith(
                                color: AivoColors.accentDark,
                              ),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),

                // Recent team insights
                _ReadOnlySection(
                  icon: Icons.lightbulb,
                  title: 'Recent Team Insights',
                  child: insights.isEmpty
                      ? Text('No insights yet',
                          style: theme.textTheme.bodyMedium,)
                      : Column(
                          children: insights.take(5).map((insight) {
                            return _InsightTile(insight: insight);
                          }).toList(),
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _functioningLevelDisplay(String level) {
    switch (level.toLowerCase()) {
      case 'level_1':
      case 'significant_support':
        return 'Level 1 - Significant Support';
      case 'level_2':
      case 'moderate_support':
        return 'Level 2 - Moderate Support';
      case 'level_3':
      case 'standard':
        return 'Level 3 - Standard';
      case 'level_4':
      case 'advanced':
        return 'Level 4 - Advanced';
      default:
        return level;
    }
  }

  String _formatKey(String key) {
    return key
        .replaceAll('_', ' ')
        .split(' ')
        .map((w) =>
            w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : w,)
        .join(' ');
  }

  IconData _accommodationIcon(String key) {
    switch (key.toLowerCase()) {
      case 'text_to_speech':
      case 'audio':
        return Icons.volume_up;
      case 'extended_time':
        return Icons.timer;
      case 'large_text':
        return Icons.text_fields;
      case 'dyslexic_font':
        return Icons.font_download;
      case 'visual_supports':
        return Icons.image;
      case 'switch_access':
        return Icons.touch_app;
      default:
        return Icons.accessibility_new;
    }
  }
}

// ---------------------------------------------------------------------------
// Read-only section wrapper
// ---------------------------------------------------------------------------

class _ReadOnlySection extends StatelessWidget {
  const _ReadOnlySection({
    required this.icon,
    required this.title,
    required this.child,
  });

  final IconData icon;
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, color: theme.colorScheme.primary, size: 20),
                  const SizedBox(width: 8),
                  Semantics(
                    header: true,
                    child: Text(title,
                        style: theme.textTheme.titleMedium,),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              child,
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Mastery list
// ---------------------------------------------------------------------------

class _MasteryList extends StatelessWidget {
  const _MasteryList({required this.masteryLevels});
  final Map<String, MasteryLevel> masteryLevels;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (masteryLevels.isEmpty) {
      return Text('No mastery data',
          style: theme.textTheme.bodyMedium,);
    }

    // Group by subject
    final bySubject = <String, List<MasteryLevel>>{};
    for (final entry in masteryLevels.values) {
      bySubject.putIfAbsent(entry.subject, () => []).add(entry);
    }

    return Column(
      children: bySubject.entries.map((entry) {
        final avg = entry.value
                .map((m) => m.level)
                .fold<double>(0, (a, b) => a + b) /
            entry.value.length;
        final pct = (avg * 100).clamp(0.0, 100.0);

        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  entry.key[0].toUpperCase() + entry.key.substring(1),
                  style: theme.textTheme.bodyLarge,
                ),
              ),
              Expanded(
                flex: 3,
                child: Semantics(
                  label: '${entry.key} mastery ${pct.toInt()}%',
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: avg.clamp(0.0, 1.0),
                      minHeight: 8,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 42,
                child: Text(
                  '${pct.toInt()}%',
                  style: theme.textTheme.labelLarge,
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// Goal progress
// ---------------------------------------------------------------------------

class _GoalProgress extends StatelessWidget {
  const _GoalProgress({required this.goal});
  final IepGoal goal;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color statusColor;
    switch (goal.status.toLowerCase()) {
      case 'on_track':
      case 'on-track':
        statusColor = AivoColors.secondary;
      case 'at_risk':
      case 'at-risk':
        statusColor = AivoColors.accent;
      case 'behind':
        statusColor = AivoColors.error;
      default:
        statusColor = theme.colorScheme.outline;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${goal.area}: ${goal.goalText}',
                  style: theme.textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Semantics(
            label:
                'Goal progress ${(goal.progress * 100).toInt()} percent',
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: goal.progress.clamp(0.0, 1.0),
                minHeight: 6,
                color: statusColor,
                backgroundColor: statusColor.withValues(alpha: 0.15),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Insight tile
// ---------------------------------------------------------------------------

class _InsightTile extends StatelessWidget {
  const _InsightTile({required this.insight});
  final TeacherInsight insight;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final formatter = DateFormat.yMMMd();

    Color severityColor;
    switch (insight.severity.toLowerCase()) {
      case 'high':
        severityColor = AivoColors.error;
      case 'medium':
        severityColor = AivoColors.accent;
      default:
        severityColor = AivoColors.secondary;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 6, vertical: 2,),
                  decoration: BoxDecoration(
                    color: severityColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    insight.insightType,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: severityColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 10,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  formatter.format(insight.createdAt.toLocal()),
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(insight.description,
                style: theme.textTheme.bodyMedium,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,),
            const SizedBox(height: 4),
            Text(
              'By ${insight.authorName}',
              style: theme.textTheme.bodySmall?.copyWith(
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error retry
// ---------------------------------------------------------------------------

class _ErrorRetry extends StatelessWidget {
  const _ErrorRetry({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline,
                size: 48, color: theme.colorScheme.error,),
            const SizedBox(height: 16),
            Text(message, style: theme.textTheme.bodyLarge),
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
