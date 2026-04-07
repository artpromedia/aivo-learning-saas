import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/i18n/locale_provider.dart';

/// Convenience extension on [WidgetRef] for translating keys.
///
/// Usage:
/// ```dart
/// final t = ref.t;
/// Text(t('dashboard.heyName', {'name': 'Sam'}));
/// ```
extension TranslationExt on WidgetRef {
  /// Returns a translation function bound to the current locale.
  ///
  /// The returned function accepts a dot-separated key (e.g. `'dashboard.heyName'`)
  /// and an optional map of parameters for substitution.
  String Function(String key, [Map<String, String>? params]) get t {
    final locale = watch(localeProvider).languageCode;
    final loader = watch(translationLoaderProvider);
    return (String key, [Map<String, String>? params]) {
      return loader.translate(locale, key, params);
    };
  }
}
