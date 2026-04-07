import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/i18n/i18n_service.dart';
import 'package:aivo_mobile/core/i18n/locale_provider.dart';

/// Preloads translations for the current locale before rendering [child].
///
/// Also sets [Directionality] based on whether the current locale is RTL.
/// If translations fail to load, the child is rendered anyway (keys are shown
/// as fallback text via [TranslationLoader.translate]).
class TranslationPreloader extends ConsumerWidget {
  const TranslationPreloader({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final translations =
        ref.watch(translationsProvider(locale.languageCode));
    final availableLocales = ref.watch(availableLocalesProvider);

    // Determine text direction from available locale metadata.
    final textDirection = _resolveDirection(availableLocales, locale);

    return translations.when(
      data: (_) => Directionality(
        textDirection: textDirection,
        child: child,
      ),
      loading: () => MaterialApp(
        home: Directionality(
          textDirection: textDirection,
          child: const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          ),
        ),
      ),
      error: (_, __) => Directionality(
        textDirection: textDirection,
        child: child,
      ),
    );
  }

  TextDirection _resolveDirection(
    AsyncValue<List<LocaleInfo>> localesAsync,
    Locale locale,
  ) {
    final locales = localesAsync.valueOrNull;
    if (locales == null || locales.isEmpty) return TextDirection.ltr;

    final match = locales.where((l) => l.code == locale.languageCode);
    if (match.isEmpty) return TextDirection.ltr;

    return match.first.isRtl ? TextDirection.rtl : TextDirection.ltr;
  }
}
