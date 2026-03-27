import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/config/routes.dart';
import 'package:aivo_mobile/config/theme.dart';

// ---------------------------------------------------------------------------
// Accessibility providers
// ---------------------------------------------------------------------------

/// Persisted theme mode preference. Defaults to system.
final themeModeProvider = StateProvider<ThemeMode>((_) => ThemeMode.system);

/// Whether to use the OpenDyslexic font across the app.
final dyslexicFontProvider = StateProvider<bool>((_) => false);

/// Learner functioning level drives text scale and UI density.
///
/// Levels:
///   1 - Very young / significant support  (text scale 1.3, larger targets)
///   2 - Moderate support                  (text scale 1.15)
///   3 - Standard                          (text scale 1.0)
///   4 - Advanced / minimal support        (text scale 0.95)
final functioningLevelProvider = StateProvider<int>((_) => 3);

// ---------------------------------------------------------------------------
// Root app widget
// ---------------------------------------------------------------------------

class AivoApp extends ConsumerWidget {
  const AivoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final router = ref.watch(routerProvider);
    final useDyslexicFont = ref.watch(dyslexicFontProvider);
    final functioningLevel = ref.watch(functioningLevelProvider);

    return FunctioningLevelAdapter(
      level: functioningLevel,
      child: MaterialApp.router(
        title: 'AIVO Learning',
        debugShowCheckedModeBanner: false,
        theme: AivoTheme.light(useDyslexicFont: useDyslexicFont),
        darkTheme: AivoTheme.dark(useDyslexicFont: useDyslexicFont),
        themeMode: themeMode,
        routerConfig: router,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// FunctioningLevelAdapter
//
// Wraps the widget tree to override [MediaQuery.textScaler] based on the
// learner's functioning level. This provides a system-wide accessibility
// knob independent of the OS-level text scale.
// ---------------------------------------------------------------------------

class FunctioningLevelAdapter extends StatelessWidget {
  const FunctioningLevelAdapter({
    required this.level,
    required this.child,
    super.key,
  });

  final int level;
  final Widget child;

  double get _scaleForLevel {
    switch (level) {
      case 1:
        return 1.3;
      case 2:
        return 1.15;
      case 3:
        return 1.0;
      case 4:
        return 0.95;
      default:
        return 1.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final double baseScale = mediaQuery.textScaler.scale(1.0);
    final double targetScale = baseScale * _scaleForLevel;
    // Clamp between 0.8 and 2.0 to avoid extremes.
    final double clampedScale = targetScale.clamp(0.8, 2.0);

    return MediaQuery(
      data: mediaQuery.copyWith(
        textScaler: TextScaler.linear(clampedScale),
      ),
      child: child,
    );
  }
}
