import 'dart:async';

import 'package:flutter/material.dart';

import 'package:aivo_mobile/data/repositories/brain_repository.dart';

/// A transient banner shown after reconnection when the Brain state has
/// changed.  Auto-dismisses after 5 seconds or on tap.
class TransitionMessageWidget extends StatefulWidget {
  const TransitionMessageWidget({
    super.key,
    required this.result,
    this.onDismissed,
  });

  final BrainReconciliationResult result;
  final VoidCallback? onDismissed;

  @override
  State<TransitionMessageWidget> createState() =>
      _TransitionMessageWidgetState();
}

class _TransitionMessageWidgetState extends State<TransitionMessageWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _autoDismissTimer = Timer(const Duration(seconds: 5), _dismiss);
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _dismiss() {
    _autoDismissTimer?.cancel();
    _controller.reverse().then((_) {
      if (mounted) widget.onDismissed?.call();
    });
  }

  String get _message {
    switch (widget.result) {
      case BrainReconciliationResult.noChange:
        return '';
      case BrainReconciliationResult.serverUpdated:
        return 'Welcome back! Your Brain has been updated while you were offline.';
      case BrainReconciliationResult.offlineReplayed:
        return 'Your offline progress has been synced successfully.';
      case BrainReconciliationResult.conflictResolved:
        return 'Your progress has been synced. Some levels were adjusted.';
    }
  }

  IconData get _icon {
    switch (widget.result) {
      case BrainReconciliationResult.noChange:
        return Icons.check_circle_outline;
      case BrainReconciliationResult.serverUpdated:
        return Icons.cloud_download_outlined;
      case BrainReconciliationResult.offlineReplayed:
        return Icons.cloud_upload_outlined;
      case BrainReconciliationResult.conflictResolved:
        return Icons.sync;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.result == BrainReconciliationResult.noChange) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: GestureDetector(
        onTap: _dismiss,
        child: Semantics(
          liveRegion: true,
          label: _message,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF1B3A26)
                  : const Color(0xFFD4EDDA),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  _icon,
                  size: 20,
                  color: isDark
                      ? const Color(0xFF8FD4A0)
                      : const Color(0xFF155724),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _message,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? const Color(0xFF8FD4A0)
                          : const Color(0xFF155724),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Icon(
                  Icons.close,
                  size: 16,
                  color: isDark
                      ? const Color(0xFF8FD4A0)
                      : const Color(0xFF155724),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
