import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// Button variant & size enums
// ---------------------------------------------------------------------------

/// Visual style variants for [AivoButton].
enum AivoButtonVariant {
  primary,
  secondary,
  outlined,
  text,
  danger,
}

/// Sizing presets for [AivoButton].
enum AivoButtonSize {
  small,
  medium,
  large,
}

// ---------------------------------------------------------------------------
// AivoButton widget
// ---------------------------------------------------------------------------

/// A fully-featured button for the AIVO Learning app.
///
/// Supports five visual [variant]s, three [size] presets, a [isLoading] state
/// that swaps the label for a [CircularProgressIndicator], an optional leading
/// [icon], and a [fullWidth] flag.
///
/// When the user's functioning level is [FunctioningLevel.lowVerbal] or below,
/// the minimum tap target is enlarged to 80 px to comply with enhanced
/// accessibility requirements.
class AivoButton extends ConsumerWidget {
  const AivoButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AivoButtonVariant.primary,
    this.size = AivoButtonSize.medium,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.fullWidth = false,
    this.semanticsLabel,
  });

  /// The button label text.
  final String label;

  /// Callback invoked when the button is pressed. Ignored when [isDisabled] or
  /// [isLoading] is `true`.
  final VoidCallback? onPressed;

  /// The visual style variant.
  final AivoButtonVariant variant;

  /// The size preset that controls padding and font size.
  final AivoButtonSize size;

  /// Shows a spinner in place of the label when `true`.
  final bool isLoading;

  /// Disables the button when `true`.
  final bool isDisabled;

  /// An optional icon shown before the label.
  final IconData? icon;

  /// When `true` the button stretches to fill its parent width.
  final bool fullWidth;

  /// Override the default semantics label.
  final String? semanticsLabel;

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  EdgeInsetsGeometry _padding(bool isLowVerbal) {
    switch (size) {
      case AivoButtonSize.small:
        return EdgeInsets.symmetric(
          horizontal: 16,
          vertical: isLowVerbal ? 14 : 8,
        );
      case AivoButtonSize.medium:
        return EdgeInsets.symmetric(
          horizontal: 24,
          vertical: isLowVerbal ? 20 : 14,
        );
      case AivoButtonSize.large:
        return EdgeInsets.symmetric(
          horizontal: 32,
          vertical: isLowVerbal ? 24 : 18,
        );
    }
  }

  double _fontSize() {
    switch (size) {
      case AivoButtonSize.small:
        return 13;
      case AivoButtonSize.medium:
        return 14;
      case AivoButtonSize.large:
        return 16;
    }
  }

  double _iconSize() {
    switch (size) {
      case AivoButtonSize.small:
        return 16;
      case AivoButtonSize.medium:
        return 18;
      case AivoButtonSize.large:
        return 22;
    }
  }

  double _spinnerSize() {
    switch (size) {
      case AivoButtonSize.small:
        return 14;
      case AivoButtonSize.medium:
        return 18;
      case AivoButtonSize.large:
        return 22;
    }
  }

  double _minHeight(bool isLowVerbal) {
    if (isLowVerbal) return 80;
    switch (size) {
      case AivoButtonSize.small:
        return 36;
      case AivoButtonSize.medium:
        return 48;
      case AivoButtonSize.large:
        return 56;
    }
  }

  BorderRadius get _borderRadius => BorderRadius.circular(12);

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);
    final effectiveOnPressed =
        (isDisabled || isLoading) ? null : onPressed;

    // --- Resolve colours per variant ---
    final Color foreground;
    final Color background;
    final BorderSide? side;

    switch (variant) {
      case AivoButtonVariant.primary:
        background = colorScheme.primary;
        foreground = colorScheme.onPrimary;
        side = null;
      case AivoButtonVariant.secondary:
        background = colorScheme.secondaryContainer;
        foreground = colorScheme.onSecondaryContainer;
        side = null;
      case AivoButtonVariant.outlined:
        background = Colors.transparent;
        foreground = colorScheme.primary;
        side = BorderSide(color: colorScheme.primary, width: 1.5);
      case AivoButtonVariant.text:
        background = Colors.transparent;
        foreground = colorScheme.primary;
        side = null;
      case AivoButtonVariant.danger:
        background = colorScheme.error;
        foreground = colorScheme.onError;
        side = null;
    }

    // --- Build child content ---
    final Widget child;
    if (isLoading) {
      child = SizedBox(
        width: _spinnerSize(),
        height: _spinnerSize(),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(foreground),
        ),
      );
    } else {
      final textWidget = Text(
        label,
        style: theme.textTheme.labelLarge?.copyWith(
          fontSize: _fontSize(),
          color: foreground,
        ),
      );

      if (icon != null) {
        child = Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: _iconSize(), color: foreground),
            const SizedBox(width: 8),
            Flexible(child: textWidget),
          ],
        );
      } else {
        child = textWidget;
      }
    }

    // --- Button style ---
    final style = ButtonStyle(
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return background.withAlpha(100);
        }
        return background;
      }),
      foregroundColor: WidgetStatePropertyAll(foreground),
      padding: WidgetStatePropertyAll(_padding(isLowVerbal)),
      minimumSize: WidgetStatePropertyAll(
        Size(fullWidth ? double.infinity : 0, _minHeight(isLowVerbal)),
      ),
      maximumSize: WidgetStatePropertyAll(
        Size(fullWidth ? double.infinity : double.infinity, double.infinity),
      ),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(
          borderRadius: _borderRadius,
          side: side ?? BorderSide.none,
        ),
      ),
      elevation: variant == AivoButtonVariant.text ||
              variant == AivoButtonVariant.outlined
          ? const WidgetStatePropertyAll(0)
          : WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.disabled)) return 0;
              if (states.contains(WidgetState.pressed)) return 0;
              return 2;
            }),
      overlayColor: WidgetStatePropertyAll(foreground.withAlpha(20)),
    );

    final button = ElevatedButton(
      onPressed: effectiveOnPressed,
      style: style,
      child: child,
    );

    return Semantics(
      label: semanticsLabel ?? label,
      button: true,
      enabled: effectiveOnPressed != null,
      child: fullWidth
          ? SizedBox(width: double.infinity, child: button)
          : button,
    );
  }
}
