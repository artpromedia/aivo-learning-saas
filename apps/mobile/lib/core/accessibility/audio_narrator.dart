import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const String _kNarrationEnabledKey = 'aivo_narration_enabled';

// ---------------------------------------------------------------------------
// AudioNarrator
// ---------------------------------------------------------------------------

/// Text-to-speech narration service.
///
/// When [isEnabled] is true **and** the functioning level is LOW_VERBAL or
/// below, screens can call [narrateScreen] during their init to have the
/// screen title and elements read aloud automatically.
class AudioNarrator {
  AudioNarrator({
    FlutterSecureStorage? storage,
    FlutterTts? tts,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        _tts = tts ?? FlutterTts() {
    _init();
  }

  final FlutterSecureStorage _storage;
  final FlutterTts _tts;

  bool _isEnabled = false;
  bool get isEnabled => _isEnabled;

  bool _isSpeaking = false;
  bool get isSpeaking => _isSpeaking;

  // -----------------------------------------------------------------------
  // Initialisation
  // -----------------------------------------------------------------------

  Future<void> _init() async {
    // Load persisted preference.
    final raw = await _storage.read(key: _kNarrationEnabledKey);
    _isEnabled = raw == 'true';

    // Configure the TTS engine defaults.
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    _tts.setStartHandler(() {
      _isSpeaking = true;
    });

    _tts.setCompletionHandler(() {
      _isSpeaking = false;
    });

    _tts.setCancelHandler(() {
      _isSpeaking = false;
    });

    _tts.setErrorHandler((msg) {
      _isSpeaking = false;
      debugPrint('[AudioNarrator] TTS error: $msg');
    });
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /// Speaks the given [text] aloud.
  Future<void> speak(String text) async {
    if (!_isEnabled) return;
    await _tts.speak(text);
  }

  /// Stops any ongoing speech.
  Future<void> stop() async {
    await _tts.stop();
    _isSpeaking = false;
  }

  /// Sets the speech rate. Values range from 0.0 (slowest) to 1.0 (fastest).
  Future<void> setSpeed(double rate) async {
    await _tts.setSpeechRate(rate);
  }

  /// Sets the TTS language/locale (e.g. `en-US`, `es-ES`).
  Future<void> setLanguage(String language) async {
    await _tts.setLanguage(language);
  }

  /// Sets the speech volume from 0.0 to 1.0.
  Future<void> setVolume(double volume) async {
    await _tts.setVolume(volume);
  }

  /// Reads the screen title followed by each element in order.
  ///
  /// Designed to be called from a screen's `initState` or equivalent. If
  /// narration is disabled this is a no-op.
  Future<void> narrateScreen(String screenTitle, List<String> elements) async {
    if (!_isEnabled) return;

    await stop();

    // Speak the title first.
    await _tts.speak(screenTitle);

    // Wait for the title to finish before speaking elements.
    await _tts.awaitSpeakCompletion(true);

    for (final element in elements) {
      await _tts.speak(element);
      await _tts.awaitSpeakCompletion(true);
    }
  }

  /// Toggles narration on or off and persists the choice.
  Future<void> setEnabled(bool enabled) async {
    _isEnabled = enabled;
    await _storage.write(key: _kNarrationEnabledKey, value: enabled.toString());
    if (!enabled) {
      await stop();
    }
  }

  /// Convenience: speaks the screen title and elements only if narration is
  /// enabled **and** the given [level] is LOW_VERBAL or below.
  Future<void> autoNarrateIfNeeded(
    FunctioningLevel level,
    String screenTitle,
    List<String> elements,
  ) async {
    if (!_isEnabled) return;
    if (level.index < FunctioningLevel.lowVerbal.index) return;
    await narrateScreen(screenTitle, elements);
  }

  /// Release TTS resources.
  Future<void> dispose() async {
    await _tts.stop();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final audioNarratorProvider = Provider<AudioNarrator>((ref) {
  final narrator = AudioNarrator();
  ref.onDispose(() => narrator.dispose());
  return narrator;
});
