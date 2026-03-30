import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:flutter_riverpod/legacy.dart';

// ---------------------------------------------------------------------------
// AacDeviceType
// ---------------------------------------------------------------------------

/// Supported AAC device families.
enum AacDeviceType {
  goTalk,
  tobiiDynavox,
  lamp,
  touchChat,
  other,
}

// ---------------------------------------------------------------------------
// AacDevice
// ---------------------------------------------------------------------------

/// Represents a discovered or paired AAC (Augmentative and Alternative
/// Communication) device.
class AacDevice {
  const AacDevice({
    required this.id,
    required this.name,
    required this.type,
  });

  final String id;
  final String name;
  final AacDeviceType type;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AacDevice && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'AacDevice($name, $type)';
}

// ---------------------------------------------------------------------------
// AacSymbolSelection
// ---------------------------------------------------------------------------

/// A symbol selection event received from an AAC device.
class AacSymbolSelection {
  const AacSymbolSelection({
    required this.symbolId,
    required this.symbolLabel,
    this.categoryId,
  });

  final String symbolId;
  final String symbolLabel;
  final String? categoryId;

  @override
  String toString() => 'AacSymbolSelection($symbolLabel)';
}

// ---------------------------------------------------------------------------
// AacConnectionState
// ---------------------------------------------------------------------------

enum AacConnectionState {
  disconnected,
  scanning,
  connecting,
  connected,
  partnerAssisted,
}

// ---------------------------------------------------------------------------
// AacSymbolMapping
// ---------------------------------------------------------------------------

/// Maps an AAC symbol ID to an AIVO response option key.
class AacSymbolMapping {
  const AacSymbolMapping({
    required this.symbolId,
    required this.symbolLabel,
    required this.responseOptionKey,
  });

  final String symbolId;
  final String symbolLabel;
  final String responseOptionKey;
}

// ---------------------------------------------------------------------------
// AacBridge
// ---------------------------------------------------------------------------

/// Manages BLE connections to AAC devices, listens for symbol selections, and
/// maps them to AIVO response options.
class AacBridge extends ChangeNotifier {
  AacBridge({
    List<AacSymbolMapping>? symbolMappings,
  }) : _symbolMappings = symbolMappings ?? [];

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  AacConnectionState _connectionState = AacConnectionState.disconnected;
  AacConnectionState get connectionState => _connectionState;

  AacDevice? _connectedDevice;
  AacDevice? get connectedDevice => _connectedDevice;

  final List<AacDevice> _discoveredDevices = [];
  List<AacDevice> get discoveredDevices => List.unmodifiable(_discoveredDevices);

  List<AacSymbolMapping> _symbolMappings;
  List<AacSymbolMapping> get symbolMappings =>
      List.unmodifiable(_symbolMappings);

  final StreamController<AacSymbolSelection> _symbolController =
      StreamController<AacSymbolSelection>.broadcast();

  /// Stream of symbol selections from the connected AAC device.
  Stream<AacSymbolSelection> get symbolSelectionStream =>
      _symbolController.stream;

  final StreamController<String> _responseController =
      StreamController<String>.broadcast();

  /// Stream of mapped AIVO response option keys derived from AAC selections.
  Stream<String> get responseStream => _responseController.stream;

  StreamSubscription<List<ScanResult>>? _scanSubscription;
  StreamSubscription<BluetoothConnectionState>? _deviceConnectionSub;
  StreamSubscription<List<int>>? _characteristicSub;
  BluetoothDevice? _bleDevice;

  // BLE Service UUID for AAC symbol notification (convention).
  static const String _aacServiceUuid = '0000ffe0-0000-1000-8000-00805f9b34fb';
  static const String _aacCharUuid = '0000ffe1-0000-1000-8000-00805f9b34fb';

  // -----------------------------------------------------------------------
  // Scanning
  // -----------------------------------------------------------------------

  /// Start scanning for BLE AAC devices.
  Future<void> startScan({Duration timeout = const Duration(seconds: 10)}) async {
    _connectionState = AacConnectionState.scanning;
    _discoveredDevices.clear();
    notifyListeners();

    try {
      await FlutterBluePlus.startScan(timeout: timeout);

      _scanSubscription = FlutterBluePlus.scanResults.listen((results) {
        for (final result in results) {
          final device = _classifyDevice(result);
          if (device != null &&
              !_discoveredDevices.any((d) => d.id == device.id)) {
            _discoveredDevices.add(device);
            notifyListeners();
          }
        }
      });
    } catch (e) {
      debugPrint('[AacBridge] Scan error: $e');
      _connectionState = AacConnectionState.disconnected;
      notifyListeners();
    }
  }

  /// Stop an ongoing BLE scan.
  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
    await _scanSubscription?.cancel();
    _scanSubscription = null;
    if (_connectionState == AacConnectionState.scanning) {
      _connectionState = AacConnectionState.disconnected;
      notifyListeners();
    }
  }

  // -----------------------------------------------------------------------
  // Connection
  // -----------------------------------------------------------------------

  /// Connect to a discovered AAC device.
  Future<bool> connectToDevice(AacDevice device) async {
    _connectionState = AacConnectionState.connecting;
    notifyListeners();

    try {
      _bleDevice = BluetoothDevice.fromId(device.id);
      await _bleDevice!.connect(
        license: License.free,
        autoConnect: true,
        mtu: null,
      );

      _deviceConnectionSub =
          _bleDevice!.connectionState.listen((state) {
        if (state == BluetoothConnectionState.disconnected) {
          _onDeviceDisconnected();
        }
      });

      await _subscribeToSymbols();

      _connectedDevice = device;
      _connectionState = AacConnectionState.connected;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('[AacBridge] Connection error: $e');
      _connectionState = AacConnectionState.disconnected;
      notifyListeners();
      return false;
    }
  }

  /// Disconnect from the current AAC device.
  Future<void> disconnect() async {
    await _characteristicSub?.cancel();
    _characteristicSub = null;
    await _deviceConnectionSub?.cancel();
    _deviceConnectionSub = null;

    try {
      await _bleDevice?.disconnect();
    } catch (_) {}

    _bleDevice = null;
    _connectedDevice = null;
    _connectionState = AacConnectionState.disconnected;
    notifyListeners();
  }

  /// Enter partner-assisted mode when no AAC device is available.
  void enterPartnerAssistedMode() {
    _connectionState = AacConnectionState.partnerAssisted;
    _connectedDevice = null;
    notifyListeners();
  }

  /// Submit a response in partner-assisted mode on behalf of the learner.
  void submitPartnerAssistedResponse(String responseOptionKey) {
    if (_connectionState == AacConnectionState.partnerAssisted) {
      _responseController.add(responseOptionKey);
    }
  }

  // -----------------------------------------------------------------------
  // Symbol mapping
  // -----------------------------------------------------------------------

  /// Update the symbol-to-response mappings.
  void updateSymbolMappings(List<AacSymbolMapping> mappings) {
    _symbolMappings = List.from(mappings);
    notifyListeners();
  }

  /// Test the connection by requesting a ping from the device.
  Future<bool> testConnection() async {
    if (_bleDevice == null ||
        _connectionState != AacConnectionState.connected) {
      return false;
    }
    try {
      final services = await _bleDevice!.discoverServices();
      return services.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  AacDevice? _classifyDevice(ScanResult result) {
    final name = result.device.platformName;
    if (name.isEmpty) return null;

    final nameLower = name.toLowerCase();
    AacDeviceType type;

    if (nameLower.contains('go talk') || nameLower.contains('gotalk')) {
      type = AacDeviceType.goTalk;
    } else if (nameLower.contains('tobii') || nameLower.contains('dynavox')) {
      type = AacDeviceType.tobiiDynavox;
    } else if (nameLower.contains('lamp')) {
      type = AacDeviceType.lamp;
    } else if (nameLower.contains('touchchat') ||
        nameLower.contains('touch chat')) {
      type = AacDeviceType.touchChat;
    } else {
      type = AacDeviceType.other;
    }

    return AacDevice(
      id: result.device.remoteId.str,
      name: name,
      type: type,
    );
  }

  Future<void> _subscribeToSymbols() async {
    if (_bleDevice == null) return;

    final services = await _bleDevice!.discoverServices();
    for (final service in services) {
      if (service.uuid.toString().toLowerCase() == _aacServiceUuid) {
        for (final characteristic in service.characteristics) {
          if (characteristic.uuid.toString().toLowerCase() == _aacCharUuid &&
              characteristic.properties.notify) {
            await characteristic.setNotifyValue(true);
            _characteristicSub =
                characteristic.lastValueStream.listen(_handleSymbolData);
            return;
          }
        }
      }
    }
  }

  void _handleSymbolData(List<int> data) {
    if (data.isEmpty) return;

    final payload = String.fromCharCodes(data);
    final parts = payload.split('|');
    if (parts.length < 2) return;

    final selection = AacSymbolSelection(
      symbolId: parts[0],
      symbolLabel: parts[1],
      categoryId: parts.length > 2 ? parts[2] : null,
    );

    _symbolController.add(selection);

    final mapping = _symbolMappings
        .where((m) => m.symbolId == selection.symbolId)
        .firstOrNull;

    if (mapping != null) {
      _responseController.add(mapping.responseOptionKey);
    }
  }

  void _onDeviceDisconnected() {
    _connectedDevice = null;
    _connectionState = AacConnectionState.disconnected;
    _characteristicSub?.cancel();
    _characteristicSub = null;
    notifyListeners();
  }

  // -----------------------------------------------------------------------
  // Disposal
  // -----------------------------------------------------------------------

  @override
  void dispose() {
    _scanSubscription?.cancel();
    _deviceConnectionSub?.cancel();
    _characteristicSub?.cancel();
    _symbolController.close();
    _responseController.close();
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// Riverpod provider
// ---------------------------------------------------------------------------

final aacBridgeProvider = ChangeNotifierProvider<AacBridge>((ref) {
  final bridge = AacBridge();
  ref.onDispose(() => bridge.dispose());
  return bridge;
});
