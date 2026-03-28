import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/quest.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _questChaptersProvider = FutureProvider.autoDispose
    .family<List<QuestChapter>, String>((ref, worldId) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.questWorldDetail(worldId));
  final data = response.data as Map<String, dynamic>;
  final chapters = data['chapters'] as List<dynamic>? ?? [];
  return chapters
      .map((e) => QuestChapter.fromJson(e as Map<String, dynamic>))
      .toList()
    ..sort((a, b) => a.orderIndex.compareTo(b.orderIndex));
});

final _worldDetailProvider = FutureProvider.autoDispose
    .family<QuestWorld, String>((ref, worldId) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.questWorldDetail(worldId));
  final data = response.data as Map<String, dynamic>;
  return QuestWorld.fromJson(data);
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class QuestChapterScreen extends ConsumerWidget {
  const QuestChapterScreen({
    super.key,
    required this.worldId,
    required this.chapterId,
  });

  final String worldId;
  final String chapterId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(_questChaptersProvider(worldId));
    final worldAsync = ref.watch(_worldDetailProvider(worldId));
    final theme = Theme.of(context);
    // ignore: unused_local_variable
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: worldAsync.when(
          data: (world) => Text(world.name),
          loading: () => const Text('Loading...'),
          error: (_, __) => const Text('Quest World'),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/quests'),
          tooltip: 'Back',
        ),
      ),
      body: chaptersAsync.when(
        loading: () => _buildShimmer(context),
        error: (e, _) => _buildError(context, ref, e),
        data: (chapters) {
          if (chapters.isEmpty) {
            return Center(
              child: Text(
                'No chapters available yet.',
                style: theme.textTheme.bodyLarge,
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(0, 16, 0, 32),
            itemCount: chapters.length,
            itemBuilder: (context, index) {
              final chapter = chapters[index];
              final isFirst = index == 0;
              final isLast = index == chapters.length - 1;
              return _ChapterNode(
                chapter: chapter,
                isFirst: isFirst,
                isLast: isLast,
                index: index,
                worldId: worldId,
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildShimmer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 6,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Row(
            children: [
              const SizedBox(width: 40),
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  height: 20,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ],
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
            Text('Failed to load chapters',
                style: theme.textTheme.titleMedium,),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () =>
                  ref.invalidate(_questChaptersProvider(worldId)),
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
// Chapter node
// ---------------------------------------------------------------------------

class _ChapterNode extends StatelessWidget {
  const _ChapterNode({
    required this.chapter,
    required this.isFirst,
    required this.isLast,
    required this.index,
    required this.worldId,
  });

  final QuestChapter chapter;
  final bool isFirst;
  final bool isLast;
  final int index;
  final String worldId;

  bool get _isBoss => chapter.isBoss;
  bool get _isCompleted => chapter.status == 'completed';
  bool get _isInProgress => chapter.status == 'in_progress';
  bool get _isLocked => chapter.status == 'locked';
  bool get _isAvailable => !_isLocked;

  Color _nodeColor(ColorScheme cs) {
    if (_isCompleted) return AivoColors.questGreen;
    if (_isInProgress) return cs.primary;
    return cs.outline;
  }

  IconData get _nodeIcon {
    if (_isCompleted) return Icons.check;
    if (_isBoss) return Icons.star;
    if (_isLocked) return Icons.lock;
    if (_isInProgress) return Icons.play_arrow;
    return Icons.circle;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final nodeColor = _nodeColor(colorScheme);
    final nodeSize = _isBoss ? 56.0 : 48.0;

    return Semantics(
      label:
          '${chapter.title}, ${_isCompleted ? 'completed' : _isInProgress ? 'in progress' : _isLocked ? 'locked' : 'available'}'
          '${_isBoss ? ', boss chapter' : ''}',
      button: _isAvailable,
      child: InkWell(
        onTap: _isAvailable
            ? () => _showChapterDetail(context, theme, colorScheme)
            : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Connecting line + node
                SizedBox(
                  width: 56,
                  child: Column(
                    children: [
                      // Top connector
                      if (!isFirst)
                        Container(
                          width: 3,
                          height: 16,
                          color: _isCompleted || _isInProgress
                              ? AivoColors.questGreen
                              : colorScheme.outline.withValues(alpha: 0.3),
                        ),
                      // Node circle
                      _isInProgress
                          ? _PulsingNode(
                              size: nodeSize,
                              color: nodeColor,
                              icon: _nodeIcon,
                              isBoss: _isBoss,
                            )
                          : Container(
                              width: nodeSize,
                              height: nodeSize,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _isLocked
                                    ? colorScheme.surfaceContainerHighest
                                    : nodeColor.withValues(alpha: 0.15),
                                border: Border.all(
                                  color: nodeColor,
                                  width: _isBoss ? 3 : 2,
                                ),
                              ),
                              child: Icon(
                                _nodeIcon,
                                color: nodeColor,
                                size: _isBoss ? 28 : 22,
                              ),
                            ),
                      // Bottom connector
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 3,
                            constraints: const BoxConstraints(minHeight: 24),
                            color: _isCompleted
                                ? AivoColors.questGreen
                                : colorScheme.outline.withValues(alpha: 0.3),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                // Chapter info
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Opacity(
                      opacity: _isLocked ? 0.5 : 1.0,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  chapter.title,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: _isBoss
                                        ? FontWeight.w700
                                        : FontWeight.w600,
                                  ),
                                ),
                              ),
                              if (_isBoss)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2,),
                                  decoration: BoxDecoration(
                                    color: AivoColors.streakFlame
                                        .withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'BOSS',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: AivoColors.streakFlame,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            chapter.description,
                            style: theme.textTheme.bodySmall,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.menu_book,
                                  size: 14, color: colorScheme.outline,),
                              const SizedBox(width: 4),
                              Text(
                                '${chapter.stages.length} stages',
                                style: theme.textTheme.bodySmall,
                              ),
                              if (_isAvailable) ...[
                                const SizedBox(width: 12),
                                Icon(Icons.chevron_right,
                                    size: 16, color: colorScheme.primary,),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showChapterDetail(
      BuildContext context, ThemeData theme, ColorScheme colorScheme,) {
    final xpReward = chapter.stages.fold(0, (sum, s) => sum + s.xpReward);
    final estimatedMinutes = chapter.stages.length * 5;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
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
                    color: colorScheme.outline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  if (_isBoss)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: const Icon(Icons.star,
                          color: AivoColors.streakFlame, size: 28,),
                    ),
                  Expanded(
                    child: Text(
                      chapter.title,
                      style: theme.textTheme.headlineSmall,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                chapter.description,
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              // Stats row
              Row(
                children: [
                  _StatChip(
                    icon: Icons.star,
                    label: '$xpReward XP',
                    color: AivoColors.xpGold,
                  ),
                  const SizedBox(width: 12),
                  _StatChip(
                    icon: Icons.timer,
                    label: '~$estimatedMinutes min',
                    color: colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  _StatChip(
                    icon: Icons.menu_book,
                    label: '${chapter.stages.length} stages',
                    color: colorScheme.secondary,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    if (chapter.stages.isNotEmpty) {
                      context.push(
                        '/learner/session/${chapter.stages.first.id}',
                      );
                    }
                  },
                  child: Text(_isBoss ? 'Start Boss Battle' : 'Start Chapter'),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Pulsing node for in-progress chapters
// ---------------------------------------------------------------------------

class _PulsingNode extends StatefulWidget {
  const _PulsingNode({
    required this.size,
    required this.color,
    required this.icon,
    required this.isBoss,
  });

  final double size;
  final Color color;
  final IconData icon;
  final bool isBoss;

  @override
  State<_PulsingNode> createState() => _PulsingNodeState();
}

class _PulsingNodeState extends State<_PulsingNode>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.12).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: widget.color.withValues(alpha: 0.15),
          border: Border.all(
            color: widget.color,
            width: widget.isBoss ? 3 : 2,
          ),
          boxShadow: [
            BoxShadow(
              color: widget.color.withValues(alpha: 0.3),
              blurRadius: 12,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Icon(
          widget.icon,
          color: widget.color,
          size: widget.isBoss ? 28 : 22,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Stat chip for bottom sheet
// ---------------------------------------------------------------------------

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
