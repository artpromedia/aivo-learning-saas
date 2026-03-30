import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

// ---------------------------------------------------------------------------
// GazePoint
// ---------------------------------------------------------------------------

/// A single gaze coordinate with a confidence value.
class GazePoint {
  const GazePoint({
    required this.x,
    required this.y,
    required this.confidence,
  });

  final double x;
  final double y;
  final double confidence;

  factory GazePoint.fromMap(Map<dynamic, dynamic> map) {
    return GazePoint(
      x: (map['x'] as num).toDouble(),
      y: (map['y'] as num).toDouble(),
      confidence: (map['confidence'] as num?)?.toDouble() ?? 0.0,
    );
  }

  @override
  String toString() =>
      'GazePoint(x: ${x.toStringAsFixed(1)}, y: ${y.toStringAsFixed(1)}, '
      'confidence: ${confidence.toStringAsFixed(2)})';
}

// ---------------------------------------------------------------------------
// EyeGazeProvider (abstract interface)
// ---------------------------------------------------------------------------

/// Abstract interface for eye-gaze tracking providers.
abstract class EyeGazeProvider {
  /// Stream of gaze points from the eye tracking hardware.
  Stream<GazePoint> get gazeStream;

  /// Run the calibration flow for the eye tracker.
  Future<bool> calibrate();

  /// Start emitting gaze data.
  Future<void> startTracking();

  /// Stop emitting gaze data.
  Future<void> stopTracking();

  /// Whether eye-tracking hardware is available on this device.
  Future<bool> get isAvailable;
}

// ---------------------------------------------------------------------------
// EyeGazeController
// ---------------------------------------------------------------------------

/// Concrete [EyeGazeProvider] that communicates with native eye-tracking
/// hardware via a [MethodChannel].
///
/// Implements dwell-to-select logic: when the user's gaze remains within a
/// target region for longer than [dwellDuration], a selection event is fired.
class EyeGazeController extends ChangeNotifier implements EyeGazeProvider {
  EyeGazeController({
    this.dwellDuration = const Duration(milliseconds: 1500),
    MethodChannel? channel,
  }) : _channel = channel ?? const MethodChannel('com.aivolearning/eye_gaze') {
    _init();
  }

  final MethodChannel _channel;

  /// How long gaze must remain on a target before selection triggers.
  final Duration dwellDuration;

  final StreamController<GazePoint> _gazeController =
      StreamController<GazePoint>.broadcast();

  bool _isTracking = false;
  bool get isTracking => _isTracking;

  bool _available = false;
  GazePoint? _latestGaze;
  GazePoint? get latestGaze => _latestGaze;

  // Dwell tracking state
  Rect? _currentDwellTarget;
  DateTime? _dwellStartTime;
  double _dwellProgress = 0.0;
  double get dwellProgress => _dwellProgress;

  final StreamController<Rect> _selectionController =
      StreamController<Rect>.broadcast();

  /// Emits the target [Rect] when a dwell-to-select completes.
  Stream<Rect> get selectionStream => _selectionController.stream;

  // -----------------------------------------------------------------------
  // Initialisation
  // -----------------------------------------------------------------------

  Future<void> _init() async {
    try {
      final result = await _channel.invokeMethod<bool>('isAvailable');
      _available = result ?? false;
    } on MissingPluginException {
      _available = false;
    }

    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onGazePoint') {
        final point = GazePoint.fromMap(call.arguments as Map);
        _latestGaze = point;
        _gazeController.add(point);
        _processDwell(point);
        notifyListeners();
      }
    });
  }

  // -----------------------------------------------------------------------
  // EyeGazeProvider implementation
  // -----------------------------------------------------------------------

  @override
  Stream<GazePoint> get gazeStream => _gazeController.stream;

  @override
  Future<bool> calibrate() async {
    try {
      final result = await _channel.invokeMethod<bool>('calibrate');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  @override
  Future<void> startTracking() async {
    if (_isTracking) return;
    try {
      await _channel.invokeMethod<void>('startTracking');
      _isTracking = true;
      notifyListeners();
    } on PlatformException catch (e) {
      debugPrint('[EyeGazeController] Failed to start tracking: $e');
    }
  }

  @override
  Future<void> stopTracking() async {
    if (!_isTracking) return;
    try {
      await _channel.invokeMethod<void>('stopTracking');
    } on PlatformException catch (e) {
      debugPrint('[EyeGazeController] Failed to stop tracking: $e');
    }
    _isTracking = false;
    _resetDwell();
    notifyListeners();
  }

  @override
  Future<bool> get isAvailable async => _available;

  // -----------------------------------------------------------------------
  // Dwell-to-select
  // -----------------------------------------------------------------------

  /// Set the target rect that the user is expected to dwell on.
  void setDwellTarget(Rect? target) {
    if (target != _currentDwellTarget) {
      _currentDwellTarget = target;
      _resetDwell();
    }
  }

  void _processDwell(GazePoint point) {
    if (_currentDwellTarget == null) return;

    final gazeOffset = Offset(point.x, point.y);
    if (_currentDwellTarget!.contains(gazeOffset) && point.confidence > 0.3) {
      _dwellStartTime ??= DateTime.now();

      final elapsed = DateTime.now().difference(_dwellStartTime!);
      _dwellProgress =
          (elapsed.inMilliseconds / dwellDuration.inMilliseconds).clamp(0.0, 1.0);

      if (_dwellProgress >= 1.0) {
        _selectionController.add(_currentDwellTarget!);
        _resetDwell();
      }
    } else {
      _resetDwell();
    }
  }

  void _resetDwell() {
    _dwellStartTime = null;
    _dwellProgress = 0.0;
  }

  // -----------------------------------------------------------------------
  // Disposal
  // -----------------------------------------------------------------------

  @override
  void dispose() {
    _gazeController.close();
    _selectionController.close();
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final eyeGazeControllerProvider =
    ChangeNotifierProvider<EyeGazeController>((ref) {
  final controller = EyeGazeController();
  return controller;
});

// ---------------------------------------------------------------------------
// DwellProgressIndicator
// ---------------------------------------------------------------------------

/// Draws a circular progress arc around its child to indicate how long the
/// user has been dwelling on a target via eye gaze.
class DwellProgressIndicator extends ConsumerWidget {
  const DwellProgressIndicator({
    super.key,
    required this.child,
    this.size = 80.0,
    this.strokeWidth = 4.0,
    this.color = const Color(0xFF6C5CE7),
    this.backgroundColor = const Color(0x336C5CE7),
  });

  final Widget child;
  final double size;
  final double strokeWidth;
  final Color color;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.watch(eyeGazeControllerProvider);
    final progress = controller.dwellProgress;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _DwellArcPainter(
              progress: progress,
              color: color,
              backgroundColor: backgroundColor,
              strokeWidth: strokeWidth,
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _DwellArcPainter extends CustomPainter {
  _DwellArcPainter({
    required this.progress,
    required this.color,
    required this.backgroundColor,
    required this.strokeWidth,
  });

  final double progress;
  final Color color;
  final Color backgroundColor;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    final bgPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, bgPaint);

    if (progress > 0) {
      final fgPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      final sweepAngle = 2 * math.pi * progress;
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2,
        sweepAngle,
        false,
        fgPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_DwellArcPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

// ---------------------------------------------------------------------------
// TwoChoiceEyeGazeLayout
// ---------------------------------------------------------------------------

/// A layout designed for eye-gaze users in assessments. Divides the screen into
/// two large halves (left and right) so the user can select by looking at the
/// desired side.
class TwoChoiceEyeGazeLayout extends ConsumerStatefulWidget {
  const TwoChoiceEyeGazeLayout({
    super.key,
    required this.leftChild,
    required this.rightChild,
    required this.leftLabel,
    required this.rightLabel,
    required this.onSelectLeft,
    required this.onSelectRight,
  });

  final Widget leftChild;
  final Widget rightChild;
  final String leftLabel;
  final String rightLabel;
  final VoidCallback onSelectLeft;
  final VoidCallback onSelectRight;

  @override
  ConsumerState<TwoChoiceEyeGazeLayout> createState() =>
      _TwoChoiceEyeGazeLayoutState();
}

class _TwoChoiceEyeGazeLayoutState
    extends ConsumerState<TwoChoiceEyeGazeLayout> {
  final GlobalKey _leftKey = GlobalKey();
  final GlobalKey _rightKey = GlobalKey();
  StreamSubscription<Rect>? _selectionSub;

  @override
  void initState() {
    super.initState();
    final controller = ref.read(eyeGazeControllerProvider);
    _selectionSub = controller.selectionStream.listen(_onSelection);
  }

  @override
  void dispose() {
    _selectionSub?.cancel();
    super.dispose();
  }

  void _onSelection(Rect selectedRect) {
    final leftBox =
        _leftKey.currentContext?.findRenderObject() as RenderBox?;
    final rightBox =
        _rightKey.currentContext?.findRenderObject() as RenderBox?;

    if (leftBox != null) {
      final leftPos = leftBox.localToGlobal(Offset.zero);
      final leftRect = leftPos & leftBox.size;
      if (leftRect.overlaps(selectedRect)) {
        widget.onSelectLeft();
        return;
      }
    }

    if (rightBox != null) {
      final rightPos = rightBox.localToGlobal(Offset.zero);
      final rightRect = rightPos & rightBox.size;
      if (rightRect.overlaps(selectedRect)) {
        widget.onSelectRight();
        return;
      }
    }
  }

  void _updateDwellTarget() {
    final controller = ref.read(eyeGazeControllerProvider);
    final gaze = controller.latestGaze;
    if (gaze == null) return;

    final leftBox =
        _leftKey.currentContext?.findRenderObject() as RenderBox?;
    final rightBox =
        _rightKey.currentContext?.findRenderObject() as RenderBox?;

    if (leftBox != null) {
      final leftPos = leftBox.localToGlobal(Offset.zero);
      final leftRect = leftPos & leftBox.size;
      if (leftRect.contains(Offset(gaze.x, gaze.y))) {
        controller.setDwellTarget(leftRect);
        return;
      }
    }

    if (rightBox != null) {
      final rightPos = rightBox.localToGlobal(Offset.zero);
      final rightRect = rightPos & rightBox.size;
      if (rightRect.contains(Offset(gaze.x, gaze.y))) {
        controller.setDwellTarget(rightRect);
        return;
      }
    }

    controller.setDwellTarget(null);
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(eyeGazeControllerProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateDwellTarget();
    });

    return Row(
      children: [
        Expanded(
          child: Semantics(
            label: widget.leftLabel,
            button: true,
            child: GestureDetector(
              onTap: widget.onSelectLeft,
              child: Container(
                key: _leftKey,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: const Color(0xFFDDD6FE),
                    width: 3,
                  ),
                ),
                child: Center(
                  child: DwellProgressIndicator(
                    size: 120,
                    child: widget.leftChild,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Semantics(
            label: widget.rightLabel,
            button: true,
            child: GestureDetector(
              onTap: widget.onSelectRight,
              child: Container(
                key: _rightKey,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: const Color(0xFFDDD6FE),
                    width: 3,
                  ),
                ),
                child: Center(
                  child: DwellProgressIndicator(
                    size: 120,
                    child: widget.rightChild,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// EyeGazeFallbackMessage
// ---------------------------------------------------------------------------

/// Shown when no eye-tracking hardware is detected on the device.
class EyeGazeFallbackMessage extends StatelessWidget {
  const EyeGazeFallbackMessage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.visibility_off,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'Eye Tracking Not Available',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'No compatible eye-tracking device was detected. '
              'Please connect a supported device or use an alternative '
              'input method such as switch scanning or touch.',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
