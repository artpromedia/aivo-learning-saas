import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _tutorCatalogProvider =
    FutureProvider.autoDispose<List<TutorCatalogItem>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.tutorCatalog);
  final raw = response.data as List<dynamic>;
  return raw
      .map((e) => TutorCatalogItem.fromJson(e as Map<String, dynamic>))
      .toList();
});

final _selectedSubjectProvider =
    StateProvider.autoDispose<String?>((_) => null);

final _subscribingProvider = StateProvider.autoDispose<String?>((_) => null);

// ---------------------------------------------------------------------------
// TutorStoreScreen
// ---------------------------------------------------------------------------

class TutorStoreScreen extends ConsumerWidget {
  const TutorStoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogAsync = ref.watch(_tutorCatalogProvider);
    final selectedSubject = ref.watch(_selectedSubjectProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tutor Catalog'),
        leading: Semantics(
          button: true,
          label: 'Go back',
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.canPop()
                ? context.pop()
                : context.go('/learner/tutors'),
          ),
        ),
      ),
      body: catalogAsync.when(
        loading: () => _buildLoadingState(theme),
        error: (e, _) => _buildErrorState(context, ref, theme, e),
        data: (tutors) {
          // Extract unique subjects
          final subjects = tutors
              .map((t) => t.subject)
              .toSet()
              .toList()
            ..sort();

          // Filter
          final filtered = selectedSubject == null
              ? tutors
              : tutors
                  .where((t) => t.subject == selectedSubject)
                  .toList();

          return Column(
            children: [
              // Subject filter chips
              if (subjects.isNotEmpty)
                SizedBox(
                  height: 52,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Semantics(
                          button: true,
                          label: 'Show all subjects',
                          selected: selectedSubject == null,
                          child: FilterChip(
                            label: const Text('All'),
                            selected: selectedSubject == null,
                            onSelected: (_) => ref
                                .read(_selectedSubjectProvider.notifier)
                                .state = null,
                          ),
                        ),
                      ),
                      ...subjects.map((subject) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Semantics(
                            button: true,
                            label: 'Filter by $subject',
                            selected: selectedSubject == subject,
                            child: FilterChip(
                              label: Text(subject),
                              selected: selectedSubject == subject,
                              onSelected: (_) => ref
                                  .read(_selectedSubjectProvider.notifier)
                                  .state = subject,
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),

              // Grid
              Expanded(
                child: filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.search_off,
                                size: 48, color: theme.colorScheme.outline,),
                            const SizedBox(height: 12),
                            Text('No tutors found',
                                style: theme.textTheme.bodyLarge,),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () async =>
                            ref.invalidate(_tutorCatalogProvider),
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.62,
                          ),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            return _TutorCard(tutor: filtered[index]);
                          },
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLoadingState(ThemeData theme) {
    final baseColor = theme.brightness == Brightness.dark
        ? AivoColors.surfaceVariantDark
        : AivoColors.surfaceVariantLight;
    final highlightColor = theme.brightness == Brightness.dark
        ? AivoColors.surfaceDark
        : AivoColors.surfaceLight;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.62,
        ),
        itemCount: 6,
        itemBuilder: (context, index) {
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          );
        },
      ),
    );
  }

  Widget _buildErrorState(
      BuildContext context, WidgetRef ref, ThemeData theme, Object error,) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 16),
            Text('Failed to load tutor catalog',
                style: theme.textTheme.titleMedium,),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: theme.textTheme.bodySmall,
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 24),
            Semantics(
              button: true,
              label: 'Retry loading catalog',
              child: ElevatedButton.icon(
                onPressed: () => ref.invalidate(_tutorCatalogProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tutor card
// ---------------------------------------------------------------------------

class _TutorCard extends ConsumerWidget {
  const _TutorCard({required this.tutor});

  final TutorCatalogItem tutor;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final subscribing = ref.watch(_subscribingProvider);
    final isLoading = subscribing == tutor.id;

    return Semantics(
      label: '${tutor.name}, ${tutor.subject}, '
          '${tutor.isSubscribed ? 'subscribed' : '\$${tutor.monthlyPrice.toStringAsFixed(2)} per month'}',
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Avatar
            Expanded(
              flex: 3,
              child: Container(
                color: theme.colorScheme.surfaceContainerHighest,
                child: tutor.avatar.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: tutor.avatar,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Center(
                          child: Icon(Icons.person,
                              size: 40, color: theme.colorScheme.outline,),
                        ),
                        errorWidget: (_, __, ___) => Center(
                          child: Icon(Icons.person,
                              size: 40, color: theme.colorScheme.outline,),
                        ),
                      )
                    : Center(
                        child: CircleAvatar(
                          radius: 30,
                          child: Text(
                            tutor.name.isNotEmpty
                                ? tutor.name[0].toUpperCase()
                                : 'T',
                            style: const TextStyle(fontSize: 24),
                          ),
                        ),
                      ),
              ),
            ),
            // Info
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tutor.name,
                      style: theme.textTheme.titleSmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2,),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tutor.subject,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.primary,
                          fontSize: 11,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Expanded(
                      child: Text(
                        tutor.description,
                        style: theme.textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    // Price
                    Text(
                      '\$${tutor.monthlyPrice.toStringAsFixed(2)}/mo',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AivoColors.xpGold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    // Action
                    SizedBox(
                      width: double.infinity,
                      height: 32,
                      child: tutor.isSubscribed
                          ? OutlinedButton(
                              onPressed: null,
                              style: OutlinedButton.styleFrom(
                                padding: EdgeInsets.zero,
                                textStyle: const TextStyle(fontSize: 11),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.check,
                                      size: 14,
                                      color: theme.colorScheme.primary,),
                                  const SizedBox(width: 4),
                                  const Text('Subscribed'),
                                ],
                              ),
                            )
                          : Semantics(
                              button: true,
                              label: 'Subscribe to ${tutor.name}',
                              child: ElevatedButton(
                                onPressed: isLoading
                                    ? null
                                    : () => _subscribe(context, ref),
                                style: ElevatedButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  textStyle: const TextStyle(fontSize: 12),
                                ),
                                child: isLoading
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,),
                                      )
                                    : const Text('Subscribe'),
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _subscribe(BuildContext context, WidgetRef ref) async {
    ref.read(_subscribingProvider.notifier).state = tutor.id;
    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        Endpoints.tutorSubscriptions,
        data: {'tutorId': tutor.id},
      );
      ref.invalidate(_tutorCatalogProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Subscribed to ${tutor.name}!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Subscription failed: $e')),
        );
      }
    } finally {
      ref.read(_subscribingProvider.notifier).state = null;
    }
  }
}
