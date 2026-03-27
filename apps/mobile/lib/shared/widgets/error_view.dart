import 'package:flutter/material.dart';

/// A reusable error display widget for the AIVO Learning app.
///
/// Provides two layout modes:
/// * **Inline** (default constructor) -- suitable for embedding inside a list
///   or a column alongside other content.
/// * **Full-screen** ([ErrorView.fullScreen]) -- centres the error message in
///   a [Scaffold]-filling area and is intended for route-level error states.
///
/// Both variants display an icon, a message, and an optional "Try Again"
/// button. An accessible live-region announcement is made so screen readers
/// immediately convey the error state.
class ErrorView extends StatelessWidget {
  /// Creates an inline error view.
  const ErrorView({
    super.key,
    required this.message,
    this.onRetry,
    this.icon,
    this.iconSize = 48,
    this.iconColor,
    this.retryLabel = 'Try Again',
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
  }) : _isFullScreen = false;

  /// Creates a full-screen centred error view.
  const ErrorView.fullScreen({
    super.key,
    required this.message,
    this.onRetry,
    this.icon,
    this.iconSize = 72,
    this.iconColor,
    this.retryLabel = 'Try Again',
    this.padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
  }) : _isFullScreen = true;

  /// The error message to display.
  final String message;

  /// Callback invoked when the user taps the retry button. When `null` the
  /// button is hidden.
  final VoidCallback? onRetry;

  /// The icon to show above the message. Defaults to [Icons.error_outline].
  final IconData? icon;

  /// Icon size. Defaults to 48 for inline, 72 for full-screen.
  final double iconSize;

  /// Icon colour override. Defaults to the theme's error colour.
  final Color? iconColor;

  /// Label for the retry button. Defaults to "Try Again".
  final String retryLabel;

  /// Padding around the content.
  final EdgeInsetsGeometry padding;

  final bool _isFullScreen;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveIconColor = iconColor ?? theme.colorScheme.error;
    final effectiveIcon = icon ?? Icons.error_outline;

    final content = Semantics(
      liveRegion: true,
      child: Padding(
        padding: padding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              effectiveIcon,
              size: iconSize,
              color: effectiveIconColor,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurface,
              ),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              Semantics(
                button: true,
                label: retryLabel,
                child: ElevatedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh, size: 18),
                  label: Text(retryLabel),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );

    if (_isFullScreen) {
      return Center(child: content);
    }

    return content;
  }
}
