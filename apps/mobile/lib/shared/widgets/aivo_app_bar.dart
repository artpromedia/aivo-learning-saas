import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/shared/widgets/offline_banner.dart';

/// A custom [AppBar] for the AIVO Learning app.
///
/// Supports an optional offline banner displayed directly below the app bar,
/// a leading back button with proper semantics, title text, trailing actions,
/// and a leading widget override.
class AivoAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const AivoAppBar({
    super.key,
    required this.title,
    this.showBack = true,
    this.actions,
    this.showOfflineBanner = false,
    this.leading,
    this.bottom,
    this.centerTitle = true,
    this.titleWidget,
    this.backgroundColor,
    this.foregroundColor,
    this.elevation,
  });

  /// The title text displayed in the centre of the app bar.
  final String title;

  /// Whether to display a back button as the leading widget. Defaults to
  /// `true`. Ignored when [leading] is provided.
  final bool showBack;

  /// Optional trailing action widgets.
  final List<Widget>? actions;

  /// When `true`, an [OfflineBanner] is shown below the app bar.
  final bool showOfflineBanner;

  /// Optional leading widget override. When non-null, takes precedence over
  /// the default back button regardless of [showBack].
  final Widget? leading;

  /// An optional bottom widget (e.g. a [TabBar]).
  final PreferredSizeWidget? bottom;

  /// Whether the title should be centred. Defaults to `true`.
  final bool centerTitle;

  /// An optional widget to use in place of the text [title]. When provided
  /// the [title] string is still used for accessibility semantics.
  final Widget? titleWidget;

  /// Optional background colour override.
  final Color? backgroundColor;

  /// Optional foreground colour override.
  final Color? foregroundColor;

  /// Optional elevation override.
  final double? elevation;

  @override
  Size get preferredSize {
    double height = kToolbarHeight;
    if (bottom != null) {
      height += bottom!.preferredSize.height;
    }
    if (showOfflineBanner) {
      height += OfflineBanner.bannerHeight;
    }
    return Size.fromHeight(height);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    Widget? leadingWidget = leading;
    if (leadingWidget == null && showBack) {
      final canPop = Navigator.of(context).canPop();
      if (canPop) {
        leadingWidget = Semantics(
          label: 'Go back',
          button: true,
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            tooltip: 'Back',
            onPressed: () => Navigator.of(context).maybePop(),
          ),
        );
      }
    }

    final appBar = AppBar(
      leading: leadingWidget,
      title: titleWidget ??
          Text(
            title,
            style: theme.appBarTheme.titleTextStyle ??
                theme.textTheme.titleLarge,
          ),
      centerTitle: centerTitle,
      actions: actions,
      backgroundColor: backgroundColor ?? theme.appBarTheme.backgroundColor,
      foregroundColor: foregroundColor ?? theme.appBarTheme.foregroundColor,
      elevation: elevation ?? theme.appBarTheme.elevation ?? 0,
      bottom: bottom,
    );

    if (!showOfflineBanner) {
      return appBar;
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        appBar,
        const OfflineBanner(),
      ],
    );
  }
}
