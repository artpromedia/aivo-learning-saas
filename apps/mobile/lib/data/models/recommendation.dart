/// Recommendation model for AI-generated accommodation, curriculum,
/// goal, and tutor suggestions in the AIVO Learning mobile app.

import 'package:flutter/foundation.dart';

class Recommendation {
  final String id;
  final String learnerId;
  final String type;
  final String title;
  final String description;
  final String rationale;
  final String status;
  final String? parentResponse;
  final Map<String, dynamic>? adjustments;
  final DateTime createdAt;
  final DateTime? respondedAt;

  const Recommendation({
    required this.id,
    required this.learnerId,
    required this.type,
    required this.title,
    required this.description,
    required this.rationale,
    required this.status,
    this.parentResponse,
    this.adjustments,
    required this.createdAt,
    this.respondedAt,
  });

  Recommendation copyWith({
    String? id,
    String? learnerId,
    String? type,
    String? title,
    String? description,
    String? rationale,
    String? status,
    String? Function()? parentResponse,
    Map<String, dynamic>? Function()? adjustments,
    DateTime? createdAt,
    DateTime? Function()? respondedAt,
  }) {
    return Recommendation(
      id: id ?? this.id,
      learnerId: learnerId ?? this.learnerId,
      type: type ?? this.type,
      title: title ?? this.title,
      description: description ?? this.description,
      rationale: rationale ?? this.rationale,
      status: status ?? this.status,
      parentResponse:
          parentResponse != null ? parentResponse() : this.parentResponse,
      adjustments: adjustments != null ? adjustments() : this.adjustments,
      createdAt: createdAt ?? this.createdAt,
      respondedAt: respondedAt != null ? respondedAt() : this.respondedAt,
    );
  }

  factory Recommendation.fromJson(Map<String, dynamic> json) {
    return Recommendation(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      rationale: json['rationale'] as String,
      status: json['status'] as String,
      parentResponse: json['parentResponse'] as String?,
      adjustments: json['adjustments'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      respondedAt: json['respondedAt'] != null
          ? DateTime.parse(json['respondedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'learnerId': learnerId,
      'type': type,
      'title': title,
      'description': description,
      'rationale': rationale,
      'status': status,
      'parentResponse': parentResponse,
      'adjustments': adjustments,
      'createdAt': createdAt.toIso8601String(),
      'respondedAt': respondedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Recommendation &&
        other.id == id &&
        other.learnerId == learnerId &&
        other.type == type &&
        other.title == title &&
        other.description == description &&
        other.rationale == rationale &&
        other.status == status &&
        other.parentResponse == parentResponse &&
        mapEquals(other.adjustments, adjustments) &&
        other.createdAt == createdAt &&
        other.respondedAt == respondedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      learnerId,
      type,
      title,
      description,
      rationale,
      status,
      parentResponse,
      adjustments != null ? Object.hashAll(adjustments!.entries) : null,
      createdAt,
      respondedAt,
    );
  }

  @override
  String toString() {
    return 'Recommendation(id: $id, learnerId: $learnerId, type: $type, '
        'title: $title, status: $status, createdAt: $createdAt)';
  }
}
