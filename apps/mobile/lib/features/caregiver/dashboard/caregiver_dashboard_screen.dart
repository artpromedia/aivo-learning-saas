import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class CaregiverChild {
  final String id;
  final String name;
  final String functioningLevel;
  final String? grade;
  final int mastery;
  final int recentSessionCount;
  final int accommodationCount;
  final int iepGoalCount;
  final List<SubjectData> subjects;

  CaregiverChild({
    required this.id,
    required this.name,
    required this.functioningLevel,
    this.grade,
    required this.mastery,
    required this.recentSessionCount,
    required this.accommodationCount,
    required this.iepGoalCount,
    required this.subjects,
  });

  factory CaregiverChild.fromJson(Map<String, dynamic> json) {
    return CaregiverChild(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      functioningLevel: json['functioningLevel'] as String? ?? 'STANDARD',
      grade: json['grade'] as String?,
      mastery: (json['mastery'] as num?)?.toInt() ?? 0,
      recentSessionCount: (json['recentSessionCount'] as num?)?.toInt() ?? 0,
      accommodationCount: (json['accommodationCount'] as num?)?.toInt() ?? 0,
      iepGoalCount: (json['iepGoalCount'] as num?)?.toInt() ?? 0,
      subjects: (json['subjects'] as List<dynamic>?)
              ?.map((s) => SubjectData.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class SubjectData {
  final String name;
  final int mastery;

  SubjectData({required this.name, required this.mastery});

  factory SubjectData.fromJson(Map<String, dynamic> json) {
    return SubjectData(
      name: json['name'] as String? ?? '',
      mastery: (json['mastery'] as num?)?.toInt() ?? 0,
    );
  }
}

final _caregiverChildProvider =
    FutureProvider<CaregiverChild>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(Endpoints.caregiverChild);
    return CaregiverChild.fromJson(res.data as Map<String, dynamic>);
  } catch (_) {
    return CaregiverChild(
      id: 'learner-001',
      name: 'Alex Johnson',
      functioningLevel: 'SUPPORTED',
      grade: '3rd Grade',
      mastery: 72,
      recentSessionCount: 4,
      accommodationCount: 4,
      iepGoalCount: 3,
      subjects: [
        SubjectData(name: 'Mathematics', mastery: 85),
        SubjectData(name: 'Science', mastery: 75),
        SubjectData(name: 'Language Arts', mastery: 58),
        SubjectData(name: 'Social Studies', mastery: 70),
      ],
    );
  }
});

class CaregiverDashboardScreen extends ConsumerWidget {
  const CaregiverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final child = ref.watch(_caregiverChildProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: child.when(
        loading: () => LoadingShimmer.list(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(_caregiverChildProvider),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(_caregiverChildProvider),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildHeader(context, data),
              const SizedBox(height: 16),
              _buildStatRow(context, data),
              const SizedBox(height: 24),
              _buildQuickLinks(context, data),
              const SizedBox(height: 24),
              if (data.subjects.isNotEmpty) _buildSubjectMastery(context, data),
              const SizedBox(height: 24),
              _buildEncouragementCard(context, data),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, CaregiverChild data) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AivoColors.primary, AivoColors.primaryLight],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(51),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.favorite, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Welcome, Caregiver',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text('Viewing ${data.name}\'s profile',
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
                if (data.grade != null)
                  Text(
                      '${data.grade} · ${_levelLabel(data.functioningLevel)}',
                      style: TextStyle(
                          color: Colors.white.withAlpha(153), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, CaregiverChild data) {
    return Row(
      children: [
        _Stat(icon: Icons.trending_up, label: 'Avg Mastery', value: '${data.mastery}%', color: AivoColors.primary),
        const SizedBox(width: 8),
        _Stat(icon: Icons.menu_book, label: 'Sessions', value: '${data.recentSessionCount}', color: const Color(0xFF3B82F6)),
        const SizedBox(width: 8),
        _Stat(icon: Icons.shield, label: 'Accomm.', value: '${data.accommodationCount}', color: AivoColors.secondary),
        const SizedBox(width: 8),
        _Stat(icon: Icons.flag, label: 'IEP Goals', value: '${data.iepGoalCount}', color: const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildQuickLinks(BuildContext context, CaregiverChild data) {
    final links = [
      _Link('Brain Profile', Icons.psychology, const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]), '/caregiver/brain'),
      _Link('Accommodations', Icons.shield, const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)]), '/caregiver/accommodations'),
      _Link('IEP Goals', Icons.flag, const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]), '/caregiver/iep'),
      _Link('Gradebook', Icons.school, const LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF14B8A6)]), '/caregiver/gradebook'),
      _Link('Sessions', Icons.schedule, const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]), '/caregiver/sessions'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Navigation',
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 0.9,
          children: links.map((link) {
            final theme = Theme.of(context);
            return GestureDetector(
              onTap: () => context.push(link.route),
              child: Container(
                decoration: BoxDecoration(
                  color: theme.cardTheme.color ?? theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.colorScheme.outline.withAlpha(40)),
                ),
                padding: const EdgeInsets.all(12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(gradient: link.gradient, borderRadius: BorderRadius.circular(12)),
                      child: Icon(link.icon, color: Colors.white, size: 20),
                    ),
                    const SizedBox(height: 8),
                    Text(link.label,
                        style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildSubjectMastery(BuildContext context, CaregiverChild data) {
    final theme = Theme.of(context);
    return AivoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.school, color: AivoColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('Subject Mastery',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
              const Spacer(),
              GestureDetector(
                onTap: () => context.push('/caregiver/gradebook'),
                child: Text('View All',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AivoColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...data.subjects.map((s) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(s.name, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                        Text('${s.mastery}%',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AivoColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: s.mastery / 100,
                        minHeight: 8,
                        backgroundColor: theme.colorScheme.surfaceContainerHighest,
                        valueColor: const AlwaysStoppedAnimation(AivoColors.primary),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildEncouragementCard(BuildContext context, CaregiverChild data) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outline.withAlpha(40)),
      ),
      child: Column(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFF472B6), Color(0xFFEC4899)]),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.favorite, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 12),
          Text("You're making a difference!",
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(
            "Your support helps ${data.name} learn and grow every day.",
            style: theme.textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  static String _levelLabel(String level) {
    const labels = {
      'STANDARD': 'Standard',
      'SUPPORTED': 'Supported',
      'LOW_VERBAL': 'Low Verbal',
      'NON_VERBAL': 'Non-Verbal',
      'PRE_SYMBOLIC': 'Pre-Symbolic',
    };
    return labels[level] ?? level;
  }
}

class _Stat extends StatelessWidget {
  const _Stat({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: color.withAlpha(18),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withAlpha(40)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(height: 2),
            Text(value,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color)),
            Text(label,
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 9),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _Link {
  final String label;
  final IconData icon;
  final Gradient gradient;
  final String route;

  _Link(this.label, this.icon, this.gradient, this.route);
}
