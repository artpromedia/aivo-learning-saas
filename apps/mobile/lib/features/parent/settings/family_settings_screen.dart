import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/app.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _selectedLearnerIdProvider = StateProvider<String?>((_) => null);

final _learnersProvider =
    FutureProvider.autoDispose<List<Learner>>((ref) async {
  final rawLearners =
      await ref.watch(familyRepositoryProvider).getLearners();
  return rawLearners.map((m) => Learner.fromJson(m)).toList();
});

final _settingsNotifierProvider = StateNotifierProvider.autoDispose
    .family<_SettingsNotifier, FamilySettings?, String>(
  (ref, learnerId) => _SettingsNotifier(ref, learnerId),
);

class _SettingsNotifier extends StateNotifier<FamilySettings?> {
  _SettingsNotifier(this._ref, this._learnerId) : super(null) {
    _load();
  }

  final Ref _ref;
  final String _learnerId;

  Future<void> _load() async {
    try {
      final rawSettings = await _ref
          .read(familyRepositoryProvider)
          .getSettings(_learnerId);
      if (mounted) {
        state = FamilySettings.fromJson({
          ...rawSettings,
          'learnerId': _learnerId,
        });
      }
    } catch (_) {
      // Use defaults
      if (mounted) {
        state = FamilySettings(
            learnerId: _learnerId, functioningLevel: 'standard');
      }
    }
  }

  Future<void> update(FamilySettings updated) async {
    state = updated;
    try {
      await _ref
          .read(familyRepositoryProvider)
          .updateSettings(updated.learnerId, updated.toJson());
    } catch (_) {
      // Keep local state
    }
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class FamilySettingsScreen extends ConsumerWidget {
  const FamilySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncLearners = ref.watch(_learnersProvider);
    final selectedId = ref.watch(_selectedLearnerIdProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: asyncLearners.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 16),
              const Text('Failed to load settings'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(_learnersProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (learners) {
          if (learners.isEmpty) {
            return const Center(
              child: Text('No children found. Add a child first.'),
            );
          }

          final currentId = selectedId ?? learners.first.id;
          // Ensure provider is initialized
          if (selectedId == null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              ref.read(_selectedLearnerIdProvider.notifier).state =
                  currentId;
            });
          }

          return _SettingsBody(
            learners: learners,
            currentLearnerId: currentId,
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Settings body
// ---------------------------------------------------------------------------

class _SettingsBody extends ConsumerWidget {
  const _SettingsBody({
    required this.learners,
    required this.currentLearnerId,
  });

  final List<Learner> learners;
  final String currentLearnerId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsState =
        ref.watch(_settingsNotifierProvider(currentLearnerId));
    final theme = Theme.of(context);

    if (settingsState == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final settings = settingsState;
    final notifier =
        ref.read(_settingsNotifierProvider(currentLearnerId).notifier);

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 16),
      children: [
        // Child selector
        if (learners.length > 1)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButtonFormField<String>(
              value: currentLearnerId,
              decoration: const InputDecoration(
                labelText: 'Select Child',
                prefixIcon: Icon(Icons.child_care),
              ),
              items: learners.map((l) {
                return DropdownMenuItem(
                  value: l.id,
                  child: Text(l.name),
                );
              }).toList(),
              onChanged: (id) {
                if (id != null) {
                  ref.read(_selectedLearnerIdProvider.notifier).state =
                      id;
                }
              },
            ),
          ),
        const SizedBox(height: 16),

        // ---- Accessibility ----
        _SettingsSectionHeader(title: 'Accessibility'),
        _InfoTile(
          icon: Icons.psychology,
          title: 'Functioning Level',
          subtitle: settings.functioningLevel,
        ),
        SwitchListTile(
          secondary: const Icon(Icons.font_download),
          title: const Text('OpenDyslexic Font'),
          subtitle:
              const Text('Use OpenDyslexic font throughout the app'),
          value: settings.useDyslexicFont,
          onChanged: (v) {
            notifier.update(settings.copyWith(useDyslexicFont: v));
            ref.read(dyslexicFontProvider.notifier).state = v;
          },
        ),
        ListTile(
          leading: const Icon(Icons.text_fields),
          title: const Text('Font Size'),
          subtitle: Semantics(
            label:
                'Font size scale ${settings.fontSizeScale.toStringAsFixed(1)}',
            slider: true,
            child: Slider(
              value: settings.fontSizeScale.clamp(0.8, 1.5),
              min: 0.8,
              max: 1.5,
              divisions: 7,
              label: settings.fontSizeScale.toStringAsFixed(1),
              onChanged: (v) {
                notifier.update(settings.copyWith(fontSizeScale: v));
              },
            ),
          ),
        ),
        SwitchListTile(
          secondary: const Icon(Icons.volume_up),
          title: const Text('Audio Narration'),
          subtitle: const Text('Read all text aloud'),
          value: settings.audioNarration,
          onChanged: (v) {
            notifier.update(settings.copyWith(audioNarration: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.touch_app),
          title: const Text('Switch Scanning'),
          subtitle:
              const Text('Enable switch access scanning mode'),
          value: settings.switchScan,
          onChanged: (v) {
            notifier.update(settings.copyWith(switchScan: v));
          },
        ),
        const Divider(height: 32),

        // ---- Notifications ----
        _SettingsSectionHeader(title: 'Notifications'),
        SwitchListTile(
          secondary: const Icon(Icons.notifications_active),
          title: const Text('Learning Reminders'),
          value: settings.pushLearningReminders,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushLearningReminders: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.local_fire_department),
          title: const Text('Streak Warnings'),
          value: settings.pushStreakWarnings,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushStreakWarnings: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.recommend),
          title: const Text('Recommendations'),
          value: settings.pushRecommendations,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushRecommendations: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.emoji_events),
          title: const Text('Badge Notifications'),
          value: settings.pushBadges,
          onChanged: (v) {
            notifier.update(settings.copyWith(pushBadges: v));
          },
        ),
        const Divider(height: 32),

        // ---- Privacy ----
        _SettingsSectionHeader(title: 'Privacy'),
        SwitchListTile(
          secondary: const Icon(Icons.share),
          title: const Text('Data Sharing'),
          subtitle: const Text(
              'Share anonymized learning data to improve AIVO'),
          value: settings.dataSharing,
          onChanged: (v) {
            notifier.update(settings.copyWith(dataSharing: v));
          },
        ),
        const Divider(height: 32),

        // ---- Learning ----
        _SettingsSectionHeader(title: 'Learning'),
        ListTile(
          leading: const Icon(Icons.timer),
          title: const Text('Session Duration Limit'),
          subtitle: Text(
              '${settings.sessionDurationLimitMinutes} minutes'),
          trailing: SizedBox(
            width: 160,
            child: Semantics(
              label:
                  'Session duration limit ${settings.sessionDurationLimitMinutes} minutes',
              slider: true,
              child: Slider(
                value:
                    settings.sessionDurationLimitMinutes.toDouble(),
                min: 10,
                max: 60,
                divisions: 10,
                label:
                    '${settings.sessionDurationLimitMinutes} min',
                onChanged: (v) {
                  notifier.update(settings.copyWith(
                    sessionDurationLimitMinutes: v.toInt(),
                  ));
                },
              ),
            ),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.flag),
          title: const Text('Daily Goal'),
          subtitle: Text('${settings.dailyGoalMinutes} minutes'),
          trailing: SizedBox(
            width: 160,
            child: Semantics(
              label:
                  'Daily goal ${settings.dailyGoalMinutes} minutes',
              slider: true,
              child: Slider(
                value: settings.dailyGoalMinutes.toDouble(),
                min: 5,
                max: 60,
                divisions: 11,
                label: '${settings.dailyGoalMinutes} min',
                onChanged: (v) {
                  notifier.update(settings.copyWith(
                    dailyGoalMinutes: v.toInt(),
                  ));
                },
              ),
            ),
          ),
        ),
        _SubjectToggles(
          enabledSubjects: settings.enabledSubjects,
          onChanged: (subjects) {
            notifier.update(
                settings.copyWith(enabledSubjects: subjects));
          },
        ),
        const Divider(height: 32),

        // ---- Account ----
        _SettingsSectionHeader(title: 'Account'),
        ListTile(
          leading: const Icon(Icons.lock_outline),
          title: const Text('Change Password'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Password change coming soon')),
            );
          },
        ),
        ListTile(
          leading: const Icon(Icons.email_outlined),
          title: const Text('Change Email'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Email change coming soon')),
            );
          },
        ),
        ListTile(
          leading: Icon(Icons.delete_forever,
              color: theme.colorScheme.error),
          title: Text('Delete Account',
              style: TextStyle(color: theme.colorScheme.error)),
          onTap: () => _confirmDeleteAccount(context, ref),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Future<void> _confirmDeleteAccount(
      BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'This action is permanent and cannot be undone. '
          'All your data and your children\'s learning data will be removed.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(
                foregroundColor: AivoColors.error),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    await ref.read(authProvider.notifier).logout();
    if (context.mounted) {
      context.go('/login');
    }
  }
}

// ---------------------------------------------------------------------------
// Subject toggles
// ---------------------------------------------------------------------------

class _SubjectToggles extends StatelessWidget {
  const _SubjectToggles({
    required this.enabledSubjects,
    required this.onChanged,
  });

  final List<String> enabledSubjects;
  final ValueChanged<List<String>> onChanged;

  static const _allSubjects = [
    'math',
    'reading',
    'science',
    'social_studies',
    'writing',
    'art',
    'music',
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 8,
        runSpacing: 4,
        children: _allSubjects.map((subject) {
          final isEnabled = enabledSubjects.contains(subject);
          final displayName = subject
              .replaceAll('_', ' ')
              .split(' ')
              .map((w) => w.isNotEmpty
                  ? '${w[0].toUpperCase()}${w.substring(1)}'
                  : w)
              .join(' ');
          return FilterChip(
            label: Text(displayName),
            selected: isEnabled,
            onSelected: (selected) {
              final updated = List<String>.from(enabledSubjects);
              if (selected) {
                updated.add(subject);
              } else {
                updated.remove(subject);
              }
              onChanged(updated);
            },
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Settings section header
// ---------------------------------------------------------------------------

class _SettingsSectionHeader extends StatelessWidget {
  const _SettingsSectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Semantics(
        header: true,
        child: Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Info tile (non-interactive)
// ---------------------------------------------------------------------------

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
    );
  }
}
