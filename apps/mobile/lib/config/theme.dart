import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// AIVO brand colours
// ---------------------------------------------------------------------------

class AivoColors {
  AivoColors._();

  // Brand primaries
  static const Color primary = Color(0xFF6C5CE7);
  static const Color primaryLight = Color(0xFFA29BFE);
  static const Color primaryDark = Color(0xFF4834D4);

  static const Color secondary = Color(0xFF00B894);
  static const Color secondaryLight = Color(0xFF55EFC4);
  static const Color secondaryDark = Color(0xFF00896E);

  static const Color accent = Color(0xFFFDCB6E);
  static const Color accentLight = Color(0xFFFEE9A0);
  static const Color accentDark = Color(0xFFF9A825);

  static const Color error = Color(0xFFE17055);
  static const Color errorLight = Color(0xFFFFAB91);
  static const Color errorDark = Color(0xFFD63031);

  // Light theme surfaces
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceVariantLight = Color(0xFFF0F0F5);
  static const Color textPrimaryLight = Color(0xFF2D3436);
  static const Color textSecondaryLight = Color(0xFF636E72);
  static const Color textTertiaryLight = Color(0xFFB2BEC3);
  static const Color dividerLight = Color(0xFFDFE6E9);

  // Dark theme surfaces
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1E2C);
  static const Color surfaceVariantDark = Color(0xFF2A2A3C);
  static const Color textPrimaryDark = Color(0xFFF5F6FA);
  static const Color textSecondaryDark = Color(0xFFB2BEC3);
  static const Color textTertiaryDark = Color(0xFF636E72);
  static const Color dividerDark = Color(0xFF3D3D50);

  // Semantic / gamification
  static const Color xpGold = Color(0xFFFFD700);
  static const Color streakFlame = Color(0xFFFF6348);
  static const Color questGreen = Color(0xFF2ECC71);
  static const Color badgeSilver = Color(0xFFC0C0C0);
}

// ---------------------------------------------------------------------------
// Typography helpers
// ---------------------------------------------------------------------------

class _AivoTypography {
  _AivoTypography._();

  static TextTheme _buildTextTheme(String fontFamily, Color primary, Color secondary) {
    return TextTheme(
      headlineLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 32,
        fontWeight: FontWeight.w800,
        height: 1.25,
        color: primary,
      ),
      headlineMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 1.29,
        color: primary,
      ),
      headlineSmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.33,
        color: primary,
      ),
      titleLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: primary,
      ),
      titleMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.5,
        color: primary,
      ),
      bodyLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: primary,
      ),
      bodyMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.43,
        color: secondary,
      ),
      bodySmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.33,
        color: secondary,
      ),
      labelLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.43,
        letterSpacing: 0.1,
        color: primary,
      ),
    );
  }

  static TextTheme light({String fontFamily = 'Inter'}) =>
      _buildTextTheme(fontFamily, AivoColors.textPrimaryLight, AivoColors.textSecondaryLight);

  static TextTheme dark({String fontFamily = 'Inter'}) =>
      _buildTextTheme(fontFamily, AivoColors.textPrimaryDark, AivoColors.textSecondaryDark);
}

// ---------------------------------------------------------------------------
// Theme builder
// ---------------------------------------------------------------------------

class AivoTheme {
  AivoTheme._();

  /// If [useDyslexicFont] is true the entire type scale uses OpenDyslexic.
  static ThemeData light({bool useDyslexicFont = false}) {
    final String fontFamily = useDyslexicFont ? 'OpenDyslexic' : 'Inter';
    final textTheme = _AivoTypography.light(fontFamily: fontFamily);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      fontFamily: fontFamily,
      colorScheme: const ColorScheme.light(
        primary: AivoColors.primary,
        onPrimary: Colors.white,
        primaryContainer: AivoColors.primaryLight,
        onPrimaryContainer: AivoColors.primaryDark,
        secondary: AivoColors.secondary,
        onSecondary: Colors.white,
        secondaryContainer: AivoColors.secondaryLight,
        onSecondaryContainer: AivoColors.secondaryDark,
        tertiary: AivoColors.accent,
        onTertiary: Colors.black,
        tertiaryContainer: AivoColors.accentLight,
        onTertiaryContainer: AivoColors.accentDark,
        error: AivoColors.error,
        onError: Colors.white,
        errorContainer: AivoColors.errorLight,
        onErrorContainer: AivoColors.errorDark,
        surface: AivoColors.surfaceLight,
        onSurface: AivoColors.textPrimaryLight,
        surfaceContainerHighest: AivoColors.surfaceVariantLight,
        onSurfaceVariant: AivoColors.textSecondaryLight,
        outline: AivoColors.dividerLight,
        outlineVariant: AivoColors.textTertiaryLight,
      ),
      scaffoldBackgroundColor: AivoColors.backgroundLight,
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AivoColors.surfaceLight,
        foregroundColor: AivoColors.textPrimaryLight,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: textTheme.titleLarge,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AivoColors.primary,
          foregroundColor: Colors.white,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 2,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AivoColors.primary,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          side: const BorderSide(color: AivoColors.primary, width: 1.5),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AivoColors.primary,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AivoColors.surfaceVariantLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.error, width: 2),
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AivoColors.textTertiaryLight),
        labelStyle: textTheme.bodyMedium,
      ),
      cardTheme: CardThemeData(
        color: AivoColors.surfaceLight,
        elevation: 2,
        shadowColor: AivoColors.primary.withValues(alpha: 0.08),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AivoColors.surfaceLight,
        selectedItemColor: AivoColors.primary,
        unselectedItemColor: AivoColors.textTertiaryLight,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: const DividerThemeData(
        color: AivoColors.dividerLight,
        thickness: 1,
        space: 1,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AivoColors.surfaceVariantLight,
        selectedColor: AivoColors.primaryLight,
        labelStyle: textTheme.bodySmall!,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AivoColors.textPrimaryLight,
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        behavior: SnackBarBehavior.floating,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AivoColors.primary,
        linearTrackColor: AivoColors.surfaceVariantLight,
      ),
    );
  }

  static ThemeData dark({bool useDyslexicFont = false}) {
    final String fontFamily = useDyslexicFont ? 'OpenDyslexic' : 'Inter';
    final textTheme = _AivoTypography.dark(fontFamily: fontFamily);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: fontFamily,
      colorScheme: const ColorScheme.dark(
        primary: AivoColors.primaryLight,
        onPrimary: AivoColors.primaryDark,
        primaryContainer: AivoColors.primaryDark,
        onPrimaryContainer: AivoColors.primaryLight,
        secondary: AivoColors.secondaryLight,
        onSecondary: AivoColors.secondaryDark,
        secondaryContainer: AivoColors.secondaryDark,
        onSecondaryContainer: AivoColors.secondaryLight,
        tertiary: AivoColors.accentLight,
        onTertiary: Colors.black,
        tertiaryContainer: AivoColors.accentDark,
        onTertiaryContainer: AivoColors.accentLight,
        error: AivoColors.errorLight,
        onError: AivoColors.errorDark,
        errorContainer: AivoColors.errorDark,
        onErrorContainer: AivoColors.errorLight,
        surface: AivoColors.surfaceDark,
        onSurface: AivoColors.textPrimaryDark,
        surfaceContainerHighest: AivoColors.surfaceVariantDark,
        onSurfaceVariant: AivoColors.textSecondaryDark,
        outline: AivoColors.dividerDark,
        outlineVariant: AivoColors.textTertiaryDark,
      ),
      scaffoldBackgroundColor: AivoColors.backgroundDark,
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AivoColors.surfaceDark,
        foregroundColor: AivoColors.textPrimaryDark,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: textTheme.titleLarge,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AivoColors.primaryLight,
          foregroundColor: AivoColors.primaryDark,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 2,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AivoColors.primaryLight,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          side: const BorderSide(color: AivoColors.primaryLight, width: 1.5),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AivoColors.primaryLight,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AivoColors.surfaceVariantDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.primaryLight, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.errorLight, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AivoColors.errorLight, width: 2),
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AivoColors.textTertiaryDark),
        labelStyle: textTheme.bodyMedium,
      ),
      cardTheme: CardThemeData(
        color: AivoColors.surfaceDark,
        elevation: 2,
        shadowColor: Colors.black26,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AivoColors.surfaceDark,
        selectedItemColor: AivoColors.primaryLight,
        unselectedItemColor: AivoColors.textTertiaryDark,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: const DividerThemeData(
        color: AivoColors.dividerDark,
        thickness: 1,
        space: 1,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AivoColors.surfaceVariantDark,
        selectedColor: AivoColors.primaryDark,
        labelStyle: textTheme.bodySmall!,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AivoColors.surfaceVariantDark,
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: AivoColors.textPrimaryDark),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        behavior: SnackBarBehavior.floating,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AivoColors.primaryLight,
        linearTrackColor: AivoColors.surfaceVariantDark,
      ),
    );
  }
}
