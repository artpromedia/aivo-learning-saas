import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';

// ---------------------------------------------------------------------------
// ScanTargetWrapper
// ---------------------------------------------------------------------------

/// Convenience widget that automatically registers and unregisters a
/// [ScanTarget] with the [SwitchScanController].
///
/// Wraps [child] with a [ScanHighlight] so it receives visual focus feedback
/// during switch-scan navigation. Use this in assessment, lesson, and tutor
/// screens to make interactive elements scannable.
///
/// ```dart
/// ScanTargetWrapper(
///   label: 'Answer A',
///   child: AnswerCard(text: 'Blue'),
/// )
/// ```
class ScanTargetWrapper extends ConsumerStatefulWidget {
  const ScanTargetWrapper({
    super.key,
    required this.label,
    required this.child,
    this.enabled = true,
  });

  /// Accessible label describing this scan target.
  final String label;

  /// The interactive widget to wrap.
  final Widget child;

  /// When false, the target is not registered with the scan controller.
  /// Useful for conditionally enabling scan support.
  final bool enabled;

  @override
  ConsumerState<ScanTargetWrapper> createState() => _ScanTargetWrapperState();
}

class _ScanTargetWrapperState extends ConsumerState<ScanTargetWrapper> {
  final GlobalKey _scanKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    if (widget.enabled) {
      _register();
    }
  }

  @override
  void didUpdateWidget(ScanTargetWrapper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.enabled && !widget.enabled) {
      _unregister();
    } else if (!oldWidget.enabled && widget.enabled) {
      _register();
    }
    if (oldWidget.label != widget.label && widget.enabled) {
      _unregister();
      _register();
    }
  }

  @override
  void dispose() {
    _unregister();
    super.dispose();
  }

  void _register() {
    final controller = ref.read(switchScanControllerProvider);
    controller.registerTarget(_scanKey, widget.label);
  }

  void _unregister() {
    final controller = ref.read(switchScanControllerProvider);
    controller.unregisterTarget(_scanKey);
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    return ScanHighlight(
      scanKey: _scanKey,
      label: widget.label,
      child: widget.child,
    );
  }
}
