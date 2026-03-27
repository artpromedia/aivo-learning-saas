import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/recommendation.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// RecommendationCard
// ---------------------------------------------------------------------------

class RecommendationCard extends ConsumerStatefulWidget {
  const RecommendationCard({
    super.key,
    required this.recommendation,
    this.onUpdated,
  });

  final Recommendation recommendation;
  final VoidCallback? onUpdated;

  @override
  ConsumerState<RecommendationCard> createState() =>
      _RecommendationCardState();
}

class _RecommendationCardState extends ConsumerState<RecommendationCard> {
  bool _isExpanded = false;
  bool _isProcessing = false;

  Recommendation get rec => widget.recommendation;
  bool get isPending => rec.status == 'pending';

  Future<void> _approve() async {
    setState(() => _isProcessing = true);
    try {
      await ref.read(familyRepositoryProvider).respondToRecommendation(
            rec.id,
            'approved',
          );
      widget.onUpdated?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recommendation approved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to approve: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _decline() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Decline Recommendation'),
        content: Text(
          'Are you sure you want to decline "${rec.title}"?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: AivoColors.error,
            ),
            child: const Text('Decline'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isProcessing = true);
    try {
      await ref.read(familyRepositoryProvider).respondToRecommendation(
            rec.id,
            'declined',
          );
      widget.onUpdated?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recommendation declined')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to decline: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _adjust() async {
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _AdjustmentSheet(recommendation: rec),
    );

    if (result == null) return;

    setState(() => _isProcessing = true);
    try {
      final adjustments = result['adjustments'] as Map<String, dynamic>? ?? {};
      final notes = result['notes'] as String?;
      if (notes != null && notes.isNotEmpty) {
        adjustments['notes'] = notes;
      }
      await ref.read(familyRepositoryProvider).respondToRecommendation(
            rec.id,
            'adjusted',
            adjustments: adjustments,
          );
      widget.onUpdated?.call();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recommendation adjusted')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to adjust: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      label: '${rec.type} recommendation: ${rec.title}, status ${rec.status}',
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: type badge + status
              Row(
                children: [
                  _TypeBadge(type: rec.type),
                  const Spacer(),
                  if (!isPending) _StatusBadge(status: rec.status),
                ],
              ),
              const SizedBox(height: 12),

              // Title
              Text(rec.title, style: theme.textTheme.titleMedium),
              const SizedBox(height: 6),

              // Description
              Text(rec.description, style: theme.textTheme.bodyMedium),

              // Expandable rationale
              const SizedBox(height: 8),
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () =>
                    setState(() => _isExpanded = !_isExpanded),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Icon(
                        _isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        size: 20,
                        color: colorScheme.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _isExpanded
                            ? 'Hide rationale'
                            : 'View rationale',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_isExpanded) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    rec.rationale,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              ],

              // Resolved info
              if (!isPending && rec.respondedAt != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Responded ${DateFormat.yMMMd().format(rec.respondedAt!.toLocal())}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.outline,
                  ),
                ),
                if (rec.parentResponse != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    'Response: ${rec.parentResponse}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],

              // Pending action buttons
              if (isPending) ...[
                const SizedBox(height: 16),
                if (_isProcessing)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(8),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                else
                  Row(
                    children: [
                      Expanded(
                        child: Semantics(
                          button: true,
                          label: 'Approve recommendation',
                          child: FilledButton.icon(
                            onPressed: _approve,
                            icon: const Icon(Icons.check, size: 18),
                            label: const Text('Approve'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AivoColors.secondary,
                              foregroundColor: Colors.white,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Semantics(
                          button: true,
                          label: 'Decline recommendation',
                          child: FilledButton.icon(
                            onPressed: _decline,
                            icon: const Icon(Icons.close, size: 18),
                            label: const Text('Decline'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AivoColors.error,
                              foregroundColor: Colors.white,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Semantics(
                          button: true,
                          label: 'Adjust recommendation',
                          child: FilledButton.icon(
                            onPressed: _adjust,
                            icon: const Icon(Icons.tune, size: 18),
                            label: const Text('Adjust'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AivoColors.accent,
                              foregroundColor: Colors.black,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ),
                    ],
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
// Type badge
// ---------------------------------------------------------------------------

class _TypeBadge extends StatelessWidget {
  const _TypeBadge({required this.type});
  final String type;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    IconData icon;
    Color color;
    switch (type.toLowerCase()) {
      case 'accommodation':
        icon = Icons.accessibility_new;
        color = AivoColors.primary;
      case 'curriculum':
        icon = Icons.school;
        color = AivoColors.secondary;
      case 'goal':
        icon = Icons.flag;
        color = AivoColors.accent;
      case 'tutor':
        icon = Icons.smart_toy;
        color = AivoColors.streakFlame;
      default:
        icon = Icons.lightbulb;
        color = theme.colorScheme.primary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            type[0].toUpperCase() + type.substring(1),
            style: theme.textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color color;
    switch (status.toLowerCase()) {
      case 'approved':
        color = AivoColors.secondary;
      case 'declined':
        color = AivoColors.error;
      case 'adjusted':
        color = AivoColors.accent;
      default:
        color = theme.colorScheme.outline;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        status[0].toUpperCase() + status.substring(1),
        style: theme.textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Adjustment bottom sheet
// ---------------------------------------------------------------------------

class _AdjustmentSheet extends StatefulWidget {
  const _AdjustmentSheet({required this.recommendation});
  final Recommendation recommendation;

  @override
  State<_AdjustmentSheet> createState() => _AdjustmentSheetState();
}

class _AdjustmentSheetState extends State<_AdjustmentSheet> {
  final _notesController = TextEditingController();
  double _difficultyAdjustment = 0.5;
  double _frequencyAdjustment = 0.5;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mediaQuery = MediaQuery.of(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: mediaQuery.viewInsets.bottom,
        left: 24,
        right: 24,
        top: 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle
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
              child: Text(
                'Adjust Recommendation',
                style: theme.textTheme.titleLarge,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.recommendation.title,
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),

            // Difficulty slider
            Text('Difficulty Level',
                style: theme.textTheme.labelLarge),
            Semantics(
              label:
                  'Difficulty adjustment: ${(_difficultyAdjustment * 100).toInt()}%',
              slider: true,
              child: Slider(
                value: _difficultyAdjustment,
                onChanged: (v) =>
                    setState(() => _difficultyAdjustment = v),
                divisions: 10,
                label:
                    '${(_difficultyAdjustment * 100).toInt()}%',
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Easier',
                    style: theme.textTheme.bodySmall),
                Text('Harder',
                    style: theme.textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 16),

            // Frequency slider
            Text('Frequency', style: theme.textTheme.labelLarge),
            Semantics(
              label:
                  'Frequency adjustment: ${(_frequencyAdjustment * 100).toInt()}%',
              slider: true,
              child: Slider(
                value: _frequencyAdjustment,
                onChanged: (v) =>
                    setState(() => _frequencyAdjustment = v),
                divisions: 10,
                label:
                    '${(_frequencyAdjustment * 100).toInt()}%',
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Less often',
                    style: theme.textTheme.bodySmall),
                Text('More often',
                    style: theme.textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 16),

            // Notes
            Text('Notes', style: theme.textTheme.labelLarge),
            const SizedBox(height: 8),
            Semantics(
              label: 'Adjustment notes',
              textField: true,
              child: TextField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText:
                      'Add any notes about this adjustment...',
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit
            FilledButton(
              onPressed: () {
                Navigator.of(context).pop(<String, dynamic>{
                  'notes': _notesController.text.trim().isNotEmpty
                      ? _notesController.text.trim()
                      : null,
                  'adjustments': <String, dynamic>{
                    'difficulty': _difficultyAdjustment,
                    'frequency': _frequencyAdjustment,
                  },
                });
              },
              child: const Text('Submit Adjustment'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
