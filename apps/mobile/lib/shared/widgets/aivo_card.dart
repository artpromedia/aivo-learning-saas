import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

/// A themed card widget for the AIVO Learning app.
///
/// Adapts its padding for the user's functioning level, supports optional
/// header/footer slots, and wraps tappable cards in [Semantics] with an
/// [InkWell] ripple effect.
class AivoCard extends ConsumerWidget {
  const AivoCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.elevation,
    this.borderRadius,
    this.color,
    this.header,
    this.footer,
    this.semanticsLabel,
    this.margin,
    this.border,
    this.clipBehavior = Clip.antiAlias,
  });

  /// The main body content of the card.
  final Widget child;

  /// When non-null the card responds to taps with a ripple effect.
  final VoidCallback? onTap;

  /// Override for inner content padding. When `null` the default is adapted
  /// based on the user's functioning level.
  final EdgeInsetsGeometry? padding;

  /// Material elevation. Defaults to 2.
  final double? elevation;

  /// Corner radius. Defaults to 16.
  final BorderRadiusGeometry? borderRadius;

  /// Card background colour override.
  final Color? color;

  /// Optional widget rendered above [child] inside the card.
  final Widget? header;

  /// Optional widget rendered below [child] inside the card.
  final Widget? footer;

  /// Semantic label for the entire card (announced when tappable).
  final String? semanticsLabel;

  /// Outer margin around the card.
  final EdgeInsetsGeometry? margin;

  /// Optional border around the card.
  final BoxBorder? border;

  /// Clip behaviour for the card. Defaults to [Clip.antiAlias].
  final Clip clipBehavior;

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  EdgeInsetsGeometry _effectivePadding(bool isLowVerbal) {
    if (padding != null) return padding!;
    return isLowVerbal
        ? const EdgeInsets.all(20)
        : const EdgeInsets.all(16);
  }

  BorderRadiusGeometry get _effectiveBorderRadius =>
      borderRadius ?? BorderRadius.circular(16);

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);
    final effectivePadding = _effectivePadding(isLowVerbal);
    final effectiveColor = color ?? theme.cardTheme.color ?? theme.colorScheme.surface;
    final effectiveElevation = elevation ?? 2;

    // --- Inner content ---
    Widget content = Padding(
      padding: effectivePadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (header != null) ...[
            header!,
            const SizedBox(height: 12),
          ],
          child,
          if (footer != null) ...[
            const SizedBox(height: 12),
            footer!,
          ],
        ],
      ),
    );

    // --- Card shell ---
    final cardShape = RoundedRectangleBorder(
      borderRadius: _effectiveBorderRadius,
    );

    Widget card = Material(
      color: effectiveColor,
      elevation: effectiveElevation,
      shadowColor: theme.colorScheme.primary.withAlpha(20),
      shape: border != null
          ? RoundedRectangleBorder(
              borderRadius: _effectiveBorderRadius,
              side: BorderSide.none,
            )
          : cardShape,
      clipBehavior: clipBehavior,
      child: border != null
          ? DecoratedBox(
              decoration: BoxDecoration(
                border: border,
                borderRadius: _effectiveBorderRadius,
              ),
              child: onTap != null
                  ? InkWell(
                      onTap: onTap,
                      borderRadius:
                          _effectiveBorderRadius as BorderRadius?,
                      child: content,
                    )
                  : content,
            )
          : onTap != null
              ? InkWell(
                  onTap: onTap,
                  borderRadius:
                      _effectiveBorderRadius as BorderRadius?,
                  child: content,
                )
              : content,
    );

    if (margin != null) {
      card = Padding(padding: margin!, child: card);
    }

    // --- Semantics ---
    if (onTap != null) {
      return Semantics(
        label: semanticsLabel,
        button: true,
        enabled: true,
        child: card,
      );
    }

    if (semanticsLabel != null) {
      return Semantics(
        label: semanticsLabel,
        container: true,
        child: card,
      );
    }

    return card;
  }
}
