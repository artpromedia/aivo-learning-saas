import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _brainProfileProvider = FutureProvider.autoDispose
    .family<BrainContext, String>((ref, learnerId) {
  return ref.watch(familyRepositoryProvider).getBrainProfile(learnerId);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class BrainProfileScreen extends ConsumerWidget {
  const BrainProfileScreen({super.key, required this.learnerId});

  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBrain = ref.watch(_brainProfileProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Brain Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Version history',
            onPressed: () => _showVersionHistory(context, ref),
          ),
        ],
      ),
      body: asyncBrain.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: 'Failed to load brain profile',
          onRetry: () =>
              ref.invalidate(_brainProfileProvider(learnerId)),
        ),
        data: (brain) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(_brainProfileProvider(learnerId));
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              // Overall progress gauge
              _OverallProgressGauge(progress: brain.overallProgress),
              const SizedBox(height: 24),

              // Functioning level
              _FunctioningLevelSection(
                  level: brain.functioningLevel,),
              const SizedBox(height: 24),

              // Diagnoses
              if (brain.diagnoses.isNotEmpty) ...[
                const _SectionHeader(title: 'Diagnoses'),
                const SizedBox(height: 8),
                _DiagnosesList(diagnoses: brain.diagnoses),
                const SizedBox(height: 24),
              ],

              // Accommodations
              const _SectionHeader(title: 'Active Accommodations'),
              const SizedBox(height: 8),
              _AccommodationsList(
                  accommodations: brain.accommodations,),
              const SizedBox(height: 24),

              // Strengths and challenges
              _StrengthsAndChallenges(
                strengths: brain.strengths,
                challenges: brain.challenges,
              ),
              const SizedBox(height: 24),

              // Mastery overview
              const _SectionHeader(title: 'Mastery Overview'),
              const SizedBox(height: 8),
              _MasteryOverview(
                  masteryLevels: brain.masteryLevels,),
              const SizedBox(height: 24),

              // IEP goals
              if (brain.iepGoals.isNotEmpty) ...[
                const _SectionHeader(title: 'IEP Goals'),
                const SizedBox(height: 8),
                ...brain.iepGoals.map(
                  (goal) => _IepGoalTile(goal: goal),
                ),
                const SizedBox(height: 24),
              ],

              // Learning preferences
              const _SectionHeader(title: 'Learning Preferences'),
              const SizedBox(height: 8),
              _LearningPreferences(
                  preferences: brain.learningPreferences,),
              const SizedBox(height: 24),

              // Export button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: OutlinedButton.icon(
                  onPressed: () => _exportBrainData(context, ref),
                  icon: const Icon(Icons.download),
                  label: const Text('Export Brain Data'),
                ),
              ),
              const SizedBox(height: 8),

              // Last updated
              Center(
                child: Text(
                  'Last updated: ${DateFormat.yMMMd().add_jm().format(brain.lastUpdated.toLocal())}',
                  style: theme.textTheme.bodySmall,
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _exportBrainData(
      BuildContext context, WidgetRef ref,) async {
    try {
      await ref
          .read(familyRepositoryProvider)
          .exportBrainData(learnerId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Brain data export initiated. Check your email.'),),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    }
  }

  Future<void> _showVersionHistory(
      BuildContext context, WidgetRef ref,) async {
    try {
      final versions = await ref
          .read(familyRepositoryProvider)
          .getBrainVersions(learnerId);

      if (!context.mounted) return;

      showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (ctx) {
          final theme = Theme.of(ctx);
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outline,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Semantics(
                  header: true,
                  child: Text('Version History',
                      style: theme.textTheme.titleLarge,),
                ),
                const SizedBox(height: 16),
                if (versions.isEmpty)
                  const Text('No version history available')
                else
                  ...versions.take(10).map((v) {
                    final date = v['createdAt'] != null
                        ? DateFormat.yMMMd()
                            .format(DateTime.parse(v['createdAt'] as String))
                        : 'Unknown date';
                    final note =
                        v['note'] as String? ?? 'Brain profile update';
                    return ListTile(
                      leading: const Icon(Icons.history),
                      title: Text(note),
                      subtitle: Text(date),
                      dense: true,
                    );
                  }),
                const SizedBox(height: 16),
              ],
            ),
          );
        },
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load versions: $e')),
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Overall progress radial gauge
// ---------------------------------------------------------------------------

class _OverallProgressGauge extends StatelessWidget {
  const _OverallProgressGauge({required this.progress});
  final double progress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final pct = (progress * 100).clamp(0.0, 100.0);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Semantics(
                label: 'Overall progress ${pct.toInt()} percent',
                child: SizedBox(
                  height: 160,
                  width: 160,
                  child: PieChart(
                    PieChartData(
                      startDegreeOffset: -90,
                      sectionsSpace: 0,
                      centerSpaceRadius: 55,
                      sections: [
                        PieChartSectionData(
                          value: pct,
                          color: colorScheme.primary,
                          radius: 18,
                          showTitle: false,
                        ),
                        PieChartSectionData(
                          value: 100 - pct,
                          color: colorScheme.surfaceContainerHighest,
                          radius: 18,
                          showTitle: false,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${pct.toInt()}%',
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text('Overall Progress',
                  style: theme.textTheme.bodyMedium,),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Functioning level section
// ---------------------------------------------------------------------------

class _FunctioningLevelSection extends StatelessWidget {
  const _FunctioningLevelSection({required this.level});
  final String level;

  String get _description {
    switch (level.toLowerCase()) {
      case 'level_1':
      case 'significant_support':
        return 'Significant support needed. Lessons use large targets, '
            'simplified language, audio narration, and extended time.';
      case 'level_2':
      case 'moderate_support':
        return 'Moderate support. Lessons include visual scaffolding, '
            'sentence starters, and frequent check-ins.';
      case 'level_3':
      case 'standard':
        return 'Standard functioning. Balanced curriculum with grade-level '
            'expectations and regular progress checks.';
      case 'level_4':
      case 'advanced':
        return 'Advanced. Accelerated content with enrichment opportunities '
            'and deeper analytical challenges.';
      default:
        return 'Functioning level: $level';
    }
  }

  String get _displayLevel {
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.psychology,
                      color: theme.colorScheme.primary,),
                  const SizedBox(width: 8),
                  Semantics(
                    header: true,
                    child: Text('Functioning Level',
                        style: theme.textTheme.titleMedium,),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(_displayLevel,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),),
              const SizedBox(height: 4),
              Text(_description, style: theme.textTheme.bodyMedium),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Diagnoses list
// ---------------------------------------------------------------------------

class _DiagnosesList extends StatelessWidget {
  const _DiagnosesList({required this.diagnoses});
  final List<String> diagnoses;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: diagnoses.map((d) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    Icon(Icons.medical_information,
                        size: 18,
                        color: theme.colorScheme.primary,),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(d,
                          style: theme.textTheme.bodyLarge,),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Accommodations list
// ---------------------------------------------------------------------------

class _AccommodationsList extends StatelessWidget {
  const _AccommodationsList({required this.accommodations});
  final Map<String, dynamic> accommodations;

  IconData _iconFor(String key) {
    switch (key.toLowerCase()) {
      case 'text_to_speech':
      case 'audio':
        return Icons.volume_up;
      case 'extended_time':
        return Icons.timer;
      case 'large_text':
      case 'font_size':
        return Icons.text_fields;
      case 'dyslexic_font':
        return Icons.font_download;
      case 'visual_supports':
        return Icons.image;
      case 'reduced_stimuli':
        return Icons.visibility_off;
      case 'switch_access':
        return Icons.touch_app;
      case 'breaks':
        return Icons.pause_circle;
      default:
        return Icons.accessibility_new;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (accommodations.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text('No active accommodations',
                style: theme.textTheme.bodyMedium,),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: accommodations.entries.map((entry) {
              final active = entry.value == true ||
                  (entry.value is String &&
                      entry.value.toString().toLowerCase() != 'false');
              if (!active) return const SizedBox.shrink();

              return Chip(
                avatar: Icon(_iconFor(entry.key), size: 16),
                label: Text(
                  entry.key
                      .replaceAll('_', ' ')
                      .split(' ')
                      .map((w) => w.isNotEmpty
                          ? '${w[0].toUpperCase()}${w.substring(1)}'
                          : w,)
                      .join(' '),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Strengths and challenges
// ---------------------------------------------------------------------------

class _StrengthsAndChallenges extends StatelessWidget {
  const _StrengthsAndChallenges({
    required this.strengths,
    required this.challenges,
  });

  final List<String> strengths;
  final List<String> challenges;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Strengths
          Expanded(
            child: Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.thumb_up,
                            color: AivoColors.secondary, size: 18,),
                        const SizedBox(width: 6),
                        Text('Strengths',
                            style: theme.textTheme.labelLarge,),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (strengths.isEmpty)
                      Text('None identified yet',
                          style: theme.textTheme.bodySmall,)
                    else
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: strengths.map((s) {
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
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Challenges
          Expanded(
            child: Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.trending_up,
                            color: AivoColors.accent, size: 18,),
                        const SizedBox(width: 6),
                        Text('Challenges',
                            style: theme.textTheme.labelLarge,),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (challenges.isEmpty)
                      Text('None identified yet',
                          style: theme.textTheme.bodySmall,)
                    else
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: challenges.map((c) {
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
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Mastery overview
// ---------------------------------------------------------------------------

class _MasteryOverview extends StatelessWidget {
  const _MasteryOverview({required this.masteryLevels});
  final Map<String, MasteryLevel> masteryLevels;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (masteryLevels.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text('No mastery data yet',
                style: theme.textTheme.bodyMedium,),
          ),
        ),
      );
    }

    // Group by subject
    final bySubject = <String, List<MasteryLevel>>{};
    for (final entry in masteryLevels.values) {
      bySubject.putIfAbsent(entry.subject, () => []).add(entry);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: bySubject.entries.map((entry) {
          final avgMastery = entry.value
                  .map((m) => m.level)
                  .fold<double>(0, (a, b) => a + b) /
              entry.value.length;
          final pct = (avgMastery * 100).clamp(0.0, 100.0);

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircularProgressIndicator(
                value: avgMastery.clamp(0.0, 1.0),
                strokeWidth: 4,
                backgroundColor:
                    theme.colorScheme.surfaceContainerHighest,
                semanticsLabel: '${entry.key} mastery ${pct.toInt()}%',
              ),
              title: Text(
                entry.key[0].toUpperCase() + entry.key.substring(1),
                style: theme.textTheme.titleMedium,
              ),
              subtitle: Text(
                '${pct.toInt()}% mastery '
                '(${entry.value.length} skills)',
              ),
              trailing: Text(
                '${pct.toInt()}%',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// IEP goal tile
// ---------------------------------------------------------------------------

class _IepGoalTile extends StatelessWidget {
  const _IepGoalTile({required this.goal});
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
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      goal.area,
                      style: theme.textTheme.labelLarge,
                    ),
                  ),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    goal.status.replaceAll('_', ' '),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(goal.goalText, style: theme.textTheme.bodyMedium),
              const SizedBox(height: 8),
              Semantics(
                label:
                    'Goal progress ${(goal.progress * 100).toInt()} percent',
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: goal.progress.clamp(0.0, 1.0),
                    minHeight: 8,
                    color: statusColor,
                    backgroundColor:
                        statusColor.withValues(alpha: 0.15),
                  ),
                ),
              ),
              if (goal.targetDate != null) ...[
                const SizedBox(height: 6),
                Text(
                  'Target: ${DateFormat.yMMMd().format(goal.targetDate!)}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Learning preferences summary
// ---------------------------------------------------------------------------

class _LearningPreferences extends StatelessWidget {
  const _LearningPreferences({required this.preferences});
  final Map<String, dynamic> preferences;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (preferences.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text('No preferences data yet',
                style: theme.textTheme.bodyMedium,),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: preferences.entries.map((entry) {
              final key = entry.key
                  .replaceAll('_', ' ')
                  .split(' ')
                  .map((w) => w.isNotEmpty
                      ? '${w[0].toUpperCase()}${w.substring(1)}'
                      : w,)
                  .join(' ');
              final value = entry.value.toString();

              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 120,
                      child: Text(
                        key,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Expanded(
                      child:
                          Text(value, style: theme.textTheme.bodyMedium),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared widgets
// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Semantics(
        header: true,
        child: Text(
          title,
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
    );
  }
}

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
