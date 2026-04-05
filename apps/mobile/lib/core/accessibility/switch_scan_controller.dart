import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ---------------------------------------------------------------------------
// ScanTarget
// ---------------------------------------------------------------------------

/// An element that participates in switch-scan navigation.
class ScanTarget {
  const ScanTarget({
    required this.key,
    required this.label,
  });

  final GlobalKey key;
  final String label;
}

// ---------------------------------------------------------------------------
// SwitchScanController
// ---------------------------------------------------------------------------

/// Controls switch-scan (1-switch or 2-switch) navigation for users who cannot
/// use touch input.
///
/// Maintains an ordered list of [ScanTarget]s and cycles through them on a
/// timer.  The user presses a hardware key (or external switch mapped to a key)
/// to select the currently highlighted target.
class SwitchScanController extends ChangeNotifier {
  SwitchScanController({
    this.dwellTime = const Duration(seconds: 2),
  });

  /// How long the highlight stays on each target before advancing.
  Duration dwellTime;

  final List<ScanTarget> _targets = [];
  List<ScanTarget> get targets => List.unmodifiable(_targets);

  int _currentIndex = 0;
  int get currentIndex => _currentIndex;

  bool _isScanning = false;
  bool get isScanning => _isScanning;

  Timer? _scanTimer;

  // -----------------------------------------------------------------------
  // Target registration
  // -----------------------------------------------------------------------

  void registerTarget(GlobalKey key, String label) {
    final existing = _targets.indexWhere((t) => t.key == key);
    if (existing == -1) {
      _targets.add(ScanTarget(key: key, label: label));
      notifyListeners();
    }
  }

  void unregisterTarget(GlobalKey key) {
    _targets.removeWhere((t) => t.key == key);
    if (_currentIndex >= _targets.length) {
      _currentIndex = _targets.isEmpty ? 0 : _targets.length - 1;
    }
    notifyListeners();
  }

  // -----------------------------------------------------------------------
  // Scanning lifecycle
  // -----------------------------------------------------------------------

  void startScanning() {
    if (_isScanning || _targets.isEmpty) return;
    _isScanning = true;
    _currentIndex = 0;
    _startTimer();
    notifyListeners();
  }

  void stopScanning() {
    _isScanning = false;
    _scanTimer?.cancel();
    _scanTimer = null;
    notifyListeners();
  }

  void _startTimer() {
    _scanTimer?.cancel();
    _scanTimer = Timer.periodic(dwellTime, (_) {
      _advance();
    });
  }

  void _advance() {
    if (_targets.isEmpty) return;
    _currentIndex = (_currentIndex + 1) % _targets.length;
    notifyListeners();
  }

  // -----------------------------------------------------------------------
  // Selection
  // -----------------------------------------------------------------------

  /// Triggers a tap on the widget associated with the currently highlighted
  /// [ScanTarget].
  void select() {
    if (!_isScanning || _targets.isEmpty) return;
    final target = _targets[_currentIndex];
    final context = target.key.currentContext;
    if (context != null) {
      // Find the nearest GestureDetector / InkWell / button and invoke its
      // onTap callback by sending a synthetic tap via the widget's render box.
      final renderBox = context.findRenderObject() as RenderBox?;
      if (renderBox != null) {
        final center = renderBox.localToGlobal(
          renderBox.size.center(Offset.zero),
        );
        // Dispatch a tap event pair through the binding.
        final binding = WidgetsBinding.instance;
        binding.handlePointerEvent(PointerDownEvent(position: center));
        binding.handlePointerEvent(PointerUpEvent(position: center));
      }
    }
    // Restart the scan timer so the user has full dwell time on the next item.
    _startTimer();
  }

  // -----------------------------------------------------------------------
  // Hardware key handling
  // -----------------------------------------------------------------------

  /// Call from a [Focus] or [KeyboardListener] ancestor.  Maps any key
  /// press to the [select] action while scanning is active.  Returns true if
  /// the event was consumed.
  bool handleKeyEvent(KeyEvent event) {
    if (!_isScanning) return false;
    if (event is KeyDownEvent) {
      select();
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------------------
  // Disposal
  // -----------------------------------------------------------------------

  @override
  void dispose() {
    _scanTimer?.cancel();
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final switchScanControllerProvider =
    ChangeNotifierProvider<SwitchScanController>(
  (ref) => SwitchScanController(),
);

// ---------------------------------------------------------------------------
// ScanHighlight widget
// ---------------------------------------------------------------------------

/// Wraps a child widget and draws a thick purple border with a gentle scale
/// animation when this target is the currently focused element in switch-scan
/// mode.
class ScanHighlight extends ConsumerStatefulWidget {
  const ScanHighlight({
    super.key,
    required this.scanKey,
    required this.label,
    required this.child,
  });

  /// The [GlobalKey] that was registered with [SwitchScanController].
  final GlobalKey scanKey;

  /// Accessible label for this target.
  final String label;

  final Widget child;

  @override
  ConsumerState<ScanHighlight> createState() => _ScanHighlightState();
}

class _ScanHighlightState extends ConsumerState<ScanHighlight>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.06).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );

    // Register this target with the scan controller.
    final controller = ref.read(switchScanControllerProvider);
    controller.registerTarget(widget.scanKey, widget.label);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(switchScanControllerProvider);
    final isFocused = controller.isScanning &&
        controller.targets.isNotEmpty &&
        controller.currentIndex < controller.targets.length &&
        controller.targets[controller.currentIndex].key == widget.scanKey;

    if (isFocused && !_animController.isAnimating) {
      _animController.repeat(reverse: true);
    } else if (!isFocused && _animController.isAnimating) {
      _animController.stop();
      _animController.reset();
    }

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: isFocused ? _scaleAnimation.value : 1.0,
          child: Semantics(
            label: widget.label,
            focused: isFocused,
            child: Container(
              key: widget.scanKey,
              decoration: isFocused
                  ? BoxDecoration(
                      border: Border.all(
                        color: const Color(0xFF6C5CE7), // AivoColors.primary
                        width: 4.0,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    )
                  : null,
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}
