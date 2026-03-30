import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/auth/biometric_auth.dart';
import 'package:aivo_mobile/features/auth/widgets/oauth_button.dart';

/// Login screen with email/password, OAuth, and biometric authentication.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();

  bool _obscurePassword = true;
  bool _biometricAvailable = false;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final biometricService = ref.read(biometricAuthProvider);
    final isEnabled = await biometricService.isBiometricEnabled();
    final isAvailable = await biometricService.isAvailable();
    if (mounted) {
      setState(() {
        _biometricAvailable = isEnabled && isAvailable;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).login(
          _emailController.text.trim(),
          _passwordController.text,
        );
  }

  Future<void> _handleBiometricLogin() async {
    final biometricService = ref.read(biometricAuthProvider);
    final authenticated = await biometricService.authenticate(
      reason: 'Authenticate to sign in to AIVO Learning',
    );
    if (!authenticated || !mounted) return;

    // Biometric success means the user has a stored session -- trigger
    // a silent re-auth via checkAuth which reads the persisted token.
    await ref.read(authProvider.notifier).checkAuth();
  }

  Future<void> _handleOAuthLogin(String provider) async {
    // OAuth flow is handled natively; the auth service exposes a
    // callback endpoint. For now we trigger loading state and
    // delegate to the auth notifier once the native SDK returns.
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$provider sign-in initiated...')),
    );
  }

  void _navigateOnAuth(AuthState state) {
    if (state is AuthAuthenticated) {
      final role = state.user.role.toLowerCase();
      switch (role) {
        case 'learner':
          context.go('/learner/home');
        case 'parent':
          context.go('/onboarding/add-child');
        case 'teacher':
          context.go('/teacher/classroom');
        default:
          context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    ref.listen<AuthState>(authProvider, (previous, next) {
      _navigateOnAuth(next);
    });

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: _formKey,
                child: AutofillGroup(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // ---- Header ----
                      Semantics(
                        header: true,
                        child: Text(
                          'Welcome Back',
                          style: theme.textTheme.headlineLarge,
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Sign in to continue learning',
                        style: theme.textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // ---- Error banner ----
                      if (authState is AuthError) ...[
                        Semantics(
                          liveRegion: true,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: colorScheme.errorContainer,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.error_outline,
                                    color: colorScheme.onErrorContainer,
                                    size: 20,),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    authState.message,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: colorScheme.onErrorContainer,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // ---- Email field ----
                      Semantics(
                        label: 'Email address',
                        textField: true,
                        child: TextFormField(
                          controller: _emailController,
                          focusNode: _emailFocus,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          enabled: !isLoading,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            hintText: 'you@example.com',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Email is required';
                            }
                            final emailRegex = RegExp(
                                r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',);
                            if (!emailRegex.hasMatch(value.trim())) {
                              return 'Enter a valid email address';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            _passwordFocus.requestFocus();
                          },
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Password field ----
                      Semantics(
                        label: 'Password',
                        textField: true,
                        child: TextFormField(
                          controller: _passwordController,
                          focusNode: _passwordFocus,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.password],
                          enabled: !isLoading,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                              tooltip: _obscurePassword
                                  ? 'Show password'
                                  : 'Hide password',
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) => _handleLogin(),
                        ),
                      ),
                      const SizedBox(height: 8),

                      // ---- Forgot password ----
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed:
                              isLoading ? null : () => context.go('/forgot-password'),
                          child: const Text('Forgot password?'),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Login button ----
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleLogin,
                          child: isLoading
                              ? SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: colorScheme.onPrimary,
                                  ),
                                )
                              : const Text('Login'),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ---- Divider ----
                      Row(
                        children: [
                          const Expanded(child: Divider()),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'or continue with',
                              style: theme.textTheme.bodySmall,
                            ),
                          ),
                          const Expanded(child: Divider()),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // ---- OAuth buttons ----
                      Row(
                        children: [
                          Expanded(
                            child: OAuthButton(
                              providerName: 'Google',
                              icon: Icons.g_mobiledata,
                              onTap: isLoading
                                  ? null
                                  : () => _handleOAuthLogin('Google'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OAuthButton(
                              providerName: 'Apple',
                              icon: Icons.apple,
                              onTap: isLoading
                                  ? null
                                  : () => _handleOAuthLogin('Apple'),
                            ),
                          ),
                        ],
                      ),

                      // ---- Biometric ----
                      if (_biometricAvailable) ...[
                        const SizedBox(height: 24),
                        Center(
                          child: Semantics(
                            label: 'Sign in with biometrics',
                            button: true,
                            child: IconButton.filled(
                              onPressed:
                                  isLoading ? null : _handleBiometricLogin,
                              iconSize: 32,
                              style: IconButton.styleFrom(
                                backgroundColor:
                                    colorScheme.primaryContainer,
                                foregroundColor:
                                    colorScheme.onPrimaryContainer,
                                padding: const EdgeInsets.all(16),
                              ),
                              icon: const Icon(Icons.fingerprint),
                              tooltip: 'Sign in with biometrics',
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 32),

                      // ---- Create account ----
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              "Don't have an account?",
                              style: theme.textTheme.bodyMedium,
                            ),
                          ),
                          TextButton(
                            onPressed:
                                isLoading ? null : () => context.go('/register'),
                            child: const Text('Create account'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
