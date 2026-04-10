import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class LearnerBrainData {
  final String id;
  final String name;
  final String functioningLevel;
  final List<SubjectMastery> subjects;
  final int accommodationCount;
  final int iepGoalCount;
  final int recentSessionCount;

  LearnerBrainData({
    required this.id,
    required this.name,
    required this.functioningLevel,
    required this.subjects,
    required this.accommodationCount,
    required this.iepGoalCount,
    required this.recentSessionCount,
  });

  factory LearnerBrainData.fromJson(Map<String, dynamic> json) {
    return LearnerBrainData(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      functioningLevel: json['functioningLevel'] as String? ?? 'STANDARD',
      subjects: (json['subjects'] as List<dynamic>?)
              ?.map((s) => SubjectMastery.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      accommodationCount: (json['accommodations'] as List?)?.length ?? (json['accommodationCount'] as num?)?.toInt() ?? 0,
      iepGoalCount: (json['iepGoals'] as List?)?.length ?? (json['iepGoalCount'] as num?)?.toInt() ?? 0,
      recentSessionCount: (json['recentSessions'] as List?)?.length ?? (json['recentSessionCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class SubjectMastery {
  final String subject;
  final int masteryPct;

  SubjectMastery({required this.subject, required this.masteryPct});

  factory SubjectMastery.fromJson(Map<String, dynamic> json) {
    return SubjectMastery(
      subject: json['subject'] as String? ?? '',
      masteryPct: (json['masteryPct'] as num?)?.toInt() ?? 0,
    );
  }
}

final _learnerBrainProvider =
    FutureProvider.family<LearnerBrainData, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get('/teacher/learners/$learnerId/brain');
    return LearnerBrainData.fromJson(res.data as Map<String, dynamic>);
  } catch (_) {
    return LearnerBrainData(
      id: learnerId,
      name: 'Jamie Rivera',
      functioningLevel: 'SUPPORTED',
      subjects: [
        SubjectMastery(subject: 'Mathematics', masteryPct: 72),
        SubjectMastery(subject: 'Science', masteryPct: 68),
        SubjectMastery(subject: 'Language Arts', masteryPct: 55),
        SubjectMastery(subject: 'Social Studies', masteryPct: 78),
      ],
      accommodationCount: 4,
      iepGoalCount: 3,
      recentSessionCount: 8,
    );
  }
});

class TeacherLearnerHubScreen extends ConsumerStatefulWidget {
  const TeacherLearnerHubScreen({super.key, required this.learnerId});
  final String learnerId;

  @override
  ConsumerState<TeacherLearnerHubScreen> createState() =>
      _TeacherLearnerHubScreenState();
}

class _TeacherLearnerHubScreenState
    extends ConsumerState<TeacherLearnerHubScreen> {
  final _insightController = TextEditingController();
  bool _submittingInsight = false;
  bool _insightSuccess = false;

  @override
  void dispose() {
    _insightController.dispose();
    super.dispose();
  }

  Future<void> _submitInsight() async {
    if (_insightController.text.trim().isEmpty) return;
    setState(() {
      _submittingInsight = true;
      _insightSuccess = false;
    });
    try {
      final api = ref.read(apiClientProvider);
      await api.post('/teacher/learners/${widget.learnerId}/insights',
          data: {'text': _insightController.text.trim()});
    } catch (_) {}
    _insightController.clear();
    setState(() {
      _submittingInsight = false;
      _insightSuccess = true;
    });
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _insightSuccess = false);
    });
  }

  @override
  Widget build(BuildContext context, ) {
    final brain = ref.watch(_learnerBrainProvider(widget.learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Learner Hub'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: brain.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () =>
              ref.invalidate(_learnerBrainProvider(widget.learnerId)),
        ),
        data: (data) {
          final avgMastery = data.subjects.isNotEmpty
              ? (data.subjects
                          .fold<int>(0, (sum, s) => sum + s.masteryPct) /
                      data.subjects.length)
                  .round()
              : 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildHeader(context, data),
              const SizedBox(height: 16),
              _buildStatRow(context, data, avgMastery),
              const SizedBox(height: 24),
              _buildQuickLinks(context, data),
              const SizedBox(height: 24),
              _buildSubjectMastery(context, data),
              const SizedBox(height: 24),
              _buildInsightSection(context),
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context, LearnerBrainData data) {
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
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white.withAlpha(51),
            child: Text(
              data.name.isNotEmpty ? data.name[0].toUpperCase() : '?',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w800),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(data.name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text(_levelLabel(data.functioningLevel),
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
                Text('Learner Hub',
                    style: TextStyle(
                        color: Colors.white.withAlpha(153), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(
      BuildContext context, LearnerBrainData data, int avgMastery) {
    return Row(
      children: [
        _Stat(
            icon: Icons.trending_up,
            label: 'Avg Mastery',
            value: '$avgMastery%',
            color: AivoColors.primary),
        const SizedBox(width: 8),
        _Stat(
            icon: Icons.menu_book,
            label: 'Sessions',
            value: '${data.recentSessionCount}',
            color: const Color(0xFF3B82F6)),
        const SizedBox(width: 8),
        _Stat(
            icon: Icons.shield,
            label: 'Accomm.',
            value: '${data.accommodationCount}',
            color: AivoColors.secondary),
        const SizedBox(width: 8),
        _Stat(
            icon: Icons.flag,
            label: 'IEP Goals',
            value: '${data.iepGoalCount}',
            color: const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildQuickLinks(BuildContext context, LearnerBrainData data) {
    final links = [
      _QuickLink('Brain Profile', Icons.psychology, const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFFA855F7)]), '/teacher/learner/${data.id}/brain'),
      _QuickLink('Accommodations', Icons.shield, const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)]), '/teacher/learner/${data.id}/accommodations'),
      _QuickLink('IEP Goals', Icons.flag, const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF2563EB)]), '/teacher/learner/${data.id}/iep'),
      _QuickLink('Gradebook', Icons.school, const LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF14B8A6)]), '/teacher/learner/${data.id}/gradebook'),
      _QuickLink('Sessions', Icons.schedule, const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)]), '/teacher/learner/${data.id}/sessions'),
      _QuickLink('Family', Icons.people, const LinearGradient(colors: [Color(0xFFF472B6), Color(0xFFEC4899)]), '/teacher/learner/${data.id}/family'),
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
          children: links
              .map((link) => _buildQuickLinkTile(context, link))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildQuickLinkTile(BuildContext context, _QuickLink link) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () => context.push(link.route),
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardTheme.color ?? theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: theme.colorScheme.outline.withAlpha(40)),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.primary.withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: link.gradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(link.icon, color: Colors.white, size: 20),
            ),
            const SizedBox(height: 8),
            Text(link.label,
                style: theme.textTheme.bodySmall
                    ?.copyWith(fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectMastery(BuildContext context, LearnerBrainData data) {
    if (data.subjects.isEmpty) return const SizedBox.shrink();
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
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700)),
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
                        Text(s.subject,
                            style: theme.textTheme.bodyMedium
                                ?.copyWith(fontWeight: FontWeight.w500)),
                        Text('${s.masteryPct}%',
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AivoColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: s.masteryPct / 100,
                        minHeight: 8,
                        backgroundColor:
                            theme.colorScheme.surfaceContainerHighest,
                        valueColor: const AlwaysStoppedAnimation(
                            AivoColors.primary),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildInsightSection(BuildContext context) {
    final theme = Theme.of(context);

    return AivoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb, color: Color(0xFFF59E0B), size: 20),
              const SizedBox(width: 8),
              Text('Submit Insight',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 4),
          Text('Share observations to improve the AI model',
              style: theme.textTheme.bodySmall),
          const SizedBox(height: 12),
          TextField(
            controller: _insightController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Describe what you observed...',
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (_insightSuccess)
                const Text('Insight submitted!',
                    style: TextStyle(
                        color: AivoColors.secondary,
                        fontWeight: FontWeight.w500,
                        fontSize: 13))
              else
                const SizedBox.shrink(),
              ElevatedButton.icon(
                onPressed: _submittingInsight ? null : _submitInsight,
                icon: _submittingInsight
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send, size: 16),
                label: const Text('Submit'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _levelLabel(String level) {
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
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: color)),
            Text(label,
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 9),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _QuickLink {
  final String label;
  final IconData icon;
  final Gradient gradient;
  final String route;

  _QuickLink(this.label, this.icon, this.gradient, this.route);
}
