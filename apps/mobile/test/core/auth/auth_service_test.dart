import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

import 'package:aivo_mobile/core/auth/auth_service.dart';
import 'package:aivo_mobile/core/auth/secure_storage.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockApiClient extends Mock implements ApiClient {}

class MockSecureStorageService extends Mock implements SecureStorageService {}

void main() {
  late MockApiClient mockApiClient;
  late MockSecureStorageService mockStorage;
  late AuthService authService;

  setUp(() {
    mockApiClient = MockApiClient();
    mockStorage = MockSecureStorageService();
    authService = AuthService(
      apiClient: mockApiClient,
      secureStorage: mockStorage,
    );
  });

  setUpAll(() {
    registerFallbackValue(RequestOptions(path: ''));
  });

  Response<dynamic> _buildResponse(Map<String, dynamic> data,
      {int statusCode = 200}) {
    return Response(
      data: data,
      statusCode: statusCode,
      requestOptions: RequestOptions(path: ''),
    );
  }

  group('AuthService.login', () {
    test('returns AuthUser and persists tokens on success', () async {
      final responseData = {
        'accessToken': 'access-token-123',
        'refreshToken': 'refresh-token-456',
        'user': {
          'id': 'user-1',
          'email': 'test@example.com',
          'name': 'Test User',
          'role': 'learner',
        },
      };

      when(() => mockApiClient.post(Endpoints.login, data: any(named: 'data')))
          .thenAnswer((_) async => _buildResponse(responseData));
      when(() => mockStorage.saveTokens(
            accessToken: any(named: 'accessToken'),
            refreshToken: any(named: 'refreshToken'),
          )).thenAnswer((_) async {});
      when(() => mockStorage.saveUserInfo(
            userId: any(named: 'userId'),
            userRole: any(named: 'userRole'),
            learnerId: any(named: 'learnerId'),
            functioningLevel: any(named: 'functioningLevel'),
          )).thenAnswer((_) async {});

      final user = await authService.login('test@example.com', 'password123');

      expect(user.id, 'user-1');
      expect(user.email, 'test@example.com');
      verify(() => mockStorage.saveTokens(
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-456',
          )).called(1);
    });

    test('throws on network error', () async {
      when(() => mockApiClient.post(Endpoints.login, data: any(named: 'data')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: Endpoints.login),
        type: DioExceptionType.connectionTimeout,
      ));

      expect(
        () => authService.login('test@example.com', 'password'),
        throwsA(isA<DioException>()),
      );
    });
  });

  group('AuthService.register', () {
    test('returns AuthUser on success', () async {
      final responseData = {
        'accessToken': 'new-access',
        'refreshToken': 'new-refresh',
        'user': {
          'id': 'user-2',
          'email': 'new@example.com',
          'name': 'New User',
          'role': 'parent',
        },
      };

      when(() => mockApiClient.post(Endpoints.register, data: any(named: 'data')))
          .thenAnswer((_) async => _buildResponse(responseData));
      when(() => mockStorage.saveTokens(
            accessToken: any(named: 'accessToken'),
            refreshToken: any(named: 'refreshToken'),
          )).thenAnswer((_) async {});
      when(() => mockStorage.saveUserInfo(
            userId: any(named: 'userId'),
            userRole: any(named: 'userRole'),
            learnerId: any(named: 'learnerId'),
            functioningLevel: any(named: 'functioningLevel'),
          )).thenAnswer((_) async {});

      final user = await authService.register(
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'parent',
      );

      expect(user.id, 'user-2');
      expect(user.role, 'parent');
    });
  });

  group('AuthService.logout', () {
    test('clears all storage even when API call fails', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => 'some-token');
      when(() => mockApiClient.post(Endpoints.logout, data: any(named: 'data')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: Endpoints.logout),
      ));
      when(() => mockStorage.clearAll()).thenAnswer((_) async {});

      await authService.logout();

      verify(() => mockStorage.clearAll()).called(1);
    });

    test('calls API logout with refresh token', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => 'rt-123');
      when(() => mockApiClient.post(Endpoints.logout, data: any(named: 'data')))
          .thenAnswer((_) async => _buildResponse({}));
      when(() => mockStorage.clearAll()).thenAnswer((_) async {});

      await authService.logout();

      verify(() => mockApiClient.post(
            Endpoints.logout,
            data: {'refreshToken': 'rt-123'},
          )).called(1);
    });
  });

  group('AuthService.refreshToken', () {
    test('returns true and saves new tokens on success', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => 'old-refresh');
      when(() => mockApiClient.post(Endpoints.refreshToken,
              data: any(named: 'data')))
          .thenAnswer((_) async => _buildResponse({
                'accessToken': 'new-access',
                'refreshToken': 'new-refresh',
              }));
      when(() => mockStorage.saveTokens(
            accessToken: any(named: 'accessToken'),
            refreshToken: any(named: 'refreshToken'),
          )).thenAnswer((_) async {});

      final result = await authService.refreshToken();

      expect(result, isTrue);
      verify(() => mockStorage.saveTokens(
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
          )).called(1);
    });

    test('returns false when no refresh token stored', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => null);

      final result = await authService.refreshToken();

      expect(result, isFalse);
    });

    test('returns false on API error', () async {
      when(() => mockStorage.getRefreshToken())
          .thenAnswer((_) async => 'some-token');
      when(() => mockApiClient.post(Endpoints.refreshToken,
              data: any(named: 'data')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: Endpoints.refreshToken),
      ));

      final result = await authService.refreshToken();

      expect(result, isFalse);
    });
  });

  group('AuthService.forgotPassword', () {
    test('calls API with email', () async {
      when(() => mockApiClient.post(Endpoints.forgotPassword,
              data: any(named: 'data')))
          .thenAnswer((_) async => _buildResponse({}));

      await authService.forgotPassword('user@example.com');

      verify(() => mockApiClient.post(
            Endpoints.forgotPassword,
            data: {'email': 'user@example.com'},
          )).called(1);
    });
  });

  group('AuthService.getCurrentUser', () {
    test('returns null when no access token', () async {
      when(() => mockStorage.getAccessToken())
          .thenAnswer((_) async => null);

      final user = await authService.getCurrentUser();

      expect(user, isNull);
    });

    test('returns null when access token is empty', () async {
      when(() => mockStorage.getAccessToken())
          .thenAnswer((_) async => '');

      final user = await authService.getCurrentUser();

      expect(user, isNull);
    });
  });
}
