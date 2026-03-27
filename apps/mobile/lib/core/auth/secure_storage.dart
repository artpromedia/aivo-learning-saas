import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Keys used by [SecureStorageService] to persist sensitive data.
abstract final class _Keys {
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userRole = 'user_role';
  static const String learnerId = 'learner_id';
  static const String functioningLevel = 'functioning_level';
  static const String biometricEnabled = 'biometric_enabled';
}

/// Riverpod provider for [SecureStorageService].
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

/// Thin wrapper around [FlutterSecureStorage] that enforces a fixed set of
/// storage keys and provides strongly-typed convenience methods.
class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock,
              ),
            );

  final FlutterSecureStorage _storage;

  // ---------------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------------

  /// Persist both the access and refresh tokens atomically.
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _Keys.accessToken, value: accessToken),
      _storage.write(key: _Keys.refreshToken, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() =>
      _storage.read(key: _Keys.accessToken);

  Future<String?> getRefreshToken() =>
      _storage.read(key: _Keys.refreshToken);

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _Keys.accessToken),
      _storage.delete(key: _Keys.refreshToken),
    ]);
  }

  // ---------------------------------------------------------------------------
  // User info
  // ---------------------------------------------------------------------------

  /// Save basic user metadata after login or profile fetch.
  Future<void> saveUserInfo({
    required String userId,
    required String userRole,
    String? learnerId,
    String? functioningLevel,
  }) async {
    await Future.wait([
      _storage.write(key: _Keys.userId, value: userId),
      _storage.write(key: _Keys.userRole, value: userRole),
      if (learnerId != null)
        _storage.write(key: _Keys.learnerId, value: learnerId),
      if (functioningLevel != null)
        _storage.write(key: _Keys.functioningLevel, value: functioningLevel),
    ]);
  }

  Future<String?> getUserId() => _storage.read(key: _Keys.userId);

  Future<String?> getUserRole() => _storage.read(key: _Keys.userRole);

  Future<String?> getLearnerId() => _storage.read(key: _Keys.learnerId);

  Future<String?> getFunctioningLevel() =>
      _storage.read(key: _Keys.functioningLevel);

  // ---------------------------------------------------------------------------
  // Biometric preference
  // ---------------------------------------------------------------------------

  Future<bool> isBiometricEnabled() async {
    final value = await _storage.read(key: _Keys.biometricEnabled);
    return value == 'true';
  }

  Future<void> setBiometricEnabled(bool enabled) =>
      _storage.write(key: _Keys.biometricEnabled, value: enabled.toString());

  // ---------------------------------------------------------------------------
  // Bulk operations
  // ---------------------------------------------------------------------------

  /// Remove **all** persisted secure data (used on logout).
  Future<void> clearAll() => _storage.deleteAll();
}
