import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:aivo_mobile/core/i18n/i18n_service.dart';
import 'package:aivo_mobile/core/i18n/translation_loader.dart';

/// Hive box key for persisted locale preference.
const String _localePreferenceKey = 'selected_locale';
const String _prefsBoxName = 'i18n_prefs';

/// Provider for the [I18nService] singleton.
final i18nServiceProvider = Provider<I18nService>((ref) {
  return I18nService();
});

/// Provider for the [TranslationLoader] that handles loading and caching.
final translationLoaderProvider = Provider<TranslationLoader>((ref) {
  final i18nService = ref.watch(i18nServiceProvider);
  return TranslationLoader(i18nService: i18nService);
});

/// Notifier that manages the current locale selection.
final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

/// Provider for the current translations map.
final translationsProvider =
    FutureProvider.family<Map<String, String>, String>((ref, locale) async {
  final loader = ref.watch(translationLoaderProvider);
  return loader.loadTranslations(locale);
});

/// Provider for available locales fetched from the API.
final availableLocalesProvider = FutureProvider<List<LocaleInfo>>((ref) async {
  final i18nService = ref.watch(i18nServiceProvider);
  return i18nService.fetchAvailableLocales();
});

/// Manages the current [Locale] and persists the choice to Hive.
class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('en')) {
    _loadPersistedLocale();
  }

  Future<void> _loadPersistedLocale() async {
    try {
      final box = await Hive.openBox<String>(_prefsBoxName);
      final saved = box.get(_localePreferenceKey);
      if (saved != null && saved.isNotEmpty) {
        state = Locale(saved);
      }
    } catch (_) {
      // First run or box not available yet - keep default
    }
  }

  /// Sets the locale and persists the selection.
  Future<void> setLocale(String localeCode) async {
    state = Locale(localeCode);
    try {
      final box = Hive.box<String>(_prefsBoxName);
      await box.put(_localePreferenceKey, localeCode);
    } catch (_) {
      // Ignore persistence errors
    }
  }
}
