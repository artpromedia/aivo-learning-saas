
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/api/auth_interceptor.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockSecureStorageService extends Mock implements SecureStorageService {}

class MockDio extends Mock implements Dio {
  @override
  BaseOptions get options => BaseOptions(
        baseUrl: 'http://localhost:3000/api/v1',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
      );
}

class MockRequestInterceptorHandler extends Mock
    implements RequestInterceptorHandler {}

class MockErrorInterceptorHandler extends Mock
    implements ErrorInterceptorHandler {}

void main() {
  late MockSecureStorageService mockStorage;
  late MockDio mockDio;
  late AuthInterceptor interceptor;
  late bool forceLogoutCalled;

  setUp(() {
    mockStorage = MockSecureStorageService();
    mockDio = MockDio();
    forceLogoutCalled = false;
    interceptor = AuthInterceptor(
      secureStorage: mockStorage,
      dio: mockDio,
      onForceLogout: () => forceLogoutCalled = true,
    );
  });

  setUpAll(() {
    registerFallbackValue(RequestOptions(path: ''));
    registerFallbackValue(DioException(requestOptions: RequestOptions(path: '')));
    registerFallbackValue(Response(requestOptions: RequestOptions(path: '')));
  });

  group('onRequest', () {
    test('adds Authorization header for non-public paths', () async {
      when(() => mockStorage.getAccessToken())
          .thenAnswer((_) async => 'test-token');

      final options = RequestOptions(path: '/brain/learner/123');
      final handler = MockRequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers['Authorization'], 'Bearer test-token');
      verify(() => handler.next(options)).called(1);
    });

    test('does not add auth header for login path', () async {
      final options = RequestOptions(path: Endpoints.login);
      final handler = MockRequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers.containsKey('Authorization'), isFalse);
      verify(() => handler.next(options)).called(1);
    });

    test('does not add auth header for register path', () async {
      final options = RequestOptions(path: Endpoints.register);
      final handler = MockRequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers.containsKey('Authorization'), isFalse);
    });

    test('does not add auth header when token is null', () async {
      when(() => mockStorage.getAccessToken())
          .thenAnswer((_) async => null);

      final options = RequestOptions(path: '/some/protected/path');
      final handler = MockRequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers.containsKey('Authorization'), isFalse);
    });

    test('does not add auth header when token is empty', () async {
      when(() => mockStorage.getAccessToken())
          .thenAnswer((_) async => '');

      final options = RequestOptions(path: '/some/path');
      final handler = MockRequestInterceptorHandler();

      await interceptor.onRequest(options, handler);

      expect(options.headers.containsKey('Authorization'), isFalse);
    });
  });

  group('onError', () {
    test('passes through non-401 errors', () async {
      final error = DioException(
        requestOptions: RequestOptions(path: '/test'),
        response: Response(
          statusCode: 500,
          requestOptions: RequestOptions(path: '/test'),
        ),
      );
      final handler = MockErrorInterceptorHandler();

      await interceptor.onError(error, handler);

      verify(() => handler.next(error)).called(1);
    });

    test('passes through 401 on refresh endpoint itself', () async {
      final error = DioException(
        requestOptions: RequestOptions(path: Endpoints.refreshToken),
        response: Response(
          statusCode: 401,
          requestOptions: RequestOptions(path: Endpoints.refreshToken),
        ),
      );
      final handler = MockErrorInterceptorHandler();

      await interceptor.onError(error, handler);

      verify(() => handler.next(error)).called(1);
    });

    test('triggers forceLogout when refresh token is empty on 401', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => null);
      when(() => mockStorage.clearAll()).thenAnswer((_) async {});

      final error = DioException(
        requestOptions: RequestOptions(path: '/protected'),
        response: Response(
          statusCode: 401,
          requestOptions: RequestOptions(path: '/protected'),
        ),
      );
      final handler = MockErrorInterceptorHandler();

      await interceptor.onError(error, handler);

      expect(forceLogoutCalled, isTrue);
      verify(() => handler.next(any())).called(1);
    });
  });
}
