import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Shimmer-based loading placeholder widgets.
///
/// Provides named constructors for common UI skeleton shapes: lists, cards,
/// text blocks, and avatars. All variants automatically adapt their base and
/// highlight colours to the current theme brightness.
class LoadingShimmer extends StatelessWidget {
  /// Creates a raw shimmer wrapper around an arbitrary [child].
  const LoadingShimmer({
    super.key,
    required this.child,
  });

  /// The placeholder shape to shimmer over.
  final Widget child;

  // -----------------------------------------------------------------------
  // Named constructors
  // -----------------------------------------------------------------------

  /// A vertical list of rectangular shimmer placeholders.
  ///
  /// [itemCount] controls how many rows are rendered (default 5).
  /// [itemHeight] controls the height of each row (default 72).
  factory LoadingShimmer.list({
    Key? key,
    int itemCount = 5,
    double itemHeight = 72,
    EdgeInsetsGeometry padding =
        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  }) {
    return LoadingShimmer(
      key: key,
      child: _ShimmerList(
        itemCount: itemCount,
        itemHeight: itemHeight,
        padding: padding,
      ),
    );
  }

  /// A card-shaped shimmer placeholder.
  factory LoadingShimmer.card({
    Key? key,
    double height = 180,
    double borderRadius = 16,
    EdgeInsetsGeometry margin =
        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  }) {
    return LoadingShimmer(
      key: key,
      child: _ShimmerCard(
        height: height,
        borderRadius: borderRadius,
        margin: margin,
      ),
    );
  }

  /// Text-line shimmers simulating paragraph loading.
  ///
  /// [lines] controls how many text rows are drawn (default 3).
  factory LoadingShimmer.text({
    Key? key,
    int lines = 3,
    EdgeInsetsGeometry padding =
        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  }) {
    return LoadingShimmer(
      key: key,
      child: _ShimmerText(lines: lines, padding: padding),
    );
  }

  /// A circular shimmer placeholder for avatar images.
  factory LoadingShimmer.avatar({
    Key? key,
    double size = 48,
  }) {
    return LoadingShimmer(
      key: key,
      child: _ShimmerAvatar(size: size),
    );
  }

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final baseColor = isDark
        ? const Color(0xFF2A2A3C)
        : const Color(0xFFE0E0E0);
    final highlightColor = isDark
        ? const Color(0xFF3D3D50)
        : const Color(0xFFF5F5F5);

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: child,
    );
  }
}

// ---------------------------------------------------------------------------
// Internal shape widgets
// ---------------------------------------------------------------------------

class _ShimmerList extends StatelessWidget {
  const _ShimmerList({
    required this.itemCount,
    required this.itemHeight,
    required this.padding,
  });

  final int itemCount;
  final double itemHeight;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Column(
        children: List.generate(itemCount, (index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: itemHeight * 0.7,
                  height: itemHeight,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 14,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 14,
                        width: 140,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 10,
                        width: 80,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  const _ShimmerCard({
    required this.height,
    required this.borderRadius,
    required this.margin,
  });

  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry margin;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: margin,
      child: Container(
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class _ShimmerText extends StatelessWidget {
  const _ShimmerText({
    required this.lines,
    required this.padding,
  });

  final int lines;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(lines, (index) {
          // Make the last line shorter.
          final isLast = index == lines - 1;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Container(
              height: 14,
              width: isLast ? 160 : double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _ShimmerAvatar extends StatelessWidget {
  const _ShimmerAvatar({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}
