import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aivo_mobile/core/auth/auth_provider.dart';
import 'package:aivo_mobile/core/i18n/language_picker_field.dart';
import 'package:aivo_mobile/core/i18n/locale_provider.dart';
import 'package:aivo_mobile/core/i18n/t.dart';

/// Registration screen with name, email, password, role selection, and terms.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _nameFocus = FocusNode();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmPasswordFocus = FocusNode();

  String _selectedRole = 'parent';
  String? _selectedLanguage;
  bool _acceptedTerms = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameFocus.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _confirmPasswordFocus.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_acceptedTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(t('auth.acceptTermsRequired')),
        ),
      );
      return;
    }

    await ref.read(authProvider.notifier).register(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          role: _selectedRole,
          preferredLanguage: _selectedLanguage ?? 'en',
        );
  }

  void _navigateOnAuth(AuthState state) {
    if (state is AuthAuthenticated) {
      final role = state.user.role.toLowerCase();
      switch (role) {
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
      appBar: AppBar(
        title: Text(t('auth.createYourAccount')),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
          tooltip: t('auth.backToSignIn'),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
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
                          t('auth.createYourAccount'),
                          style: theme.textTheme.headlineMedium,
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        t('auth.registerSubtitle'),
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

                      // ---- Name field ----
                      Semantics(
                        label: t('auth.fullName'),
                        textField: true,
                        child: TextFormField(
                          controller: _nameController,
                          focusNode: _nameFocus,
                          textInputAction: TextInputAction.next,
                          textCapitalization: TextCapitalization.words,
                          autofillHints: const [AutofillHints.name],
                          enabled: !isLoading,
                          decoration: InputDecoration(
                            labelText: t('auth.fullName'),
                            hintText: t('auth.fullNamePlaceholder'),
                            prefixIcon: const Icon(Icons.person_outlined),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return t('auth.nameMinLength');
                            }
                            if (value.trim().length < 2) {
                              return t('auth.nameMinLength');
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) =>
                              _emailFocus.requestFocus(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Email field ----
                      Semantics(
                        label: t('auth.emailAddress'),
                        textField: true,
                        child: TextFormField(
                          controller: _emailController,
                          focusNode: _emailFocus,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          enabled: !isLoading,
                          decoration: InputDecoration(
                            labelText: t('auth.emailAddress'),
                            hintText: t('auth.emailPlaceholder'),
                            prefixIcon: const Icon(Icons.email_outlined),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return t('auth.emailInvalid');
                            }
                            final emailRegex = RegExp(
                                r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',);
                            if (!emailRegex.hasMatch(value.trim())) {
                              return t('auth.emailInvalid');
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) =>
                              _passwordFocus.requestFocus(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Password field ----
                      Semantics(
                        label: t('auth.password'),
                        textField: true,
                        child: TextFormField(
                          controller: _passwordController,
                          focusNode: _passwordFocus,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.newPassword],
                          enabled: !isLoading,
                          decoration: InputDecoration(
                            labelText: t('auth.password'),
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
                                  ? t('auth.showPassword')
                                  : t('auth.hidePassword'),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return t('auth.passwordRequired');
                            }
                            if (value.length < 8) {
                              return t('auth.passwordMinLength');
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) =>
                              _confirmPasswordFocus.requestFocus(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Confirm password field ----
                      Semantics(
                        label: t('auth.confirmPassword'),
                        textField: true,
                        child: TextFormField(
                          controller: _confirmPasswordController,
                          focusNode: _confirmPasswordFocus,
                          obscureText: _obscureConfirmPassword,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.newPassword],
                          enabled: !isLoading,
                          decoration: InputDecoration(
                            labelText: t('auth.confirmPassword'),
                            prefixIcon: const Icon(Icons.lock_outlined),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirmPassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscureConfirmPassword =
                                      !_obscureConfirmPassword;
                                });
                              },
                              tooltip: _obscureConfirmPassword
                                  ? t('auth.showPassword')
                                  : t('auth.hidePassword'),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return t('auth.confirmPassword');
                            }
                            if (value != _passwordController.text) {
                              return t('auth.passwordsMismatch');
                            }
                            return null;
                          },
                          onFieldSubmitted: (_) => _handleRegister(),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ---- Role selection ----
                      Semantics(
                        label: t('auth.selectRole'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              t('auth.selectRole'),
                              style: theme.textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            SegmentedButton<String>(
                              segments: [
                                ButtonSegment<String>(
                                  value: 'parent',
                                  label: Text(t('auth.roleParent')),
                                  icon: const Icon(Icons.family_restroom),
                                ),
                                ButtonSegment<String>(
                                  value: 'teacher',
                                  label: Text(t('auth.roleTeacher')),
                                  icon: const Icon(Icons.school_outlined),
                                ),
                              ],
                              selected: {_selectedRole},
                              onSelectionChanged: isLoading
                                  ? null
                                  : (selection) {
                                      setState(() {
                                        _selectedRole = selection.first;
                                      });
                                    },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ---- Language preference ----
                      Semantics(
                        label: t('auth.preferredLanguage'),
                        child: LanguagePickerField(
                          selectedLocaleCode: _selectedLanguage,
                          onChanged: (code) {
                            setState(() => _selectedLanguage = code);
                            ref.read(localeProvider.notifier).setLocale(code);
                          },
                          labelText: t('auth.preferredLanguage'),
                          enabled: !isLoading,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ---- Terms checkbox ----
                      Semantics(
                        label: t('auth.termsAgreement'),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              height: 24,
                              width: 24,
                              child: Checkbox(
                                value: _acceptedTerms,
                                onChanged: isLoading
                                    ? null
                                    : (value) {
                                        setState(() {
                                          _acceptedTerms = value ?? false;
                                        });
                                      },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: GestureDetector(
                                onTap: isLoading
                                    ? null
                                    : () {
                                        setState(() {
                                          _acceptedTerms = !_acceptedTerms;
                                        });
                                      },
                                child: Text.rich(
                                  TextSpan(
                                    text: t('auth.termsAgreement'),
                                    style: theme.textTheme.bodyMedium,
                                    children: [
                                      TextSpan(
                                        text: t('auth.termsOfService'),
                                        style: TextStyle(
                                          color: colorScheme.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const TextSpan(text: ' and '),
                                      TextSpan(
                                        text: t('auth.privacyPolicy'),
                                        style: TextStyle(
                                          color: colorScheme.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ---- Register button ----
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: isLoading ? null : _handleRegister,
                          child: isLoading
                              ? SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: colorScheme.onPrimary,
                                  ),
                                )
                              : Text(t('auth.createAccount')),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ---- Already have account ----
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              t('auth.alreadyHaveAccount'),
                              style: theme.textTheme.bodyMedium,
                            ),
                          ),
                          TextButton(
                            onPressed:
                                isLoading ? null : () => context.go('/login'),
                            child: Text(t('auth.signIn')),
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
