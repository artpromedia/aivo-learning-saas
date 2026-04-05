import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

// ---------------------------------------------------------------------------
// Upload state
// ---------------------------------------------------------------------------

enum UploadStage { idle, uploading, ocr, detectingSubject, adapting, complete, error }

class UploadState {
  const UploadState({
    this.stage = UploadStage.idle,
    this.progress = 0.0,
    this.message,
    this.homeworkId,
    this.errorMessage,
  });

  final UploadStage stage;
  final double progress;
  final String? message;
  final String? homeworkId;
  final String? errorMessage;

  UploadState copyWith({
    UploadStage? stage,
    double? progress,
    String? Function()? message,
    String? Function()? homeworkId,
    String? Function()? errorMessage,
  }) {
    return UploadState(
      stage: stage ?? this.stage,
      progress: progress ?? this.progress,
      message: message != null ? message() : this.message,
      homeworkId: homeworkId != null ? homeworkId() : this.homeworkId,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  String get stageLabel {
    switch (stage) {
      case UploadStage.idle:
        return '';
      case UploadStage.uploading:
        return 'Uploading...';
      case UploadStage.ocr:
        return 'Reading your homework...';
      case UploadStage.detectingSubject:
        return 'Detecting subject...';
      case UploadStage.adapting:
        return 'Adapting content for you...';
      case UploadStage.complete:
        return 'All done!';
      case UploadStage.error:
        return 'Something went wrong';
    }
  }
}

// ---------------------------------------------------------------------------
// Upload notifier
// ---------------------------------------------------------------------------

final _uploadStateProvider =
    StateNotifierProvider.autoDispose<_UploadNotifier, UploadState>((ref) {
  return _UploadNotifier(api: ref.watch(apiClientProvider));
});

class _UploadNotifier extends StateNotifier<UploadState> {
  _UploadNotifier({required ApiClient api})
      : _api = api,
        super(const UploadState());

  final ApiClient _api;

  Future<void> upload(String filePath) async {
    try {
      state = const UploadState(
          stage: UploadStage.uploading, progress: 0.0, message: 'Uploading...',);

      final response = await _api.upload<Map<String, dynamic>>(
        Endpoints.tutorHomeworkUpload,
        filePath: filePath,
        fieldName: 'file',
        onSendProgress: (sent, total) {
          if (total > 0) {
            state = state.copyWith(
              progress: (sent / total) * 0.3,
              message: () => 'Uploading... ${((sent / total) * 100).round()}%',
            );
          }
        },
      );

      final data = response.data!;
      final homeworkId = data['id'] as String? ?? data['homeworkId'] as String?;

      // Simulate server-side pipeline stages via polling or SSE.
      // We advance through stages to give feedback.
      state = UploadState(
        stage: UploadStage.ocr,
        progress: 0.35,
        message: 'Reading your homework...',
        homeworkId: homeworkId,
      );
      await Future<void>.delayed(const Duration(milliseconds: 1200));

      if (!mounted) return;
      state = state.copyWith(
        stage: UploadStage.detectingSubject,
        progress: 0.6,
        message: () => 'Detecting subject...',
      );
      await Future<void>.delayed(const Duration(milliseconds: 1000));

      if (!mounted) return;
      state = state.copyWith(
        stage: UploadStage.adapting,
        progress: 0.85,
        message: () => 'Adapting content for you...',
      );
      await Future<void>.delayed(const Duration(milliseconds: 1200));

      if (!mounted) return;
      state = state.copyWith(
        stage: UploadStage.complete,
        progress: 1.0,
        message: () => 'All done!',
      );
    } catch (e) {
      if (!mounted) return;
      state = UploadState(
        stage: UploadStage.error,
        progress: 0.0,
        errorMessage: e.toString(),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Captured file model
// ---------------------------------------------------------------------------

class _CapturedFile {
  _CapturedFile({required this.path, required this.name, required this.isPdf});

  final String path;
  final String name;
  final bool isPdf;
  int rotationQuarters = 0;
}

// ---------------------------------------------------------------------------
// Camera capture screen
// ---------------------------------------------------------------------------

class CameraCaptureScreen extends ConsumerStatefulWidget {
  const CameraCaptureScreen({super.key});

  @override
  ConsumerState<CameraCaptureScreen> createState() =>
      _CameraCaptureScreenState();
}

class _CameraCaptureScreenState extends ConsumerState<CameraCaptureScreen> {
  final ImagePicker _picker = ImagePicker();
  _CapturedFile? _capturedFile;

  Future<void> _takePhoto() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 2048,
      maxHeight: 2048,
      imageQuality: 90,
    );
    if (photo != null && mounted) {
      setState(() {
        _capturedFile = _CapturedFile(
            path: photo.path, name: photo.name, isPdf: false,);
      });
    }
  }

  Future<void> _pickFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 2048,
      maxHeight: 2048,
      imageQuality: 90,
    );
    if (image != null && mounted) {
      setState(() {
        _capturedFile = _CapturedFile(
            path: image.path, name: image.name, isPdf: false,);
      });
    }
  }

  Future<void> _pickPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: false,
      withReadStream: false,
    );
    if (result != null && result.files.isNotEmpty && mounted) {
      final file = result.files.first;
      if (file.path != null) {
        setState(() {
          _capturedFile = _CapturedFile(
              path: file.path!, name: file.name, isPdf: true,);
        });
      }
    }
  }

  void _rotate90() {
    if (_capturedFile == null || _capturedFile!.isPdf) return;
    setState(() {
      _capturedFile!.rotationQuarters =
          (_capturedFile!.rotationQuarters + 1) % 4;
    });
  }

  void _clearFile() {
    setState(() {
      _capturedFile = null;
    });
  }

  Future<void> _confirmAndUpload() async {
    if (_capturedFile == null) return;
    await ref.read(_uploadStateProvider.notifier).upload(_capturedFile!.path);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final uploadState = ref.watch(_uploadStateProvider);
    final isUploading =
        uploadState.stage != UploadStage.idle &&
        uploadState.stage != UploadStage.error;

    // Navigate on completion.
    ref.listen<UploadState>(_uploadStateProvider, (prev, next) {
      if (next.stage == UploadStage.complete && next.homeworkId != null) {
        Future.delayed(const Duration(milliseconds: 500), () {
          if (!context.mounted) return;
          context.go('/learner/homework/session/${next.homeworkId}');
        });
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(_capturedFile == null ? 'Capture Homework' : 'Preview'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: isUploading
              ? null
              : () {
                  if (_capturedFile != null) {
                    _clearFile();
                  } else {
                    context.canPop() ? context.pop() : context.go('/learner/homework');
                  }
                },
          tooltip: 'Back',
        ),
      ),
      body: Stack(
        children: [
          if (_capturedFile == null)
            _buildCaptureOptions(theme, colorScheme)
          else
            _buildPreview(theme, colorScheme),

          // Upload progress overlay
          if (isUploading) _buildProgressOverlay(theme, colorScheme, uploadState),

          // Error overlay
          if (uploadState.stage == UploadStage.error)
            _buildErrorOverlay(theme, colorScheme, uploadState),
        ],
      ),
    );
  }

  Widget _buildCaptureOptions(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.document_scanner, size: 80, color: colorScheme.primary),
            const SizedBox(height: 24),
            Text(
              'Upload Your Homework',
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Take a photo, choose from gallery, or upload a PDF',
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _takePhoto,
                icon: const Icon(Icons.camera_alt),
                label: const Text('Take Photo'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _pickFromGallery,
                icon: const Icon(Icons.photo_library),
                label: const Text('Choose from Gallery'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _pickPdf,
                icon: const Icon(Icons.picture_as_pdf),
                label: const Text('Upload PDF'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreview(ThemeData theme, ColorScheme colorScheme) {
    final file = _capturedFile!;
    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: file.isPdf
                ? _buildPdfPreview(theme, colorScheme, file)
                : _buildImagePreview(file),
          ),
        ),
        // Controls
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Column(
            children: [
              // File name
              Text(
                file.name,
                style: theme.textTheme.bodySmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (!file.isPdf)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _rotate90,
                        icon: const Icon(Icons.rotate_90_degrees_cw),
                        label: const Text('Rotate'),
                      ),
                    ),
                  if (!file.isPdf) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _confirmAndUpload,
                      icon: const Icon(Icons.cloud_upload),
                      label: const Text('Confirm & Upload'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: _clearFile,
                child: const Text('Choose different file'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildImagePreview(_CapturedFile file) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: RotatedBox(
        quarterTurns: file.rotationQuarters,
        child: InteractiveViewer(
          minScale: 0.5,
          maxScale: 4.0,
          child: Image.file(
            File(file.path),
            fit: BoxFit.contain,
            semanticLabel: 'Homework photo preview',
          ),
        ),
      ),
    );
  }

  Widget _buildPdfPreview(
      ThemeData theme, ColorScheme colorScheme, _CapturedFile file,) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 120,
            height: 150,
            decoration: BoxDecoration(
              color: colorScheme.errorContainer.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colorScheme.outline),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.picture_as_pdf,
                    size: 56, color: colorScheme.error,),
                const SizedBox(height: 8),
                Text('PDF', style: theme.textTheme.titleMedium),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            file.name,
            style: theme.textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildProgressOverlay(
      ThemeData theme, ColorScheme colorScheme, UploadState state,) {
    return Container(
      color: Colors.black.withValues(alpha: 0.75),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 80,
                height: 80,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: CircularProgressIndicator(
                        value: state.progress,
                        strokeWidth: 6,
                        backgroundColor: Colors.white24,
                        color: colorScheme.primary,
                      ),
                    ),
                    Text(
                      '${(state.progress * 100).round()}%',
                      style: theme.textTheme.titleMedium
                          ?.copyWith(color: Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _StageIndicator(
                label: 'Uploading',
                isActive: state.stage == UploadStage.uploading,
                isComplete: state.stage.index > UploadStage.uploading.index,
              ),
              _StageIndicator(
                label: 'OCR',
                isActive: state.stage == UploadStage.ocr,
                isComplete: state.stage.index > UploadStage.ocr.index,
              ),
              _StageIndicator(
                label: 'Detecting Subject',
                isActive: state.stage == UploadStage.detectingSubject,
                isComplete:
                    state.stage.index > UploadStage.detectingSubject.index,
              ),
              _StageIndicator(
                label: 'Adapting',
                isActive: state.stage == UploadStage.adapting,
                isComplete: state.stage.index > UploadStage.adapting.index,
              ),
              if (state.stage == UploadStage.complete) ...[
                const SizedBox(height: 16),
                Icon(Icons.check_circle, color: colorScheme.secondary, size: 48),
                const SizedBox(height: 8),
                Text('All done!',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(color: Colors.white),),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorOverlay(
      ThemeData theme, ColorScheme colorScheme, UploadState state,) {
    return Container(
      color: Colors.black.withValues(alpha: 0.75),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, color: colorScheme.error, size: 64),
              const SizedBox(height: 16),
              Text(
                'Upload Failed',
                style: theme.textTheme.titleLarge
                    ?.copyWith(color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                state.errorMessage ?? 'An unexpected error occurred.',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: Colors.white70),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _confirmAndUpload,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: _clearFile,
                style: TextButton.styleFrom(foregroundColor: Colors.white70),
                child: const Text('Choose different file'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Stage indicator row
// ---------------------------------------------------------------------------

class _StageIndicator extends StatelessWidget {
  const _StageIndicator({
    required this.label,
    required this.isActive,
    required this.isComplete,
  });

  final String label;
  final bool isActive;
  final bool isComplete;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final IconData icon;
    if (isComplete) {
      color = Theme.of(context).colorScheme.secondary;
      icon = Icons.check_circle;
    } else if (isActive) {
      color = Theme.of(context).colorScheme.primary;
      icon = Icons.radio_button_checked;
    } else {
      color = Colors.white38;
      icon = Icons.radio_button_unchecked;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isActive)
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: color,
              ),
            )
          else
            Icon(icon, size: 20, color: color),
          const SizedBox(width: 12),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: color,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                ),
          ),
        ],
      ),
    );
  }
}
