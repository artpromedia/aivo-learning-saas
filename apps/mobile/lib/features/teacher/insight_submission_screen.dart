import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/i18n/translation_ext.dart';
import 'package:aivo_mobile/data/repositories/family_repository.dart';

// ---------------------------------------------------------------------------
// Skill key mapping (internal key → seed key suffix)
// ---------------------------------------------------------------------------

const _skillKeys = [
  'readingComprehension',
  'mathComputation',
  'writtenExpression',
  'verbalCommunication',
  'socialInteraction',
  'selfRegulation',
  'attention',
  'organization',
  'problemSolving',
  'fineMotor',
  'grossMotor',
  'followingDirections',
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class InsightSubmissionScreen extends ConsumerStatefulWidget {
  const InsightSubmissionScreen({super.key, this.learnerId});

  final String? learnerId;

  @override
  ConsumerState<InsightSubmissionScreen> createState() =>
      _InsightSubmissionScreenState();
}

class _InsightSubmissionScreenState
    extends ConsumerState<InsightSubmissionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();

  String _insightType = 'academic';
  String _severity = 'low';
  final Set<String> _selectedSkills = {};
  String? _photoPath;
  bool _isSubmitting = false;
  bool _submitted = false;

  static const _insightTypes = [
    'academic',
    'behavioral',
    'social',
    'communication',
  ];

  static const _severityLevels = ['low', 'medium', 'high'];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
      maxWidth: 1920,
    );

    if (image != null) {
      setState(() => _photoPath = image.path);
    }
  }

  Future<void> _pickFromGallery() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 1920,
    );

    if (image != null) {
      setState(() => _photoPath = image.path);
    }
  }

  Future<void> _submit() async {
    final t = ref.t;
    if (!_formKey.currentState!.validate()) return;
    if (widget.learnerId == null || widget.learnerId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(t('teacher.noLearnerSelected'))),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final insightData = <String, dynamic>{
        'learnerId': widget.learnerId,
        'insightType': _insightType,
        'description': _descriptionController.text.trim(),
        'severity': _severity,
        'relatedSkills': _selectedSkills.toList(),
      };

      if (_photoPath != null) {
        insightData['photoPath'] = _photoPath;
      }

      await ref
          .read(familyRepositoryProvider)
          .submitInsight(insightData);

      if (mounted) {
        setState(() {
          _submitted = true;
          _isSubmitting = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${t('teacher.failedToSubmitInsight')}: $e')),
        );
      }
    }
  }

  void _resetForm() {
    _descriptionController.clear();
    setState(() {
      _insightType = 'academic';
      _severity = 'low';
      _selectedSkills.clear();
      _photoPath = null;
      _submitted = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final t = ref.t;

    if (_submitted) {
      return Scaffold(
        appBar: AppBar(title: Text(t('teacher.insightSubmitted'))),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle,
                    size: 80, color: AivoColors.secondary,),
                const SizedBox(height: 24),
                Text(
                  t('teacher.insightSubmittedSuccess'),
                  style: theme.textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  t('teacher.insightRecordedDesc'),
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _resetForm,
                      icon: const Icon(Icons.add),
                      label: Text(t('teacher.submitAnother')),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        if (widget.learnerId != null) {
                          context.go(
                              '/teacher/learner/${widget.learnerId}',);
                        } else {
                          context.go('/teacher/classroom');
                        }
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: Text(t('common.back')),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(t('teacher.submitInsight'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Insight type selection
              Semantics(
                header: true,
                child: Text(t('teacher.insightType'),
                    style: theme.textTheme.titleMedium,),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: _insightTypes.map((type) {
                  final isSelected = _insightType == type;
                  final displayName = t('teacher.type${type[0].toUpperCase()}${type.substring(1)}');

                  IconData icon;
                  switch (type) {
                    case 'academic':
                      icon = Icons.school;
                    case 'behavioral':
                      icon = Icons.psychology;
                    case 'social':
                      icon = Icons.people;
                    case 'communication':
                      icon = Icons.chat;
                    default:
                      icon = Icons.lightbulb;
                  }

                  return Semantics(
                    selected: isSelected,
                    button: true,
                    child: ChoiceChip(
                      avatar: Icon(icon, size: 16),
                      label: Text(displayName),
                      selected: isSelected,
                      onSelected: (_) =>
                          setState(() => _insightType = type),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Description
              Semantics(
                header: true,
                child: Text(t('teacher.description'),
                    style: theme.textTheme.titleMedium,),
              ),
              const SizedBox(height: 8),
              Semantics(
                label: t('teacher.description'),
                textField: true,
                child: TextFormField(
                  controller: _descriptionController,
                  maxLines: 5,
                  maxLength: 1000,
                  decoration: InputDecoration(
                    hintText: t('teacher.descriptionHint'),
                    alignLabelWithHint: true,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return t('teacher.descriptionRequired');
                    }
                    if (value.trim().length < 10) {
                      return t('teacher.descriptionMinLength');
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Severity
              Semantics(
                header: true,
                child: Text(t('teacher.severity'),
                    style: theme.textTheme.titleMedium,),
              ),
              const SizedBox(height: 8),
              Row(
                children: _severityLevels.map((level) {
                  final isSelected = _severity == level;
                  Color color;
                  switch (level) {
                    case 'high':
                      color = AivoColors.error;
                    case 'medium':
                      color = AivoColors.accent;
                    default:
                      color = AivoColors.secondary;
                  }

                  final severityLabel = t('teacher.severity${level[0].toUpperCase()}${level.substring(1)}');

                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: level != 'high' ? 8 : 0,
                      ),
                      child: Semantics(
                        selected: isSelected,
                        button: true,
                        label: '$severityLabel ${t('teacher.severity').toLowerCase()}',
                        child: OutlinedButton(
                          onPressed: () =>
                              setState(() => _severity = level),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: isSelected
                                ? color.withValues(alpha: 0.12)
                                : null,
                            foregroundColor:
                                isSelected ? color : null,
                            side: BorderSide(
                              color: isSelected
                                  ? color
                                  : colorScheme.outline,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Text(severityLabel),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Related skills
              Semantics(
                header: true,
                child: Text(t('teacher.relatedSkills'),
                    style: theme.textTheme.titleMedium,),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: _skillKeys.map((skillKey) {
                  final isSelected = _selectedSkills.contains(skillKey);
                  final label = t('teacher.skill_$skillKey');
                  return FilterChip(
                    label: Text(label),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedSkills.add(skillKey);
                        } else {
                          _selectedSkills.remove(skillKey);
                        }
                      });
                    },
                    showCheckmark: true,
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Photo attachment
              Semantics(
                header: true,
                child: Text(t('teacher.photoOptional'),
                    style: theme.textTheme.titleMedium,),
              ),
              const SizedBox(height: 8),
              if (_photoPath != null) ...[
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.photo, color: AivoColors.secondary),
                    title: Text(t('teacher.photoAttached')),
                    subtitle: Text(
                      _photoPath!.split('/').last,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () =>
                          setState(() => _photoPath = null),
                      tooltip: t('common.close'),
                    ),
                  ),
                ),
              ] else
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _pickPhoto,
                        icon: const Icon(Icons.camera_alt),
                        label: Text(t('teacher.camera')),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _pickFromGallery,
                        icon: const Icon(Icons.photo_library),
                        label: Text(t('teacher.gallery')),
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 32),

              // Submit button
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: colorScheme.onPrimary,
                          ),
                        )
                      : Text(t('teacher.submitInsight')),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
