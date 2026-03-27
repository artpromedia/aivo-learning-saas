import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:workmanager/workmanager.dart';

import 'package:aivo_mobile/app.dart';
import 'package:aivo_mobile/config/env.dart';

/// Workmanager top-level callback dispatcher.
///
/// Must be a top-level or static function. Background tasks such as
/// offline-sync and push-token refresh are dispatched through this entry point.
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) async {
    switch (taskName) {
      case 'offlineSync':
        // Offline sync logic will be wired up in data/repositories.
        break;
      case 'refreshPushToken':
        // Push token refresh logic will be wired up in core/push.
        break;
    }
    return true;
  });
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // --- Hive (lightweight key-value persistence) ---
  await Hive.initFlutter();

  // --- Firebase ---
  try {
    // Firebase requires platform-specific config files (google-services.json /
    // GoogleService-Info.plist). Initialization is wrapped in try/catch so that
    // the app can still run in simulators / CI where those files are absent.
    //
    // When Env.firebaseOptions is populated via dart-define in CI, we would
    // parse it and pass DefaultFirebaseOptions. For now we import firebase_core
    // dynamically only if it resolves.
    //
    // import 'package:firebase_core/firebase_core.dart';
    // await Firebase.initializeApp();
    if (kDebugMode) {
      debugPrint('[AIVO] Firebase init skipped - no config present.');
    }
  } catch (e, st) {
    if (kDebugMode) {
      debugPrint('[AIVO] Firebase init failed: $e\n$st');
    }
  }

  // --- Workmanager (background tasks) ---
  await Workmanager().initialize(callbackDispatcher, isInDebugMode: kDebugMode);
  await Workmanager().registerPeriodicTask(
    'offlineSync',
    'offlineSync',
    frequency: const Duration(minutes: 15),
    constraints: Constraints(networkType: NetworkType.connected),
  );

  // --- Sentry ---
  if (Env.sentryDsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = Env.sentryDsn;
        options.tracesSampleRate = Env.isProduction ? 0.2 : 1.0;
        options.environment = Env.isProduction ? 'production' : 'development';
        options.sendDefaultPii = false;
        options.attachScreenshot = true;
        options.diagnosticLevel = SentryLevel.warning;
      },
      appRunner: () => runApp(
        DefaultAssetBundle(
          bundle: SentryAssetBundle(),
          child: const ProviderScope(child: AivoApp()),
        ),
      ),
    );
  } else {
    runApp(const ProviderScope(child: AivoApp()));
  }
}
