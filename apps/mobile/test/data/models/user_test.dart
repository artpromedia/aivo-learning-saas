import 'package:flutter_test/flutter_test.dart';

import 'package:aivo_mobile/data/models/user.dart';

void main() {
  final testDate = DateTime.parse('2025-01-15T10:00:00.000Z');

  const testJson = {
    'id': 'user-1',
    'email': 'test@example.com',
    'name': 'Test User',
    'role': 'parent',
    'tenantId': 'tenant-1',
    'avatarUrl': 'https://example.com/avatar.png',
    'emailVerified': true,
    'createdAt': '2025-01-15T10:00:00.000Z',
  };

  User createTestUser() => User(
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'parent',
        tenantId: 'tenant-1',
        avatarUrl: 'https://example.com/avatar.png',
        emailVerified: true,
        createdAt: testDate,
      );

  group('User', () {
    test('fromJson creates correct User', () {
      final user = User.fromJson(testJson);

      expect(user.id, 'user-1');
      expect(user.email, 'test@example.com');
      expect(user.name, 'Test User');
      expect(user.role, 'parent');
      expect(user.tenantId, 'tenant-1');
      expect(user.avatarUrl, 'https://example.com/avatar.png');
      expect(user.emailVerified, isTrue);
      expect(user.createdAt, testDate);
    });

    test('toJson produces correct map', () {
      final user = createTestUser();
      final json = user.toJson();

      expect(json['id'], 'user-1');
      expect(json['email'], 'test@example.com');
      expect(json['name'], 'Test User');
      expect(json['role'], 'parent');
      expect(json['tenantId'], 'tenant-1');
      expect(json['avatarUrl'], 'https://example.com/avatar.png');
      expect(json['emailVerified'], isTrue);
      expect(json['createdAt'], testDate.toIso8601String());
    });

    test('fromJson -> toJson round-trip', () {
      final user = User.fromJson(testJson);
      final json = user.toJson();
      final restored = User.fromJson(json);

      expect(restored, user);
    });

    test('copyWith overrides specified fields', () {
      final user = createTestUser();
      final updated = user.copyWith(
        name: 'Updated Name',
        email: 'new@example.com',
      );

      expect(updated.name, 'Updated Name');
      expect(updated.email, 'new@example.com');
      expect(updated.id, user.id); // unchanged
      expect(updated.role, user.role); // unchanged
    });

    test('copyWith can nullify optional fields', () {
      final user = createTestUser();
      final updated = user.copyWith(
        tenantId: () => null,
        avatarUrl: () => null,
      );

      expect(updated.tenantId, isNull);
      expect(updated.avatarUrl, isNull);
      expect(updated.id, user.id);
    });

    test('equality checks all fields', () {
      final user1 = createTestUser();
      final user2 = createTestUser();

      expect(user1, equals(user2));
      expect(user1.hashCode, equals(user2.hashCode));
    });

    test('inequality when fields differ', () {
      final user1 = createTestUser();
      final user2 = user1.copyWith(id: 'different-id');

      expect(user1, isNot(equals(user2)));
    });

    test('toString contains key fields', () {
      final user = createTestUser();
      final str = user.toString();

      expect(str, contains('user-1'));
      expect(str, contains('test@example.com'));
      expect(str, contains('Test User'));
    });
  });

  group('AuthTokens', () {
    test('fromJson creates correct AuthTokens', () {
      final tokens = AuthTokens.fromJson({
        'accessToken': 'at-123',
        'refreshToken': 'rt-456',
      });

      expect(tokens.accessToken, 'at-123');
      expect(tokens.refreshToken, 'rt-456');
    });

    test('toJson round-trip', () {
      const tokens = AuthTokens(accessToken: 'at', refreshToken: 'rt');
      final json = tokens.toJson();
      final restored = AuthTokens.fromJson(json);

      expect(restored, tokens);
    });

    test('copyWith updates specified fields', () {
      const tokens = AuthTokens(accessToken: 'at', refreshToken: 'rt');
      final updated = tokens.copyWith(accessToken: 'new-at');

      expect(updated.accessToken, 'new-at');
      expect(updated.refreshToken, 'rt');
    });

    test('equality', () {
      const t1 = AuthTokens(accessToken: 'a', refreshToken: 'b');
      const t2 = AuthTokens(accessToken: 'a', refreshToken: 'b');

      expect(t1, equals(t2));
      expect(t1.hashCode, equals(t2.hashCode));
    });
  });
}
