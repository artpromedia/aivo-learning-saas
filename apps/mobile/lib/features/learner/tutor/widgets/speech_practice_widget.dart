import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:uuid/uuid.dart';

// ---------------------------------------------------------------------------
// SpeechRecording model
// ---------------------------------------------------------------------------

class SpeechRecording {
  final String filePath;
  final Duration duration;

  const SpeechRecording({required this.filePath, required this.duration});
}

// ---------------------------------------------------------------------------
// SpeechPracticeWidget
// ---------------------------------------------------------------------------

class SpeechPracticeWidget extends StatefulWidget {
  const SpeechPracticeWidget({
    super.key,
    required this.targetSound,
    required this.onComplete,
    this.maxDurationSeconds = 10,
  });

  final String targetSound;
  final ValueChanged<SpeechRecording> onComplete;
  final int maxDurationSeconds;

  @override
  State<SpeechPracticeWidget> createState() => _SpeechPracticeWidgetState();
}

enum _RecordState { idle, recording, recorded, playing }

class _SpeechPracticeWidgetState extends State<SpeechPracticeWidget>
    with TickerProviderStateMixin {
  // Echo's coral / sky-blue theme
  static const _coral = Color(0xFFFF7675);
  static const _coralLight = Color(0xFFFFF0F0);
  static const _skyBlue = Color(0xFF74B9FF);

  final _recorder = AudioRecorder();
  final _player = AudioPlayer();

  _RecordState _state = _RecordState.idle;
  String? _filePath;
  Duration _elapsed = Duration.zero;
  Duration _recordedDuration = Duration.zero;
  Timer? _timer;

  // Waveform animation
  late final AnimationController _waveController;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _player.onPlayerComplete.listen((_) {
      if (mounted && _state == _RecordState.playing) {
        setState(() => _state = _RecordState.recorded);
        SemanticsService.announce('Playback finished', TextDirection.ltr);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _waveController.dispose();
    _pulseController.dispose();
    _recorder.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<void> _handleRecordTap() async {
    switch (_state) {
      case _RecordState.idle:
        await _startRecording();
      case _RecordState.recording:
        await _stopRecording();
      case _RecordState.recorded:
        await _startPlayback();
      case _RecordState.playing:
        await _stopPlayback();
    }
  }

  Future<void> _startRecording() async {
    // Request microphone permission
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Microphone access is needed for speech practice. '
            'Please enable it in Settings.',
          ),
          action: SnackBarAction(
            label: 'Open Settings',
            onPressed: openAppSettings,
          ),
        ),
      );
      return;
    }

    // Prepare file path
    final dir = await getTemporaryDirectory();
    final fileName = 'speech_${const Uuid().v4()}.m4a';
    _filePath = p.join(dir.path, fileName);

    await _recorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc),
      path: _filePath!,
    );

    _elapsed = Duration.zero;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        _elapsed += const Duration(seconds: 1);
      });
      if (_elapsed.inSeconds >= widget.maxDurationSeconds) {
        _stopRecording();
      }
    });

    _waveController.repeat();
    _pulseController.repeat(reverse: true);

    setState(() => _state = _RecordState.recording);
    SemanticsService.announce('Recording started', TextDirection.ltr);
  }

  Future<void> _stopRecording() async {
    _timer?.cancel();
    _waveController.stop();
    _pulseController.stop();
    _pulseController.value = 0;

    final path = await _recorder.stop();
    _filePath = path ?? _filePath;
    _recordedDuration = _elapsed;

    if (mounted) {
      setState(() => _state = _RecordState.recorded);
      SemanticsService.announce(
        'Recording stopped. ${_formatDuration(_recordedDuration)} recorded.',
        TextDirection.ltr,
      );
    }
  }

  Future<void> _startPlayback() async {
    if (_filePath == null) return;
    await _player.play(DeviceFileSource(_filePath!));
    setState(() => _state = _RecordState.playing);
    SemanticsService.announce('Playing recording', TextDirection.ltr);
  }

  Future<void> _stopPlayback() async {
    await _player.stop();
    setState(() => _state = _RecordState.recorded);
  }

  void _tryAgain() {
    _player.stop();
    setState(() {
      _state = _RecordState.idle;
      _filePath = null;
      _elapsed = Duration.zero;
      _recordedDuration = Duration.zero;
    });
    SemanticsService.announce('Ready to record again', TextDirection.ltr);
  }

  void _submit() {
    if (_filePath == null) return;
    widget.onComplete(SpeechRecording(
      filePath: _filePath!,
      duration: _recordedDuration,
    ),);
  }

  String _formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      color: _coralLight,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: _coral.withValues(alpha: 0.3)),
      ),
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            ExcludeSemantics(
              child: Text(
                '\u{1F3B5} Try saying: ${widget.targetSound}',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: const Color(0xFFB71C1C),
                ),
                textAlign: TextAlign.center,
              ),
            ),
            Semantics(
              label: 'Try saying: ${widget.targetSound}',
              child: const SizedBox(height: 20),
            ),

            // Record button
            _buildRecordButton(),

            // Waveform during recording
            if (_state == _RecordState.recording) ...[
              const SizedBox(height: 16),
              SizedBox(
                height: 40,
                child: AnimatedBuilder(
                  animation: _waveController,
                  builder: (context, _) => CustomPaint(
                    size: const Size(double.infinity, 40),
                    painter: _WaveformPainter(
                      progress: _waveController.value,
                      color: _coral,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _formatDuration(_elapsed),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: _coral,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],

            // Post-recording controls
            if (_state == _RecordState.recorded ||
                _state == _RecordState.playing) ...[
              const SizedBox(height: 16),
              // Playback info
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _state == _RecordState.playing
                        ? Icons.stop_circle
                        : Icons.play_circle,
                    color: _skyBlue,
                    size: 32,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _formatDuration(_recordedDuration),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Semantics(
                    button: true,
                    label: 'Try recording again',
                    child: TextButton(
                      onPressed: _tryAgain,
                      child: const Text('Try Again'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Semantics(
                    button: true,
                    label: 'Send recording to Echo',
                    child: ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _coral,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(48, 48),
                      ),
                      child: const Text('Send to Echo \u{2728}'),
                    ),
                  ),
                ],
              ),
            ],

            // Privacy notice
            const SizedBox(height: 16),
            ExcludeSemantics(
              child: Text(
                '\u{1F512} Recording used for this practice only',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.outline,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecordButton() {
    final IconData icon;
    final Color bgColor;
    final String semanticLabel;

    switch (_state) {
      case _RecordState.idle:
        icon = Icons.mic;
        bgColor = _coral;
        semanticLabel = 'Record your practice of ${widget.targetSound}';
      case _RecordState.recording:
        icon = Icons.stop;
        bgColor = Colors.red;
        semanticLabel = 'Stop recording';
      case _RecordState.recorded:
        icon = Icons.play_arrow;
        bgColor = _skyBlue;
        semanticLabel = 'Play your recording';
      case _RecordState.playing:
        icon = Icons.stop;
        bgColor = _skyBlue;
        semanticLabel = 'Stop playback';
    }

    Widget button = Semantics(
      button: true,
      label: semanticLabel,
      child: GestureDetector(
        onTap: _handleRecordTap,
        child: Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: bgColor,
            boxShadow: [
              BoxShadow(
                color: bgColor.withValues(alpha: 0.4),
                blurRadius: 12,
                spreadRadius: 1,
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: Colors.white, size: 36),
        ),
      ),
    );

    if (_state == _RecordState.recording) {
      button = ScaleTransition(
        scale: _pulseAnimation,
        child: button,
      );
    }

    return button;
  }
}

// ---------------------------------------------------------------------------
// Waveform painter
// ---------------------------------------------------------------------------

class _WaveformPainter extends CustomPainter {
  _WaveformPainter({required this.progress, required this.color});

  final double progress;
  final Color color;

  static final _rng = Random(42);
  // Pre-generate bar heights for consistency within a paint call
  static final _baseHeights = List.generate(20, (_) => _rng.nextDouble());

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    const barCount = 20;
    final barWidth = size.width / (barCount * 2);
    final maxHeight = size.height;

    for (var i = 0; i < barCount; i++) {
      // Animate each bar with a phase offset
      final phase = (progress + i / barCount) % 1.0;
      final heightFactor = 0.3 + 0.7 * _baseHeights[i] * sin(phase * pi);
      final barHeight = maxHeight * heightFactor.clamp(0.15, 1.0);

      final x = i * (barWidth * 2) + barWidth / 2;
      final y = (size.height - barHeight) / 2;

      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, y, barWidth, barHeight),
          const Radius.circular(2),
        ),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_WaveformPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
