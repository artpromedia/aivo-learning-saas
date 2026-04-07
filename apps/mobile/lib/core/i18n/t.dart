import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/i18n/locale_provider.dart';

/// Extension on [WidgetRef] for convenient translation access.
///
/// Usage in a [ConsumerWidget]:
/// ```dart
/// Text(ref.t('onboarding.tellUsAboutChild'))
/// Text(ref.t('onboarding.stepProgress', {'current': '2', 'total': '6'}))
/// ```
extension TranslationExt on WidgetRef {
  /// Translate a key using the current locale.
  String t(String key, [Map<String, String>? params]) {
    final locale = watch(localeProvider);
    final loader = watch(translationLoaderProvider);
    return loader.translate(locale.languageCode, key, params);
  }
}

/// Extension on [ConsumerState] for use in [ConsumerStatefulWidget]s.
///
/// Usage:
/// ```dart
/// Text(t('auth.createAccount'))
/// ```
extension TranslationStateExt on ConsumerState {
  /// Translate a key using the current locale.
  String t(String key, [Map<String, String>? params]) {
    final locale = ref.watch(localeProvider);
    final loader = ref.watch(translationLoaderProvider);
    return loader.translate(locale.languageCode, key, params);
  }
}
