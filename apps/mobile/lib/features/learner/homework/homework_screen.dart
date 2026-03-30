import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/data/models/homework.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _homeworkListProvider =
    FutureProvider.autoDispose<List<Homework>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';
  final response =
      await api.get(Endpoints.learningSessionHistory, queryParameters: {
    'learnerId': learnerId,
    'type': 'homework',
  },);
  final list = response.data as List<dynamic>;
  return list
      .map((e) => Homework.fromJson(e as Map<String, dynamic>))
      .toList()
    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class HomeworkScreen extends ConsumerWidget {
  const HomeworkScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeworkAsync = ref.watch(_homeworkListProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Homework'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/learner/homework/camera'),
        icon: const Icon(Icons.camera_alt),
        label: const Text('Upload New'),
        tooltip: 'Upload new homework',
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_homeworkListProvider);
          await ref.read(_homeworkListProvider.future);
        },
        child: homeworkAsync.when(
          loading: () => _buildShimmerList(context),
          error: (error, stack) => _buildError(context, ref, error),
          data: (homeworks) {
            if (homeworks.isEmpty) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.assignment_outlined,
                        size: 64, color: colorScheme.outline,),
                    const SizedBox(height: 16),
                    Text(
                      'No homework yet',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap the button below to upload your first homework!',
                      style: theme.textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              itemCount: homeworks.length,
              itemBuilder: (context, index) =>
                  _HomeworkCard(homework: homeworks[index]),
            );
          },
        ),
      ),
    );
  }

  Widget _buildShimmerList(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Container(
            height: 88,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 16),
            Text(
              'Failed to load homework',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(_homeworkListProvider),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Homework card
// ---------------------------------------------------------------------------

class _HomeworkCard extends StatelessWidget {
  const _HomeworkCard({required this.homework});

  final Homework homework;

  Color _statusColor(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    switch (homework.status) {
      case 'processing':
        return colorScheme.tertiary;
      case 'ready':
        return colorScheme.primary;
      case 'completed':
        return colorScheme.secondary;
      default:
        return colorScheme.outline;
    }
  }

  IconData get _statusIcon {
    switch (homework.status) {
      case 'processing':
        return Icons.hourglass_top;
      case 'ready':
        return Icons.play_circle_outline;
      case 'completed':
        return Icons.check_circle;
      default:
        return Icons.help_outline;
    }
  }

  String get _statusLabel {
    switch (homework.status) {
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      default:
        return homework.status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateStr = DateFormat('MMM d, y').format(homework.createdAt);
    final statusColor = _statusColor(context);
    final isCompleted = homework.status == 'completed';
    final isReady = homework.status == 'ready';
    final isTappable = isCompleted || isReady;

    return Semantics(
      label:
          '${homework.detectedSubject ?? 'Homework'}, $dateStr, $_statusLabel'
          '${isCompleted && homework.questions.isNotEmpty ? ', Score: ${_computeScore()}%' : ''}',
      button: isTappable,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: isTappable
              ? () =>
                  context.push('/learner/homework/session/${homework.id}')
              : null,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Subject icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(_subjectIcon, color: statusColor, size: 24),
                ),
                const SizedBox(width: 12),
                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        homework.detectedSubject ?? 'Homework',
                        style: theme.textTheme.titleMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        dateStr,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Status + score
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4,),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_statusIcon, size: 14, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            _statusLabel,
                            style: theme.textTheme.bodySmall
                                ?.copyWith(color: statusColor),
                          ),
                        ],
                      ),
                    ),
                    if (isCompleted && homework.questions.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${_computeScore()}%',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData get _subjectIcon {
    final subject = (homework.detectedSubject ?? '').toLowerCase();
    if (subject.contains('math')) return Icons.calculate;
    if (subject.contains('science')) return Icons.science;
    if (subject.contains('english') || subject.contains('reading')) {
      return Icons.menu_book;
    }
    if (subject.contains('history') || subject.contains('social')) {
      return Icons.public;
    }
    return Icons.assignment;
  }

  int _computeScore() {
    final answered =
        homework.questions.where((q) => q.isCorrect != null).toList();
    if (answered.isEmpty) return 0;
    final correct = answered.where((q) => q.isCorrect == true).length;
    return ((correct / answered.length) * 100).round();
  }
}
