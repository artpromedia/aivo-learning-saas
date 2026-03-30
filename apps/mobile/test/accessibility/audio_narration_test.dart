import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

import 'audio_narration_test.mocks.dart';

@GenerateMocks([FlutterTts, FlutterSecureStorage])
void main() {
  late MockFlutterTts mockTts;
  late MockFlutterSecureStorage mockStorage;
  late AudioNarrator narrator;

  setUp(() {
    mockTts = MockFlutterTts();
    mockStorage = MockFlutterSecureStorage();

    when(mockStorage.read(key: anyNamed('key')))
        .thenAnswer((_) async => 'true');
    when(mockTts.setLanguage(any)).thenAnswer((_) async => 1);
    when(mockTts.setSpeechRate(any)).thenAnswer((_) async => 1);
    when(mockTts.setVolume(any)).thenAnswer((_) async => 1);
    when(mockTts.setPitch(any)).thenAnswer((_) async => 1);
    when(mockTts.speak(any)).thenAnswer((_) async => 1);
    when(mockTts.stop()).thenAnswer((_) async => 1);
    when(mockTts.awaitSpeakCompletion(any)).thenAnswer((_) async => 1);
    when(mockTts.setStartHandler(any)).thenReturn(null);
    when(mockTts.setCompletionHandler(any)).thenReturn(null);
    when(mockTts.setCancelHandler(any)).thenReturn(null);
    when(mockTts.setErrorHandler(any)).thenReturn(null);

    narrator = AudioNarrator(storage: mockStorage, tts: mockTts);
  });

  tearDown(() async {
    await narrator.dispose();
  });

  group('AudioNarrator', () {
    test('autoNarrateIfNeeded speaks for LOW_VERBAL level', () async {
      // Allow _init to complete
      await Future.delayed(const Duration(milliseconds: 50));

      await narrator.autoNarrateIfNeeded(
        FunctioningLevel.lowVerbal,
        'Lesson Title',
        ['Element one', 'Element two'],
      );

      verify(mockTts.speak('Lesson Title')).called(greaterThanOrEqualTo(1));
      verify(mockTts.speak('Element one')).called(1);
      verify(mockTts.speak('Element two')).called(1);
    });

    test('autoNarrateIfNeeded speaks for NON_VERBAL level', () async {
      await Future.delayed(const Duration(milliseconds: 50));

      await narrator.autoNarrateIfNeeded(
        FunctioningLevel.nonVerbal,
        'Screen Title',
        ['Item A'],
      );

      verify(mockTts.speak('Screen Title')).called(greaterThanOrEqualTo(1));
      verify(mockTts.speak('Item A')).called(1);
    });

    test('autoNarrateIfNeeded does not speak for STANDARD level', () async {
      await Future.delayed(const Duration(milliseconds: 50));

      await narrator.autoNarrateIfNeeded(
        FunctioningLevel.standard,
        'Title',
        ['Elem'],
      );

      verifyNever(mockTts.speak('Title'));
      verifyNever(mockTts.speak('Elem'));
    });

    test('autoNarrateIfNeeded does not speak when disabled', () async {
      when(mockStorage.read(key: anyNamed('key')))
          .thenAnswer((_) async => 'false');

      final disabledNarrator = AudioNarrator(
        storage: mockStorage,
        tts: mockTts,
      );

      await Future.delayed(const Duration(milliseconds: 50));

      await disabledNarrator.autoNarrateIfNeeded(
        FunctioningLevel.lowVerbal,
        'Title',
        ['Elem'],
      );

      verifyNever(mockTts.speak('Title'));

      await disabledNarrator.dispose();
    });

    test('narrateScreen speaks title then elements in order', () async {
      await Future.delayed(const Duration(milliseconds: 50));

      await narrator.narrateScreen('Screen Title', [
        'First element',
        'Second element',
        'Third element',
      ]);

      verifyInOrder([
        mockTts.stop(),
        mockTts.speak('Screen Title'),
        mockTts.awaitSpeakCompletion(true),
        mockTts.speak('First element'),
        mockTts.awaitSpeakCompletion(true),
        mockTts.speak('Second element'),
        mockTts.awaitSpeakCompletion(true),
        mockTts.speak('Third element'),
        mockTts.awaitSpeakCompletion(true),
      ]);
    });

    test('setEnabled persists preference and stops speech when disabled',
        () async {
      when(mockStorage.write(key: anyNamed('key'), value: anyNamed('value')))
          .thenAnswer((_) async {
            return;
          });

      await narrator.setEnabled(false);

      verify(mockStorage.write(
        key: 'aivo_narration_enabled',
        value: 'false',
      ),).called(1);
      verify(mockTts.stop()).called(1);
      expect(narrator.isEnabled, false);
    });
  });
}
