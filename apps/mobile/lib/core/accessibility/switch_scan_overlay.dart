
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';

// ---------------------------------------------------------------------------
// SwitchScanOverlay
// ---------------------------------------------------------------------------

/// A visual overlay that draws a pulsing highlight ring around the currently
/// focused [ScanTarget] using its [GlobalKey] to locate the render box.
///
/// When the platform requests reduced motion (via [MediaQuery]), the overlay
/// renders a solid ring instead of the pulsing animation.
class SwitchScanOverlay extends ConsumerStatefulWidget {
  const SwitchScanOverlay({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  ConsumerState<SwitchScanOverlay> createState() => _SwitchScanOverlayState();
}

class _SwitchScanOverlayState extends ConsumerState<SwitchScanOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  OverlayEntry? _overlayEntry;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _pulseAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _removeOverlay();
    _pulseController.dispose();
    super.dispose();
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(switchScanControllerProvider);
    final reducedMotion = MediaQuery.of(context).disableAnimations;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateOverlay(controller, reducedMotion);
    });

    return widget.child;
  }

  void _updateOverlay(SwitchScanController controller, bool reducedMotion) {
    _removeOverlay();

    if (!controller.isScanning || controller.targets.isEmpty) {
      _pulseController.stop();
      return;
    }

    final currentTarget = controller.targets[controller.currentIndex];
    final renderObject = currentTarget.key.currentContext?.findRenderObject();
    if (renderObject == null || renderObject is! RenderBox) return;

    if (!renderObject.hasSize) return;

    final box = renderObject;
    final position = box.localToGlobal(Offset.zero);
    final size = box.size;

    if (reducedMotion) {
      _pulseController.stop();
    } else if (!_pulseController.isAnimating) {
      _pulseController.repeat(reverse: true);
    }

    _overlayEntry = OverlayEntry(
      builder: (context) {
        if (reducedMotion) {
          return _buildStaticRing(position, size);
        }
        return AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, _) {
            return _buildAnimatedRing(position, size, _pulseAnimation.value);
          },
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  Widget _buildStaticRing(Offset position, Size size) {
    return Positioned(
      left: position.dx - _kRingPadding,
      top: position.dy - _kRingPadding,
      child: IgnorePointer(
        child: CustomPaint(
          size: Size(
            size.width + _kRingPadding * 2,
            size.height + _kRingPadding * 2,
          ),
          painter: _ScanRingPainter(
            color: _kHighlightColor,
            strokeWidth: _kStrokeWidth,
            opacity: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedRing(Offset position, Size size, double opacity) {
    return Positioned(
      left: position.dx - _kRingPadding,
      top: position.dy - _kRingPadding,
      child: IgnorePointer(
        child: CustomPaint(
          size: Size(
            size.width + _kRingPadding * 2,
            size.height + _kRingPadding * 2,
          ),
          painter: _ScanRingPainter(
            color: _kHighlightColor,
            strokeWidth: _kStrokeWidth,
            opacity: opacity,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const double _kRingPadding = 6.0;
const double _kStrokeWidth = 4.0;
const Color _kHighlightColor = Color(0xFF6C5CE7);

// ---------------------------------------------------------------------------
// _ScanRingPainter
// ---------------------------------------------------------------------------

class _ScanRingPainter extends CustomPainter {
  _ScanRingPainter({
    required this.color,
    required this.strokeWidth,
    required this.opacity,
  });

  final Color color;
  final double strokeWidth;
  final double opacity;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: opacity)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        strokeWidth / 2,
        strokeWidth / 2,
        size.width - strokeWidth,
        size.height - strokeWidth,
      ),
      const Radius.circular(12),
    );

    canvas.drawRRect(rect, paint);
  }

  @override
  bool shouldRepaint(_ScanRingPainter oldDelegate) {
    return oldDelegate.opacity != opacity ||
        oldDelegate.color != color ||
        oldDelegate.strokeWidth != strokeWidth;
  }
}
