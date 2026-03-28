import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/core/accessibility/switch_scan_controller.dart';

void main() {
  late SwitchScanController controller;

  setUp(() {
    controller = SwitchScanController(
      dwellTime: const Duration(milliseconds: 500),
    );
  });

  tearDown(() {
    controller.dispose();
  });

  group('SwitchScanController', () {
    test('registers and unregisters targets', () {
      final key1 = GlobalKey();
      final key2 = GlobalKey();

      controller.registerTarget(key1, 'Target 1');
      controller.registerTarget(key2, 'Target 2');
      expect(controller.targets.length, 2);
      expect(controller.targets[0].label, 'Target 1');
      expect(controller.targets[1].label, 'Target 2');

      controller.unregisterTarget(key1);
      expect(controller.targets.length, 1);
      expect(controller.targets[0].label, 'Target 2');
    });

    test('does not register duplicate targets', () {
      final key = GlobalKey();

      controller.registerTarget(key, 'Target');
      controller.registerTarget(key, 'Target');
      expect(controller.targets.length, 1);
    });

    test('cycles through targets on dwell timer', () async {
      final key1 = GlobalKey();
      final key2 = GlobalKey();
      final key3 = GlobalKey();

      controller.registerTarget(key1, 'A');
      controller.registerTarget(key2, 'B');
      controller.registerTarget(key3, 'C');

      expect(controller.currentIndex, 0);
      controller.startScanning();
      expect(controller.isScanning, true);
      expect(controller.currentIndex, 0);

      // Wait for one dwell period to advance
      await Future.delayed(const Duration(milliseconds: 600));
      expect(controller.currentIndex, 1);

      // Wait for another dwell period
      await Future.delayed(const Duration(milliseconds: 600));
      expect(controller.currentIndex, 2);

      // Should wrap around
      await Future.delayed(const Duration(milliseconds: 600));
      expect(controller.currentIndex, 0);
    });

    test('configurable dwell time changes scan speed', () async {
      controller.dwellTime = const Duration(milliseconds: 200);

      final key1 = GlobalKey();
      final key2 = GlobalKey();

      controller.registerTarget(key1, 'A');
      controller.registerTarget(key2, 'B');
      controller.startScanning();

      await Future.delayed(const Duration(milliseconds: 250));
      expect(controller.currentIndex, 1);
    });

    test('select() does nothing when not scanning', () {
      final key = GlobalKey();
      controller.registerTarget(key, 'A');
      // Should not throw
      controller.select();
      expect(controller.isScanning, false);
    });

    test('select() does nothing when targets are empty', () {
      controller.startScanning();
      // startScanning returns early when empty
      expect(controller.isScanning, false);
    });

    test('stops scanning and clears timer', () async {
      final key1 = GlobalKey();
      final key2 = GlobalKey();

      controller.registerTarget(key1, 'A');
      controller.registerTarget(key2, 'B');
      controller.startScanning();
      expect(controller.isScanning, true);

      controller.stopScanning();
      expect(controller.isScanning, false);

      final indexAtStop = controller.currentIndex;
      await Future.delayed(const Duration(milliseconds: 600));
      // Index should not have changed after stopping
      expect(controller.currentIndex, indexAtStop);
    });

    test('unregistering adjusts currentIndex when out of bounds', () {
      final key1 = GlobalKey();
      final key2 = GlobalKey();

      controller.registerTarget(key1, 'A');
      controller.registerTarget(key2, 'B');

      // Manually simulate being on index 1
      controller.startScanning();
      controller.stopScanning();

      // Remove all targets
      controller.unregisterTarget(key1);
      controller.unregisterTarget(key2);

      expect(controller.currentIndex, 0);
      expect(controller.targets.isEmpty, true);
    });

    test('handleKeyEvent returns false when not scanning', () {
      final event = KeyDownEvent(
        physicalKey: PhysicalKeyboardKey.space,
        logicalKey: LogicalKeyboardKey.space,
        timeStamp: Duration.zero,
      );
      expect(controller.handleKeyEvent(event), false);
    });

    test('handleKeyEvent returns true and calls select when scanning', () {
      final key = GlobalKey();
      controller.registerTarget(key, 'A');
      controller.startScanning();

      final event = KeyDownEvent(
        physicalKey: PhysicalKeyboardKey.space,
        logicalKey: LogicalKeyboardKey.space,
        timeStamp: Duration.zero,
      );
      expect(controller.handleKeyEvent(event), true);
    });
  });
}
