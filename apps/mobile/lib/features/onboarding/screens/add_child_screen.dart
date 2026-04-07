import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';
import 'package:aivo_mobile/core/i18n/language_picker_field.dart';
import 'package:aivo_mobile/core/i18n/locale_provider.dart';
import 'package:aivo_mobile/core/i18n/t.dart';

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

/// Grade value → i18n key mapping.
const Map<String, String> _gradeI18nKeys = {
  'Pre-K': 'onboarding.gradePreK',
  'Kindergarten': 'onboarding.gradeKindergarten',
  'Grade 1': 'onboarding.grade1',
  'Grade 2': 'onboarding.grade2',
  'Grade 3': 'onboarding.grade3',
  'Grade 4': 'onboarding.grade4',
  'Grade 5': 'onboarding.grade5',
  'Grade 6': 'onboarding.grade6',
  'Grade 7': 'onboarding.grade7',
  'Grade 8': 'onboarding.grade8',
  'Grade 9': 'onboarding.grade9',
  'Grade 10': 'onboarding.grade10',
  'Grade 11': 'onboarding.grade11',
  'Grade 12': 'onboarding.grade12',
};

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
  final _pinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  bool _obscurePin = true;
  bool _obscureConfirmPin = true;

  DateTime? _dateOfBirth;
  String? _selectedGrade;
  File? _profileImage;
  String? _childLanguage;
  bool _isSubmitting = false;
  String? _errorMessage;

  final _imagePicker = ImagePicker();

  @override
  void dispose() {
    _nameController.dispose();
    _nameFocus.dispose();
    _pinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(now.year - 8, now.month, now.day),
      firstDate: DateTime(now.year - 22),
      lastDate: now,
      helpText: t('onboarding.selectDateOfBirth'),
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
              title: Text(t('onboarding.takePhoto')),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: Text(t('onboarding.chooseFromGallery')),
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
        _errorMessage = t('onboarding.dateOfBirthRequired');
      });
      return;
    }
    if (_selectedGrade == null) {
      setState(() {
        _errorMessage = t('onboarding.gradeLevelRequired');
      });
      return;
    }

    final pin = _pinController.text.trim();
    final confirmPin = _confirmPinController.text.trim();
    if (pin.isEmpty || !RegExp(r'^\d{4,6}$').hasMatch(pin)) {
      setState(() {
        _errorMessage = t('onboarding.pinMustBe4to6Digits');
      });
      return;
    }
    if (pin != confirmPin) {
      setState(() {
        _errorMessage = t('onboarding.pinsDoNotMatch');
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final apiClient = ref.read(apiClientProvider);
      final storage = ref.read(secureStorageProvider);

      dynamic response;

      if (_profileImage != null) {
        response = await apiClient.upload(
          Endpoints.learners,
          filePath: _profileImage!.path,
          fieldName: 'profileImage',
          fields: {
            'name': _nameController.text.trim(),
            'dateOfBirth': _dateOfBirth!.toIso8601String(),
            'gradeLevel': _selectedGrade,
            'pin': _pinController.text.trim(),
            'preferredLanguage': _childLanguage ?? ref.read(localeProvider).languageCode,
          },
        );
      } else {
        response = await apiClient.post(
          Endpoints.learners,
          data: {
            'name': _nameController.text.trim(),
            'dateOfBirth': _dateOfBirth!.toIso8601String(),
            'gradeLevel': _selectedGrade,
            'pin': _pinController.text.trim(),
            'preferredLanguage': _childLanguage ?? ref.read(localeProvider).languageCode,
          },
        );
      }

      // Store the learnerId for the parent assessment step.
      final learnerId = response.data?['id'] as String?;
      if (learnerId != null) {
        await storage.saveUserInfo(
          userId: (await storage.getUserId()) ?? '',
          userRole: (await storage.getUserRole()) ?? '',
          learnerId: learnerId,
        );
      }

      if (mounted) {
        context.go('/onboarding/assessment');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = t('errors.pleaseTryAgain');
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
        title: Text(t('onboarding.addChild')),
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
                        t('onboarding.tellUsAboutChild'),
                        style: theme.textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      t('onboarding.tellUsAboutChildSubtitle'),
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
                        label: t('onboarding.addPhotoOptional'),
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
                        t('onboarding.addPhotoOptional'),
                        style: theme.textTheme.bodySmall,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ---- Name field ----
                    Semantics(
                      label: t('onboarding.childName'),
                      textField: true,
                      child: TextFormField(
                        controller: _nameController,
                        focusNode: _nameFocus,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        enabled: !_isSubmitting,
                        decoration: InputDecoration(
                          labelText: t('onboarding.childName'),
                          hintText: t('onboarding.firstName'),
                          prefixIcon: const Icon(Icons.child_care_outlined),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return t('onboarding.childNameRequired');
                          }
                          if (value.trim().length < 2) {
                            return t('onboarding.childNameRequired');
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Date of birth ----
                    Semantics(
                      label: t('onboarding.dateOfBirth'),
                      button: true,
                      child: InkWell(
                        onTap: _isSubmitting ? null : _pickDateOfBirth,
                        borderRadius: BorderRadius.circular(12),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: t('onboarding.dateOfBirth'),
                            prefixIcon: const Icon(Icons.cake_outlined),
                          ),
                          child: Text(
                            _dateOfBirth != null
                                ? dateFormat.format(_dateOfBirth!)
                                : t('onboarding.selectDate'),
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
                      label: t('onboarding.enrolledGrade'),
                      child: DropdownButtonFormField<String>(
                        initialValue: _selectedGrade,
                        decoration: InputDecoration(
                          labelText: t('onboarding.enrolledGrade'),
                          prefixIcon: const Icon(Icons.school_outlined),
                        ),
                        items: _gradeOptions
                            .map((grade) => DropdownMenuItem(
                                  value: grade,
                                  child: Text(
                                    t(_gradeI18nKeys[grade] ?? grade),
                                  ),
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
                            return t('onboarding.gradeLevelRequired');
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Child's preferred language ----
                    Semantics(
                      label: t('onboarding.childPreferredLanguage'),
                      child: LanguagePickerField(
                        selectedLocaleCode: _childLanguage,
                        onChanged: (code) =>
                            setState(() => _childLanguage = code),
                        labelText: t('onboarding.childPreferredLanguage'),
                        enabled: !_isSubmitting,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Text(
                        t('onboarding.childLanguageHint'),
                        style: theme.textTheme.bodySmall,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- PIN field ----
                    Semantics(
                      label: t('onboarding.createLearnerPin'),
                      textField: true,
                      child: TextFormField(
                        controller: _pinController,
                        keyboardType: TextInputType.number,
                        textInputAction: TextInputAction.next,
                        enabled: !_isSubmitting,
                        obscureText: _obscurePin,
                        maxLength: 6,
                        style: const TextStyle(
                          letterSpacing: 8,
                          fontSize: 20,
                        ),
                        textAlign: TextAlign.center,
                        decoration: InputDecoration(
                          labelText: t('onboarding.createLearnerPin'),
                          hintText: t('onboarding.pinMustBe4to6Digits'),
                          helperText: t('onboarding.pinHelperText'),
                          prefixIcon: const Icon(Icons.pin_outlined),
                          counterText: '',
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePin
                                ? Icons.visibility_off
                                : Icons.visibility),
                            onPressed: () {
                              setState(() => _obscurePin = !_obscurePin);
                            },
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return t('onboarding.pinRequired');
                          }
                          if (!RegExp(r'^\d{4,6}$').hasMatch(value)) {
                            return t('onboarding.pinMustBe4to6Digits');
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ---- Confirm PIN field ----
                    Semantics(
                      label: t('onboarding.confirmLearnerPin'),
                      textField: true,
                      child: TextFormField(
                        controller: _confirmPinController,
                        keyboardType: TextInputType.number,
                        textInputAction: TextInputAction.done,
                        enabled: !_isSubmitting,
                        obscureText: _obscureConfirmPin,
                        maxLength: 6,
                        style: const TextStyle(
                          letterSpacing: 8,
                          fontSize: 20,
                        ),
                        textAlign: TextAlign.center,
                        decoration: InputDecoration(
                          labelText: t('onboarding.confirmLearnerPin'),
                          hintText: t('onboarding.reenterPin'),
                          prefixIcon: const Icon(Icons.pin_outlined),
                          counterText: '',
                          suffixIcon: IconButton(
                            icon: Icon(_obscureConfirmPin
                                ? Icons.visibility_off
                                : Icons.visibility),
                            onPressed: () {
                              setState(() =>
                                  _obscureConfirmPin = !_obscureConfirmPin);
                            },
                          ),
                        ),
                        validator: (value) {
                          if (value != _pinController.text) {
                            return t('onboarding.pinsDoNotMatch');
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
                            : Text(t('common.continue')),
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
