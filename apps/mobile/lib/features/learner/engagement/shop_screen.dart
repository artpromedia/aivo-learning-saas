import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// Shop item model
// ---------------------------------------------------------------------------

class ShopItem {
  const ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.imageUrl,
    required this.price,
    this.isOwned = false,
    this.isEquipped = false,
  });

  final String id;
  final String name;
  final String description;
  final String category;
  final String imageUrl;
  final int price;
  final bool isOwned;
  final bool isEquipped;

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'Avatar Items',
      imageUrl: json['imageUrl'] as String? ?? '',
      price: json['price'] as int? ?? 0,
      isOwned: json['isOwned'] as bool? ?? false,
      isEquipped: json['isEquipped'] as bool? ?? false,
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _shopCatalogProvider =
    FutureProvider.autoDispose<List<ShopItem>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';

  final results = await Future.wait([
    api.get(Endpoints.shopCatalog),
    api.get(Endpoints.inventory(learnerId)),
  ]);

  final catalogList = (results[0].data as List<dynamic>)
      .map((e) => ShopItem.fromJson(e as Map<String, dynamic>))
      .toList();

  final inventoryData = results[1].data as Map<String, dynamic>? ?? {};
  final ownedIds =
      (inventoryData['ownedItems'] as List<dynamic>?)?.cast<String>().toSet() ??
          {};
  final equippedIds =
      (inventoryData['equippedItems'] as List<dynamic>?)?.cast<String>().toSet() ??
          {};

  return catalogList.map((item) {
    return ShopItem(
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      price: item.price,
      isOwned: ownedIds.contains(item.id),
      isEquipped: equippedIds.contains(item.id),
    );
  }).toList();
});

final _coinBalanceProvider = FutureProvider.autoDispose<int>((ref) async {
  final api = ref.watch(apiClientProvider);
  final authState = ref.watch(authProvider);
  final learnerId = authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';
  final response = await api.get(Endpoints.xp(learnerId));
  final data = response.data as Map<String, dynamic>;
  return data['aivoCoins'] as int? ?? 0;
});

final _selectedShopCategoryProvider =
    StateProvider.autoDispose<String>((_) => 'Avatar Items');

final _purchaseLoadingProvider =
    StateProvider.autoDispose<String?>((_) => null);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class ShopScreen extends ConsumerWidget {
  const ShopScreen({super.key});

  static const _categories = [
    'Avatar Items',
    'Themes',
    'Power-ups',
    'Decorations',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogAsync = ref.watch(_shopCatalogProvider);
    final coinAsync = ref.watch(_coinBalanceProvider);
    final selectedCategory = ref.watch(_selectedShopCategoryProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
      ),
      body: Column(
        children: [
          // Coin balance
          _buildCoinBalance(theme, colorScheme, coinAsync),

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
                        .read(_selectedShopCategoryProvider.notifier)
                        .state = cat,
                    selectedColor: colorScheme.primary.withValues(alpha: 0.15),
                    checkmarkColor: colorScheme.primary,
                  ),
                );
              },
            ),
          ),

          // Items grid
          Expanded(
            child: catalogAsync.when(
              loading: () => _buildShimmer(context),
              error: (e, _) => _buildError(context, ref, e),
              data: (items) {
                final filtered = items
                    .where((i) => i.category == selectedCategory)
                    .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shopping_bag_outlined,
                            size: 48, color: colorScheme.outline,),
                        const SizedBox(height: 16),
                        Text('No items in this category',
                            style: theme.textTheme.bodyLarge,),
                      ],
                    ),
                  );
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final coins =
                        coinAsync.whenOrNull(data: (c) => c) ?? 0;
                    return _ShopItemCard(
                      item: filtered[index],
                      coinBalance: coins,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoinBalance(
      ThemeData theme, ColorScheme colorScheme, AsyncValue<int> coinAsync,) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AivoColors.xpGold.withValues(alpha: 0.15),
            AivoColors.xpGold.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AivoColors.xpGold.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.monetization_on, size: 32, color: AivoColors.xpGold),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Your Balance', style: theme.textTheme.bodySmall),
              coinAsync.when(
                data: (coins) => Text(
                  '$coins AivoCoins',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AivoColors.xpGold,
                  ),
                ),
                loading: () => const SizedBox(
                  height: 24,
                  width: 80,
                  child: LinearProgressIndicator(),
                ),
                error: (_, __) => Text(
                  '-- AivoCoins',
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ],
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
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        itemCount: 4,
        itemBuilder: (_, __) => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
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
          Text('Failed to load shop', style: theme.textTheme.titleMedium),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(_shopCatalogProvider),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shop item card
// ---------------------------------------------------------------------------

class _ShopItemCard extends ConsumerWidget {
  const _ShopItemCard({required this.item, required this.coinBalance});

  final ShopItem item;
  final int coinBalance;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final purchaseLoading = ref.watch(_purchaseLoadingProvider);
    final isLoading = purchaseLoading == item.id;
    final canAfford = coinBalance >= item.price;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Image
          Expanded(
            flex: 3,
            child: Container(
              color: colorScheme.surfaceContainerHighest,
              child: item.imageUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: item.imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Center(
                        child: Icon(Icons.image,
                            size: 32, color: colorScheme.outline,),
                      ),
                      errorWidget: (_, __, ___) => Center(
                        child: Icon(Icons.image,
                            size: 32, color: colorScheme.outline,),
                      ),
                    )
                  : Center(
                      child: Icon(
                        _categoryIcon(item.category),
                        size: 40,
                        color: colorScheme.primary,
                      ),
                    ),
            ),
          ),
          // Info
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  // Price
                  Row(
                    children: [
                      const Icon(Icons.monetization_on,
                          size: 14, color: AivoColors.xpGold,),
                      const SizedBox(width: 2),
                      Text(
                        '${item.price}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AivoColors.xpGold,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Button
                  SizedBox(
                    width: double.infinity,
                    height: 30,
                    child: _buildActionButton(
                        context, ref, theme, colorScheme, isLoading, canAfford,),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, WidgetRef ref,
      ThemeData theme, ColorScheme colorScheme, bool isLoading, bool canAfford,) {
    if (item.isEquipped) {
      return OutlinedButton(
        onPressed: null,
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.zero,
          textStyle: theme.textTheme.bodySmall,
        ),
        child: const Text('Equipped'),
      );
    }
    if (item.isOwned) {
      return OutlinedButton(
        onPressed: null,
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.zero,
          textStyle: theme.textTheme.bodySmall,
        ),
        child: const Text('Owned'),
      );
    }
    if (!canAfford) {
      return OutlinedButton(
        onPressed: null,
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.zero,
          textStyle: const TextStyle(fontSize: 10),
        ),
        child: Text('Need ${item.price - coinBalance} more'),
      );
    }
    return ElevatedButton(
      onPressed: isLoading ? null : () => _purchase(context, ref),
      style: ElevatedButton.styleFrom(
        padding: EdgeInsets.zero,
        textStyle: theme.textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      child: isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Text('Buy'),
    );
  }

  Future<void> _purchase(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Purchase'),
        content: Text(
          'Buy "${item.name}" for ${item.price} AivoCoins?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Buy'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    ref.read(_purchaseLoadingProvider.notifier).state = item.id;
    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        Endpoints.shopPurchase,
        data: {'itemId': item.id},
      );
      ref.invalidate(_shopCatalogProvider);
      ref.invalidate(_coinBalanceProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Purchased "${item.name}"!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Purchase failed: $e')),
        );
      }
    } finally {
      ref.read(_purchaseLoadingProvider.notifier).state = null;
    }
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'Avatar Items':
        return Icons.face;
      case 'Themes':
        return Icons.palette;
      case 'Power-ups':
        return Icons.flash_on;
      case 'Decorations':
        return Icons.auto_fix_high;
      default:
        return Icons.shopping_bag;
    }
  }
}
