import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

/// Grade levels offered during child creation.
const List<String> _gradeOptions = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

/// Screen for adding a child (learner) during onboarding.
class AddChildScreen extends ConsumerStatefulWidget {
  const AddChildScreen({super.key});

  @override
  ConsumerState<AddChildScreen> createState() => _AddChildScreenState();
}

class _AddChildScreenState extends ConsumerState<AddChildScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _nameFocus = FocusNode();

  DateTime? _dateOfBirth;
  String? _selectedGrade;
  File? _profileImage;
  bool _isSubmitting = false;
  String? _errorMessage;

  final _imagePicker = ImagePicker();

  @override
  void dispose() {
    _nameController.dispose();
    _nameFocus.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 8, now.month, now.day),
      firstDate: DateTime(now.year - 22),
      lastDate: now,
      helpText: "Select your child's date of birth",
    );
    if (picked != null && mounted) {
      setState(() {
        _dateOfBirth = picked;
      });
    }
  }

  Future<void> _pickProfileImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Take a photo'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    final picked = await _imagePicker.pickImage(
      source: source,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );

    if (picked != null && mounted) {
      setState(() {
        _profileImage = File(picked.path);
      });
    }
  }

  Future<void> _handleContinue() async {
    if (!_formKey.currentState!.validate()) return;

    if (_dateOfBirth == null) {
      setState(() {
        _errorMessage = 'Please select a date of birth';
      });
      return;
    }
    if (_selectedGrade == null) {
      setState(() {
        _errorMessage = 'Please select a grade level';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);

      if (_profileImage != null) {
        await apiClient.upload(
          Endpoints.learners,
          filePath: _profileImage!.path,
          fieldName: 'profileImage',
          fields: {
            'name': _nameController.text.trim(),
            'dateOfBirth': _dateOfBirth!.toIso8601String(),
            'gradeLevel': _selectedGrade,
          },
        );
      } else {
        await apiClient.post(
          Endpoints.learners,
          data: {
            'name': _nameController.text.trim(),
            'dateOfBirth': _dateOfBirth!.toIso8601String(),
            'gradeLevel': _selectedGrade,
          },
        );
      }

      if (mounted) {
        context.go('/onboarding/assessment');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to add child. Please try again.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final dateFormat = DateFormat.yMMMd();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Your Child'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Semantics(
                      header: true,
                      child: Text(
                        'Tell us about your child',
                        style: theme.textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'This helps us personalize their learning experience.',
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
                                  color: colorScheme.onErrorContainer,
                                  size: 20,),
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

                    // ---- Profile image ----
                    Center(
                      child: Semantics(
                        label: 'Profile picture. Tap to change.',
                        button: true,
                        child: GestureDetector(
                          onTap: _isSubmitting ? null : _pickProfileImage,
                          child: Stack(
                            children: [
                              CircleAvatar(
                                radius: 48,
                                backgroundColor:
                                    colorScheme.surfaceContainerHighest,
                                backgroundImage: _profileImage != null
                                    ? FileImage(_profileImage!)
                                    : null,
                                child: _profileImage == null
                                    ? Icon(Icons.person,
                                        size: 48,
                                        color: colorScheme.onSurfaceVariant,)
                                    : null,
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: colorScheme.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.camera_alt,
                                    size: 16,
                                    color: colorScheme.onPrimary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        'Add a photo (optional)',
                        style: theme.textTheme.bodySmall,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ---- Name field ----
                    Semantics(
                      label: "Child's name",
                      textField: true,
                      child: TextFormField(
                        controller: _nameController,
                        focusNode: _nameFocus,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        enabled: !_isSubmitting,
                        decoration: const InputDecoration(
                          labelText: "Child's Name",
                          hintText: 'First name',
                          prefixIcon: Icon(Icons.child_care_outlined),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return "Child's name is required";
                          }
                          if (value.trim().length < 2) {
                            return 'Name must be at least 2 characters';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Date of birth ----
                    Semantics(
                      label: 'Date of birth',
                      button: true,
                      child: InkWell(
                        onTap: _isSubmitting ? null : _pickDateOfBirth,
                        borderRadius: BorderRadius.circular(12),
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Date of Birth',
                            prefixIcon: Icon(Icons.cake_outlined),
                          ),
                          child: Text(
                            _dateOfBirth != null
                                ? dateFormat.format(_dateOfBirth!)
                                : 'Select date',
                            style: _dateOfBirth != null
                                ? theme.textTheme.bodyLarge
                                : theme.textTheme.bodyMedium?.copyWith(
                                    color: colorScheme.outlineVariant,
                                  ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Grade level ----
                    Semantics(
                      label: 'Grade level',
                      child: DropdownButtonFormField<String>(
                        initialValue: _selectedGrade,
                        decoration: const InputDecoration(
                          labelText: 'Grade Level',
                          prefixIcon: Icon(Icons.school_outlined),
                        ),
                        items: _gradeOptions
                            .map((grade) => DropdownMenuItem(
                                  value: grade,
                                  child: Text(grade),
                                ),)
                            .toList(),
                        onChanged: _isSubmitting
                            ? null
                            : (value) {
                                setState(() {
                                  _selectedGrade = value;
                                });
                              },
                        validator: (value) {
                          if (value == null) {
                            return 'Please select a grade level';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 32),

                    // ---- Continue button ----
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _handleContinue,
                        child: _isSubmitting
                            ? SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: colorScheme.onPrimary,
                                ),
                              )
                            : const Text('Continue'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
