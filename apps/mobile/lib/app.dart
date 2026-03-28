import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/config/routes.dart';
import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/i18n/locale_provider.dart';

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
///   STANDARD     - Standard independence          (text scale 1.0)
///   SUPPORTED    - Moderate support               (text scale 1.15)
///   LOW_VERBAL   - Low verbal, picture support    (text scale 1.3)
///   NON_VERBAL   - Non-verbal, partner assisted   (text scale 1.3)
///   PRE_SYMBOLIC - Adult-directed, no learner text (text scale 1.0)
final functioningLevelProvider = StateProvider<String>((_) => 'STANDARD');

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
    final locale = ref.watch(localeProvider);

    return FunctioningLevelAdapter(
      level: functioningLevel,
      child: MaterialApp.router(
        title: 'AIVO Learning',
        debugShowCheckedModeBanner: false,
        theme: AivoTheme.light(useDyslexicFont: useDyslexicFont),
        darkTheme: AivoTheme.dark(useDyslexicFont: useDyslexicFont),
        themeMode: themeMode,
        routerConfig: router,
        locale: locale,
        supportedLocales: const [
          Locale('en'),
          Locale('es'),
          Locale('fr'),
          Locale('ar'),
          Locale('zh'),
          Locale('pt'),
          Locale('de'),
          Locale('ja'),
          Locale('ko'),
          Locale('hi'),
        ],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
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

  final String level;
  final Widget child;

  double get _scaleForLevel {
    switch (level) {
      case 'STANDARD':
        return 1.0;
      case 'SUPPORTED':
        return 1.15;
      case 'LOW_VERBAL':
        return 1.3;
      case 'NON_VERBAL':
        return 1.3;
      case 'PRE_SYMBOLIC':
        return 1.0; // Adult-directed, no learner text
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
