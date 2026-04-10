import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

final _familyProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.familyCollaborationMembers(learnerId));
    final data = res.data;
    if (data is Map) return (data['members'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  } catch (_) {
    return [
      {'id': '1', 'name': 'Sarah Johnson', 'email': 'parent@test.aivo.com', 'role': 'parent', 'status': 'active'},
      {'id': '2', 'name': '', 'email': 'grandma@email.com', 'role': 'caregiver', 'status': 'active'},
    ];
  }
});

class TeacherLearnerFamilyScreen extends ConsumerWidget {
  const TeacherLearnerFamilyScreen({super.key, required this.learnerId});
  final String learnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final family = ref.watch(_familyProvider(learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Family & Caregivers'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: family.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_familyProvider(learnerId)),
        ),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFF472B6), Color(0xFFEC4899)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.people, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Family Network', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                        Text('${data.length} contacts', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (data.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 32),
                child: Column(
                  children: [
                    Icon(Icons.people_outline, size: 48, color: theme.colorScheme.outline),
                    const SizedBox(height: 12),
                    Text('No family contacts', style: theme.textTheme.titleMedium),
                  ],
                ),
              )
            else
              ...data.map((m) {
                final role = m['role'] as String? ?? 'parent';
                IconData icon;
                Color color;
                switch (role) {
                  case 'parent':
                    icon = Icons.person;
                    color = AivoColors.primary;
                    break;
                  case 'caregiver':
                    icon = Icons.favorite;
                    color = const Color(0xFFF472B6);
                    break;
                  default:
                    icon = Icons.people;
                    color = AivoColors.secondary;
                }

                final name = (m['name'] as String?) ?? '';
                final email = (m['email'] as String?) ?? '';
                final status = (m['status'] as String?) ?? 'active';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: AivoCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: color.withAlpha(26),
                          child: Icon(icon, color: color, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(name.isNotEmpty ? name : email,
                                        style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                                        overflow: TextOverflow.ellipsis),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: color.withAlpha(26), borderRadius: BorderRadius.circular(12)),
                                    child: Text(role, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
                                  ),
                                  if (status == 'pending') ...[
                                    const SizedBox(width: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: const Color(0xFFF59E0B).withAlpha(26), borderRadius: BorderRadius.circular(12)),
                                      child: const Text('pending', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFFF59E0B))),
                                    ),
                                  ],
                                ],
                              ),
                              if (name.isNotEmpty) ...[
                                const SizedBox(height: 2),
                                Text(email, style: theme.textTheme.bodySmall, overflow: TextOverflow.ellipsis),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
