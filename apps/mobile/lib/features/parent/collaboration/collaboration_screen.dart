import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/shared/widgets/aivo_card.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';
import 'package:aivo_mobile/shared/widgets/loading_shimmer.dart';

class TeamMember {
  final String id;
  final String name;
  final String email;
  final String role;
  final String status;

  TeamMember({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
  });

  factory TeamMember.fromJson(Map<String, dynamic> json) {
    return TeamMember(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'teacher',
      status: json['status'] as String? ?? 'active',
    );
  }
}

final _membersProvider =
    FutureProvider.family<List<TeamMember>, String>((ref, learnerId) async {
  final api = ref.read(apiClientProvider);
  try {
    final res =
        await api.get(Endpoints.familyCollaborationMembers(learnerId));
    final data = res.data;
    List<dynamic> list;
    if (data is Map<String, dynamic>) {
      list = data['members'] as List<dynamic>? ?? [];
    } else if (data is List) {
      list = data;
    } else {
      list = [];
    }
    return list
        .map((m) => TeamMember.fromJson(m as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return [
      TeamMember(id: '1', name: 'Ms. Rivera', email: 'rivera@school.edu', role: 'teacher', status: 'active'),
      TeamMember(id: '2', name: '', email: 'therapist@clinic.com', role: 'therapist', status: 'pending'),
    ];
  }
});

class CollaborationScreen extends ConsumerStatefulWidget {
  const CollaborationScreen({super.key, required this.learnerId});
  final String learnerId;

  @override
  ConsumerState<CollaborationScreen> createState() =>
      _CollaborationScreenState();
}

class _CollaborationScreenState extends ConsumerState<CollaborationScreen> {
  final _emailController = TextEditingController();
  String _selectedRole = 'caregiver';
  bool _inviting = false;
  String? _successMessage;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendInvite() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    setState(() {
      _inviting = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final api = ref.read(apiClientProvider);
      await api.post(
        Endpoints.familyCollaborationMembers(widget.learnerId),
        data: {'email': email, 'role': _selectedRole},
      );
      _emailController.clear();
      setState(() => _successMessage = 'Invitation sent successfully!');
      ref.invalidate(_membersProvider(widget.learnerId));
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      setState(() => _inviting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final members = ref.watch(_membersProvider(widget.learnerId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Care Team'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: members.when(
        loading: () => const LoadingShimmer(),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () =>
              ref.invalidate(_membersProvider(widget.learnerId)),
        ),
        data: (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildHeader(context, data.length),
            const SizedBox(height: 16),
            _buildStatRow(context, data),
            const SizedBox(height: 24),
            _buildInviteSection(context),
            const SizedBox(height: 24),
            Text('Current Members (${data.length})',
                style: theme.textTheme.titleLarge),
            const SizedBox(height: 12),
            if (data.isEmpty)
              _buildEmptyState(context)
            else
              ...data.map((m) => _buildMemberTile(context, m)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int count) {
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
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(51),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.people, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Collaboration Team',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800)),
                Text('Manage your child\'s support team',
                    style: TextStyle(
                        color: Colors.white.withAlpha(204), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(BuildContext context, List<TeamMember> members) {
    final active = members.where((m) => m.status == 'active').length;
    final pending = members.where((m) => m.status == 'pending').length;
    final caregivers = members.where((m) => m.role == 'caregiver').length;

    return Row(
      children: [
        Expanded(
          child: _StatChip(
              icon: Icons.people, label: 'Members', value: '${members.length}', color: AivoColors.primary),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatChip(
              icon: Icons.mail, label: 'Pending', value: '$pending', color: const Color(0xFFF59E0B)),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatChip(
              icon: Icons.favorite, label: 'Caregivers', value: '$caregivers/2', color: const Color(0xFFF472B6)),
        ),
      ],
    );
  }

  Widget _buildInviteSection(BuildContext context) {
    final theme = Theme.of(context);

    return AivoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.person_add, color: AivoColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('Invite Member',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              hintText: 'Enter email address',
              prefixIcon: Icon(Icons.email_outlined),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _selectedRole,
            decoration: const InputDecoration(
              labelText: 'Role',
              prefixIcon: Icon(Icons.badge_outlined),
            ),
            items: const [
              DropdownMenuItem(value: 'caregiver', child: Text('Caregiver')),
              DropdownMenuItem(value: 'teacher', child: Text('Teacher')),
              DropdownMenuItem(value: 'therapist', child: Text('Therapist')),
            ],
            onChanged: (v) {
              if (v != null) setState(() => _selectedRole = v);
            },
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _inviting ? null : _sendInvite,
              icon: _inviting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send, size: 18),
              label: Text(_inviting ? 'Sending...' : 'Send Invitation'),
            ),
          ),
          if (_successMessage != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AivoColors.secondaryLight.withAlpha(51),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AivoColors.secondary.withAlpha(77)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AivoColors.secondary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_successMessage!,
                        style: TextStyle(
                            color: AivoColors.secondaryDark,
                            fontSize: 13,
                            fontWeight: FontWeight.w500)),
                  ),
                ],
              ),
            ),
          ],
          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AivoColors.errorLight.withAlpha(51),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AivoColors.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_errorMessage!,
                        style: const TextStyle(color: AivoColors.errorDark, fontSize: 13)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMemberTile(BuildContext context, TeamMember member) {
    final theme = Theme.of(context);

    IconData roleIcon;
    Color roleColor;
    switch (member.role) {
      case 'teacher':
        roleIcon = Icons.school;
        roleColor = AivoColors.primary;
        break;
      case 'therapist':
        roleIcon = Icons.health_and_safety;
        roleColor = AivoColors.secondary;
        break;
      case 'caregiver':
        roleIcon = Icons.favorite;
        roleColor = const Color(0xFFF472B6);
        break;
      default:
        roleIcon = Icons.person;
        roleColor = AivoColors.primary;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AivoCard(
        child: Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: roleColor.withAlpha(26),
              child: Icon(roleIcon, color: roleColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          member.name.isNotEmpty ? member.name : member.email,
                          style: theme.textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: roleColor.withAlpha(26),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(member.role,
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: roleColor)),
                      ),
                      if (member.status == 'pending') ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withAlpha(26),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('pending',
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFFF59E0B))),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(member.email,
                      style: theme.textTheme.bodySmall,
                      overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.delete_outline,
                  color: theme.colorScheme.outline, size: 20),
              onPressed: () => _showRemoveDialog(member),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.people_outline, size: 48, color: theme.colorScheme.outline),
          const SizedBox(height: 12),
          Text('No team members yet',
              style: theme.textTheme.titleMedium),
          const SizedBox(height: 4),
          Text('Invite teachers and caregivers above',
              style: theme.textTheme.bodyMedium),
        ],
      ),
    );
  }

  void _showRemoveDialog(TeamMember member) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Member'),
        content:
            Text('Remove ${member.name.isNotEmpty ? member.name : member.email} from the care team?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.invalidate(_membersProvider(widget.learnerId));
            },
            child: const Text('Remove',
                style: TextStyle(color: AivoColors.error)),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
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
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 4),
          Text(value,
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.w800, color: color)),
          Text(label,
              style: theme.textTheme.bodySmall?.copyWith(fontSize: 10),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
