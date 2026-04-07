import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/i18n/i18n_service.dart';
import 'package:aivo_mobile/core/i18n/locale_provider.dart';
import 'package:aivo_mobile/core/i18n/t.dart';

/// Maps locale codes to flag emoji (best-effort based on primary region).
const Map<String, String> _localeFlags = {
  'en': '\u{1F1FA}\u{1F1F8}',
  'es': '\u{1F1EA}\u{1F1F8}',
  'fr': '\u{1F1EB}\u{1F1F7}',
  'ar': '\u{1F1F8}\u{1F1E6}',
  'zh': '\u{1F1E8}\u{1F1F3}',
  'pt': '\u{1F1E7}\u{1F1F7}',
  'de': '\u{1F1E9}\u{1F1EA}',
  'ja': '\u{1F1EF}\u{1F1F5}',
  'ko': '\u{1F1F0}\u{1F1F7}',
  'hi': '\u{1F1EE}\u{1F1F3}',
  'sw': '\u{1F1F0}\u{1F1EA}',
  'ig': '\u{1F1F3}\u{1F1EC}',
  'yo': '\u{1F1F3}\u{1F1EC}',
  'ha': '\u{1F1F3}\u{1F1EC}',
};

/// A FormField-style dropdown that fetches and displays available locales.
///
/// Shows each locale in its nativeName (e.g., "Español", "العربية", "中文").
class LanguagePickerField extends ConsumerWidget {
  const LanguagePickerField({
    super.key,
    this.selectedLocaleCode,
    required this.onChanged,
    this.labelText,
    this.enabled = true,
  });

  final String? selectedLocaleCode;
  final ValueChanged<String> onChanged;
  final String? labelText;
  final bool enabled;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final localesAsync = ref.watch(availableLocalesProvider);
    final label = labelText ?? ref.t('settings.language');

    return localesAsync.when(
      data: (locales) => _buildDropdown(context, locales, label),
      loading: () => _buildDropdown(context, _fallbackLocales, label),
      error: (_, __) => _buildDropdown(context, _fallbackLocales, label),
    );
  }

  Widget _buildDropdown(
    BuildContext context,
    List<LocaleInfo> locales,
    String label,
  ) {
    return DropdownButtonFormField<String>(
      value: selectedLocaleCode,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.language),
      ),
      isExpanded: true,
      items: locales
          .map(
            (locale) => DropdownMenuItem<String>(
              value: locale.code,
              child: Text(
                '${_localeFlags[locale.code] ?? ''} ${locale.nativeName} (${locale.name})',
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: enabled
          ? (value) {
              if (value != null) onChanged(value);
            }
          : null,
    );
  }
}

/// Fallback list when the API hasn't responded yet.
const List<LocaleInfo> _fallbackLocales = [
  LocaleInfo(code: 'en', name: 'English', nativeName: 'English', direction: 'LTR'),
  LocaleInfo(code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'LTR'),
  LocaleInfo(code: 'fr', name: 'French', nativeName: 'Français', direction: 'LTR'),
  LocaleInfo(code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'RTL'),
  LocaleInfo(code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'LTR'),
  LocaleInfo(code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'LTR'),
  LocaleInfo(code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'LTR'),
  LocaleInfo(code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'LTR'),
  LocaleInfo(code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'LTR'),
  LocaleInfo(code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'LTR'),
  LocaleInfo(code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'LTR'),
  LocaleInfo(code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', direction: 'LTR'),
  LocaleInfo(code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', direction: 'LTR'),
  LocaleInfo(code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'LTR'),
];
