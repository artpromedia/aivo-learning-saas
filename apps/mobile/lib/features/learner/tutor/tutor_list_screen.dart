import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _subscriptionsProvider =
    FutureProvider.autoDispose<List<TutorCatalogItem>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.tutorSubscriptions);
  final raw = response.data as List<dynamic>;
  return raw
      .map((e) => TutorCatalogItem.fromJson(e as Map<String, dynamic>))
      .toList();
});

final _sessionHistoryProvider =
    FutureProvider.autoDispose<List<TutorSession>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.get(Endpoints.tutorSessionHistory);
  final raw = response.data as List<dynamic>;
  return raw
      .map((e) => TutorSession.fromJson(e as Map<String, dynamic>))
      .toList();
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
        leading: Semantics(
          button: true,
          label: 'Go back',
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () =>
                context.canPop() ? context.pop() : context.go('/learner/home'),
          ),
        ),
      ),
      body: subsAsync.when(
        loading: () => _buildLoadingState(theme),
        error: (e, _) => _buildErrorState(context, ref, theme, e),
        data: (tutors) {
          if (tutors.isEmpty) {
            return _buildEmptyState(context, theme);
          }

          final sessions = historyAsync.value ?? [];
          final lastSessionMap = <String, DateTime>{};
          final sessionCountMap = <String, int>{};
          for (final session in sessions) {
            // Track last session date
            final existing = lastSessionMap[session.tutorId];
            if (existing == null || session.startedAt.isAfter(existing)) {
              lastSessionMap[session.tutorId] = session.startedAt;
            }
            // Track session count
            sessionCountMap[session.tutorId] =
                (sessionCountMap[session.tutorId] ?? 0) + 1;
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
                    child: Semantics(
                      button: true,
                      label: 'Browse more tutors',
                      child: OutlinedButton.icon(
                        onPressed: () =>
                            context.push('/learner/tutors/store'),
                        icon: const Icon(Icons.add),
                        label: const Text('Browse More Tutors'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48),
                        ),
                      ),
                    ),
                  );
                }

                final tutor = tutors[index];
                final lastDate = lastSessionMap[tutor.id];
                final sessionCount = sessionCountMap[tutor.id] ?? 0;

                return _TutorTile(
                  tutor: tutor,
                  lastSessionDate: lastDate,
                  sessionCount: sessionCount,
                  onTap: () =>
                      context.push('/learner/tutors/chat/${tutor.id}'),
                );
              },
            ),
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
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: 4,
        itemBuilder: (context, index) {
          return ListTile(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: const CircleAvatar(radius: 28),
            title: Container(
              height: 16,
              width: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            subtitle: Container(
              height: 12,
              width: 80,
              margin: const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
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
            Text(
              'Could not load tutors',
              style: theme.textTheme.titleMedium,
            ),
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
              label: 'Retry loading tutors',
              child: ElevatedButton.icon(
                onPressed: () => ref.invalidate(_subscriptionsProvider),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ),
          ],
        ),
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
            Semantics(
              label: 'No tutors subscribed',
              child: Icon(Icons.school_outlined,
                  size: 80, color: theme.colorScheme.outline,),
            ),
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
            Semantics(
              button: true,
              label: 'Browse tutor catalog',
              child: ElevatedButton.icon(
                onPressed: () => context.push('/learner/tutors/store'),
                icon: const Icon(Icons.storefront),
                label: const Text('Browse Tutors'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(200, 48),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tutor accent colours — used for avatar glow on 2D avatars
// ---------------------------------------------------------------------------

Color? _tutorAccentColor(TutorCatalogItem tutor) {
  switch (tutor.subject.toLowerCase()) {
    case 'sel':
      return const Color(0xFFB39DDB); // Harmony – lavender
    case 'speech':
      return const Color(0xFFFF7675); // Echo – coral
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Tutor tile
// ---------------------------------------------------------------------------

class _TutorTile extends StatelessWidget {
  const _TutorTile({
    required this.tutor,
    this.lastSessionDate,
    required this.sessionCount,
    required this.onTap,
  });

  final TutorCatalogItem tutor;
  final DateTime? lastSessionDate;
  final int sessionCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormatter = DateFormat.yMMMd();
    final accentColor = _tutorAccentColor(tutor);
    final hasGlow =
        accentColor != null && tutor.avatar.endsWith('-avatar-2d.png');

    return Semantics(
      button: true,
      label: '${tutor.name}, ${tutor.subject}'
          '${lastSessionDate != null ? ', last session ${dateFormatter.format(lastSessionDate!)}' : ''}'
          ', $sessionCount sessions',
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          decoration: hasGlow
              ? BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: accentColor.withValues(alpha: 0.45),
                      blurRadius: 10,
                      spreadRadius: 2,
                    ),
                  ],
                )
              : null,
          child: CircleAvatar(
            radius: 28,
            backgroundColor: accentColor?.withValues(alpha: 0.15),
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
        ),
        title: Text(tutor.name, style: theme.textTheme.titleMedium),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(tutor.subject, style: theme.textTheme.bodySmall),
            const SizedBox(height: 2),
            Row(
              children: [
                if (lastSessionDate != null)
                  Expanded(
                    child: Text(
                      'Last: ${dateFormatter.format(lastSessionDate!)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.outline,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                if (sessionCount > 0)
                  Text(
                    '$sessionCount sessions',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chat_bubble_outline),
        onTap: onTap,
      ),
    );
  }
}
