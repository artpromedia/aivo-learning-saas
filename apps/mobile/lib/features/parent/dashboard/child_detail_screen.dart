import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _childDashboardProvider = FutureProvider.autoDispose
    .family<ChildDashboard, String>((ref, learnerId) {
  return ref.watch(familyRepositoryProvider).getChildDashboard(learnerId);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ChildDetailScreen extends ConsumerWidget {
  const ChildDetailScreen({super.key, required this.learnerId});

  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncDash = ref.watch(_childDashboardProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: asyncDash.whenOrNull(
              data: (d) => Text(d.learner.name),
            ) ??
            const Text('Child Dashboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/parent/dashboard'),
          tooltip: 'Back to dashboard',
        ),
      ),
      body: asyncDash.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: 'Failed to load child dashboard',
          onRetry: () =>
              ref.invalidate(_childDashboardProvider(learnerId)),
        ),
        data: (dash) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(_childDashboardProvider(learnerId));
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 16),
            children: [
              // Summary cards row
              _SummaryCardsRow(dash: dash),
              const SizedBox(height: 24),

              // Subject progress chart
              _SectionHeader(title: 'Subject Progress'),
              const SizedBox(height: 8),
              _SubjectProgressChart(
                  subjectProgress: dash.subjectProgress),
              const SizedBox(height: 24),

              // Quick actions
              _SectionHeader(title: 'Quick Actions'),
              const SizedBox(height: 8),
              _QuickActions(learnerId: learnerId),
              const SizedBox(height: 24),

              // Learning path preview
              if (dash.nextLessons.isNotEmpty) ...[
                _SectionHeader(title: 'Up Next'),
                const SizedBox(height: 8),
                ...dash.nextLessons.take(3).map(
                      (lesson) => _LessonPreviewTile(lesson: lesson),
                    ),
                const SizedBox(height: 24),
              ],

              // Weekly trend chart
              if (dash.weeklyTrend.isNotEmpty) ...[
                _SectionHeader(title: 'Weekly Trend'),
                const SizedBox(height: 8),
                _WeeklyTrendChart(data: dash.weeklyTrend),
                const SizedBox(height: 24),
              ],

              // Recent activity timeline
              if (dash.recentActivity.isNotEmpty) ...[
                _SectionHeader(title: 'Recent Activity'),
                const SizedBox(height: 8),
                ...dash.recentActivity.map(
                  (item) => _ActivityTile(item: item),
                ),
              ],

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

class _SummaryCardsRow extends StatelessWidget {
  const _SummaryCardsRow({required this.dash});
  final ChildDashboard dash;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _MiniStatCard(
            icon: Icons.star,
            label: 'XP Today',
            value: '${dash.xpEarnedToday}',
            color: AivoColors.xpGold,
          ),
          _MiniStatCard(
            icon: Icons.local_fire_department,
            label: 'Streak',
            value: '${dash.streak} days',
            color: AivoColors.streakFlame,
          ),
          _MiniStatCard(
            icon: Icons.trending_up,
            label: 'Mastery',
            value: '${(dash.masteryProgress * 100).toInt()}%',
            color: AivoColors.secondary,
          ),
          _MiniStatCard(
            icon: Icons.timer,
            label: 'Time Spent',
            value: '${dash.timeSpentMinutes} min',
            color: AivoColors.primary,
          ),
        ],
      ),
    );
  }
}

class _MiniStatCard extends StatelessWidget {
  const _MiniStatCard({
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
    final width =
        (MediaQuery.of(context).size.width - 16 * 2 - 12) / 2;

    return SizedBox(
      width: width,
      child: Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(value,
                        style: theme.textTheme.titleMedium
                            ?.copyWith(color: color)),
                    Text(label, style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Subject progress bar chart
// ---------------------------------------------------------------------------

class _SubjectProgressChart extends StatelessWidget {
  const _SubjectProgressChart({required this.subjectProgress});
  final Map<String, double> subjectProgress;

  @override
  Widget build(BuildContext context) {
    if (subjectProgress.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: Text(
                'No subject data yet',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ),
        ),
      );
    }

    final entries = subjectProgress.entries.toList();
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final barColors = [
      AivoColors.primary,
      AivoColors.secondary,
      AivoColors.accent,
      AivoColors.streakFlame,
      AivoColors.questGreen,
      AivoColors.primaryLight,
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: SizedBox(
            height: 200,
            child: Semantics(
              label: 'Subject progress bar chart',
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: 100,
                  barTouchData: BarTouchData(
                    touchTooltipData: BarTouchTooltipData(
                      getTooltipItem: (group, gIdx, rod, rIdx) {
                        final subject = entries[group.x].key;
                        return BarTooltipItem(
                          '$subject\n${rod.toY.toInt()}%',
                          TextStyle(
                            color: colorScheme.onSurface,
                            fontWeight: FontWeight.w600,
                          ),
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          final idx = value.toInt();
                          if (idx < 0 || idx >= entries.length) {
                            return const SizedBox.shrink();
                          }
                          final name = entries[idx].key;
                          final abbreviation = name.length > 4
                              ? '${name.substring(0, 4)}.'
                              : name;
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              abbreviation,
                              style: theme.textTheme.bodySmall
                                  ?.copyWith(fontSize: 10),
                            ),
                          );
                        },
                        reservedSize: 28,
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: 25,
                        reservedSize: 32,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            '${value.toInt()}%',
                            style: theme.textTheme.bodySmall
                                ?.copyWith(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: FlGridData(
                    show: true,
                    horizontalInterval: 25,
                    getDrawingHorizontalLine: (value) => FlLine(
                      color: colorScheme.outline.withValues(alpha: 0.2),
                      strokeWidth: 1,
                    ),
                    drawVerticalLine: false,
                  ),
                  barGroups: List.generate(entries.length, (i) {
                    final pct = (entries[i].value * 100).clamp(0.0, 100.0);
                    return BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: pct,
                          color: barColors[i % barColors.length],
                          width: 20,
                          borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(6)),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.learnerId});
  final String learnerId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _ActionChip(
              icon: Icons.psychology,
              label: 'Brain',
              onTap: () => context.go('/parent/brain/$learnerId'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _ActionChip(
              icon: Icons.recommend,
              label: 'Recs',
              onTap: () => context.go('/parent/recommendations'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _ActionChip(
              icon: Icons.flag,
              label: 'IEP Goals',
              onTap: () => context.go('/parent/iep/$learnerId'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Column(
              children: [
                Icon(icon,
                    color: colorScheme.onPrimaryContainer, size: 24),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Lesson preview tile
// ---------------------------------------------------------------------------

class _LessonPreviewTile extends StatelessWidget {
  const _LessonPreviewTile({required this.lesson});
  final LessonPreview lesson;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    IconData statusIcon;
    Color statusColor;
    switch (lesson.status) {
      case 'completed':
        statusIcon = Icons.check_circle;
        statusColor = AivoColors.secondary;
      case 'in_progress':
        statusIcon = Icons.play_circle;
        statusColor = AivoColors.primary;
      default:
        statusIcon = Icons.circle_outlined;
        statusColor = theme.colorScheme.outline;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: Icon(statusIcon, color: statusColor),
          title: Text(lesson.title),
          subtitle: Text(lesson.subject),
          trailing: const Icon(Icons.chevron_right),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Weekly trend line chart
// ---------------------------------------------------------------------------

class _WeeklyTrendChart extends StatelessWidget {
  const _WeeklyTrendChart({required this.data});
  final List<WeeklyDataPoint> data;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final maxY = data
        .map((e) => e.value)
        .fold<double>(0, (prev, v) => math.max(prev, v));
    final ceilY = maxY < 10 ? 10.0 : (maxY * 1.2).ceilToDouble();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: SizedBox(
            height: 180,
            child: Semantics(
              label: 'Weekly learning trend chart',
              child: LineChart(
                LineChartData(
                  minY: 0,
                  maxY: ceilY,
                  gridData: FlGridData(
                    show: true,
                    horizontalInterval: ceilY / 4,
                    getDrawingHorizontalLine: (value) => FlLine(
                      color: colorScheme.outline.withValues(alpha: 0.15),
                      strokeWidth: 1,
                    ),
                    drawVerticalLine: false,
                  ),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: 1,
                        getTitlesWidget: (value, meta) {
                          final idx = value.toInt();
                          if (idx < 0 || idx >= data.length) {
                            return const SizedBox.shrink();
                          }
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              data[idx].label,
                              style: theme.textTheme.bodySmall
                                  ?.copyWith(fontSize: 10),
                            ),
                          );
                        },
                        reservedSize: 28,
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 32,
                        interval: ceilY / 4,
                        getTitlesWidget: (value, meta) => Text(
                          '${value.toInt()}',
                          style: theme.textTheme.bodySmall
                              ?.copyWith(fontSize: 10),
                        ),
                      ),
                    ),
                    topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: List.generate(data.length, (i) {
                        return FlSpot(i.toDouble(), data[i].value);
                      }),
                      isCurved: true,
                      curveSmoothness: 0.3,
                      color: colorScheme.primary,
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, pct, bar, idx) =>
                            FlDotCirclePainter(
                          radius: 4,
                          color: colorScheme.primary,
                          strokeWidth: 2,
                          strokeColor: colorScheme.surface,
                        ),
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        color:
                            colorScheme.primary.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                  lineTouchData: LineTouchData(
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipItems: (spots) {
                        return spots.map((spot) {
                          final idx = spot.x.toInt();
                          final label =
                              idx < data.length ? data[idx].label : '';
                          return LineTooltipItem(
                            '$label: ${spot.y.toInt()}',
                            TextStyle(
                              color: colorScheme.onSurface,
                              fontWeight: FontWeight.w600,
                            ),
                          );
                        }).toList();
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Activity timeline tile
// ---------------------------------------------------------------------------

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.item});
  final ActivityItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final formatter = DateFormat('h:mm a');

    IconData icon;
    switch (item.type) {
      case 'lesson_completed':
        icon = Icons.check_circle;
      case 'badge_earned':
        icon = Icons.emoji_events;
      case 'quiz_completed':
        icon = Icons.quiz;
      case 'streak':
        icon = Icons.local_fire_department;
      default:
        icon = Icons.circle;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        margin: const EdgeInsets.only(bottom: 6),
        child: ListTile(
          leading: Icon(icon, color: theme.colorScheme.primary),
          title: Text(item.title, style: theme.textTheme.bodyLarge),
          subtitle: item.subtitle != null
              ? Text(item.subtitle!)
              : null,
          trailing: Text(
            formatter.format(item.timestamp.toLocal()),
            style: theme.textTheme.bodySmall,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section header
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
                size: 48, color: theme.colorScheme.error),
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
