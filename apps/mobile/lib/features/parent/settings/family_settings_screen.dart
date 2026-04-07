import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/app.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/i18n/translation_ext.dart';
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
            learnerId: _learnerId, functioningLevel: 'standard',);
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
    final t = ref.t;

    return Scaffold(
      appBar: AppBar(title: Text(t('settings.settings'))),
      body: asyncLearners.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error,),
              const SizedBox(height: 16),
              Text(t('settings.failedToLoad')),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(_learnersProvider),
                child: Text(t('common.retry')),
              ),
            ],
          ),
        ),
        data: (learners) {
          if (learners.isEmpty) {
            return Center(
              child: Text(t('settings.noChildrenFound')),
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
    final t = ref.t;

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
              initialValue: currentLearnerId,
              decoration: InputDecoration(
                labelText: t('settings.selectChild'),
                prefixIcon: const Icon(Icons.child_care),
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
        _SettingsSectionHeader(title: t('settings.accessibility')),
        _InfoTile(
          icon: Icons.psychology,
          title: t('settings.functioningLevel'),
          subtitle: settings.functioningLevel,
        ),
        SwitchListTile(
          secondary: const Icon(Icons.font_download),
          title: Text(t('settings.dyslexicFont')),
          subtitle: Text(t('settings.dyslexicFontDesc')),
          value: settings.useDyslexicFont,
          onChanged: (v) {
            notifier.update(settings.copyWith(useDyslexicFont: v));
            ref.read(dyslexicFontProvider.notifier).state = v;
          },
        ),
        ListTile(
          leading: const Icon(Icons.text_fields),
          title: Text(t('settings.fontSize')),
          subtitle: Semantics(
            label:
                '${t('settings.fontSize')} ${settings.fontSizeScale.toStringAsFixed(1)}',
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
          title: Text(t('settings.audioNarration')),
          subtitle: Text(t('settings.audioNarrationDesc')),
          value: settings.audioNarration,
          onChanged: (v) {
            notifier.update(settings.copyWith(audioNarration: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.touch_app),
          title: Text(t('settings.switchScanning')),
          subtitle: Text(t('settings.switchScanningDesc')),
          value: settings.switchScan,
          onChanged: (v) {
            notifier.update(settings.copyWith(switchScan: v));
          },
        ),
        const Divider(height: 32),

        // ---- Notifications ----
        _SettingsSectionHeader(title: t('settings.notifications')),
        SwitchListTile(
          secondary: const Icon(Icons.notifications_active),
          title: Text(t('settings.learningReminders')),
          value: settings.pushLearningReminders,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushLearningReminders: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.local_fire_department),
          title: Text(t('settings.streakWarnings')),
          value: settings.pushStreakWarnings,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushStreakWarnings: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.recommend),
          title: Text(t('settings.recommendationNotifs')),
          value: settings.pushRecommendations,
          onChanged: (v) {
            notifier
                .update(settings.copyWith(pushRecommendations: v));
          },
        ),
        SwitchListTile(
          secondary: const Icon(Icons.emoji_events),
          title: Text(t('settings.badgeNotifs')),
          value: settings.pushBadges,
          onChanged: (v) {
            notifier.update(settings.copyWith(pushBadges: v));
          },
        ),
        const Divider(height: 32),

        // ---- Privacy ----
        _SettingsSectionHeader(title: t('settings.privacy')),
        SwitchListTile(
          secondary: const Icon(Icons.share),
          title: Text(t('settings.dataSharing')),
          subtitle: Text(t('settings.dataSharingDesc')),
          value: settings.dataSharing,
          onChanged: (v) {
            notifier.update(settings.copyWith(dataSharing: v));
          },
        ),
        const Divider(height: 32),

        // ---- Learning ----
        _SettingsSectionHeader(title: t('settings.learningSection')),
        ListTile(
          leading: const Icon(Icons.timer),
          title: Text(t('settings.sessionDuration')),
          subtitle: Text(
              '${settings.sessionDurationLimitMinutes} minutes',),
          trailing: SizedBox(
            width: 160,
            child: Semantics(
              label:
                  '${t('settings.sessionDuration')} ${settings.sessionDurationLimitMinutes} minutes',
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
                  ),);
                },
              ),
            ),
          ),
        ),
        ListTile(
          leading: const Icon(Icons.flag),
          title: Text(t('settings.dailyGoal')),
          subtitle: Text('${settings.dailyGoalMinutes} minutes'),
          trailing: SizedBox(
            width: 160,
            child: Semantics(
              label:
                  '${t('settings.dailyGoal')} ${settings.dailyGoalMinutes} minutes',
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
                  ),);
                },
              ),
            ),
          ),
        ),
        _SubjectToggles(
          enabledSubjects: settings.enabledSubjects,
          onChanged: (subjects) {
            notifier.update(
                settings.copyWith(enabledSubjects: subjects),);
          },
        ),
        const Divider(height: 32),

        // ---- Learner PIN ----
        _SettingsSectionHeader(title: t('settings.learnerPin')),
        _PinManagementTile(learnerId: currentLearnerId),
        const Divider(height: 32),

        // ---- Account ----
        _SettingsSectionHeader(title: t('settings.account')),
        ListTile(
          leading: const Icon(Icons.lock_outline),
          title: Text(t('settings.changePassword')),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(t('settings.changePasswordComingSoon')),),
            );
          },
        ),
        ListTile(
          leading: const Icon(Icons.email_outlined),
          title: Text(t('settings.changeEmail')),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(t('settings.changeEmailComingSoon')),),
            );
          },
        ),
        ListTile(
          leading: Icon(Icons.delete_forever,
              color: theme.colorScheme.error,),
          title: Text(t('settings.deleteAccount'),
              style: TextStyle(color: theme.colorScheme.error),),
          onTap: () => _confirmDeleteAccount(context, ref),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Future<void> _confirmDeleteAccount(
      BuildContext context, WidgetRef ref,) async {
    final t = ref.t;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t('settings.deleteAccount')),
        content: Text(t('settings.deleteAccountConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(t('common.cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(
                foregroundColor: AivoColors.error,),
            child: Text(t('settings.deleteAccount')),
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

class _SubjectToggles extends ConsumerWidget {
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
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.t;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 8,
        runSpacing: 4,
        children: _allSubjects.map((subject) {
          final isEnabled = enabledSubjects.contains(subject);
          final displayName = t('settings.subject_$subject');
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

// ---------------------------------------------------------------------------
// PIN management tile
// ---------------------------------------------------------------------------

class _PinManagementTile extends ConsumerStatefulWidget {
  const _PinManagementTile({required this.learnerId});
  final String learnerId;

  @override
  ConsumerState<_PinManagementTile> createState() =>
      _PinManagementTileState();
}

class _PinManagementTileState extends ConsumerState<_PinManagementTile> {
  final _pinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  bool _isUpdating = false;
  String? _successMessage;
  String? _errorMessage;

  @override
  void dispose() {
    _pinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  Future<void> _handleSetPin() async {
    final t = ref.t;
    final pin = _pinController.text.trim();
    final confirm = _confirmPinController.text.trim();

    if (!RegExp(r'^\d{4,6}$').hasMatch(pin)) {
      setState(() => _errorMessage = t('settings.pinMustBeDigits'));
      return;
    }
    if (pin != confirm) {
      setState(() => _errorMessage = t('settings.pinsDoNotMatch'));
      return;
    }

    setState(() {
      _isUpdating = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repo = ref.read(familyRepositoryProvider);
      await repo.setLearnerPin(widget.learnerId, pin);
      setState(() {
        _successMessage = t('settings.pinUpdated');
        _pinController.clear();
        _confirmPinController.clear();
      });
    } catch (e) {
      setState(() => _errorMessage = t('settings.pinFailed'));
    } finally {
      setState(() => _isUpdating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = ref.t;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            t('settings.pinDescription'),
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _pinController,
            keyboardType: TextInputType.number,
            obscureText: true,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(letterSpacing: 8, fontSize: 18),
            decoration: InputDecoration(
              labelText: t('settings.newPin'),
              hintText: '••••',
              counterText: '',
              prefixIcon: const Icon(Icons.pin_outlined),
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _confirmPinController,
            keyboardType: TextInputType.number,
            obscureText: true,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(letterSpacing: 8, fontSize: 18),
            decoration: InputDecoration(
              labelText: t('settings.confirmPin'),
              hintText: '••••',
              counterText: '',
              prefixIcon: const Icon(Icons.pin_outlined),
            ),
          ),
          const SizedBox(height: 12),
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_errorMessage!,
                  style: TextStyle(color: theme.colorScheme.error, fontSize: 13)),
            ),
          if (_successMessage != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_successMessage!,
                  style: TextStyle(color: AivoColors.secondary, fontSize: 13)),
            ),
          ElevatedButton.icon(
            onPressed: _isUpdating ? null : _handleSetPin,
            icon: _isUpdating
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.lock_reset),
            label: Text(t('settings.setPin')),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
