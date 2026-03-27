import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jwt_decode/jwt_decode.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';

/// Riverpod provider for [AuthService].
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(
    apiClient: ref.watch(apiClientProvider),
    secureStorage: ref.watch(secureStorageProvider),
  );
});

/// Lightweight representation of the authenticated user returned after login
/// or registration.
class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.learnerId,
    this.functioningLevel,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String? ?? '',
      role: json['role'] as String,
      learnerId: json['learnerId'] as String?,
      functioningLevel: json['functioningLevel'] as String?,
    );
  }

  final String id;
  final String email;
  final String name;
  final String role;
  final String? learnerId;
  final String? functioningLevel;

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        if (learnerId != null) 'learnerId': learnerId,
        if (functioningLevel != null) 'functioningLevel': functioningLevel,
      };
}

/// Business-logic layer for authentication operations.
///
/// Each method calls the appropriate API endpoint, persists tokens and user
/// metadata in secure storage, and returns typed results.
class AuthService {
  const AuthService({
    required ApiClient apiClient,
    required SecureStorageService secureStorage,
  })  : _apiClient = apiClient,
        _secureStorage = secureStorage;

  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  /// Authenticate with email and password.  On success the access/refresh
  /// tokens and user metadata are persisted and an [AuthUser] is returned.
  Future<AuthUser> login(String email, String password) async {
    final response = await _apiClient.post(
      Endpoints.login,
      data: {'email': email, 'password': password},
    );

    final data = response.data as Map<String, dynamic>;
    await _persistAuthData(data);

    return _extractUser(data);
  }

  // ---------------------------------------------------------------------------
  // Register
  // ---------------------------------------------------------------------------

  Future<AuthUser> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await _apiClient.post(
      Endpoints.register,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = response.data as Map<String, dynamic>;
    await _persistAuthData(data);

    return _extractUser(data);
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  Future<void> logout() async {
    try {
      final refreshToken = await _secureStorage.getRefreshToken();
      await _apiClient.post(
        Endpoints.logout,
        data: {'refreshToken': refreshToken},
      );
    } on DioException {
      // Server-side logout is best-effort; we always clear local state.
    } finally {
      await _secureStorage.clearAll();
    }
  }

  // ---------------------------------------------------------------------------
  // Token refresh
  // ---------------------------------------------------------------------------

  /// Manually refresh the access token.  Returns `true` on success.
  Future<bool> refreshToken() async {
    final currentRefreshToken = await _secureStorage.getRefreshToken();
    if (currentRefreshToken == null || currentRefreshToken.isEmpty) {
      return false;
    }

    try {
      final response = await _apiClient.post(
        Endpoints.refreshToken,
        data: {'refreshToken': currentRefreshToken},
      );

      final data = response.data as Map<String, dynamic>;
      final accessToken =
          data['accessToken'] as String? ?? data['access_token'] as String?;
      final refreshToken =
          data['refreshToken'] as String? ?? data['refresh_token'] as String?;

      if (accessToken != null && refreshToken != null) {
        await _secureStorage.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
        );
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------------------

  Future<void> forgotPassword(String email) async {
    await _apiClient.post(
      Endpoints.forgotPassword,
      data: {'email': email},
    );
  }

  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    await _apiClient.post(
      Endpoints.resetPassword,
      data: {'token': token, 'password': password},
    );
  }

  // ---------------------------------------------------------------------------
  // Current user (from stored token)
  // ---------------------------------------------------------------------------

  /// Attempt to reconstruct an [AuthUser] from the persisted access token
  /// without hitting the network.  Returns `null` if no valid token exists.
  Future<AuthUser?> getCurrentUser() async {
    final accessToken = await _secureStorage.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) return null;

    try {
      // Check expiry.
      if (Jwt.isExpired(accessToken)) {
        final refreshed = await refreshToken();
        if (!refreshed) return null;
        // Re-read the freshly stored token.
        final freshToken = await _secureStorage.getAccessToken();
        if (freshToken == null) return null;
        return _userFromToken(freshToken);
      }
      return _userFromToken(accessToken);
    } catch (_) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  AuthUser? _userFromToken(String token) {
    try {
      final payload = Jwt.parseJwt(token);
      return AuthUser(
        id: payload['sub'] as String? ?? payload['userId'] as String? ?? '',
        email: payload['email'] as String? ?? '',
        name: payload['name'] as String? ?? '',
        role: payload['role'] as String? ?? '',
        learnerId: payload['learnerId'] as String?,
        functioningLevel: payload['functioningLevel'] as String?,
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> _persistAuthData(Map<String, dynamic> data) async {
    final accessToken =
        data['accessToken'] as String? ?? data['access_token'] as String?;
    final refreshToken =
        data['refreshToken'] as String? ?? data['refresh_token'] as String?;

    if (accessToken != null && refreshToken != null) {
      await _secureStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
    }

    final user = _extractUserMap(data);
    if (user != null) {
      await _secureStorage.saveUserInfo(
        userId: user['id'] as String,
        userRole: user['role'] as String,
        learnerId: user['learnerId'] as String?,
        functioningLevel: user['functioningLevel'] as String?,
      );
    }
  }

  AuthUser _extractUser(Map<String, dynamic> data) {
    final userMap = _extractUserMap(data);
    if (userMap != null) return AuthUser.fromJson(userMap);

    // Fallback: decode from the freshly received access token.
    final accessToken =
        data['accessToken'] as String? ?? data['access_token'] as String?;
    if (accessToken != null) {
      final fromToken = _userFromToken(accessToken);
      if (fromToken != null) return fromToken;
    }

    throw const FormatException('Unable to extract user from auth response');
  }

  Map<String, dynamic>? _extractUserMap(Map<String, dynamic> data) {
    if (data.containsKey('user')) {
      return data['user'] as Map<String, dynamic>;
    }
    if (data.containsKey('id') && data.containsKey('role')) {
      return data;
    }
    return null;
  }
}
