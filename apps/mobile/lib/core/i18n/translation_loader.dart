import 'package:flutter/foundation.dart';

import 'package:aivo_mobile/core/i18n/i18n_service.dart';

/// Loads translations from the i18n-svc API with local caching fallback.
///
/// When online, fetches fresh translations and caches them locally.
/// When offline, serves from the Hive cache.
class TranslationLoader {
  TranslationLoader({
    required I18nService i18nService,
  }) : _i18nService = i18nService;

  final I18nService _i18nService;

  /// In-memory cache of loaded translations per locale.
  final Map<String, Map<String, String>> _memoryCache = {};

  /// Loads translations for the given [locale].
  ///
  /// Strategy:
  /// 1. Return from memory cache if available
  /// 2. If Hive cache is valid, use it and refresh in background
  /// 3. Otherwise, fetch from API (falls back to Hive cache on failure)
  Future<Map<String, String>> loadTranslations(String locale) async {
    // 1. Memory cache
    if (_memoryCache.containsKey(locale)) {
      return _memoryCache[locale]!;
    }

    // 2. Check Hive cache validity
    if (_i18nService.isCacheValid(locale)) {
      final cached = _i18nService.getCachedTranslations(locale);
      if (cached.isNotEmpty) {
        _memoryCache[locale] = cached;

        // Refresh in background
        _refreshInBackground(locale);

        return cached;
      }
    }

    // 3. Fetch from API
    final translations = await _i18nService.fetchTranslations(locale);
    if (translations.isNotEmpty) {
      _memoryCache[locale] = translations;
    }
    return translations;
  }

  /// Translates a single key for the given [locale].
  ///
  /// Returns the translation value, or the [key] itself if not found.
  String translate(String locale, String key, [Map<String, String>? params]) {
    final translations = _memoryCache[locale] ?? {};
    var value = translations[key] ?? key;

    // Simple ICU-like parameter substitution for {paramName}
    if (params != null) {
      for (final entry in params.entries) {
        value = value.replaceAll('{${entry.key}}', entry.value);
      }
    }

    return value;
  }

  /// Clears the in-memory cache for a specific locale or all locales.
  void clearCache([String? locale]) {
    if (locale != null) {
      _memoryCache.remove(locale);
    } else {
      _memoryCache.clear();
    }
  }

  void _refreshInBackground(String locale) {
    _i18nService.fetchTranslations(locale).then((translations) {
      if (translations.isNotEmpty) {
        _memoryCache[locale] = translations;
      }
    }).catchError((e) {
      if (kDebugMode) {
        debugPrint('[I18n] Background refresh failed for $locale: $e');
      }
    });
  }
}
