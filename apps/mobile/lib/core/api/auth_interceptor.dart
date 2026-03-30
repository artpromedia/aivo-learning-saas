import 'dart:async';

import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';

/// Dio [Interceptor] that attaches the current access token to every outgoing
/// request and transparently refreshes expired tokens on 401 responses.
///
/// A [Completer]-based lock ensures that only one refresh attempt runs at a
/// time; concurrent requests that hit a 401 will wait for the single refresh
/// to complete before being retried.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required SecureStorageService secureStorage,
    required Dio dio,
    required void Function() onForceLogout,
  })  : _secureStorage = secureStorage,
        _dio = dio,
        _onForceLogout = onForceLogout;

  final SecureStorageService _secureStorage;

  /// The *same* [Dio] instance used by the app so retried requests go through
  /// the full interceptor chain.
  final Dio _dio;

  /// Callback invoked when a token refresh fails, signalling that the user
  /// must re-authenticate.
  final void Function() _onForceLogout;

  /// Non-null while a refresh is in progress.  Concurrent 401 handlers await
  /// the same future instead of issuing duplicate refresh calls.
  Completer<bool>? _refreshCompleter;

  /// Paths that must never carry an Authorization header (to avoid a chicken-
  /// and-egg problem during login/register).
  static final _publicPaths = <String>{
    Endpoints.login,
    Endpoints.register,
    Endpoints.refreshToken,
    Endpoints.forgotPassword,
    Endpoints.resetPassword,
    Endpoints.verifyEmail,
    Endpoints.oauthCallback,
  };

  // ---------------------------------------------------------------------------
  // onRequest – attach Bearer token
  // ---------------------------------------------------------------------------

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final path = options.path;

    if (!_publicPaths.contains(path)) {
      final token = await _secureStorage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    handler.next(options);
  }

  // ---------------------------------------------------------------------------
  // onError – handle 401 and attempt token refresh
  // ---------------------------------------------------------------------------

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Only attempt refresh on 401 and not on the refresh endpoint itself.
    if (err.response?.statusCode != 401 ||
        err.requestOptions.path == Endpoints.refreshToken) {
      return handler.next(err);
    }

    final didRefresh = await _performTokenRefresh();

    if (didRefresh) {
      // Retry the original request with the fresh access token.
      try {
        final opts = err.requestOptions;
        final freshToken = await _secureStorage.getAccessToken();
        opts.headers['Authorization'] = 'Bearer $freshToken';

        final response = await _dio.fetch(opts);
        return handler.resolve(response);
      } on DioException catch (retryError) {
        return handler.next(retryError);
      }
    }

    // Refresh failed – force a logout and propagate the original error.
    return handler.next(err);
  }

  // ---------------------------------------------------------------------------
  // Token refresh (with lock)
  // ---------------------------------------------------------------------------

  /// Returns `true` when tokens were successfully refreshed.
  Future<bool> _performTokenRefresh() async {
    // If another refresh is already in-flight, wait for it.
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }

    _refreshCompleter = Completer<bool>();

    try {
      final currentRefreshToken = await _secureStorage.getRefreshToken();
      if (currentRefreshToken == null || currentRefreshToken.isEmpty) {
        await _handleRefreshFailure();
        _completeRefresh(false);
        return false;
      }

      // Use a *bare* Dio instance so this call does not pass through the
      // AuthInterceptor again (which would deadlock).
      final refreshDio = Dio(BaseOptions(
        baseUrl: _dio.options.baseUrl,
        headers: {'Content-Type': 'application/json'},
        connectTimeout: _dio.options.connectTimeout,
        receiveTimeout: _dio.options.receiveTimeout,
      ),);

      final response = await refreshDio.post(
        Endpoints.refreshToken,
        data: {'refreshToken': currentRefreshToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data as Map<String, dynamic>;
        final newAccessToken =
            data['accessToken'] as String? ?? data['access_token'] as String?;
        final newRefreshToken = data['refreshToken'] as String? ??
            data['refresh_token'] as String?;

        if (newAccessToken != null && newRefreshToken != null) {
          await _secureStorage.saveTokens(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          );
          _completeRefresh(true);
          return true;
        }
      }

      // Unexpected payload – treat as failure.
      await _handleRefreshFailure();
      _completeRefresh(false);
      return false;
    } catch (_) {
      await _handleRefreshFailure();
      _completeRefresh(false);
      return false;
    }
  }

  void _completeRefresh(bool success) {
    _refreshCompleter?.complete(success);
    _refreshCompleter = null;
  }

  Future<void> _handleRefreshFailure() async {
    await _secureStorage.clearAll();
    _onForceLogout();
  }
}
