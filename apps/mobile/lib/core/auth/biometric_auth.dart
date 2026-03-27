import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';

import 'package:aivo_mobile/core/auth/secure_storage.dart';

/// Riverpod provider for [BiometricAuthService].
final biometricAuthProvider = Provider<BiometricAuthService>((ref) {
  return BiometricAuthService(
    secureStorage: ref.watch(secureStorageProvider),
  );
});

/// Wraps the `local_auth` plugin to provide a simple, testable interface for
/// biometric authentication (Face ID, Touch ID, fingerprint, etc.).
///
/// The user's preference for whether biometric unlock is enabled is stored in
/// [SecureStorageService] so it survives app restarts.
class BiometricAuthService {
  BiometricAuthService({
    required SecureStorageService secureStorage,
    LocalAuthentication? localAuth,
  })  : _secureStorage = secureStorage,
        _localAuth = localAuth ?? LocalAuthentication();

  final SecureStorageService _secureStorage;
  final LocalAuthentication _localAuth;

  // ---------------------------------------------------------------------------
  // Capability checks
  // ---------------------------------------------------------------------------

  /// Returns `true` when the device supports at least one biometric type
  /// **and** the user has enrolled biometrics in the OS settings.
  Future<bool> isAvailable() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      final isSupported = await _localAuth.isDeviceSupported();
      if (!canCheck || !isSupported) return false;

      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      return availableBiometrics.isNotEmpty;
    } on PlatformException {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  /// Prompt the user for biometric authentication.
  ///
  /// [reason] is the localised string shown on the OS biometric sheet (e.g.
  /// "Unlock AIVO Learning").  Returns `true` when the user successfully
  /// authenticates.
  Future<bool> authenticate({
    String reason = 'Please authenticate to continue',
  }) async {
    try {
      return await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } on PlatformException {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Preference management
  // ---------------------------------------------------------------------------

  /// Whether the user has opted-in to biometric unlock in the app settings.
  Future<bool> isBiometricEnabled() => _secureStorage.isBiometricEnabled();

  /// Toggle the biometric-unlock preference.
  ///
  /// When enabling, this method first verifies that biometrics are available
  /// on the device and then prompts the user to confirm their identity.  If
  /// either check fails the preference is **not** changed and `false` is
  /// returned.
  Future<bool> setBiometricEnabled(bool enabled) async {
    if (enabled) {
      final available = await isAvailable();
      if (!available) return false;

      final authenticated = await authenticate(
        reason: 'Verify your identity to enable biometric login',
      );
      if (!authenticated) return false;
    }

    await _secureStorage.setBiometricEnabled(enabled);
    return true;
  }
}
