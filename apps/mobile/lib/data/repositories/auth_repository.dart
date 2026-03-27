import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';
import 'package:aivo_mobile/data/local/database.dart';
import 'package:aivo_mobile/data/models/user.dart';

/// Repository that handles all authentication and user-profile operations.
///
/// On login/register the returned tokens are persisted to secure storage and
/// the user object is built from the API response.  On logout, both remote
/// session invalidation and local data wipe are performed.
class AuthRepository {
  const AuthRepository({
    required ApiClient apiClient,
    required SecureStorageService secureStorage,
    required AivoDatabase database,
  })  : _api = apiClient,
        _secureStorage = secureStorage,
        _db = database;

  final ApiClient _api;
  final SecureStorageService _secureStorage;
  final AivoDatabase _db;

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  /// Authenticates with email and password. Persists tokens and user info
  /// locally and returns the [User].
  Future<User> login(String email, String password) async {
    final response = await _api.post(
      Endpoints.login,
      data: {'email': email, 'password': password},
    );

    final data = response.data as Map<String, dynamic>;
    await _persistTokens(data);
    return _extractAndPersistUser(data);
  }

  // ---------------------------------------------------------------------------
  // Register
  // ---------------------------------------------------------------------------

  /// Creates a new account and returns the authenticated [User].
  Future<User> register(
      String name, String email, String password, String role) async {
    final response = await _api.post(
      Endpoints.register,
      data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    final data = response.data as Map<String, dynamic>;
    await _persistTokens(data);
    return _extractAndPersistUser(data);
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  /// Invalidates the remote session, clears all local secure storage and
  /// wipes the Drift database.
  Future<void> logout() async {
    try {
      final refreshToken = await _secureStorage.getRefreshToken();
      await _api.post(
        Endpoints.logout,
        data: {'refreshToken': refreshToken},
      );
    } on DioException {
      // Server logout is best-effort.
    } finally {
      await Future.wait([
        _secureStorage.clearAll(),
        _db.clearAllData(),
      ]);
    }
  }

  // ---------------------------------------------------------------------------
  // Token refresh
  // ---------------------------------------------------------------------------

  /// Manually refreshes the JWT pair. Returns the new [AuthTokens].
  Future<AuthTokens> refreshToken() async {
    final currentRefreshToken = await _secureStorage.getRefreshToken();
    if (currentRefreshToken == null || currentRefreshToken.isEmpty) {
      throw StateError('No refresh token available');
    }

    final response = await _api.post(
      Endpoints.refreshToken,
      data: {'refreshToken': currentRefreshToken},
    );

    final data = response.data as Map<String, dynamic>;
    final tokens = AuthTokens(
      accessToken:
          data['accessToken'] as String? ?? data['access_token'] as String,
      refreshToken:
          data['refreshToken'] as String? ?? data['refresh_token'] as String,
    );

    await _secureStorage.saveTokens(
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    );

    return tokens;
  }

  // ---------------------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------------------

  /// Triggers a password-reset email for [email].
  Future<void> forgotPassword(String email) async {
    await _api.post(
      Endpoints.forgotPassword,
      data: {'email': email},
    );
  }

  /// Resets the password using the server-issued [token].
  Future<void> resetPassword(String token, String password) async {
    await _api.post(
      Endpoints.resetPassword,
      data: {'token': token, 'password': password},
    );
  }

  // ---------------------------------------------------------------------------
  // Current user
  // ---------------------------------------------------------------------------

  /// Fetches the authenticated user's profile from the backend.
  Future<User> getCurrentUser() async {
    final response = await _api.get(Endpoints.usersMe);
    final data = response.data as Map<String, dynamic>;
    final userMap = data.containsKey('user')
        ? data['user'] as Map<String, dynamic>
        : data;
    final user = User.fromJson(userMap);

    await _secureStorage.saveUserInfo(
      userId: user.id,
      userRole: user.role,
    );

    return user;
  }

  // ---------------------------------------------------------------------------
  // Profile update
  // ---------------------------------------------------------------------------

  /// Updates the authenticated user's profile and returns the refreshed [User].
  Future<User> updateProfile(Map<String, dynamic> data) async {
    final response = await _api.put(
      Endpoints.usersMe,
      data: data,
    );

    final responseData = response.data as Map<String, dynamic>;
    final userMap = responseData.containsKey('user')
        ? responseData['user'] as Map<String, dynamic>
        : responseData;
    return User.fromJson(userMap);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  Future<void> _persistTokens(Map<String, dynamic> data) async {
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
  }

  Future<User> _extractAndPersistUser(Map<String, dynamic> data) async {
    final userMap = data.containsKey('user')
        ? data['user'] as Map<String, dynamic>
        : (data.containsKey('id') ? data : null);

    if (userMap == null) {
      throw const FormatException('Unable to extract user from auth response');
    }

    final user = User.fromJson(userMap);

    await _secureStorage.saveUserInfo(
      userId: user.id,
      userRole: user.role,
    );

    return user;
  }
}

/// Riverpod provider for [AuthRepository].
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.watch(apiClientProvider),
    secureStorage: ref.watch(secureStorageProvider),
    database: ref.watch(databaseProvider),
  );
});
