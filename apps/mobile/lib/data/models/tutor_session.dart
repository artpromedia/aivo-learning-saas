/// Tutor session models for AI tutor chat, quick replies,
/// and tutor catalog in the AIVO Learning mobile app.
library;

import 'package:flutter/foundation.dart';

class TutorSession {
  final String id;
  final String learnerId;
  final String tutorId;
  final String tutorName;
  final String tutorAvatar;
  final String subject;
  final String status;
  final List<ChatMessage> messages;
  final DateTime startedAt;
  final DateTime? endedAt;

  const TutorSession({
    required this.id,
    required this.learnerId,
    required this.tutorId,
    required this.tutorName,
    required this.tutorAvatar,
    required this.subject,
    required this.status,
    required this.messages,
    required this.startedAt,
    this.endedAt,
  });

  TutorSession copyWith({
    String? id,
    String? learnerId,
    String? tutorId,
    String? tutorName,
    String? tutorAvatar,
    String? subject,
    String? status,
    List<ChatMessage>? messages,
    DateTime? startedAt,
    DateTime? Function()? endedAt,
  }) {
    return TutorSession(
      id: id ?? this.id,
      learnerId: learnerId ?? this.learnerId,
      tutorId: tutorId ?? this.tutorId,
      tutorName: tutorName ?? this.tutorName,
      tutorAvatar: tutorAvatar ?? this.tutorAvatar,
      subject: subject ?? this.subject,
      status: status ?? this.status,
      messages: messages ?? this.messages,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt != null ? endedAt() : this.endedAt,
    );
  }

  factory TutorSession.fromJson(Map<String, dynamic> json) {
    return TutorSession(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      tutorId: json['tutorId'] as String,
      tutorName: json['tutorName'] as String,
      tutorAvatar: json['tutorAvatar'] as String,
      subject: json['subject'] as String,
      status: json['status'] as String,
      messages: (json['messages'] as List<dynamic>)
          .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
      startedAt: DateTime.parse(json['startedAt'] as String),
      endedAt: json['endedAt'] != null
          ? DateTime.parse(json['endedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'learnerId': learnerId,
      'tutorId': tutorId,
      'tutorName': tutorName,
      'tutorAvatar': tutorAvatar,
      'subject': subject,
      'status': status,
      'messages': messages.map((e) => e.toJson()).toList(),
      'startedAt': startedAt.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TutorSession &&
        other.id == id &&
        other.learnerId == learnerId &&
        other.tutorId == tutorId &&
        other.tutorName == tutorName &&
        other.tutorAvatar == tutorAvatar &&
        other.subject == subject &&
        other.status == status &&
        listEquals(other.messages, messages) &&
        other.startedAt == startedAt &&
        other.endedAt == endedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      learnerId,
      tutorId,
      tutorName,
      tutorAvatar,
      subject,
      status,
      Object.hashAll(messages),
      startedAt,
      endedAt,
    );
  }

  @override
  String toString() {
    return 'TutorSession(id: $id, learnerId: $learnerId, '
        'tutorId: $tutorId, tutorName: $tutorName, subject: $subject, '
        'status: $status, messages: ${messages.length})';
  }
}

class ChatMessage {
  final String id;
  final String role;
  final String content;
  final String? imageUrl;
  final List<QuickReply>? quickReplies;
  final DateTime timestamp;
  final bool isStreaming;

  const ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.imageUrl,
    this.quickReplies,
    required this.timestamp,
    required this.isStreaming,
  });

  ChatMessage copyWith({
    String? id,
    String? role,
    String? content,
    String? Function()? imageUrl,
    List<QuickReply>? Function()? quickReplies,
    DateTime? timestamp,
    bool? isStreaming,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      role: role ?? this.role,
      content: content ?? this.content,
      imageUrl: imageUrl != null ? imageUrl() : this.imageUrl,
      quickReplies:
          quickReplies != null ? quickReplies() : this.quickReplies,
      timestamp: timestamp ?? this.timestamp,
      isStreaming: isStreaming ?? this.isStreaming,
    );
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String?,
      quickReplies: json['quickReplies'] != null
          ? (json['quickReplies'] as List<dynamic>)
              .map((e) => QuickReply.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isStreaming: json['isStreaming'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'content': content,
      'imageUrl': imageUrl,
      'quickReplies': quickReplies?.map((e) => e.toJson()).toList(),
      'timestamp': timestamp.toIso8601String(),
      'isStreaming': isStreaming,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChatMessage &&
        other.id == id &&
        other.role == role &&
        other.content == content &&
        other.imageUrl == imageUrl &&
        listEquals(other.quickReplies, quickReplies) &&
        other.timestamp == timestamp &&
        other.isStreaming == isStreaming;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      role,
      content,
      imageUrl,
      quickReplies != null ? Object.hashAll(quickReplies!) : null,
      timestamp,
      isStreaming,
    );
  }

  @override
  String toString() {
    return 'ChatMessage(id: $id, role: $role, '
        'content: ${content.length > 50 ? '${content.substring(0, 50)}...' : content}, '
        'isStreaming: $isStreaming)';
  }
}

class QuickReply {
  final String label;
  final String? imageUrl;
  final String value;

  const QuickReply({
    required this.label,
    this.imageUrl,
    required this.value,
  });

  QuickReply copyWith({
    String? label,
    String? Function()? imageUrl,
    String? value,
  }) {
    return QuickReply(
      label: label ?? this.label,
      imageUrl: imageUrl != null ? imageUrl() : this.imageUrl,
      value: value ?? this.value,
    );
  }

  factory QuickReply.fromJson(Map<String, dynamic> json) {
    return QuickReply(
      label: json['label'] as String,
      imageUrl: json['imageUrl'] as String?,
      value: json['value'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'imageUrl': imageUrl,
      'value': value,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuickReply &&
        other.label == label &&
        other.imageUrl == imageUrl &&
        other.value == value;
  }

  @override
  int get hashCode => Object.hash(label, imageUrl, value);

  @override
  String toString() {
    return 'QuickReply(label: $label, value: $value)';
  }
}

class TutorCatalogItem {
  final String id;
  final String name;
  final String avatar;
  final String description;
  final String subject;
  final String personality;
  final bool isSubscribed;
  final double monthlyPrice;

  const TutorCatalogItem({
    required this.id,
    required this.name,
    required this.avatar,
    required this.description,
    required this.subject,
    required this.personality,
    required this.isSubscribed,
    required this.monthlyPrice,
  });

  TutorCatalogItem copyWith({
    String? id,
    String? name,
    String? avatar,
    String? description,
    String? subject,
    String? personality,
    bool? isSubscribed,
    double? monthlyPrice,
  }) {
    return TutorCatalogItem(
      id: id ?? this.id,
      name: name ?? this.name,
      avatar: avatar ?? this.avatar,
      description: description ?? this.description,
      subject: subject ?? this.subject,
      personality: personality ?? this.personality,
      isSubscribed: isSubscribed ?? this.isSubscribed,
      monthlyPrice: monthlyPrice ?? this.monthlyPrice,
    );
  }

  factory TutorCatalogItem.fromJson(Map<String, dynamic> json) {
    return TutorCatalogItem(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String,
      description: json['description'] as String,
      subject: json['subject'] as String,
      personality: json['personality'] as String,
      isSubscribed: json['isSubscribed'] as bool,
      monthlyPrice: (json['monthlyPrice'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'avatar': avatar,
      'description': description,
      'subject': subject,
      'personality': personality,
      'isSubscribed': isSubscribed,
      'monthlyPrice': monthlyPrice,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TutorCatalogItem &&
        other.id == id &&
        other.name == name &&
        other.avatar == avatar &&
        other.description == description &&
        other.subject == subject &&
        other.personality == personality &&
        other.isSubscribed == isSubscribed &&
        other.monthlyPrice == monthlyPrice;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      avatar,
      description,
      subject,
      personality,
      isSubscribed,
      monthlyPrice,
    );
  }

  @override
  String toString() {
    return 'TutorCatalogItem(id: $id, name: $name, subject: $subject, '
        'isSubscribed: $isSubscribed, monthlyPrice: $monthlyPrice)';
  }
}
