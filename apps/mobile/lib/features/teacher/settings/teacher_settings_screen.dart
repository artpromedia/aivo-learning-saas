import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';

class TeacherSettingsScreen extends ConsumerWidget {
  const TeacherSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection(context, 'Account', [
            _SettingsItem('Profile', Icons.person, () {}),
            _SettingsItem('Notifications', Icons.notifications, () {}),
            _SettingsItem('Email Preferences', Icons.email, () {}),
          ]),
          const SizedBox(height: 20),
          _buildSection(context, 'Classroom', [
            _SettingsItem('Default View', Icons.view_agenda, () {}),
            _SettingsItem('Report Format', Icons.description, () {}),
          ]),
          const SizedBox(height: 20),
          _buildSection(context, 'App', [
            _SettingsItem('About AIVO', Icons.info, () {}),
            _SettingsItem('Help & Support', Icons.help, () {}),
            _SettingsItem('Log Out', Icons.logout, () {
              context.go('/login');
            }, isDestructive: true),
          ]),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, List<_SettingsItem> items) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(title, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        ),
        AivoCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: items.asMap().entries.map((entry) {
              final item = entry.value;
              final isLast = entry.key == items.length - 1;
              return Column(
                children: [
                  ListTile(
                    leading: Icon(item.icon,
                        color: item.isDestructive ? AivoColors.error : AivoColors.primary,
                        size: 22),
                    title: Text(item.label,
                        style: TextStyle(
                            color: item.isDestructive ? AivoColors.error : null,
                            fontWeight: FontWeight.w500)),
                    trailing: Icon(Icons.chevron_right,
                        size: 18, color: theme.colorScheme.outline),
                    onTap: item.onTap,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                  ),
                  if (!isLast) Divider(height: 1, indent: 56, color: theme.colorScheme.outline.withAlpha(40)),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _SettingsItem {
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool isDestructive;

  _SettingsItem(this.label, this.icon, this.onTap, {this.isDestructive = false});
}
