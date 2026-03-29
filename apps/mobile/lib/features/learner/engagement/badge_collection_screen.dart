import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// Badge model
// ---------------------------------------------------------------------------

class Badge {
  const Badge({
    required this.slug,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.rarity,
    this.earnedAt,
    this.progress,
    this.progressTarget,
    this.requirements,
  });

  final String slug;
  final String name;
  final String description;
  final String imageUrl;
  final String category;
  final String rarity;
  final DateTime? earnedAt;
  final int? progress;
  final int? progressTarget;
  final String? requirements;

  bool get isEarned => earnedAt != null;

  double get progressPercent {
    if (progressTarget == null || progressTarget == 0) return 0;
    return ((progress ?? 0) / progressTarget!).clamp(0.0, 1.0);
  }

  Color get rarityColor {
    switch (rarity) {
      case 'common':
        return AivoColors.badgeSilver;
      case 'rare':
        return const Color(0xFF3498DB);
      case 'epic':
        return const Color(0xFF9B59B6);
      case 'legendary':
        return AivoColors.xpGold;
      default:
        return AivoColors.badgeSilver;
    }
  }

  String get rarityLabel {
    switch (rarity) {
      case 'common':
        return 'Common';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
      default:
        return rarity;
    }
  }

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      slug: json['slug'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String? ?? '',
      category: json['category'] as String? ?? 'Special',
      rarity: json['rarity'] as String? ?? 'common',
      earnedAt: json['earnedAt'] != null
          ? DateTime.parse(json['earnedAt'] as String)
          : null,
      progress: json['progress'] as int?,
      progressTarget: json['progressTarget'] as int?,
      requirements: json['requirements'] as String?,
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _allBadgesProvider =
    FutureProvider.autoDispose<List<Badge>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';

  final results = await Future.wait([
    api.get(Endpoints.badgesEarned(learnerId)),
    api.get(Endpoints.badgesAvailable),
  ]);

  final earnedList = (results[0].data as List<dynamic>)
      .map((e) => Badge.fromJson(e as Map<String, dynamic>))
      .toList();
  final availableList = (results[1].data as List<dynamic>)
      .map((e) => Badge.fromJson(e as Map<String, dynamic>))
      .toList();

  final earnedSlugs = earnedList.map((b) => b.slug).toSet();
  final merged = <Badge>[
    ...earnedList,
    ...availableList.where((b) => !earnedSlugs.contains(b.slug)),
  ];

  // Sort: earned first, then by rarity.
  merged.sort((a, b) {
    if (a.isEarned && !b.isEarned) return -1;
    if (!a.isEarned && b.isEarned) return 1;
    return _rarityOrder(b.rarity) - _rarityOrder(a.rarity);
  });

  return merged;
});

int _rarityOrder(String rarity) {
  switch (rarity) {
    case 'legendary':
      return 4;
    case 'epic':
      return 3;
    case 'rare':
      return 2;
    case 'common':
      return 1;
    default:
      return 0;
  }
}

final _selectedCategoryProvider =
    StateProvider.autoDispose<String>((_) => 'All');

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class BadgeCollectionScreen extends ConsumerWidget {
  const BadgeCollectionScreen({super.key});

  static const _categories = ['All', 'Academic', 'Social', 'Streak', 'Special'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final badgesAsync = ref.watch(_allBadgesProvider);
    final selectedCategory = ref.watch(_selectedCategoryProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Badges'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      body: Column(
        children: [
          // Category tabs
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat == selectedCategory;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (_) => ref
                        .read(_selectedCategoryProvider.notifier)
                        .state = cat,
                    selectedColor: colorScheme.primary.withValues(alpha: 0.15),
                    checkmarkColor: colorScheme.primary,
                  ),
                );
              },
            ),
          ),

          // Badges grid
          Expanded(
            child: badgesAsync.when(
              loading: () => _buildShimmer(context),
              error: (e, _) => _buildError(context, ref, e),
              data: (badges) {
                final filtered = selectedCategory == 'All'
                    ? badges
                    : badges
                        .where((b) => b.category == selectedCategory)
                        .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.emoji_events,
                            size: 48, color: colorScheme.outline,),
                        const SizedBox(height: 16),
                        Text('No badges in this category',
                            style: theme.textTheme.bodyLarge,),
                      ],
                    ),
                  );
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.78,
                  ),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) =>
                      _BadgeTile(badge: filtered[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
      highlightColor: isDark ? Colors.grey.shade700 : Colors.grey.shade100,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.78,
        ),
        itemCount: 9,
        itemBuilder: (_, __) => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, Object error) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 16),
          Text('Failed to load badges', style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(_allBadgesProvider),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Badge tile
// ---------------------------------------------------------------------------

class _BadgeTile extends StatelessWidget {
  const _BadgeTile({required this.badge});
  final Badge badge;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      label:
          '${badge.name}, ${badge.rarityLabel}, ${badge.isEarned ? 'earned' : 'not earned'}',
      button: true,
      child: GestureDetector(
        onTap: () => _showBadgeDetail(context, theme, colorScheme),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: badge.rarityColor.withValues(alpha: badge.isEarned ? 1.0 : 0.3),
              width: 2,
            ),
            color: colorScheme.surface,
          ),
          child: Opacity(
            opacity: badge.isEarned ? 1.0 : 0.45,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Badge icon display
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: badge.rarityColor.withValues(alpha: 0.15),
                  ),
                  child: Icon(
                    _categoryIcon(badge.category),
                    size: 28,
                    color: badge.rarityColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  badge.name,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (badge.isEarned) ...[
                  const SizedBox(height: 2),
                  Text(
                    DateFormat('MMM d').format(badge.earnedAt!),
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 10,
                      color: colorScheme.outline,
                    ),
                  ),
                ] else if (badge.progressTarget != null) ...[
                  const SizedBox(height: 4),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: badge.progressPercent,
                        minHeight: 4,
                        backgroundColor:
                            colorScheme.surfaceContainerHighest,
                        color: badge.rarityColor,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'Academic':
        return Icons.school;
      case 'Social':
        return Icons.people;
      case 'Streak':
        return Icons.local_fire_department;
      case 'Special':
        return Icons.auto_awesome;
      default:
        return Icons.emoji_events;
    }
  }

  void _showBadgeDetail(
      BuildContext context, ThemeData theme, ColorScheme colorScheme,) {
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
              // Badge icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: badge.rarityColor.withValues(alpha: 0.15),
                  border: Border.all(color: badge.rarityColor, width: 3),
                ),
                child: Icon(
                  _categoryIcon(badge.category),
                  size: 44,
                  color: badge.rarityColor,
                ),
              ),
              const SizedBox(height: 16),
              // Rarity chip
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: badge.rarityColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge.rarityLabel,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: badge.rarityColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                badge.name,
                style: theme.textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                badge.description,
                style: theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              if (badge.requirements != null) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Requirements',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        badge.requirements!,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
              if (!badge.isEarned && badge.progressTarget != null) ...[
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Progress', style: theme.textTheme.titleMedium),
                    Text(
                      '${badge.progress ?? 0} / ${badge.progressTarget}',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: badge.progressPercent,
                    minHeight: 8,
                    backgroundColor: colorScheme.surfaceContainerHighest,
                    color: badge.rarityColor,
                  ),
                ),
              ],
              if (badge.isEarned) ...[
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle,
                        color: AivoColors.questGreen, size: 20,),
                    const SizedBox(width: 8),
                    Text(
                      'Earned on ${DateFormat('MMM d, y').format(badge.earnedAt!)}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AivoColors.questGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}
