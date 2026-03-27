import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/auth_service.dart';

// ---------------------------------------------------------------------------
// Avatar item model
// ---------------------------------------------------------------------------

class AvatarItem {
  const AvatarItem({
    required this.id,
    required this.name,
    required this.section,
    required this.imageUrl,
    required this.isOwned,
    this.price,
  });

  final String id;
  final String name;
  final String section;
  final String imageUrl;
  final bool isOwned;
  final int? price;

  factory AvatarItem.fromJson(Map<String, dynamic> json) {
    return AvatarItem(
      id: json['id'] as String,
      name: json['name'] as String,
      section: json['section'] as String? ?? 'Head',
      imageUrl: json['imageUrl'] as String? ?? '',
      isOwned: json['isOwned'] as bool? ?? false,
      price: json['price'] as int?,
    );
  }
}

class AvatarConfig {
  const AvatarConfig({
    this.head,
    this.body,
    this.accessories,
    this.background,
    this.previewUrl,
  });

  final String? head;
  final String? body;
  final String? accessories;
  final String? background;
  final String? previewUrl;

  AvatarConfig copyWith({
    String? Function()? head,
    String? Function()? body,
    String? Function()? accessories,
    String? Function()? background,
    String? Function()? previewUrl,
  }) {
    return AvatarConfig(
      head: head != null ? head() : this.head,
      body: body != null ? body() : this.body,
      accessories: accessories != null ? accessories() : this.accessories,
      background: background != null ? background() : this.background,
      previewUrl: previewUrl != null ? previewUrl() : this.previewUrl,
    );
  }

  Map<String, dynamic> toJson() => {
        'head': head,
        'body': body,
        'accessories': accessories,
        'background': background,
      };

  factory AvatarConfig.fromJson(Map<String, dynamic> json) {
    return AvatarConfig(
      head: json['head'] as String?,
      body: json['body'] as String?,
      accessories: json['accessories'] as String?,
      background: json['background'] as String?,
      previewUrl: json['previewUrl'] as String?,
    );
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

String _learnerId(Ref ref) {
  final authState = ref.watch(authProvider);
  return authState is AuthAuthenticated
      ? (authState.user.learnerId ?? authState.user.id)
      : '';
}

final _avatarDataProvider =
    FutureProvider.autoDispose<({AvatarConfig config, List<AvatarItem> items})>(
        (ref) async {
  final api = ref.watch(apiClientProvider);
  final learnerId = _learnerId(ref);

  final results = await Future.wait([
    api.get(Endpoints.avatar(learnerId)),
    api.get(Endpoints.inventory(learnerId)),
  ]);

  final avatarJson = results[0].data as Map<String, dynamic>;
  final inventoryJson = results[1].data as Map<String, dynamic>;

  final config = AvatarConfig.fromJson(avatarJson);
  final items = (inventoryJson['avatarItems'] as List<dynamic>? ?? [])
      .map((e) => AvatarItem.fromJson(e as Map<String, dynamic>))
      .toList();

  return (config: config, items: items);
});

// ---------------------------------------------------------------------------
// Avatar state notifier
// ---------------------------------------------------------------------------

class _AvatarState {
  _AvatarState({
    required this.config,
    required this.items,
    this.isSaving = false,
    this.isDirty = false,
  });

  final AvatarConfig config;
  final List<AvatarItem> items;
  final bool isSaving;
  final bool isDirty;
}

final _avatarStateProvider =
    StateNotifierProvider.autoDispose<_AvatarNotifier, _AvatarState>((ref) {
  final api = ref.watch(apiClientProvider);
  final learnerId = _learnerId(ref);
  return _AvatarNotifier(api: api, learnerId: learnerId);
});

class _AvatarNotifier extends StateNotifier<_AvatarState> {
  _AvatarNotifier({required ApiClient api, required this.learnerId})
      : _api = api,
        super(_AvatarState(config: const AvatarConfig(), items: const [])) {
    _load();
  }

  final ApiClient _api;
  final String learnerId;

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        _api.get(Endpoints.avatar(learnerId)),
        _api.get(Endpoints.inventory(learnerId)),
      ]);

      final avatarJson = results[0].data as Map<String, dynamic>;
      final inventoryJson = results[1].data as Map<String, dynamic>;

      final config = AvatarConfig.fromJson(avatarJson);
      final items = (inventoryJson['avatarItems'] as List<dynamic>? ?? [])
          .map((e) => AvatarItem.fromJson(e as Map<String, dynamic>))
          .toList();

      if (mounted) {
        state = _AvatarState(config: config, items: items);
      }
    } catch (_) {
      // Keep empty state; UI handles gracefully.
    }
  }

  void selectItem(String section, String itemId) {
    AvatarConfig newConfig;
    switch (section) {
      case 'Head':
        newConfig = state.config.copyWith(head: () => itemId);
      case 'Body':
        newConfig = state.config.copyWith(body: () => itemId);
      case 'Accessories':
        newConfig = state.config.copyWith(accessories: () => itemId);
      case 'Background':
        newConfig = state.config.copyWith(background: () => itemId);
      default:
        return;
    }
    state = _AvatarState(
      config: newConfig,
      items: state.items,
      isDirty: true,
    );
  }

  Future<void> save() async {
    state = _AvatarState(
      config: state.config,
      items: state.items,
      isSaving: true,
      isDirty: state.isDirty,
    );

    try {
      await _api.put(
        Endpoints.avatar(learnerId),
        data: state.config.toJson(),
      );
      if (mounted) {
        state = _AvatarState(
          config: state.config,
          items: state.items,
          isSaving: false,
          isDirty: false,
        );
      }
    } catch (_) {
      if (mounted) {
        state = _AvatarState(
          config: state.config,
          items: state.items,
          isSaving: false,
          isDirty: true,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class AvatarScreen extends ConsumerWidget {
  const AvatarScreen({super.key});

  static const _sections = ['Head', 'Body', 'Accessories', 'Background'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final avatarState = ref.watch(_avatarStateProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Avatar'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
          tooltip: 'Back',
        ),
        actions: [
          if (avatarState.isDirty)
            TextButton(
              onPressed: avatarState.isSaving
                  ? null
                  : () => ref.read(_avatarStateProvider.notifier).save(),
              child: avatarState.isSaving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Avatar preview
          Expanded(
            flex: 2,
            child: _AvatarPreview(
              config: avatarState.config,
              colorScheme: colorScheme,
            ),
          ),

          // Customization sections
          Expanded(
            flex: 3,
            child: DefaultTabController(
              length: _sections.length,
              child: Column(
                children: [
                  TabBar(
                    tabs: _sections
                        .map((s) => Tab(
                              text: s,
                              icon: Icon(_sectionIcon(s), size: 20),
                            ))
                        .toList(),
                    isScrollable: false,
                    labelColor: colorScheme.primary,
                    unselectedLabelColor: colorScheme.outline,
                    indicatorColor: colorScheme.primary,
                  ),
                  Expanded(
                    child: TabBarView(
                      children: _sections.map((section) {
                        return _SectionItems(
                          section: section,
                          items: avatarState.items
                              .where((i) => i.section == section)
                              .toList(),
                          selectedId: _selectedId(avatarState.config, section),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String? _selectedId(AvatarConfig config, String section) {
    switch (section) {
      case 'Head':
        return config.head;
      case 'Body':
        return config.body;
      case 'Accessories':
        return config.accessories;
      case 'Background':
        return config.background;
      default:
        return null;
    }
  }

  IconData _sectionIcon(String section) {
    switch (section) {
      case 'Head':
        return Icons.face;
      case 'Body':
        return Icons.checkroom;
      case 'Accessories':
        return Icons.diamond;
      case 'Background':
        return Icons.wallpaper;
      default:
        return Icons.category;
    }
  }
}

// ---------------------------------------------------------------------------
// Avatar preview
// ---------------------------------------------------------------------------

class _AvatarPreview extends StatelessWidget {
  const _AvatarPreview({required this.config, required this.colorScheme});

  final AvatarConfig config;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colorScheme.outline.withValues(alpha: 0.3)),
      ),
      child: Center(
        child: config.previewUrl != null && config.previewUrl!.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: config.previewUrl!,
                width: 150,
                height: 150,
                fit: BoxFit.contain,
                placeholder: (_, __) =>
                    const CircularProgressIndicator(),
                errorWidget: (_, __, ___) => _defaultAvatar(context),
              )
            : _defaultAvatar(context),
      ),
    );
  }

  Widget _defaultAvatar(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.person, size: 100, color: colorScheme.primary),
        const SizedBox(height: 8),
        Text(
          'Your Avatar',
          style: Theme.of(context).textTheme.titleMedium,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Section items horizontal scroll
// ---------------------------------------------------------------------------

class _SectionItems extends ConsumerWidget {
  const _SectionItems({
    required this.section,
    required this.items,
    required this.selectedId,
  });

  final String section;
  final List<AvatarItem> items;
  final String? selectedId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2, size: 40, color: colorScheme.outline),
            const SizedBox(height: 8),
            Text('No $section items yet', style: theme.textTheme.bodyMedium),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => context.push('/learner/shop'),
              child: const Text('Visit Shop'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(12),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final isSelected = selectedId == item.id;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: GestureDetector(
            onTap: item.isOwned
                ? () => ref
                    .read(_avatarStateProvider.notifier)
                    .selectItem(section, item.id)
                : null,
            child: Semantics(
              label: '${item.name}${item.isOwned ? '' : ', not owned'}',
              selected: isSelected,
              button: item.isOwned,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? colorScheme.primary
                        : colorScheme.outline.withValues(alpha: 0.3),
                    width: isSelected ? 2.5 : 1,
                  ),
                  color: isSelected
                      ? colorScheme.primary.withValues(alpha: 0.08)
                      : colorScheme.surface,
                ),
                child: Opacity(
                  opacity: item.isOwned ? 1.0 : 0.5,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (item.imageUrl.isNotEmpty)
                        CachedNetworkImage(
                          imageUrl: item.imageUrl,
                          width: 48,
                          height: 48,
                          fit: BoxFit.contain,
                          placeholder: (_, __) => const SizedBox(
                            width: 48,
                            height: 48,
                            child: Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                          errorWidget: (_, __, ___) =>
                              Icon(Icons.image, size: 32, color: colorScheme.outline),
                        )
                      else
                        Icon(Icons.image, size: 32, color: colorScheme.outline),
                      const SizedBox(height: 4),
                      Text(
                        item.name,
                        style: theme.textTheme.bodySmall?.copyWith(fontSize: 10),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (!item.isOwned && item.price != null) ...[
                        const SizedBox(height: 2),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.monetization_on,
                                size: 10, color: AivoColors.xpGold),
                            const SizedBox(width: 2),
                            Text(
                              '${item.price}',
                              style: theme.textTheme.bodySmall
                                  ?.copyWith(fontSize: 10, color: AivoColors.xpGold),
                            ),
                          ],
                        ),
                      ],
                      if (isSelected) ...[
                        const SizedBox(height: 2),
                        Icon(Icons.check_circle,
                            size: 14, color: colorScheme.primary),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
