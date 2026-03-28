import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mocktail/mocktail.dart';

import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockConnectivity extends Mock implements Connectivity {}

void main() {
  // Note: connectivityProvider creates its own Connectivity() instance
  // internally, so these tests validate the _mapResults logic and the
  // isOnlineProvider behavior using ProviderScope overrides.

  group('ConnectivityStatus mapping', () {
    test('isOnlineProvider defaults to true when loading', () {
      final container = ProviderContainer(
        overrides: [
          connectivityProvider
              .overrideWith((ref) => const Stream<ConnectivityStatus>.empty()),
        ],
      );
      addTearDown(container.dispose);

      // While the stream hasn't emitted, isOnlineProvider returns true (optimistic).
      final isOnline = container.read(isOnlineProvider);
      expect(isOnline, isTrue);
    });

    test('isOnlineProvider returns true when online', () async {
      final controller = StreamController<ConnectivityStatus>();
      addTearDown(controller.close);

      final container = ProviderContainer(
        overrides: [
          connectivityProvider.overrideWith((ref) => controller.stream),
        ],
      );
      addTearDown(container.dispose);

      controller.add(ConnectivityStatus.online);
      await Future.delayed(Duration.zero);

      expect(container.read(isOnlineProvider), isTrue);
    });

    test('isOnlineProvider returns false when offline', () async {
      final controller = StreamController<ConnectivityStatus>();
      addTearDown(controller.close);

      final container = ProviderContainer(
        overrides: [
          connectivityProvider.overrideWith((ref) => controller.stream),
        ],
      );
      addTearDown(container.dispose);

      // Subscribe before adding events so the StreamProvider is active.
      container.listen(connectivityProvider, (_, __) {});

      controller.add(ConnectivityStatus.offline);
      await Future.delayed(Duration.zero);

      expect(container.read(isOnlineProvider), isFalse);
    });

    test('isOnlineProvider transitions from offline to online', () async {
      final controller = StreamController<ConnectivityStatus>();
      addTearDown(controller.close);

      final container = ProviderContainer(
        overrides: [
          connectivityProvider.overrideWith((ref) => controller.stream),
        ],
      );
      addTearDown(container.dispose);

      // Subscribe before adding events so the StreamProvider is active.
      container.listen(connectivityProvider, (_, __) {});

      controller.add(ConnectivityStatus.offline);
      await Future.delayed(Duration.zero);
      expect(container.read(isOnlineProvider), isFalse);

      controller.add(ConnectivityStatus.online);
      await Future.delayed(Duration.zero);
      expect(container.read(isOnlineProvider), isTrue);
    });

    test('isOnlineProvider returns true on stream error (optimistic)', () async {
      final controller = StreamController<ConnectivityStatus>();
      addTearDown(controller.close);

      final container = ProviderContainer(
        overrides: [
          connectivityProvider.overrideWith((ref) => controller.stream),
        ],
      );
      addTearDown(container.dispose);

      // Subscribe before adding events so the StreamProvider is active.
      container.listen(connectivityProvider, (_, __) {});

      controller.addError(Exception('Connectivity check failed'));
      await Future.delayed(Duration.zero);

      expect(container.read(isOnlineProvider), isTrue);
    });
  });
}
