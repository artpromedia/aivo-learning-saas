import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// ---------------------------------------------------------------------------
// FunctioningLevel enum
// ---------------------------------------------------------------------------

/// Ordered from highest to lowest functioning. The [index] property is used for
/// comparison helpers below.
enum FunctioningLevel {
  standard,
  supported,
  lowVerbal,
  nonVerbal,
  preSymbolic,
}

// ---------------------------------------------------------------------------
// Secure-storage keys
// ---------------------------------------------------------------------------

const String _kFunctioningLevelKey = 'aivo_functioning_level';
const String _kThemeModeKey = 'aivo_theme_mode';
const String _kDyslexicFontKey = 'aivo_dyslexic_font';

// ---------------------------------------------------------------------------
// FunctioningLevel notifier
// ---------------------------------------------------------------------------

class FunctioningLevelNotifier extends StateNotifier<FunctioningLevel> {
  FunctioningLevelNotifier({
    FlutterSecureStorage? storage,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        super(FunctioningLevel.standard) {
    _load();
  }

  final FlutterSecureStorage _storage;

  Future<void> _load() async {
    final raw = await _storage.read(key: _kFunctioningLevelKey);
    if (raw != null) {
      final parsed = FunctioningLevel.values.where((e) => e.name == raw);
      if (parsed.isNotEmpty) {
        state = parsed.first;
      }
    }
  }

  Future<void> setLevel(FunctioningLevel level) async {
    state = level;
    await _storage.write(key: _kFunctioningLevelKey, value: level.name);
  }
}

final functioningLevelProvider =
    StateNotifierProvider<FunctioningLevelNotifier, FunctioningLevel>(
  (ref) => FunctioningLevelNotifier(),
);

// ---------------------------------------------------------------------------
// Computed convenience providers
// ---------------------------------------------------------------------------

/// True when the functioning level is LOW_VERBAL, NON_VERBAL, or PRE_SYMBOLIC.
final isLowVerbalOrBelowProvider = Provider<bool>((ref) {
  final level = ref.watch(functioningLevelProvider);
  return level.index >= FunctioningLevel.lowVerbal.index;
});

/// True when the functioning level is NON_VERBAL or PRE_SYMBOLIC.
final isNonVerbalOrBelowProvider = Provider<bool>((ref) {
  final level = ref.watch(functioningLevelProvider);
  return level.index >= FunctioningLevel.nonVerbal.index;
});

/// True when the functioning level is PRE_SYMBOLIC.
final isPreSymbolicProvider = Provider<bool>((ref) {
  final level = ref.watch(functioningLevelProvider);
  return level == FunctioningLevel.preSymbolic;
});

// ---------------------------------------------------------------------------
// ThemeMode notifier
// ---------------------------------------------------------------------------

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier({
    FlutterSecureStorage? storage,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        super(ThemeMode.system) {
    _load();
  }

  final FlutterSecureStorage _storage;

  Future<void> _load() async {
    final raw = await _storage.read(key: _kThemeModeKey);
    if (raw != null) {
      switch (raw) {
        case 'light':
          state = ThemeMode.light;
          break;
        case 'dark':
          state = ThemeMode.dark;
          break;
        default:
          state = ThemeMode.system;
      }
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _storage.write(key: _kThemeModeKey, value: mode.name);
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>(
  (ref) => ThemeModeNotifier(),
);

// ---------------------------------------------------------------------------
// Dyslexic font notifier
// ---------------------------------------------------------------------------

class DyslexicFontNotifier extends StateNotifier<bool> {
  DyslexicFontNotifier({
    FlutterSecureStorage? storage,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        super(false) {
    _load();
  }

  final FlutterSecureStorage _storage;

  Future<void> _load() async {
    final raw = await _storage.read(key: _kDyslexicFontKey);
    if (raw != null) {
      state = raw == 'true';
    }
  }

  Future<void> setEnabled(bool enabled) async {
    state = enabled;
    await _storage.write(key: _kDyslexicFontKey, value: enabled.toString());
  }
}

final dyslexicFontProvider =
    StateNotifierProvider<DyslexicFontNotifier, bool>(
  (ref) => DyslexicFontNotifier(),
);
