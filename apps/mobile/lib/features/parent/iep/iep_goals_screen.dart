import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _iepGoalsProvider = FutureProvider.autoDispose
    .family<List<IepGoal>, String>((ref, learnerId) {
  return ref.watch(familyRepositoryProvider).getIepGoals(learnerId);
});

final _iepDocumentsProvider = FutureProvider.autoDispose
    .family<List<IepDocument>, String>((ref, learnerId) {
  return ref
      .watch(familyRepositoryProvider)
      .getIepDocuments(learnerId);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class IepGoalsScreen extends ConsumerWidget {
  const IepGoalsScreen({super.key, required this.learnerId});

  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncGoals = ref.watch(_iepGoalsProvider(learnerId));
    final asyncDocs = ref.watch(_iepDocumentsProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('IEP Goals'),
        actions: [
          TextButton.icon(
            onPressed: () => _uploadIep(context, ref),
            icon: const Icon(Icons.upload_file, size: 18),
            label: const Text('Upload IEP'),
          ),
        ],
      ),
      body: asyncGoals.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorRetry(
          message: 'Failed to load IEP goals',
          onRetry: () =>
              ref.invalidate(_iepGoalsProvider(learnerId)),
        ),
        data: (goals) {
          final docs = asyncDocs.value ?? [];
          final lastDoc = docs.isNotEmpty ? docs.first : null;

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(_iepGoalsProvider(learnerId));
              ref.invalidate(_iepDocumentsProvider(learnerId));
            },
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                // Last upload info
                if (lastDoc != null) ...[
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.description,
                                color: theme.colorScheme.primary,),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    lastDoc.fileName,
                                    style: theme.textTheme.titleMedium,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Uploaded ${DateFormat.yMMMd().format(lastDoc.uploadedAt.toLocal())}',
                                    style: theme.textTheme.bodySmall,
                                  ),
                                  if (lastDoc.status != null)
                                    Text(
                                      'Status: ${lastDoc.status}',
                                      style: theme.textTheme.bodySmall,
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Goals list
                if (goals.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.flag_outlined,
                              size: 64,
                              color:
                                  theme.colorScheme.outlineVariant,),
                          const SizedBox(height: 16),
                          Text('No IEP goals found',
                              style: theme.textTheme.bodyLarge,),
                          const SizedBox(height: 8),
                          Text(
                            'Upload an IEP document to import goals',
                            style: theme.textTheme.bodyMedium,
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ...goals.map(
                    (goal) => _IepGoalExpandable(goal: goal),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _uploadIep(
      BuildContext context, WidgetRef ref,) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );

    if (result == null || result.files.isEmpty) return;

    final file = result.files.first;
    if (file.path == null) return;

    try {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Uploading IEP document...')),
        );
      }

      await ref.read(familyRepositoryProvider).uploadIep(file.path!);

      ref.invalidate(_iepGoalsProvider(learnerId));
      ref.invalidate(_iepDocumentsProvider(learnerId));

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'IEP uploaded successfully. Goals will be extracted shortly.',),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e')),
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// IEP Goal expandable tile
// ---------------------------------------------------------------------------

class _IepGoalExpandable extends StatefulWidget {
  const _IepGoalExpandable({required this.goal});
  final IepGoal goal;

  @override
  State<_IepGoalExpandable> createState() => _IepGoalExpandableState();
}

class _IepGoalExpandableState extends State<_IepGoalExpandable> {
  bool _expanded = false;

  IepGoal get goal => widget.goal;

  Color _statusColor(BuildContext context) {
    switch (goal.status.toLowerCase()) {
      case 'on_track':
      case 'on-track':
        return AivoColors.secondary;
      case 'at_risk':
      case 'at-risk':
        return AivoColors.accent;
      case 'behind':
        return AivoColors.error;
      default:
        return Theme.of(context).colorScheme.outline;
    }
  }

  String get _statusLabel {
    switch (goal.status.toLowerCase()) {
      case 'on_track':
      case 'on-track':
        return 'On Track';
      case 'at_risk':
      case 'at-risk':
        return 'At Risk';
      case 'behind':
        return 'Behind';
      default:
        return goal.status;
    }
  }

  IconData get _statusIcon {
    switch (goal.status.toLowerCase()) {
      case 'on_track':
      case 'on-track':
        return Icons.check_circle;
      case 'at_risk':
      case 'at-risk':
        return Icons.warning;
      case 'behind':
        return Icons.error;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _statusColor(context);
    final pct = (goal.progress * 100).clamp(0.0, 100.0);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => setState(() => _expanded = !_expanded),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row
                Row(
                  children: [
                    Icon(_statusIcon, color: statusColor, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        goal.area,
                        style: theme.textTheme.titleMedium,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3,),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _statusLabel,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Goal text
                Text(goal.goalText,
                    style: theme.textTheme.bodyMedium,
                    maxLines: _expanded ? null : 2,
                    overflow: _expanded ? null : TextOverflow.ellipsis,),
                const SizedBox(height: 10),

                // Progress bar
                Row(
                  children: [
                    Expanded(
                      child: Semantics(
                        label:
                            'Goal progress ${pct.toInt()} percent',
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
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${pct.toInt()}%',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: statusColor,
                      ),
                    ),
                  ],
                ),

                // Target date
                if (goal.targetDate != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Target: ${DateFormat.yMMMd().format(goal.targetDate!)}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],

                // Expanded detail
                if (_expanded) ...[
                  const Divider(height: 24),
                  Text('Progress History',
                      style: theme.textTheme.labelLarge,),
                  const SizedBox(height: 8),
                  // Simple progress milestones
                  _ProgressMilestone(
                    label: 'Current',
                    value: pct,
                    color: statusColor,
                  ),
                  _ProgressMilestone(
                    label: 'Mid-year target',
                    value: 50,
                    color: theme.colorScheme.outline,
                  ),
                  _ProgressMilestone(
                    label: 'End-of-year target',
                    value: 100,
                    color: theme.colorScheme.outline,
                  ),
                ],

                // Expand indicator
                Center(
                  child: Icon(
                    _expanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: theme.colorScheme.outline,
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
// Progress milestone
// ---------------------------------------------------------------------------

class _ProgressMilestone extends StatelessWidget {
  const _ProgressMilestone({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final double value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(label, style: theme.textTheme.bodySmall),
          ),
          Text(
            '${value.toInt()}%',
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
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
