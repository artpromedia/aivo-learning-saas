import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/data/models/engagement.dart';

void main() {
  group('EngagementSummary', () {
    test('fromJson creates correct object', () {
      final summary = EngagementSummary.fromJson({
        'totalXp': 1500,
        'currentLevel': 5,
        'xpToNextLevel': 500,
        'xpProgress': 300,
        'currentStreak': 7,
        'longestStreak': 14,
        'aivoCoins': 200,
        'streakExpiresAt': '2025-03-02T00:00:00.000Z',
        'lastActivityAt': '2025-03-01T15:00:00.000Z',
      });

      expect(summary.totalXp, 1500);
      expect(summary.currentLevel, 5);
      expect(summary.xpToNextLevel, 500);
      expect(summary.currentStreak, 7);
      expect(summary.longestStreak, 14);
      expect(summary.aivoCoins, 200);
      expect(summary.streakExpiresAt, isNotNull);
      expect(summary.lastActivityAt, isNotNull);
    });

    test('toJson produces valid map', () {
      const summary = EngagementSummary(
        totalXp: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        xpProgress: 50,
        currentStreak: 3,
        longestStreak: 5,
        aivoCoins: 10,
      );

      final json = summary.toJson();
      expect(json['totalXp'], 100);
      expect(json['currentLevel'], 1);
      expect(json['streakExpiresAt'], isNull);
    });

    test('fromJson -> toJson round-trip', () {
      final json = {
        'totalXp': 500,
        'currentLevel': 3,
        'xpToNextLevel': 200,
        'xpProgress': 100,
        'currentStreak': 5,
        'longestStreak': 10,
        'aivoCoins': 50,
      };

      final summary = EngagementSummary.fromJson(json);
      final output = summary.toJson();
      final restored = EngagementSummary.fromJson(output);

      expect(restored, equals(summary));
    });

    test('copyWith overrides specific fields', () {
      const summary = EngagementSummary(
        totalXp: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        xpProgress: 50,
        currentStreak: 0,
        longestStreak: 0,
        aivoCoins: 0,
      );

      final updated = summary.copyWith(totalXp: 200, currentStreak: 1);
      expect(updated.totalXp, 200);
      expect(updated.currentStreak, 1);
      expect(updated.currentLevel, 1); // unchanged
    });

    test('equality', () {
      const s1 = EngagementSummary(
          totalXp: 1, currentLevel: 1, xpToNextLevel: 1, xpProgress: 0,
          currentStreak: 0, longestStreak: 0, aivoCoins: 0);
      const s2 = EngagementSummary(
          totalXp: 1, currentLevel: 1, xpToNextLevel: 1, xpProgress: 0,
          currentStreak: 0, longestStreak: 0, aivoCoins: 0);

      expect(s1, equals(s2));
      expect(s1.hashCode, equals(s2.hashCode));
    });
  });

  group('Badge', () {
    test('fromJson creates correct object', () {
      final badge = Badge.fromJson({
        'slug': 'first-lesson',
        'name': 'First Lesson',
        'description': 'Complete your first lesson',
        'iconUrl': 'https://example.com/badge.png',
        'rarity': 'common',
        'isEarned': true,
        'progress': 1.0,
        'earnedAt': '2025-03-01T10:00:00.000Z',
      });

      expect(badge.slug, 'first-lesson');
      expect(badge.isEarned, isTrue);
      expect(badge.rarity, 'common');
      expect(badge.earnedAt, isNotNull);
    });

    test('toJson round-trip', () {
      const badge = Badge(
        slug: 'streak-7',
        name: 'Week Warrior',
        description: '7-day streak',
        iconUrl: 'https://example.com/badge.png',
        rarity: 'rare',
        isEarned: false,
        progress: 0.5,
      );

      final json = badge.toJson();
      final restored = Badge.fromJson(json);

      expect(restored, equals(badge));
    });

    test('equality', () {
      const b1 = Badge(
          slug: 's', name: 'n', description: 'd', iconUrl: 'u',
          rarity: 'r', isEarned: false, progress: 0.0);
      const b2 = Badge(
          slug: 's', name: 'n', description: 'd', iconUrl: 'u',
          rarity: 'r', isEarned: false, progress: 0.0);

      expect(b1, equals(b2));
    });
  });

  group('ShopItem', () {
    test('fromJson creates correct object', () {
      final item = ShopItem.fromJson({
        'id': 'item-1',
        'name': 'Cool Hat',
        'description': 'A cool hat',
        'imageUrl': 'https://example.com/hat.png',
        'category': 'head',
        'price': 50,
        'isOwned': false,
        'isEquipped': false,
      });

      expect(item.id, 'item-1');
      expect(item.price, 50);
      expect(item.isOwned, isFalse);
    });

    test('toJson round-trip', () {
      const item = ShopItem(
        id: 'i1', name: 'n', description: 'd', imageUrl: 'u',
        category: 'c', price: 10, isOwned: true, isEquipped: false,
      );

      final json = item.toJson();
      final restored = ShopItem.fromJson(json);

      expect(restored, equals(item));
    });
  });

  group('LeaderboardEntry', () {
    test('fromJson creates correct object', () {
      final entry = LeaderboardEntry.fromJson({
        'odometer': 'odo-1',
        'learnerName': 'Alice',
        'xp': 1000,
        'rank': 1,
        'isCurrentUser': true,
      });

      expect(entry.learnerName, 'Alice');
      expect(entry.rank, 1);
      expect(entry.isCurrentUser, isTrue);
      expect(entry.avatarUrl, isNull);
    });

    test('equality', () {
      const e1 = LeaderboardEntry(
          odometer: 'o', learnerName: 'n', xp: 100, rank: 1, isCurrentUser: false);
      const e2 = LeaderboardEntry(
          odometer: 'o', learnerName: 'n', xp: 100, rank: 1, isCurrentUser: false);

      expect(e1, equals(e2));
    });
  });

  group('Challenge', () {
    test('fromJson creates correct object', () {
      final challenge = Challenge.fromJson({
        'id': 'ch-1',
        'title': 'Math Sprint',
        'description': 'Solve 10 problems in 5 minutes',
        'type': 'speed',
        'status': 'active',
        'participantCount': 15,
        'startsAt': '2025-03-01T08:00:00.000Z',
        'endsAt': '2025-03-01T20:00:00.000Z',
      });

      expect(challenge.id, 'ch-1');
      expect(challenge.participantCount, 15);
      expect(challenge.result, isNull);
    });

    test('toJson round-trip', () {
      final challenge = Challenge(
        id: 'ch-2',
        title: 'T',
        description: 'D',
        type: 'team',
        status: 'completed',
        participantCount: 5,
        startsAt: DateTime.parse('2025-01-01T00:00:00.000Z'),
        endsAt: DateTime.parse('2025-01-02T00:00:00.000Z'),
        result: {'winner': 'player-1'},
      );

      final json = challenge.toJson();
      final restored = Challenge.fromJson(json);

      expect(restored.id, challenge.id);
      expect(restored.result?['winner'], 'player-1');
    });

    test('copyWith updates fields', () {
      final challenge = Challenge(
        id: 'ch-1',
        title: 'T',
        description: 'D',
        type: 'solo',
        status: 'pending',
        participantCount: 0,
        startsAt: DateTime(2025, 1, 1),
        endsAt: DateTime(2025, 1, 2),
      );

      final updated = challenge.copyWith(status: 'active', participantCount: 10);
      expect(updated.status, 'active');
      expect(updated.participantCount, 10);
    });
  });

  group('DailyChallenge', () {
    test('fromJson creates correct object', () {
      final dc = DailyChallenge.fromJson({
        'id': 'dc-1',
        'title': 'Read 5 pages',
        'description': 'Reading challenge',
        'xpReward': 25,
        'isCompleted': false,
        'progress': 0.4,
      });

      expect(dc.id, 'dc-1');
      expect(dc.xpReward, 25);
      expect(dc.isCompleted, isFalse);
      expect(dc.progress, 0.4);
    });

    test('equality', () {
      const d1 = DailyChallenge(
          id: 'd', title: 't', description: 'desc',
          xpReward: 10, isCompleted: false, progress: 0.0);
      const d2 = DailyChallenge(
          id: 'd', title: 't', description: 'desc',
          xpReward: 10, isCompleted: false, progress: 0.0);

      expect(d1, equals(d2));
    });
  });
}
