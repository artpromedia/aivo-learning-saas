import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';

class TeacherReportsScreen extends ConsumerWidget {
  const TeacherReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AivoColors.primary, AivoColors.primaryLight]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: Colors.white.withAlpha(51), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.bar_chart, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Reports', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                      Text('Classroom analytics and insights', style: TextStyle(color: Colors.white.withAlpha(204), fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _buildReportTile(context, 'Mastery Overview', 'View subject mastery across all learners', Icons.trending_up, AivoColors.primary),
          _buildReportTile(context, 'At-Risk Report', 'Identify learners needing intervention', Icons.warning_amber, const Color(0xFFF59E0B)),
          _buildReportTile(context, 'Session Activity', 'Review learning session engagement', Icons.schedule, const Color(0xFF3B82F6)),
          _buildReportTile(context, 'IEP Progress', 'Track IEP goal completion rates', Icons.flag, AivoColors.secondary),
          _buildReportTile(context, 'Accommodation Usage', 'See which accommodations are active', Icons.shield, const Color(0xFF8B5CF6)),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildReportTile(BuildContext context, String title, String subtitle, IconData icon, Color color) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AivoCard(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$title report coming soon')),
          );
        },
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: color.withAlpha(26), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600)),
                  Text(subtitle, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: theme.colorScheme.outline, size: 20),
          ],
        ),
      ),
    );
  }
}
