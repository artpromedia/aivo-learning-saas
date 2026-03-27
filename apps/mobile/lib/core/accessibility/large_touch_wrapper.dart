import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// LargeTouchWrapper
// ---------------------------------------------------------------------------

/// Wraps [child] with an appropriately-sized touch target based on the current
/// [FunctioningLevel].
///
/// | Level         | Min size | Extra padding |
/// |---------------|----------|---------------|
/// | standard      | 48x48    | none          |
/// | supported     | 48x48    | none          |
/// | lowVerbal     | 80x80    | 8px all       |
/// | nonVerbal     | 80x80    | 8px all       |
/// | preSymbolic   | 80x80    | 8px all       |
class LargeTouchWrapper extends ConsumerWidget {
  const LargeTouchWrapper({
    super.key,
    required this.child,
    this.onTap,
    this.semanticLabel,
  });

  final Widget child;
  final VoidCallback? onTap;

  /// Optional label used for screen-reader semantics.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final level = ref.watch(functioningLevelProvider);

    final double minSize;
    final EdgeInsetsGeometry padding;

    switch (level) {
      case FunctioningLevel.standard:
        minSize = 48.0;
        padding = EdgeInsets.zero;
        break;
      case FunctioningLevel.supported:
        minSize = 48.0;
        padding = EdgeInsets.zero;
        break;
      case FunctioningLevel.lowVerbal:
      case FunctioningLevel.nonVerbal:
      case FunctioningLevel.preSymbolic:
        minSize = 80.0;
        padding = const EdgeInsets.all(8.0);
        break;
    }

    Widget content = ConstrainedBox(
      constraints: BoxConstraints(
        minWidth: minSize,
        minHeight: minSize,
      ),
      child: Padding(
        padding: padding,
        child: Center(child: child),
      ),
    );

    return Semantics(
      label: semanticLabel,
      button: onTap != null,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: content,
      ),
    );
  }
}
