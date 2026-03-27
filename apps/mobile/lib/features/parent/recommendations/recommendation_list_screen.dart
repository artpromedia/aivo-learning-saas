import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/data/models/recommendation.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';
import 'package:aivo_mobile/features/parent/recommendations/recommendation_card.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _filterProvider = StateProvider<String>((_) => 'pending');

final _allRecommendationsProvider =
    FutureProvider.autoDispose<List<Recommendation>>((ref) async {
  final repo = ref.watch(familyRepositoryProvider);
  // Fetch learners to get all recommendations across children
  final rawLearners = await repo.getLearners();
  final allRecs = <Recommendation>[];
  for (final learnerMap in rawLearners) {
    final learnerId = learnerMap['id'] as String;
    final recs = await repo.getRecommendations(learnerId);
    allRecs.addAll(recs);
  }
  // Sort by createdAt descending
  allRecs.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return allRecs;
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class RecommendationListScreen extends ConsumerWidget {
  const RecommendationListScreen({super.key});

  static const _filters = <String, String>{
    'pending': 'Pending',
    'approved': 'Approved',
    'declined': 'Declined',
    'all': 'All',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentFilter = ref.watch(_filterProvider);
    final asyncRecs = ref.watch(_allRecommendationsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recommendations'),
      ),
      body: Column(
        children: [
          // Filter tabs
          Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.entries.map((entry) {
                  final isSelected = currentFilter == entry.key;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Semantics(
                      selected: isSelected,
                      button: true,
                      label: '${entry.value} filter',
                      child: FilterChip(
                        label: Text(entry.value),
                        selected: isSelected,
                        onSelected: (_) {
                          ref.read(_filterProvider.notifier).state =
                              entry.key;
                        },
                        showCheckmark: false,
                        selectedColor:
                            theme.colorScheme.primaryContainer,
                        labelStyle: isSelected
                            ? theme.textTheme.labelLarge?.copyWith(
                                color: theme
                                    .colorScheme.onPrimaryContainer,
                              )
                            : theme.textTheme.labelLarge,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Recommendation list
          Expanded(
            child: asyncRecs.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (error, _) => _ErrorBody(
                message: 'Failed to load recommendations',
                onRetry: () => ref.invalidate(
                    _allRecommendationsProvider),
              ),
              data: (allRecs) {
                final recs = currentFilter == 'all'
                    ? allRecs
                    : allRecs
                        .where((r) => r.status == currentFilter)
                        .toList();

                if (recs.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.recommend_outlined,
                            size: 64,
                            color: theme.colorScheme.outlineVariant,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            currentFilter == 'pending'
                                ? 'No pending recommendations'
                                : 'No recommendations found',
                            style: theme.textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'AI-generated recommendations will appear here',
                            style: theme.textTheme.bodyMedium,
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(_allRecommendationsProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.only(
                        top: 8, bottom: 32),
                    itemCount: recs.length,
                    itemBuilder: (context, index) {
                      return RecommendationCard(
                        recommendation: recs[index],
                        onUpdated: () {
                          ref.invalidate(_allRecommendationsProvider);
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error body
// ---------------------------------------------------------------------------

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});
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
