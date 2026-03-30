import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';

/// Forgot-password screen that sends a password-reset email.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _emailFocus = FocusNode();

  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    _emailFocus.dispose();
    super.dispose();
  }

  Future<void> _handleSendResetLink() async {
    if (!_formKey.currentState!.validate()) return;

    await ref
        .read(authProvider.notifier)
        .forgotPassword(_emailController.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Listen for state transitions to detect success.
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (previous is AuthLoading && next is AuthUnauthenticated) {
        // forgotPassword completed successfully -- the notifier transitions
        // back to AuthUnauthenticated on success.
        setState(() {
          _emailSent = true;
        });
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Forgot Password'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
          tooltip: 'Back to login',
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: _emailSent
                  ? _buildSuccessView(theme, colorScheme)
                  : _buildFormView(theme, colorScheme, isLoading, authState),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessView(ThemeData theme, ColorScheme colorScheme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: colorScheme.secondaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.mark_email_read_outlined,
            size: 48,
            color: colorScheme.onSecondaryContainer,
          ),
        ),
        const SizedBox(height: 24),
        Semantics(
          liveRegion: true,
          child: Text(
            'Check your email',
            style: theme.textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'We sent a password reset link to\n${_emailController.text.trim()}',
          style: theme.textTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          "If you don't see it, check your spam folder.",
          style: theme.textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        SizedBox(
          height: 48,
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => context.go('/login'),
            child: const Text('Back to Login'),
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () {
            setState(() {
              _emailSent = false;
            });
          },
          child: const Text('Resend email'),
        ),
      ],
    );
  }

  Widget _buildFormView(
    ThemeData theme,
    ColorScheme colorScheme,
    bool isLoading,
    AuthState authState,
  ) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ---- Header icon ----
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: colorScheme.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.lock_reset,
              size: 48,
              color: colorScheme.onPrimaryContainer,
            ),
          ),
          const SizedBox(height: 24),

          Semantics(
            header: true,
            child: Text(
              'Reset your password',
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Enter the email address associated with your account '
            'and we will send you a link to reset your password.',
            style: theme.textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

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
                        color: colorScheme.onErrorContainer, size: 20,),
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
              textInputAction: TextInputAction.done,
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
              onFieldSubmitted: (_) => _handleSendResetLink(),
            ),
          ),
          const SizedBox(height: 24),

          // ---- Send reset link button ----
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: isLoading ? null : _handleSendResetLink,
              child: isLoading
                  ? SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: colorScheme.onPrimary,
                      ),
                    )
                  : const Text('Send Reset Link'),
            ),
          ),
          const SizedBox(height: 24),

          // ---- Back to login ----
          Center(
            child: TextButton(
              onPressed: isLoading ? null : () => context.go('/login'),
              child: const Text('Back to Login'),
            ),
          ),
        ],
      ),
    );
  }
}
