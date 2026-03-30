import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'package:aivo_mobile/config/env.dart';

/// Service responsible for fetching translations from the i18n-svc API
/// and caching them locally using Hive for offline support.
class I18nService {
  I18nService({
    Dio? dio,
  }) : _dio = dio ??
            Dio(BaseOptions(
              baseUrl: Env.apiBaseUrl.replaceFirst('/api/v1', ''),
              connectTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
              receiveTimeout: const Duration(seconds: Env.apiTimeoutSeconds),
            ),);

  final Dio _dio;
  static const String _boxName = 'i18n_translations';
  static const String _metaBoxName = 'i18n_meta';
  static const Duration _cacheExpiry = Duration(hours: 6);

  String get _i18nBaseUrl {
    final base = Env.apiBaseUrl.replaceFirst('/api/v1', '');
    final uri = Uri.parse(base);
    return '${uri.scheme}://${uri.host}:3011';
  }

  /// Initializes the Hive boxes used for translation caching.
  Future<void> init() async {
    await Hive.openBox<String>(_boxName);
    await Hive.openBox<String>(_metaBoxName);
  }

  /// Fetches translations for the given [locale] from the API.
  /// Returns a flat map of `"namespace.key" -> "value"`.
  Future<Map<String, String>> fetchTranslations(String locale) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '$_i18nBaseUrl/i18n/translations/$locale',
      );

      if (response.statusCode == 200 && response.data != null) {
        final translations = response.data!
            .map((key, value) => MapEntry(key, value.toString()));

        await _cacheTranslations(locale, translations);
        return translations;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[I18n] Failed to fetch translations for $locale: $e');
      }
    }

    return getCachedTranslations(locale);
  }

  /// Fetches translations as ARB format for Flutter compatibility.
  Future<Map<String, String>> fetchTranslationsArb(String locale) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '$_i18nBaseUrl/i18n/export/$locale',
        queryParameters: {'format': 'arb'},
      );

      if (response.statusCode == 200 && response.data != null) {
        final translations = <String, String>{};
        for (final entry in response.data!.entries) {
          if (!entry.key.startsWith('@')) {
            translations[entry.key] = entry.value.toString();
          }
        }

        await _cacheTranslations(locale, translations);
        return translations;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[I18n] Failed to fetch ARB translations for $locale: $e');
      }
    }

    return getCachedTranslations(locale);
  }

  /// Retrieves cached translations for the given [locale].
  Map<String, String> getCachedTranslations(String locale) {
    final box = Hive.box<String>(_boxName);
    final cached = box.get(locale);
    if (cached != null) {
      try {
        final decoded = jsonDecode(cached) as Map<String, dynamic>;
        return decoded.map((key, value) => MapEntry(key, value.toString()));
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[I18n] Failed to decode cached translations: $e');
        }
      }
    }
    return {};
  }

  /// Returns true if the cached translations are still valid (not expired).
  bool isCacheValid(String locale) {
    final metaBox = Hive.box<String>(_metaBoxName);
    final lastFetched = metaBox.get('${locale}_lastFetched');
    if (lastFetched == null) return false;

    final fetchedAt = DateTime.tryParse(lastFetched);
    if (fetchedAt == null) return false;

    return DateTime.now().difference(fetchedAt) < _cacheExpiry;
  }

  /// Fetches available locales from the API.
  Future<List<LocaleInfo>> fetchAvailableLocales() async {
    try {
      final response = await _dio.get<List<dynamic>>(
        '$_i18nBaseUrl/i18n/locales',
      );

      if (response.statusCode == 200 && response.data != null) {
        return response.data!
            .map((item) => LocaleInfo.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[I18n] Failed to fetch available locales: $e');
      }
    }
    return [const LocaleInfo(code: 'en', name: 'English', nativeName: 'English', direction: 'LTR')];
  }

  Future<void> _cacheTranslations(
    String locale,
    Map<String, String> translations,
  ) async {
    final box = Hive.box<String>(_boxName);
    final metaBox = Hive.box<String>(_metaBoxName);

    await box.put(locale, jsonEncode(translations));
    await metaBox.put(
      '${locale}_lastFetched',
      DateTime.now().toIso8601String(),
    );
  }
}

/// Describes a locale returned by the i18n-svc API.
class LocaleInfo {
  const LocaleInfo({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.direction,
  });

  factory LocaleInfo.fromJson(Map<String, dynamic> json) {
    return LocaleInfo(
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? '',
      nativeName: (json['nativeName'] ?? json['native_name']) as String? ?? '',
      direction: json['direction'] as String? ?? 'LTR',
    );
  }

  final String code;
  final String name;
  final String nativeName;
  final String direction;

  bool get isRtl => direction == 'RTL';
}
