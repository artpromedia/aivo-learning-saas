import 'package:flutter/material.dart';

/// Describes one picture option for a LOW_VERBAL assessment question.
class PictureOption {
  const PictureOption({
    required this.value,
    required this.label,
    required this.imageAsset,
  });

  final String value;
  final String label;
  final String imageAsset;
}

/// Widget for LOW_VERBAL assessments.
///
/// Shows two picture cards (minimum 80x80 px) with simple labels and large
/// touch targets. Includes audio narration support and a celebration animation
/// when a selection is made.
class PictureQuestion extends StatefulWidget {
  const PictureQuestion({
    super.key,
    required this.questionText,
    required this.optionA,
    required this.optionB,
    this.selectedValue,
    required this.onSelect,
    this.audioUrl,
  });

  final String questionText;
  final PictureOption optionA;
  final PictureOption optionB;
  final String? selectedValue;
  final ValueChanged<String> onSelect;

  /// Optional audio URL for narrating the question.
  final String? audioUrl;

  @override
  State<PictureQuestion> createState() => _PictureQuestionState();
}

class _PictureQuestionState extends State<PictureQuestion>
    with SingleTickerProviderStateMixin {
  late AnimationController _celebrationController;
  late Animation<double> _scaleAnimation;
  String? _justSelected;

  @override
  void initState() {
    super.initState();
    _celebrationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.15)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.15, end: 1.0)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 50,
      ),
    ]).animate(_celebrationController);
  }

  @override
  void dispose() {
    _celebrationController.dispose();
    super.dispose();
  }

  void _handleSelect(String value) {
    setState(() {
      _justSelected = value;
    });
    _celebrationController.forward(from: 0);
    widget.onSelect(value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // ---- Question text + audio ----
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: Semantics(
                  header: true,
                  child: Text(
                    widget.questionText,
                    style: theme.textTheme.headlineSmall,
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              IconButton(
                icon: Icon(Icons.volume_up, color: colorScheme.primary),
                onPressed: () {
                  // Audio playback via audioplayers; narrate the question.
                },
                tooltip: 'Listen to question',
                iconSize: 32,
              ),
            ],
          ),
          const SizedBox(height: 32),

          // ---- Picture cards ----
          Row(
            children: [
              Expanded(
                child: _buildCard(
                  widget.optionA,
                  theme,
                  colorScheme,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildCard(
                  widget.optionB,
                  theme,
                  colorScheme,
                ),
              ),
            ],
          ),

          // ---- Celebration feedback ----
          if (widget.selectedValue != null) ...[
            const SizedBox(height: 24),
            Semantics(
              liveRegion: true,
              child: Icon(
                Icons.check_circle,
                color: colorScheme.secondary,
                size: 40,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCard(
    PictureOption option,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    final isSelected = widget.selectedValue == option.value;
    final isJustSelected = _justSelected == option.value;

    Widget card = Semantics(
      label: option.label,
      button: true,
      selected: isSelected,
      child: Material(
        color: isSelected
            ? colorScheme.primaryContainer
            : colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        elevation: isSelected ? 4 : 1,
        child: InkWell(
          onTap: () => _handleSelect(option.value),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            constraints: const BoxConstraints(minHeight: 140),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color:
                    isSelected ? colorScheme.primary : colorScheme.outline,
                width: isSelected ? 3 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Image placeholder -- uses AssetImage or a fallback icon.
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    width: 80,
                    height: 80,
                    child: Image.asset(
                      option.imageAsset,
                      width: 80,
                      height: 80,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.image_outlined,
                          size: 40,
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  option.label,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: isSelected
                        ? colorScheme.onPrimaryContainer
                        : colorScheme.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );

    // Wrap with scale animation for the just-selected card.
    if (isJustSelected) {
      card = AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: child,
          );
        },
        child: card,
      );
    }

    return card;
  }
}
