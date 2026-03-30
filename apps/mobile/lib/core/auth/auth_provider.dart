import 'package:flutter_riverpod/legacy.dart';

import 'package:aivo_mobile/core/auth/auth_service.dart';

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------

/// Sealed hierarchy representing every possible authentication state.
sealed class AuthState {
  const AuthState();
}

/// The app has just started; auth status is not yet determined.
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// An auth operation (login, register, token check) is in progress.
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// The user is authenticated and we have their profile data.
class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.user);
  final AuthUser user;
}

/// No valid session exists; the user needs to log in.
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// An auth operation failed.
class AuthError extends AuthState {
  const AuthError(this.message);
  final String message;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/// Global auth state provider.
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService: authService);
});

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

/// [StateNotifier] that drives the authentication lifecycle.
///
/// On construction it immediately checks secure storage for an existing valid
/// token so that returning users are silently re-authenticated.
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({required AuthService authService})
      : _authService = authService,
        super(const AuthInitial()) {
    checkAuth();
  }

  final AuthService _authService;

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /// Silently check whether the user already has a valid session (e.g. on app
  /// start or after returning from background).
  Future<void> checkAuth() async {
    state = const AuthLoading();

    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        state = AuthAuthenticated(user);
      } else {
        state = const AuthUnauthenticated();
      }
    } catch (_) {
      state = const AuthUnauthenticated();
    }
  }

  /// Authenticate with email + password.
  Future<void> login(String email, String password) async {
    state = const AuthLoading();

    try {
      final user = await _authService.login(email, password);
      state = AuthAuthenticated(user);
    } catch (e) {
      state = AuthError(_friendlyError(e));
    }
  }

  /// Create a new account.
  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    state = const AuthLoading();

    try {
      final user = await _authService.register(
        name: name,
        email: email,
        password: password,
        role: role,
      );
      state = AuthAuthenticated(user);
    } catch (e) {
      state = AuthError(_friendlyError(e));
    }
  }

  /// Sign out, clearing all local tokens and server sessions.
  Future<void> logout() async {
    state = const AuthLoading();

    try {
      await _authService.logout();
    } catch (_) {
      // Best-effort; always clear local state.
    }

    state = const AuthUnauthenticated();
  }

  /// Request a password-reset email.
  Future<void> forgotPassword(String email) async {
    state = const AuthLoading();

    try {
      await _authService.forgotPassword(email);
      // Return to unauthenticated; the UI can show a success banner.
      state = const AuthUnauthenticated();
    } catch (e) {
      state = AuthError(_friendlyError(e));
    }
  }

  /// Reset the password using a one-time token from the email link.
  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    state = const AuthLoading();

    try {
      await _authService.resetPassword(token: token, password: password);
      state = const AuthUnauthenticated();
    } catch (e) {
      state = AuthError(_friendlyError(e));
    }
  }

  /// Force-transition to [AuthUnauthenticated] without calling the API.
  /// Used by the auth interceptor when a token refresh fails.
  void forceLogout() {
    state = const AuthUnauthenticated();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  String _friendlyError(Object error) {
    if (error is Exception) {
      // Attempt to extract a server message from Dio responses.
      final str = error.toString();
      // DioException payloads often embed the server message.
      final msgMatch = RegExp(r'"message"\s*:\s*"([^"]+)"').firstMatch(str);
      if (msgMatch != null) return msgMatch.group(1)!;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
