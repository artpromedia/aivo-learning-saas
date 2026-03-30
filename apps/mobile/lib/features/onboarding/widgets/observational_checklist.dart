import 'package:flutter/material.dart';

/// A single item in the PRE_SYMBOLIC observational checklist.
class ChecklistItem {
  const ChecklistItem({
    required this.id,
    required this.category,
    required this.description,
  });

  final String id;

  /// Category grouping: sensory, motor, communication, social.
  final String category;

  /// Human-readable milestone description.
  final String description;
}

/// Widget for PRE_SYMBOLIC assessments.
///
/// Displays a checklist of developmental milestones grouped by category.
/// Each item has a checkbox, description, and optional notes field.
/// Includes an "Add observation" section for free-text notes and a
/// summary of checked items at the bottom.
class ObservationalChecklist extends StatefulWidget {
  const ObservationalChecklist({
    super.key,
    required this.items,
    required this.checkedItems,
    required this.notes,
    required this.freeTextObservations,
    required this.onCheckChanged,
    required this.onNoteChanged,
    required this.onAddObservation,
  });

  final List<ChecklistItem> items;
  final Map<String, bool> checkedItems;
  final Map<String, String> notes;
  final List<String> freeTextObservations;
  final void Function(String id, bool checked) onCheckChanged;
  final void Function(String id, String note) onNoteChanged;
  final void Function(String text) onAddObservation;

  @override
  State<ObservationalChecklist> createState() =>
      _ObservationalChecklistState();
}

class _ObservationalChecklistState extends State<ObservationalChecklist> {
  final _observationController = TextEditingController();
  final Set<String> _expandedNotes = {};

  @override
  void dispose() {
    _observationController.dispose();
    super.dispose();
  }

  /// Group items by category preserving insertion order.
  Map<String, List<ChecklistItem>> get _groupedItems {
    final map = <String, List<ChecklistItem>>{};
    for (final item in widget.items) {
      map.putIfAbsent(item.category, () => []).add(item);
    }
    return map;
  }

  int get _checkedCount =>
      widget.checkedItems.values.where((v) => v).length;

  void _addObservation() {
    final text = _observationController.text.trim();
    if (text.isEmpty) return;
    widget.onAddObservation(text);
    _observationController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final grouped = _groupedItems;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        // ---- Header ----
        Semantics(
          header: true,
          child: Text(
            'Observational Checklist',
            style: theme.textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Mark each milestone you observe in your child. '
          'Add notes for any items that need clarification.',
          style: theme.textTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),

        // ---- Category sections ----
        ...grouped.entries.expand((entry) => [
              _CategoryHeader(
                category: entry.key,
                icon: _iconForCategory(entry.key),
              ),
              const SizedBox(height: 8),
              ...entry.value.map((item) => _buildChecklistTile(
                    item,
                    theme,
                    colorScheme,
                  ),),
              const SizedBox(height: 16),
            ],),

        const Divider(),
        const SizedBox(height: 16),

        // ---- Free-text observations ----
        Text(
          'Additional Observations',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Semantics(
                label: 'Add a free-text observation',
                textField: true,
                child: TextField(
                  controller: _observationController,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    hintText: 'Type an observation...',
                  ),
                  onSubmitted: (_) => _addObservation(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: _addObservation,
              icon: const Icon(Icons.add),
              tooltip: 'Add observation',
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...widget.freeTextObservations.asMap().entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.notes,
                        size: 16, color: colorScheme.onSurfaceVariant,),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        entry.value,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),

        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 12),

        // ---- Summary ----
        Semantics(
          liveRegion: true,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_outline,
                    color: colorScheme.secondary,),
                const SizedBox(width: 8),
                Text(
                  '$_checkedCount of ${widget.items.length} milestones observed',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildChecklistTile(
    ChecklistItem item,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final isChecked = widget.checkedItems[item.id] ?? false;
    final hasNoteExpanded = _expandedNotes.contains(item.id);
    final noteText = widget.notes[item.id] ?? '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        decoration: BoxDecoration(
          color: isChecked
              ? colorScheme.secondaryContainer.withValues(alpha: 0.3)
              : colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isChecked
                ? colorScheme.secondary.withValues(alpha: 0.5)
                : colorScheme.outline.withValues(alpha: 0.5),
          ),
        ),
        child: Column(
          children: [
            Semantics(
              label: '${item.description}. ${isChecked ? "Checked" : "Unchecked"}',
              child: InkWell(
                onTap: () => widget.onCheckChanged(item.id, !isChecked),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  child: Row(
                    children: [
                      SizedBox(
                        height: 24,
                        width: 24,
                        child: Checkbox(
                          value: isChecked,
                          onChanged: (v) =>
                              widget.onCheckChanged(item.id, v ?? false),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          item.description,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            decoration: isChecked
                                ? TextDecoration.none
                                : TextDecoration.none,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          hasNoteExpanded
                              ? Icons.expand_less
                              : Icons.note_add_outlined,
                          size: 20,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        onPressed: () {
                          setState(() {
                            if (hasNoteExpanded) {
                              _expandedNotes.remove(item.id);
                            } else {
                              _expandedNotes.add(item.id);
                            }
                          });
                        },
                        tooltip: hasNoteExpanded
                            ? 'Hide notes'
                            : 'Add notes',
                        visualDensity: VisualDensity.compact,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (hasNoteExpanded)
              Padding(
                padding: const EdgeInsets.fromLTRB(48, 0, 12, 12),
                child: Semantics(
                  label: 'Notes for ${item.description}',
                  textField: true,
                  child: TextField(
                    controller: TextEditingController(text: noteText)
                      ..selection = TextSelection.fromPosition(
                        TextPosition(offset: noteText.length),
                      ),
                    onChanged: (value) =>
                        widget.onNoteChanged(item.id, value),
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Add notes...',
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  IconData _iconForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'sensory':
        return Icons.visibility_outlined;
      case 'motor':
        return Icons.accessibility_new;
      case 'communication':
        return Icons.chat_bubble_outline;
      case 'social':
        return Icons.people_outline;
      default:
        return Icons.checklist;
    }
  }
}

// ---------------------------------------------------------------------------
// Category header
// ---------------------------------------------------------------------------

class _CategoryHeader extends StatelessWidget {
  const _CategoryHeader({
    required this.category,
    required this.icon,
  });

  final String category;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Row(
      children: [
        Icon(icon, size: 20, color: colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          category,
          style: theme.textTheme.titleMedium?.copyWith(
            color: colorScheme.primary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
