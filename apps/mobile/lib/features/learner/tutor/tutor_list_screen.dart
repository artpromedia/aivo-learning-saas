import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/data/models/tutor_session.dart';
import 'package:aivo_mobile/data/repositories/tutor_repository.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _subscriptionsProvider =
    FutureProvider.autoDispose<List<TutorCatalogItem>>((ref) async {
  final repo = ref.watch(tutorRepositoryProvider);
  return repo.getSubscriptions();
});

final _sessionHistoryProvider =
    FutureProvider.autoDispose<List<TutorSession>>((ref) async {
  final repo = ref.watch(tutorRepositoryProvider);
  return repo.getSessionHistory();
});

// ---------------------------------------------------------------------------
// TutorListScreen
// ---------------------------------------------------------------------------

class TutorListScreen extends ConsumerWidget {
  const TutorListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subsAsync = ref.watch(_subscriptionsProvider);
    final historyAsync = ref.watch(_sessionHistoryProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tutors'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/learner/home'),
        ),
      ),
      body: subsAsync.when(
        loading: () => LoadingShimmer.list(itemCount: 4),
        error: (e, _) => ErrorView.fullScreen(
          message: 'Could not load tutors.\n$e',
          onRetry: () => ref.invalidate(_subscriptionsProvider),
        ),
        data: (tutors) {
          if (tutors.isEmpty) {
            return _buildEmptyState(context, theme);
          }

          final sessions = historyAsync.valueOrNull ?? [];
          final lastSessionMap = <String, DateTime>{};
          for (final session in sessions) {
            final existing = lastSessionMap[session.tutorId];
            if (existing == null || session.startedAt.isAfter(existing)) {
              lastSessionMap[session.tutorId] = session.startedAt;
            }
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(_subscriptionsProvider);
              ref.invalidate(_sessionHistoryProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: tutors.length + 1,
              itemBuilder: (context, index) {
                if (index == tutors.length) {
                  return Padding(
                    padding: const EdgeInsets.all(16),
                    child: OutlinedButton.icon(
                      onPressed: () => context.push('/learner/tutors/store'),
                      icon: const Icon(Icons.add),
                      label: const Text('Browse More Tutors'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                      ),
                    ),
                  );
                }

                final tutor = tutors[index];
                final lastDate = lastSessionMap[tutor.id];

                return _TutorTile(
                  tutor: tutor,
                  lastSessionDate: lastDate,
                  onTap: () => context.push('/learner/tutors/chat/${tutor.id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.school_outlined,
                size: 80, color: theme.colorScheme.outline),
            const SizedBox(height: 24),
            Text(
              'No Tutors Yet',
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Browse our tutor catalog to find the perfect learning companion.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.push('/learner/tutors/store'),
              icon: const Icon(Icons.storefront),
              label: const Text('Browse Tutors'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(200, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tutor tile
// ---------------------------------------------------------------------------

class _TutorTile extends StatelessWidget {
  const _TutorTile({
    required this.tutor,
    this.lastSessionDate,
    required this.onTap,
  });

  final TutorCatalogItem tutor;
  final DateTime? lastSessionDate;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormatter = DateFormat.yMMMd();

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: CircleAvatar(
        radius: 28,
        backgroundImage: tutor.avatar.isNotEmpty
            ? CachedNetworkImageProvider(tutor.avatar)
            : null,
        child: tutor.avatar.isEmpty
            ? Text(
                tutor.name.isNotEmpty ? tutor.name[0].toUpperCase() : 'T',
                style: const TextStyle(fontSize: 20),
              )
            : null,
      ),
      title: Text(tutor.name,
          style: theme.textTheme.titleMedium),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tutor.subject, style: theme.textTheme.bodySmall),
          if (lastSessionDate != null)
            Text(
              'Last session: ${dateFormatter.format(lastSessionDate!)}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
        ],
      ),
      trailing: const Icon(Icons.chat_bubble_outline),
      onTap: onTap,
    );
  }
}
