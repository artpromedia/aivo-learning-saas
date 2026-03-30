import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/data/local/daos/sync_dao.dart';

/// A slim banner displayed when the device is offline.
///
/// Shows a cloud-off icon, an informational message, and the number of
/// pending sync actions. The banner animates in/out via a [SlideTransition]
/// and automatically watches [connectivityProvider] to determine visibility.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  /// The height reserved for the banner in layout calculations (e.g. when
  /// used by [AivoAppBar] to size its preferred height).
  static const double bannerHeight = 36.0;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityAsync = ref.watch(connectivityProvider);
    final isOffline = connectivityAsync.when(
      data: (status) => status == ConnectivityStatus.offline,
      loading: () => false,
      error: (_, __) => false,
    );

    return _AnimatedBanner(
      visible: isOffline,
      child: const _BannerContent(),
    );
  }
}

// ---------------------------------------------------------------------------
// Animated slide-in / slide-out wrapper
// ---------------------------------------------------------------------------

class _AnimatedBanner extends StatefulWidget {
  const _AnimatedBanner({
    required this.visible,
    required this.child,
  });

  final bool visible;
  final Widget child;

  @override
  State<_AnimatedBanner> createState() => _AnimatedBannerState();
}

class _AnimatedBannerState extends State<_AnimatedBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      value: widget.visible ? 1.0 : 0.0,
    );
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.dismissed) setState(() {});
    });
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ),);
  }

  @override
  void didUpdateWidget(covariant _AnimatedBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.visible != oldWidget.visible) {
      if (widget.visible) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller.isDismissed) return const SizedBox.shrink();
    return SizeTransition(
      sizeFactor: _controller,
      axisAlignment: -1,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Banner content
// ---------------------------------------------------------------------------

class _BannerContent extends ConsumerWidget {
  const _BannerContent();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Read the pending sync count from the DAO.
    final pendingCountAsync = ref.watch(_pendingSyncCountProvider);
    final pendingCount = pendingCountAsync.value ?? 0;

    final backgroundColor = isDark
        ? const Color(0xFF6D4C00)
        : const Color(0xFFFFF3CD);
    final foregroundColor = isDark
        ? const Color(0xFFFFE0A0)
        : const Color(0xFF856404);

    return Semantics(
      liveRegion: true,
      label: pendingCount > 0
          ? "You're offline. $pendingCount changes pending."
          : "You're offline. Changes will sync when connected.",
      child: Container(
        width: double.infinity,
        height: OfflineBanner.bannerHeight,
        color: backgroundColor,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: [
            Icon(
              Icons.cloud_off,
              size: 16,
              color: foregroundColor,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                pendingCount > 0
                    ? "You're offline -- $pendingCount changes pending"
                    : "You're offline -- changes will sync when connected",
                style: theme.textTheme.bodySmall?.copyWith(
                  color: foregroundColor,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Pending sync count provider
// ---------------------------------------------------------------------------

/// Watches the [SyncDao] for un-synced action count. Refreshes automatically
/// whenever the connectivity status changes.
final _pendingSyncCountProvider = FutureProvider<int>((ref) async {
  ref.watch(connectivityProvider);
  final dao = ref.watch(syncDaoProvider);
  return dao.pendingCount();
});
