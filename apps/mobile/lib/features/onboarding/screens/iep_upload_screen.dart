import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/brain_context.dart';

/// States for the IEP upload flow.
enum _UploadState { initial, uploading, processing, confirming, error }

/// Screen for uploading an IEP document during onboarding.
class IepUploadScreen extends ConsumerStatefulWidget {
  const IepUploadScreen({super.key});

  @override
  ConsumerState<IepUploadScreen> createState() => _IepUploadScreenState();
}

class _IepUploadScreenState extends ConsumerState<IepUploadScreen> {
  File? _selectedFile;
  String? _fileName;
  _UploadState _state = _UploadState.initial;
  String? _errorMessage;
  List<IepGoal> _extractedGoals = [];

  final _imagePicker = ImagePicker();

  Future<void> _captureFromCamera() async {
    final xFile = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 90,
    );
    if (xFile != null && mounted) {
      setState(() {
        _selectedFile = File(xFile.path);
        _fileName = xFile.name;
        _errorMessage = null;
      });
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      withData: false,
      withReadStream: false,
    );

    if (result != null && result.files.single.path != null && mounted) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
        _fileName = result.files.single.name;
        _errorMessage = null;
      });
    }
  }

  void _clearFile() {
    setState(() {
      _selectedFile = null;
      _fileName = null;
      _state = _UploadState.initial;
      _extractedGoals = [];
      _errorMessage = null;
    });
  }

  Future<void> _uploadIep() async {
    if (_selectedFile == null) return;

    setState(() {
      _state = _UploadState.uploading;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);

      setState(() {
        _state = _UploadState.uploading;
      });

      final response = await apiClient.upload(
        Endpoints.familyIepUpload,
        filePath: _selectedFile!.path,
        fieldName: 'file',
        fileName: _fileName,
      );

      if (!mounted) return;

      setState(() {
        _state = _UploadState.processing;
      });

      // The server returns extracted goals after AI processing.
      final data = response.data as Map<String, dynamic>;
      final goalsJson = data['goals'] as List<dynamic>? ?? [];
      final goals = goalsJson
          .map((g) => IepGoal.fromJson(g as Map<String, dynamic>))
          .toList();

      if (mounted) {
        setState(() {
          _extractedGoals = goals;
          _state = _UploadState.confirming;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _state = _UploadState.error;
          _errorMessage = 'Upload failed. Please try again.';
        });
      }
    }
  }

  void _confirmGoals() {
    context.go('/onboarding/baseline');
  }

  void _skipUpload() {
    context.go('/onboarding/baseline');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload IEP'),
        actions: [
          if (_state != _UploadState.uploading &&
              _state != _UploadState.processing)
            TextButton(
              onPressed: _skipUpload,
              child: const Text('Skip'),
            ),
        ],
      ),
      body: SafeArea(
        child: switch (_state) {
          _UploadState.initial => _buildInitialView(theme, colorScheme),
          _UploadState.uploading => _buildProgressView(theme, colorScheme,
              label: 'Uploading document...',),
          _UploadState.processing => _buildProgressView(theme, colorScheme,
              label: 'AI is extracting IEP goals...',),
          _UploadState.confirming =>
            _buildConfirmView(theme, colorScheme),
          _UploadState.error => _buildInitialView(theme, colorScheme),
        },
      ),
    );
  }

  // ---- Initial / file selection view ----
  Widget _buildInitialView(ThemeData theme, ColorScheme colorScheme) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Semantics(
                header: true,
                child: Text(
                  "Upload your child's IEP",
                  style: theme.textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Our AI will extract goals from the IEP to personalize '
                'the learning experience. This step is optional.',
                style: theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // ---- Error banner ----
              if (_errorMessage != null) ...[
                Semantics(
                  liveRegion: true,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: colorScheme.errorContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline,
                            color: colorScheme.onErrorContainer, size: 20,),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onErrorContainer,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // ---- File preview or picker ----
              if (_selectedFile != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colorScheme.outline),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _fileName?.endsWith('.pdf') == true
                            ? Icons.picture_as_pdf
                            : Icons.image_outlined,
                        size: 40,
                        color: colorScheme.primary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _fileName ?? 'Selected file',
                              style: theme.textTheme.titleMedium,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Ready to upload',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.secondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: _clearFile,
                        tooltip: 'Remove file',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _uploadIep,
                    icon: const Icon(Icons.cloud_upload_outlined),
                    label: const Text('Upload IEP'),
                  ),
                ),
              ] else ...[
                // ---- Camera capture ----
                SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: _captureFromCamera,
                    icon: const Icon(Icons.camera_alt_outlined),
                    label: const Text('Take a Photo'),
                  ),
                ),
                const SizedBox(height: 12),

                // ---- File picker ----
                SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: _pickFile,
                    icon: const Icon(Icons.upload_file_outlined),
                    label: const Text('Choose PDF or Image'),
                  ),
                ),
              ],

              const SizedBox(height: 32),
              Center(
                child: TextButton(
                  onPressed: _skipUpload,
                  child: const Text('Skip this step'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---- Processing / uploading view ----
  Widget _buildProgressView(
    ThemeData theme,
    ColorScheme colorScheme, {
    required String label,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              height: 64,
              width: 64,
              child: CircularProgressIndicator(strokeWidth: 3),
            ),
            const SizedBox(height: 24),
            Semantics(
              liveRegion: true,
              child: Text(
                label,
                style: theme.textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'This may take a moment...',
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ---- Goal confirmation view ----
  Widget _buildConfirmView(ThemeData theme, ColorScheme colorScheme) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
          child: Column(
            children: [
              Icon(
                Icons.check_circle_outline,
                size: 48,
                color: colorScheme.secondary,
              ),
              const SizedBox(height: 12),
              Semantics(
                header: true,
                child: Text(
                  'Goals Extracted',
                  style: theme.textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'We found ${_extractedGoals.length} goals in the IEP. '
                'Please review them below.',
                style: theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: _extractedGoals.isEmpty
              ? Center(
                  child: Text(
                    'No goals were extracted. You can still continue.',
                    style: theme.textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: _extractedGoals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final goal = _extractedGoals[index];
                    return Semantics(
                      label: 'Goal ${index + 1}: ${goal.goalText}',
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Chip(
                                    label: Text(goal.area),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  const Spacer(),
                                  Icon(
                                    Icons.check_circle,
                                    color: colorScheme.secondary,
                                    size: 20,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                goal.goalText,
                                style: theme.textTheme.bodyLarge,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: SizedBox(
            height: 48,
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _confirmGoals,
              child: const Text('Confirm & Continue'),
            ),
          ),
        ),
      ],
    );
  }
}
