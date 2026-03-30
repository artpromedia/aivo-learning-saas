import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late MockFlutterSecureStorage mockStorage;

  setUp(() {
    mockStorage = MockFlutterSecureStorage();
  });

  group('FunctioningLevelNotifier', () {
    test('initial state is standard', () {
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => null);

      final notifier = FunctioningLevelNotifier(storage: mockStorage);
      expect(notifier.state, FunctioningLevel.standard);
    });

    test('loads persisted level on construction', () async {
      when(() => mockStorage.read(key: 'aivo_functioning_level'))
          .thenAnswer((_) async => 'lowVerbal');

      final notifier = FunctioningLevelNotifier(storage: mockStorage);

      // Allow async _load to complete.
      await Future.delayed(const Duration(milliseconds: 50));

      expect(notifier.state, FunctioningLevel.lowVerbal);
    });

    test('setLevel updates state and persists to storage', () async {
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => null);
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});

      final notifier = FunctioningLevelNotifier(storage: mockStorage);
      await notifier.setLevel(FunctioningLevel.nonVerbal);

      expect(notifier.state, FunctioningLevel.nonVerbal);
      verify(() => mockStorage.write(
            key: 'aivo_functioning_level',
            value: 'nonVerbal',
          ),).called(1);
    });

    test('handles invalid persisted value gracefully', () async {
      when(() => mockStorage.read(key: 'aivo_functioning_level'))
          .thenAnswer((_) async => 'invalidLevel');

      final notifier = FunctioningLevelNotifier(storage: mockStorage);
      await Future.delayed(const Duration(milliseconds: 50));

      expect(notifier.state, FunctioningLevel.standard);
    });
  });

  group('Computed providers', () {
    test('isLowVerbalOrBelow is true for lowVerbal', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.lowVerbal)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isLowVerbalOrBelowProvider), isTrue);
    });

    test('isLowVerbalOrBelow is false for standard', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.standard)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isLowVerbalOrBelowProvider), isFalse);
    });

    test('isNonVerbalOrBelow is true for nonVerbal', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.nonVerbal)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isNonVerbalOrBelowProvider), isTrue);
    });

    test('isNonVerbalOrBelow is false for supported', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.supported)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isNonVerbalOrBelowProvider), isFalse);
    });

    test('isPreSymbolic is true only for preSymbolic', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.preSymbolic)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isPreSymbolicProvider), isTrue);
    });

    test('isPreSymbolic is false for nonVerbal', () {
      final container = ProviderContainer(
        overrides: [
          functioningLevelProvider
              .overrideWith((ref) => _FixedFunctioningLevelNotifier(FunctioningLevel.nonVerbal)),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(isPreSymbolicProvider), isFalse);
    });
  });

  group('FunctioningLevel enum', () {
    test('all levels exist in correct order', () {
      expect(FunctioningLevel.values, [
        FunctioningLevel.standard,
        FunctioningLevel.supported,
        FunctioningLevel.lowVerbal,
        FunctioningLevel.nonVerbal,
        FunctioningLevel.preSymbolic,
      ]);
    });

    test('index ordering enables comparison', () {
      expect(FunctioningLevel.standard.index, lessThan(FunctioningLevel.supported.index));
      expect(FunctioningLevel.supported.index, lessThan(FunctioningLevel.lowVerbal.index));
      expect(FunctioningLevel.lowVerbal.index, lessThan(FunctioningLevel.nonVerbal.index));
      expect(FunctioningLevel.nonVerbal.index, lessThan(FunctioningLevel.preSymbolic.index));
    });
  });
}

/// A test-only notifier that has a fixed initial value and does not
/// read from storage.
class _FixedFunctioningLevelNotifier extends FunctioningLevelNotifier {
  _FixedFunctioningLevelNotifier(FunctioningLevel level)
      : super(storage: _NoopStorage()) {
    state = level;
  }
}

class _NoopStorage extends Fake implements FlutterSecureStorage {
  @override
  Future<String?> read({
    required String key,
    IOSOptions? iOptions,
    AndroidOptions? aOptions,
    LinuxOptions? lOptions,
    WebOptions? webOptions,
    MacOsOptions? mOptions,
    WindowsOptions? wOptions,
  }) async =>
      null;
}
