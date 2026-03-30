/// User and authentication token models for the AIVO Learning mobile app.
library;

class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? tenantId;
  final String? avatarUrl;
  final bool emailVerified;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.tenantId,
    this.avatarUrl,
    required this.emailVerified,
    required this.createdAt,
  });

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? role,
    String? Function()? tenantId,
    String? Function()? avatarUrl,
    bool? emailVerified,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      tenantId: tenantId != null ? tenantId() : this.tenantId,
      avatarUrl: avatarUrl != null ? avatarUrl() : this.avatarUrl,
      emailVerified: emailVerified ?? this.emailVerified,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: json['role'] as String,
      tenantId: json['tenantId'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      emailVerified: json['emailVerified'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'tenantId': tenantId,
      'avatarUrl': avatarUrl,
      'emailVerified': emailVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User &&
        other.id == id &&
        other.email == email &&
        other.name == name &&
        other.role == role &&
        other.tenantId == tenantId &&
        other.avatarUrl == avatarUrl &&
        other.emailVerified == emailVerified &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      email,
      name,
      role,
      tenantId,
      avatarUrl,
      emailVerified,
      createdAt,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, email: $email, name: $name, role: $role, '
        'tenantId: $tenantId, avatarUrl: $avatarUrl, '
        'emailVerified: $emailVerified, createdAt: $createdAt)';
  }
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;

  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
  });

  AuthTokens copyWith({
    String? accessToken,
    String? refreshToken,
  }) {
    return AuthTokens(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthTokens &&
        other.accessToken == accessToken &&
        other.refreshToken == refreshToken;
  }

  @override
  int get hashCode => Object.hash(accessToken, refreshToken);

  @override
  String toString() {
    return 'AuthTokens(accessToken: ${accessToken.substring(0, 8)}..., '
        'refreshToken: ${refreshToken.substring(0, 8)}...)';
  }
}
