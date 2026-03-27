import 'package:flutter/material.dart';

/// Reusable OAuth sign-in button styled as an outlined button with a provider
/// icon and label. Full-width, 48 px tall.
class OAuthButton extends StatelessWidget {
  const OAuthButton({
    super.key,
    required this.providerName,
    required this.icon,
    this.onTap,
  });

  /// Display name of the OAuth provider (e.g. "Google", "Apple").
  final String providerName;

  /// Icon to display alongside the provider name.
  final IconData icon;

  /// Callback when the button is tapped. If `null` the button is disabled.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Semantics(
      button: true,
      label: 'Sign in with $providerName',
      child: SizedBox(
        height: 48,
        width: double.infinity,
        child: OutlinedButton(
          onPressed: onTap,
          style: OutlinedButton.styleFrom(
            foregroundColor: colorScheme.onSurface,
            side: BorderSide(color: colorScheme.outline),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  providerName,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: colorScheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
