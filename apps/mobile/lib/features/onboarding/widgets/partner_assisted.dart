import 'package:flutter/material.dart';

/// A single prompt for the NON_VERBAL partner-assisted assessment.
class PartnerAssistedPrompt {
  const PartnerAssistedPrompt({
    required this.id,
    required this.instruction,
    required this.question,
  });

  final String id;

  /// Instructions for the parent / caregiver to carry out.
  final String instruction;

  /// The observation question: "Does your child..."
  final String question;
}

/// Facilitator-facing UI for NON_VERBAL assessments.
///
/// Displays instructions for the parent/caregiver, observation prompts with
/// yes / no / sometimes responses. Uses large text and switch-scan compatible
/// layout.
class PartnerAssisted extends StatelessWidget {
  const PartnerAssisted({
    super.key,
    required this.prompt,
    this.selectedValue,
    required this.onSelect,
  });

  final PartnerAssistedPrompt prompt;
  final String? selectedValue;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ---- Facilitator badge ----
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: colorScheme.tertiaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.person_outline,
                    size: 18, color: colorScheme.onTertiaryContainer,),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'For Parent / Caregiver',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: colorScheme.onTertiaryContainer,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ---- Instruction card ----
          Semantics(
            label: 'Instruction for facilitator',
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: colorScheme.outline),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.info_outline,
                          size: 20, color: colorScheme.primary,),
                      const SizedBox(width: 8),
                      Text(
                        'What to do:',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: colorScheme.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    prompt.instruction,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontSize: 18,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),

          // ---- Observation question ----
          Semantics(
            header: true,
            child: Text(
              prompt.question,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontSize: 22,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),

          // ---- Response buttons (large, switch-scan compatible) ----
          _ResponseButton(
            label: 'Yes',
            icon: Icons.check_circle_outline,
            isSelected: selectedValue == 'yes',
            color: colorScheme.secondary,
            onTap: () => onSelect('yes'),
          ),
          const SizedBox(height: 12),
          _ResponseButton(
            label: 'Sometimes',
            icon: Icons.remove_circle_outline,
            isSelected: selectedValue == 'sometimes',
            color: colorScheme.tertiary,
            onTap: () => onSelect('sometimes'),
          ),
          const SizedBox(height: 12),
          _ResponseButton(
            label: 'No',
            icon: Icons.cancel_outlined,
            isSelected: selectedValue == 'no',
            color: colorScheme.error,
            onTap: () => onSelect('no'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Response button
// ---------------------------------------------------------------------------

class _ResponseButton extends StatelessWidget {
  const _ResponseButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.color,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      button: true,
      label: label,
      selected: isSelected,
      child: Material(
        color: isSelected
            ? color.withValues(alpha: 0.15)
            : colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? color : colorScheme.outline,
                width: isSelected ? 3 : 1,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isSelected
                      ? (label == 'Yes'
                          ? Icons.check_circle
                          : label == 'No'
                              ? Icons.cancel
                              : Icons.remove_circle)
                      : icon,
                  size: 28,
                  color: isSelected ? color : colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: isSelected ? color : colorScheme.onSurface,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w600,
                    fontSize: 20,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
