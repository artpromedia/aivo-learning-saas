import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Convenience extensions on [BuildContext] for common theme, layout, and
/// navigation operations used throughout the AIVO Learning app.
extension AivoContextExtensions on BuildContext {
  // -----------------------------------------------------------------------
  // Theme shortcuts
  // -----------------------------------------------------------------------

  /// Shorthand for `Theme.of(this)`.
  ThemeData get theme => Theme.of(this);

  /// Shorthand for `Theme.of(this).colorScheme`.
  ColorScheme get colorScheme => Theme.of(this).colorScheme;

  /// Shorthand for `Theme.of(this).textTheme`.
  TextTheme get textTheme => Theme.of(this).textTheme;

  /// `true` when the current theme brightness is [Brightness.dark].
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  // -----------------------------------------------------------------------
  // Media query shortcuts
  // -----------------------------------------------------------------------

  /// Shorthand for `MediaQuery.of(this)`.
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// The logical width of the screen in density-independent pixels.
  double get screenWidth => MediaQuery.of(this).size.width;

  /// The logical height of the screen in density-independent pixels.
  double get screenHeight => MediaQuery.of(this).size.height;

  /// `true` when the screen width is less than 360 dp.
  bool get isSmallScreen => screenWidth < 360;

  /// `true` when the screen width is >= 360 dp and < 600 dp.
  bool get isMediumScreen => screenWidth >= 360 && screenWidth < 600;

  /// `true` when the screen width is >= 600 dp (e.g. tablets).
  bool get isLargeScreen => screenWidth >= 600;

  // -----------------------------------------------------------------------
  // SnackBar helpers
  // -----------------------------------------------------------------------

  /// Shows a [SnackBar] with the given [message].
  ///
  /// When [isError] is `true` the snack bar uses the theme's error colour
  /// scheme; otherwise it uses the default theme styling.
  void showSnackBar(String message, {bool isError = false}) {
    final messenger = ScaffoldMessenger.of(this);
    messenger.hideCurrentSnackBar();

    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isError ? colorScheme.error : null,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
    );
    messenger.showSnackBar(snackBar);
  }

  /// Shows a success-styled [SnackBar] with a green background.
  void showSuccessSnackBar(String message) {
    final messenger = ScaffoldMessenger.of(this);
    messenger.hideCurrentSnackBar();

    final snackBar = SnackBar(
      content: Row(
        children: [
          const Icon(Icons.check_circle, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Expanded(child: Text(message)),
        ],
      ),
      backgroundColor: colorScheme.secondary,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
    );
    messenger.showSnackBar(snackBar);
  }

  /// Shows an error-styled [SnackBar] with the theme's error colour.
  void showErrorSnackBar(String message) {
    showSnackBar(message, isError: true);
  }

  // -----------------------------------------------------------------------
  // Navigation helpers (GoRouter)
  // -----------------------------------------------------------------------

  /// Navigates to [route] using [GoRouter.go] (replaces the current stack).
  void navigate(String route) => GoRouter.of(this).go(route);

  /// Pushes [route] onto the navigation stack using [GoRouter.push].
  void pushRoute(String route) => GoRouter.of(this).push(route);
}
