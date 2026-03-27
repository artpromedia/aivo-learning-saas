import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/config/env.dart';
import 'package:aivo_mobile/core/api/auth_interceptor.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';

/// Riverpod provider that exposes a fully configured [ApiClient].
///
/// The provider depends on [secureStorageProvider] so the auth interceptor
/// can transparently attach and refresh JWT tokens.
final apiClientProvider = Provider<ApiClient>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return ApiClient(secureStorage: secureStorage);
});

/// Thin wrapper around [Dio] that pre-configures base URL, timeouts,
/// interceptors and exposes ergonomic helpers for every HTTP verb the app
/// needs – including multipart uploads and SSE streaming.
class ApiClient {
  ApiClient({
    required SecureStorageService secureStorage,
    Dio? dio,
  }) : _secureStorage = secureStorage {
    _dio = dio ?? Dio();

    _dio.options
      ..baseUrl = Env.apiBaseUrl
      ..connectTimeout = const Duration(seconds: 30)
      ..receiveTimeout = const Duration(seconds: 60)
      ..headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

    _dio.interceptors.add(
      AuthInterceptor(
        secureStorage: _secureStorage,
        dio: _dio,
        onForceLogout: _handleForceLogout,
      ),
    );

    // Network logging only in debug builds when explicitly enabled.
    if (kDebugMode && Env.enableNetworkLogging) {
      _dio.interceptors.add(
        LogInterceptor(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          logPrint: (obj) => debugPrint(obj.toString()),
        ),
      );
    }
  }

  final SecureStorageService _secureStorage;
  late final Dio _dio;

  /// Callback that external code (e.g. the auth notifier) can register to
  /// react when a token refresh fails and the user is forcibly logged out.
  void Function()? onForceLogout;

  void _handleForceLogout() {
    onForceLogout?.call();
  }

  /// Provides direct access to the underlying [Dio] instance for edge-case
  /// use (e.g. download progress callbacks).
  Dio get dio => _dio;

  // ---------------------------------------------------------------------------
  // HTTP helpers
  // ---------------------------------------------------------------------------

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  /// Upload a file as `multipart/form-data`.
  ///
  /// [filePath] is the local filesystem path; [fieldName] is the form field
  /// name expected by the server (defaults to `"file"`).  Extra fields can be
  /// passed via [fields].
  Future<Response<T>> upload<T>(
    String path, {
    required String filePath,
    String fieldName = 'file',
    String? fileName,
    Map<String, dynamic>? fields,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
  }) async {
    final formData = FormData.fromMap({
      if (fields != null) ...fields,
      fieldName: await MultipartFile.fromFile(
        filePath,
        filename: fileName,
      ),
    });

    return _dio.post<T>(
      path,
      data: formData,
      options: (options ?? Options()).copyWith(
        contentType: 'multipart/form-data',
      ),
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
    );
  }

  /// Open an SSE / streaming response.
  ///
  /// Returns a [Response] whose `data` is a [ResponseBody] stream.  Callers
  /// should listen to the stream for incremental payloads (e.g. AI tutor
  /// responses).
  Future<Response<ResponseBody>> stream(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.post<ResponseBody>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: (options ?? Options()).copyWith(
        responseType: ResponseType.stream,
      ),
      cancelToken: cancelToken,
    );
  }
}
