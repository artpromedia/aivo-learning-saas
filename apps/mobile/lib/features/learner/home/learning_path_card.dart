import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/data/models/learning_session.dart';

// ---------------------------------------------------------------------------
// Subject icon helper
// ---------------------------------------------------------------------------

IconData _subjectIcon(String subject) {
  switch (subject.toLowerCase()) {
    case 'math':
    case 'mathematics':
      return Icons.calculate_rounded;
    case 'reading':
    case 'english':
    case 'ela':
    case 'language arts':
      return Icons.menu_book_rounded;
    case 'science':
      return Icons.science_rounded;
    case 'social studies':
    case 'history':
      return Icons.public_rounded;
    case 'art':
      return Icons.palette_rounded;
    case 'music':
      return Icons.music_note_rounded;
    case 'physical education':
    case 'pe':
      return Icons.sports_soccer_rounded;
    case 'technology':
    case 'coding':
      return Icons.computer_rounded;
    case 'writing':
      return Icons.edit_note_rounded;
    case 'life skills':
      return Icons.accessibility_new_rounded;
    default:
      return Icons.auto_stories_rounded;
  }
}

Color _subjectColor(String subject, Brightness brightness) {
  switch (subject.toLowerCase()) {
    case 'math':
    case 'mathematics':
      return const Color(0xFF6C5CE7);
    case 'reading':
    case 'english':
    case 'ela':
    case 'language arts':
      return const Color(0xFF00B894);
    case 'science':
      return const Color(0xFF0984E3);
    case 'social studies':
    case 'history':
      return const Color(0xFFE17055);
    case 'art':
      return const Color(0xFFE84393);
    case 'music':
      return const Color(0xFFFDCB6E);
    case 'life skills':
      return const Color(0xFF00CEC9);
    default:
      return const Color(0xFF636E72);
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
    final Color bgColor;
    final Color fgColor;
    final String label;

    switch (type.toLowerCase()) {
      case 'new':
        bgColor = AivoColors.primary.withValues(alpha: 0.12);
        fgColor = AivoColors.primary;
        label = 'New';
        break;
      case 'review':
        bgColor = AivoColors.secondary.withValues(alpha: 0.12);
        fgColor = AivoColors.secondary;
        label = 'Review';
        break;
      case 'practice':
        bgColor = AivoColors.accent.withValues(alpha: 0.15);
        fgColor = AivoColors.accentDark;
        label = 'Practice';
        break;
      case 'assessment':
        bgColor = AivoColors.error.withValues(alpha: 0.12);
        fgColor = AivoColors.error;
        label = 'Assessment';
        break;
      default:
        bgColor = Theme.of(context).colorScheme.surfaceContainerHighest;
        fgColor = Theme.of(context).colorScheme.onSurfaceVariant;
        label = type;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: fgColor,
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// LearningPathCard
// ---------------------------------------------------------------------------

class LearningPathCard extends ConsumerWidget {
  const LearningPathCard({
    super.key,
    required this.item,
    required this.functioningLevel,
    required this.onTap,
  });

  final LearningPathItem item;
  final FunctioningLevel functioningLevel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLowVerbal = functioningLevel == FunctioningLevel.lowVerbal;
    final isNonVerbal = functioningLevel == FunctioningLevel.nonVerbal;
    final isCompleted = item.isCompleted;
    final subjectColor = _subjectColor(
      item.subject,
      Theme.of(context).brightness,
    );

    final minHeight = isLowVerbal ? 100.0 : 80.0;
    final mastery = item.currentMastery ?? 0.0;

    final scanKey = GlobalKey(debugLabel: 'path_${item.lessonId}');

    Widget card = Semantics(
      button: !isCompleted,
      label: isCompleted
          ? '${item.topic} in ${item.subject}, completed'
          : '${item.topic} in ${item.subject}, ${item.type}, '
              'mastery ${(mastery * 100).round()} percent',
      child: GestureDetector(
        onTap: isCompleted
            ? null
            : () {
                if (isLowVerbal) {
                  final narrator = ref.read(audioNarratorProvider);
                  narrator.speak(item.topic);
                }
                onTap();
              },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          constraints: BoxConstraints(minHeight: minHeight),
          decoration: BoxDecoration(
            color: isCompleted
                ? Theme.of(context)
                    .colorScheme
                    .surfaceContainerHighest
                    .withValues(alpha: 0.6)
                : Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isCompleted
                  ? Theme.of(context).colorScheme.outline.withValues(alpha: 0.3)
                  : subjectColor.withValues(alpha: 0.2),
              width: 1,
            ),
            boxShadow: isCompleted
                ? null
                : [
                    BoxShadow(
                      color: subjectColor.withValues(alpha: 0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Stack(
            children: [
              Padding(
                padding: EdgeInsets.all(isLowVerbal ? 16 : 12),
                child: Row(
                  children: [
                    // Subject icon
                    Container(
                      width: isLowVerbal ? 56 : 44,
                      height: isLowVerbal ? 56 : 44,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? Theme.of(context)
                                .colorScheme
                                .outline
                                .withValues(alpha: 0.15)
                            : subjectColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Icon(
                          _subjectIcon(item.subject),
                          size: isLowVerbal ? 28 : 22,
                          color: isCompleted
                              ? Theme.of(context).colorScheme.outline
                              : subjectColor,
                        ),
                      ),
                    ),
                    SizedBox(width: isLowVerbal ? 16 : 12),

                    // Topic name, skill, and mastery
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.topic,
                                  style: isLowVerbal
                                      ? Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            fontSize: 18,
                                            color: isCompleted
                                                ? Theme.of(context)
                                                    .colorScheme
                                                    .outline
                                                : null,
                                            decoration: isCompleted
                                                ? TextDecoration.lineThrough
                                                : null,
                                          )
                                      : Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: isCompleted
                                                ? Theme.of(context)
                                                    .colorScheme
                                                    .outline
                                                : null,
                                            decoration: isCompleted
                                                ? TextDecoration.lineThrough
                                                : null,
                                          ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (!isLowVerbal) _TypeBadge(type: item.type),
                            ],
                          ),
                          const SizedBox(height: 4),
                          if (isLowVerbal) ...[
                            _TypeBadge(type: item.type),
                            const SizedBox(height: 6),
                          ],
                          // Mastery progress bar
                          Row(
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(3),
                                  child: LinearProgressIndicator(
                                    value: mastery.clamp(0.0, 1.0),
                                    minHeight: isLowVerbal ? 8 : 5,
                                    backgroundColor: Theme.of(context)
                                        .colorScheme
                                        .surfaceContainerHighest,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      isCompleted
                                          ? AivoColors.secondary
                                          : subjectColor,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${(mastery * 100).round()}%',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      fontSize: isLowVerbal ? 14 : 11,
                                      color: isCompleted
                                          ? Theme.of(context).colorScheme.outline
                                          : subjectColor,
                                    ),
                              ),
                            ],
                          ),
                          if (!isLowVerbal) ...[
                            const SizedBox(height: 2),
                            Text(
                              item.subject,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: isCompleted
                                        ? Theme.of(context).colorScheme.outline
                                        : Theme.of(context)
                                            .colorScheme
                                            .onSurfaceVariant,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Chevron or checkmark
                    SizedBox(width: isLowVerbal ? 12 : 8),
                    if (isCompleted)
                      Icon(
                        Icons.check_circle_rounded,
                        size: isLowVerbal ? 32 : 24,
                        color: AivoColors.secondary,
                      )
                    else
                      Icon(
                        Icons.chevron_right_rounded,
                        size: isLowVerbal ? 32 : 24,
                        color: Theme.of(context).colorScheme.outline,
                      ),
                  ],
                ),
              ),

              // Completed overlay
              if (isCompleted)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .surface
                          .withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );

    // Switch-scan support for NON_VERBAL
    if (isNonVerbal) {
      final controller = ref.read(switchScanControllerProvider);
      controller.registerTarget(scanKey, '${item.topic} in ${item.subject}');
      card = KeyedSubtree(key: scanKey, child: card);
    }

    return card;
  }
}
