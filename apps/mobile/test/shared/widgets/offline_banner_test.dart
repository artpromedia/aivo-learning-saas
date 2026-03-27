import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/core/connectivity/sync_manager.dart';
import 'package:aivo_mobile/shared/widgets/offline_banner.dart';

void main() {
  Widget buildApp({
    required ConnectivityStatus status,
    SyncDao? syncDao,
  }) {
    final controller = StreamController<ConnectivityStatus>();
    controller.add(status);

    return ProviderScope(
      overrides: [
        connectivityProvider.overrideWith((ref) => controller.stream),
        if (syncDao != null) syncDaoProvider.overrideWithValue(syncDao),
      ],
      child: const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              OfflineBanner(),
              Expanded(child: Placeholder()),
            ],
          ),
        ),
      ),
    );
  }

  group('OfflineBanner', () {
    testWidgets('shows banner content when offline', (tester) async {
      final dao = InMemorySyncDao();

      await tester.pumpWidget(buildApp(
        status: ConnectivityStatus.offline,
        syncDao: dao,
      ));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.cloud_off), findsOneWidget);
      expect(
        find.textContaining('offline'),
        findsAtLeast(1),
      );
    });

    testWidgets('hides banner when online', (tester) async {
      await tester.pumpWidget(buildApp(
        status: ConnectivityStatus.online,
      ));
      await tester.pumpAndSettle();

      // When online, the SizeTransition should collapse the banner.
      // The cloud_off icon should not be visible.
      expect(find.byIcon(Icons.cloud_off), findsNothing);
    });

    testWidgets('displays pending count when items are queued', (tester) async {
      final dao = InMemorySyncDao();
      await dao.insertAction(SyncAction(
        endpoint: '/test1',
        method: 'POST',
        payload: '{}',
      ));
      await dao.insertAction(SyncAction(
        endpoint: '/test2',
        method: 'POST',
        payload: '{}',
      ));

      await tester.pumpWidget(buildApp(
        status: ConnectivityStatus.offline,
        syncDao: dao,
      ));
      await tester.pumpAndSettle();

      expect(
        find.textContaining('2 changes pending'),
        findsOneWidget,
      );
    });
  });
}
