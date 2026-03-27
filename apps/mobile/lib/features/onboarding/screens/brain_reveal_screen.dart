import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/auth_provider.dart';

// ---------------------------------------------------------------------------
// Brain profile model (local to this screen)
// ---------------------------------------------------------------------------

class _BrainProfile {
  const _BrainProfile({
    required this.learnerId,
    required this.functioningLevel,
    required this.strengths,
    required this.areasForGrowth,
    required this.accommodations,
  });

  final String learnerId;
  final String functioningLevel;
  final List<String> strengths;
  final List<String> areasForGrowth;
  final List<String> accommodations;

  factory _BrainProfile.fromJson(Map<String, dynamic> json) {
    return _BrainProfile(
      learnerId: json['learnerId'] as String? ?? '',
      functioningLevel: json['functioningLevel'] as String? ?? 'STANDARD',
      strengths: (json['strengths'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      areasForGrowth: (json['areasForGrowth'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      accommodations: (json['accommodations'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Animated reveal of the child's Brain profile after baseline assessment.
class BrainRevealScreen extends ConsumerStatefulWidget {
  const BrainRevealScreen({super.key});

  @override
  ConsumerState<BrainRevealScreen> createState() => _BrainRevealScreenState();
}

class _BrainRevealScreenState extends ConsumerState<BrainRevealScreen>
    with SingleTickerProviderStateMixin {
  _BrainProfile? _profile;
  bool _isLoading = true;
  String? _errorMessage;
  bool _revealed = false;

  late AnimationController _animController;
  late Animation<double> _fadeIn;
  late Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _fadeIn = CurvedAnimation(
      parent: _animController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    );

    _slideUp = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: const Interval(0.2, 0.8, curve: Curves.easeOutCubic),
    ));

    _loadProfile();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final authState = ref.read(authProvider);
      String? learnerId;
      if (authState is AuthAuthenticated) {
        learnerId = authState.user.learnerId;
      }

      if (learnerId == null) {
        // Attempt to fetch from learners list.
        final learnersResponse = await apiClient.get(Endpoints.learners);
        final learnersData = learnersResponse.data as List<dynamic>?;
        if (learnersData != null && learnersData.isNotEmpty) {
          learnerId =
              (learnersData.first as Map<String, dynamic>)['id'] as String?;
        }
      }

      if (learnerId == null) {
        throw Exception('No learner found');
      }

      final response = await apiClient.get(
        Endpoints.familyBrainProfile(learnerId),
      );

      if (mounted) {
        setState(() {
          _profile =
              _BrainProfile.fromJson(response.data as Map<String, dynamic>);
          _isLoading = false;
        });

        // Brief delay then reveal with animation.
        await Future.delayed(const Duration(milliseconds: 400));
        if (mounted) {
          setState(() {
            _revealed = true;
          });
          _animController.forward();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to load brain profile. Please try again.';
        });
      }
    }
  }

  String _readableFunctioningLevel(String raw) {
    switch (raw.toLowerCase()) {
      case 'standard':
        return 'Standard';
      case 'supported':
        return 'Supported';
      case 'lowverbal':
      case 'low_verbal':
        return 'Low Verbal';
      case 'nonverbal':
      case 'non_verbal':
        return 'Non-Verbal';
      case 'presymbolic':
      case 'pre_symbolic':
        return 'Pre-Symbolic';
      default:
        return raw;
    }
  }

  void _navigateToHome() {
    final authState = ref.read(authProvider);
    if (authState is AuthAuthenticated) {
      final role = authState.user.role.toLowerCase();
      switch (role) {
        case 'learner':
          context.go('/learner/home');
        case 'parent':
          context.go('/parent/dashboard');
        case 'teacher':
          context.go('/teacher/classroom');
        default:
          context.go('/parent/dashboard');
      }
    } else {
      context.go('/parent/dashboard');
    }
  }

  void _viewFullProfile() {
    if (_profile != null) {
      context.go('/parent/brain/${_profile!.learnerId}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Brain Profile'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage != null
                ? _buildErrorView(theme, colorScheme)
                : _buildRevealView(theme, colorScheme),
      ),
    );
  }

  Widget _buildErrorView(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: colorScheme.error),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: theme.textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _isLoading = true;
                  _errorMessage = null;
                });
                _loadProfile();
              },
              child: const Text('Retry'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: _navigateToHome,
              child: const Text('Skip to Home'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRevealView(ThemeData theme, ColorScheme colorScheme) {
    final profile = _profile!;

    return Column(
      children: [
        // ---- Lottie celebration ----
        if (_revealed)
          SizedBox(
            height: 140,
            child: Lottie.asset(
              'assets/animations/celebration.json',
              repeat: false,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                // Graceful fallback if animation asset is missing.
                return Icon(
                  Icons.celebration,
                  size: 64,
                  color: colorScheme.tertiary,
                );
              },
            ),
          ),

        Expanded(
          child: FadeTransition(
            opacity: _fadeIn,
            child: SlideTransition(
              position: _slideUp,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      header: true,
                      child: Text(
                        'Brain Profile Ready!',
                        style: theme.textTheme.headlineMedium,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Functioning level badge ----
                    Center(
                      child: Chip(
                        avatar: Icon(Icons.psychology,
                            color: colorScheme.onPrimaryContainer),
                        label: Text(
                          _readableFunctioningLevel(
                              profile.functioningLevel),
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: colorScheme.onPrimaryContainer,
                          ),
                        ),
                        backgroundColor: colorScheme.primaryContainer,
                        side: BorderSide.none,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ---- Strengths ----
                    if (profile.strengths.isNotEmpty) ...[
                      _SectionHeader(
                        icon: Icons.star_outline,
                        title: 'Strengths',
                        color: colorScheme.secondary,
                      ),
                      const SizedBox(height: 8),
                      ...profile.strengths.map((s) => _BulletItem(
                            text: s,
                            color: colorScheme.secondary,
                          )),
                      const SizedBox(height: 20),
                    ],

                    // ---- Areas for growth ----
                    if (profile.areasForGrowth.isNotEmpty) ...[
                      _SectionHeader(
                        icon: Icons.trending_up,
                        title: 'Areas for Growth',
                        color: colorScheme.tertiary,
                      ),
                      const SizedBox(height: 8),
                      ...profile.areasForGrowth.map((a) => _BulletItem(
                            text: a,
                            color: colorScheme.tertiary,
                          )),
                      const SizedBox(height: 20),
                    ],

                    // ---- Recommended accommodations ----
                    if (profile.accommodations.isNotEmpty) ...[
                      _SectionHeader(
                        icon: Icons.accessibility_new,
                        title: 'Recommended Accommodations',
                        color: colorScheme.primary,
                      ),
                      const SizedBox(height: 8),
                      ...profile.accommodations.map((a) => _BulletItem(
                            text: a,
                            color: colorScheme.primary,
                          )),
                      const SizedBox(height: 20),
                    ],

                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ),
        ),

        // ---- Action buttons ----
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _navigateToHome,
                  child: const Text('Start Learning'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 48,
                child: OutlinedButton(
                  onPressed: _viewFullProfile,
                  child: const Text('View Full Profile'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Helper widgets
// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.color,
  });

  final IconData icon;
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, size: 20, color: color),
        const SizedBox(width: 8),
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(color: color),
        ),
      ],
    );
  }
}

class _BulletItem extends StatelessWidget {
  const _BulletItem({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 28, bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: theme.textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
