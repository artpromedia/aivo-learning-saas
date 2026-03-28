import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/accessibility/aac_bridge.dart';

// ---------------------------------------------------------------------------
// AacSettingsScreen
// ---------------------------------------------------------------------------

/// Settings screen for configuring AAC device connections, symbol mappings,
/// and testing connectivity.
class AacSettingsScreen extends ConsumerStatefulWidget {
  const AacSettingsScreen({super.key});

  @override
  ConsumerState<AacSettingsScreen> createState() => _AacSettingsScreenState();
}

class _AacSettingsScreenState extends ConsumerState<AacSettingsScreen> {
  bool _isTestingConnection = false;
  bool? _testResult;

  @override
  Widget build(BuildContext context) {
    final bridge = ref.watch(aacBridgeProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AAC Device Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildConnectionStatus(bridge, theme),
          const SizedBox(height: 24),
          _buildScanSection(bridge, theme),
          const SizedBox(height: 24),
          _buildDiscoveredDevices(bridge, theme),
          const SizedBox(height: 24),
          _buildSymbolMappingSection(bridge, theme),
          const SizedBox(height: 24),
          _buildTestConnectionSection(bridge, theme),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Connection status
  // -----------------------------------------------------------------------

  Widget _buildConnectionStatus(AacBridge bridge, ThemeData theme) {
    final Color statusColor;
    final String statusText;
    final IconData statusIcon;

    switch (bridge.connectionState) {
      case AacConnectionState.disconnected:
        statusColor = theme.colorScheme.error;
        statusText = 'Disconnected';
        statusIcon = Icons.bluetooth_disabled;
        break;
      case AacConnectionState.scanning:
        statusColor = theme.colorScheme.tertiary;
        statusText = 'Scanning...';
        statusIcon = Icons.bluetooth_searching;
        break;
      case AacConnectionState.connecting:
        statusColor = theme.colorScheme.tertiary;
        statusText = 'Connecting...';
        statusIcon = Icons.bluetooth_connected;
        break;
      case AacConnectionState.connected:
        statusColor = Colors.green;
        statusText = 'Connected to ${bridge.connectedDevice?.name ?? "device"}';
        statusIcon = Icons.bluetooth_connected;
        break;
      case AacConnectionState.partnerAssisted:
        statusColor = theme.colorScheme.primary;
        statusText = 'Partner-Assisted Mode';
        statusIcon = Icons.people;
        break;
    }

    return Card(
      child: ListTile(
        leading: Icon(statusIcon, color: statusColor, size: 32),
        title: Text(
          statusText,
          style: theme.textTheme.titleMedium?.copyWith(color: statusColor),
        ),
        subtitle: bridge.connectionState == AacConnectionState.connected
            ? Text('Type: ${_deviceTypeName(bridge.connectedDevice!.type)}')
            : null,
        trailing: bridge.connectionState == AacConnectionState.connected
            ? TextButton(
                onPressed: () => ref.read(aacBridgeProvider).disconnect(),
                child: const Text('Disconnect'),
              )
            : null,
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Scan section
  // -----------------------------------------------------------------------

  Widget _buildScanSection(AacBridge bridge, ThemeData theme) {
    final isScanning = bridge.connectionState == AacConnectionState.scanning;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Device Discovery', style: theme.textTheme.titleLarge),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                onPressed: isScanning
                    ? () => ref.read(aacBridgeProvider).stopScan()
                    : () => ref.read(aacBridgeProvider).startScan(),
                icon: Icon(isScanning ? Icons.stop : Icons.search),
                label: Text(isScanning ? 'Stop Scanning' : 'Scan for Devices'),
              ),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: bridge.connectionState == AacConnectionState.connected
                  ? null
                  : () =>
                      ref.read(aacBridgeProvider).enterPartnerAssistedMode(),
              icon: const Icon(Icons.people),
              label: const Text('Partner Mode'),
            ),
          ],
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Discovered devices list
  // -----------------------------------------------------------------------

  Widget _buildDiscoveredDevices(AacBridge bridge, ThemeData theme) {
    if (bridge.discoveredDevices.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Text(
              bridge.connectionState == AacConnectionState.scanning
                  ? 'Searching for AAC devices...'
                  : 'No devices found. Tap "Scan for Devices" to begin.',
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Discovered Devices', style: theme.textTheme.titleLarge),
        const SizedBox(height: 8),
        ...bridge.discoveredDevices.map((device) {
          final isConnected = bridge.connectedDevice?.id == device.id;
          return Card(
            child: ListTile(
              leading: Icon(
                _deviceTypeIcon(device.type),
                color: isConnected ? Colors.green : null,
              ),
              title: Text(device.name),
              subtitle: Text(_deviceTypeName(device.type)),
              trailing: isConnected
                  ? const Chip(label: Text('Connected'))
                  : FilledButton(
                      onPressed: () =>
                          ref.read(aacBridgeProvider).connectToDevice(device),
                      child: const Text('Pair'),
                    ),
            ),
          );
        }),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Symbol mapping configuration
  // -----------------------------------------------------------------------

  Widget _buildSymbolMappingSection(AacBridge bridge, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Symbol Mappings', style: theme.textTheme.titleLarge),
        const SizedBox(height: 8),
        Text(
          'Configure how AAC device symbols map to AIVO response options.',
          style: theme.textTheme.bodyMedium,
        ),
        const SizedBox(height: 12),
        if (bridge.symbolMappings.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'No symbol mappings configured. '
                  'Connect a device to auto-detect available symbols.',
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          )
        else
          ...bridge.symbolMappings.map((mapping) {
            return Card(
              child: ListTile(
                leading: const Icon(Icons.link),
                title: Text(mapping.symbolLabel),
                subtitle: Text('Maps to: ${mapping.responseOptionKey}'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () {
                    final updated = bridge.symbolMappings
                        .where((m) => m.symbolId != mapping.symbolId)
                        .toList();
                    ref.read(aacBridgeProvider).updateSymbolMappings(updated);
                  },
                ),
              ),
            );
          }),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => _showAddMappingDialog(context),
          icon: const Icon(Icons.add),
          label: const Text('Add Mapping'),
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Test connection
  // -----------------------------------------------------------------------

  Widget _buildTestConnectionSection(AacBridge bridge, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Connection Test', style: theme.textTheme.titleLarge),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: bridge.connectionState == AacConnectionState.connected &&
                  !_isTestingConnection
              ? _testConnection
              : null,
          icon: _isTestingConnection
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.speed),
          label: Text(_isTestingConnection ? 'Testing...' : 'Test Connection'),
        ),
        if (_testResult != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                _testResult! ? Icons.check_circle : Icons.error,
                color: _testResult! ? Colors.green : theme.colorScheme.error,
              ),
              const SizedBox(width: 8),
              Text(
                _testResult!
                    ? 'Connection is working properly.'
                    : 'Connection test failed. Check device and try again.',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ],
      ],
    );
  }

  Future<void> _testConnection() async {
    setState(() {
      _isTestingConnection = true;
      _testResult = null;
    });

    final result = await ref.read(aacBridgeProvider).testConnection();

    if (mounted) {
      setState(() {
        _isTestingConnection = false;
        _testResult = result;
      });
    }
  }

  // -----------------------------------------------------------------------
  // Add mapping dialog
  // -----------------------------------------------------------------------

  Future<void> _showAddMappingDialog(BuildContext context) async {
    final symbolIdController = TextEditingController();
    final symbolLabelController = TextEditingController();
    final responseKeyController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Add Symbol Mapping'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: symbolIdController,
                decoration: const InputDecoration(
                  labelText: 'Symbol ID',
                  hintText: 'e.g. sym_yes',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: symbolLabelController,
                decoration: const InputDecoration(
                  labelText: 'Symbol Label',
                  hintText: 'e.g. Yes',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: responseKeyController,
                decoration: const InputDecoration(
                  labelText: 'Response Option Key',
                  hintText: 'e.g. option_a',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Add'),
            ),
          ],
        );
      },
    );

    if (result == true &&
        symbolIdController.text.isNotEmpty &&
        symbolLabelController.text.isNotEmpty &&
        responseKeyController.text.isNotEmpty) {
      final bridge = ref.read(aacBridgeProvider);
      final updated = [
        ...bridge.symbolMappings,
        AacSymbolMapping(
          symbolId: symbolIdController.text,
          symbolLabel: symbolLabelController.text,
          responseOptionKey: responseKeyController.text,
        ),
      ];
      bridge.updateSymbolMappings(updated);
    }

    symbolIdController.dispose();
    symbolLabelController.dispose();
    responseKeyController.dispose();
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  String _deviceTypeName(AacDeviceType type) {
    switch (type) {
      case AacDeviceType.goTalk:
        return 'GoTalk';
      case AacDeviceType.tobiiDynavox:
        return 'Tobii Dynavox';
      case AacDeviceType.lamp:
        return 'LAMP';
      case AacDeviceType.touchChat:
        return 'TouchChat';
      case AacDeviceType.other:
        return 'Other';
    }
  }

  IconData _deviceTypeIcon(AacDeviceType type) {
    switch (type) {
      case AacDeviceType.goTalk:
        return Icons.record_voice_over;
      case AacDeviceType.tobiiDynavox:
        return Icons.visibility;
      case AacDeviceType.lamp:
        return Icons.lightbulb;
      case AacDeviceType.touchChat:
        return Icons.chat;
      case AacDeviceType.other:
        return Icons.bluetooth;
    }
  }
}
