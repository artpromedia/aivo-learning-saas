import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Simplified online/offline status for the app.
enum ConnectivityStatus {
  online,
  offline,
}

/// Maps a list of [ConnectivityResult] values (as reported by connectivity_plus
/// v6+) to a single [ConnectivityStatus].
ConnectivityStatus _mapResults(List<ConnectivityResult> results) {
  if (results.contains(ConnectivityResult.none) || results.isEmpty) {
    return ConnectivityStatus.offline;
  }
  return ConnectivityStatus.online;
}

/// Emits the current [ConnectivityStatus] whenever the network state changes.
///
/// The stream starts with the *current* connectivity state so that consumers
/// immediately know whether the device is online or offline.
final connectivityProvider = StreamProvider<ConnectivityStatus>((ref) {
  final connectivity = Connectivity();

  // Controller lets us push the initial value followed by the stream.
  final controller = StreamController<ConnectivityStatus>();

  // Emit the current status first.
  connectivity.checkConnectivity().then((results) {
    if (!controller.isClosed) {
      controller.add(_mapResults(results));
    }
  });

  // Then relay every change.
  final subscription = connectivity.onConnectivityChanged.listen(
    (results) {
      if (!controller.isClosed) {
        controller.add(_mapResults(results));
      }
    },
    onError: (Object error) {
      if (!controller.isClosed) {
        controller.addError(error);
      }
    },
  );

  ref.onDispose(() {
    subscription.cancel();
    controller.close();
  });

  return controller.stream;
});

/// Convenience provider that resolves to `true` when the device is online.
///
/// Falls back to `true` while the connectivity state is still loading so that
/// the app behaves optimistically during startup.
final isOnlineProvider = Provider<bool>((ref) {
  final status = ref.watch(connectivityProvider);
  return status.when(
    data: (s) => s == ConnectivityStatus.online,
    loading: () => true, // optimistic default
    error: (_, __) => true, // assume online on error
  );
});
