/// Learning session models for tracking lesson progress, interactions,
/// and learning path items in the AIVO Learning mobile app.

import 'package:flutter/foundation.dart';

class LearningSession {
  final String id;
  final String learnerId;
  final String lessonId;
  final String subject;
  final String topic;
  final String skillId;
  final String status;
  final Map<String, dynamic> content;
  final List<Interaction> interactions;
  final double? score;
  final int timeSpentSeconds;
  final DateTime startedAt;
  final DateTime? completedAt;

  const LearningSession({
    required this.id,
    required this.learnerId,
    required this.lessonId,
    required this.subject,
    required this.topic,
    required this.skillId,
    required this.status,
    required this.content,
    required this.interactions,
    this.score,
    required this.timeSpentSeconds,
    required this.startedAt,
    this.completedAt,
  });

  LearningSession copyWith({
    String? id,
    String? learnerId,
    String? lessonId,
    String? subject,
    String? topic,
    String? skillId,
    String? status,
    Map<String, dynamic>? content,
    List<Interaction>? interactions,
    double? Function()? score,
    int? timeSpentSeconds,
    DateTime? startedAt,
    DateTime? Function()? completedAt,
  }) {
    return LearningSession(
      id: id ?? this.id,
      learnerId: learnerId ?? this.learnerId,
      lessonId: lessonId ?? this.lessonId,
      subject: subject ?? this.subject,
      topic: topic ?? this.topic,
      skillId: skillId ?? this.skillId,
      status: status ?? this.status,
      content: content ?? this.content,
      interactions: interactions ?? this.interactions,
      score: score != null ? score() : this.score,
      timeSpentSeconds: timeSpentSeconds ?? this.timeSpentSeconds,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt != null ? completedAt() : this.completedAt,
    );
  }

  factory LearningSession.fromJson(Map<String, dynamic> json) {
    return LearningSession(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      lessonId: json['lessonId'] as String,
      subject: json['subject'] as String,
      topic: json['topic'] as String,
      skillId: json['skillId'] as String,
      status: json['status'] as String,
      content: json['content'] as Map<String, dynamic>,
      interactions: (json['interactions'] as List<dynamic>)
          .map((e) => Interaction.fromJson(e as Map<String, dynamic>))
          .toList(),
      score: json['score'] != null ? (json['score'] as num).toDouble() : null,
      timeSpentSeconds: json['timeSpentSeconds'] as int,
      startedAt: DateTime.parse(json['startedAt'] as String),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'learnerId': learnerId,
      'lessonId': lessonId,
      'subject': subject,
      'topic': topic,
      'skillId': skillId,
      'status': status,
      'content': content,
      'interactions': interactions.map((e) => e.toJson()).toList(),
      'score': score,
      'timeSpentSeconds': timeSpentSeconds,
      'startedAt': startedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LearningSession &&
        other.id == id &&
        other.learnerId == learnerId &&
        other.lessonId == lessonId &&
        other.subject == subject &&
        other.topic == topic &&
        other.skillId == skillId &&
        other.status == status &&
        mapEquals(other.content, content) &&
        listEquals(other.interactions, interactions) &&
        other.score == score &&
        other.timeSpentSeconds == timeSpentSeconds &&
        other.startedAt == startedAt &&
        other.completedAt == completedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      learnerId,
      lessonId,
      subject,
      topic,
      skillId,
      status,
      Object.hashAll(content.entries),
      Object.hashAll(interactions),
      score,
      timeSpentSeconds,
      startedAt,
      completedAt,
    );
  }

  @override
  String toString() {
    return 'LearningSession(id: $id, learnerId: $learnerId, '
        'lessonId: $lessonId, subject: $subject, topic: $topic, '
        'status: $status, score: $score, '
        'timeSpentSeconds: $timeSpentSeconds)';
  }
}

class Interaction {
  final String id;
  final String type;
  final String prompt;
  final Map<String, dynamic> data;
  final String? studentResponse;
  final bool? isCorrect;
  final String? feedback;
  final DateTime? respondedAt;

  const Interaction({
    required this.id,
    required this.type,
    required this.prompt,
    required this.data,
    this.studentResponse,
    this.isCorrect,
    this.feedback,
    this.respondedAt,
  });

  Interaction copyWith({
    String? id,
    String? type,
    String? prompt,
    Map<String, dynamic>? data,
    String? Function()? studentResponse,
    bool? Function()? isCorrect,
    String? Function()? feedback,
    DateTime? Function()? respondedAt,
  }) {
    return Interaction(
      id: id ?? this.id,
      type: type ?? this.type,
      prompt: prompt ?? this.prompt,
      data: data ?? this.data,
      studentResponse:
          studentResponse != null ? studentResponse() : this.studentResponse,
      isCorrect: isCorrect != null ? isCorrect() : this.isCorrect,
      feedback: feedback != null ? feedback() : this.feedback,
      respondedAt: respondedAt != null ? respondedAt() : this.respondedAt,
    );
  }

  factory Interaction.fromJson(Map<String, dynamic> json) {
    return Interaction(
      id: json['id'] as String,
      type: json['type'] as String,
      prompt: json['prompt'] as String,
      data: json['data'] as Map<String, dynamic>,
      studentResponse: json['studentResponse'] as String?,
      isCorrect: json['isCorrect'] as bool?,
      feedback: json['feedback'] as String?,
      respondedAt: json['respondedAt'] != null
          ? DateTime.parse(json['respondedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'prompt': prompt,
      'data': data,
      'studentResponse': studentResponse,
      'isCorrect': isCorrect,
      'feedback': feedback,
      'respondedAt': respondedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Interaction &&
        other.id == id &&
        other.type == type &&
        other.prompt == prompt &&
        mapEquals(other.data, data) &&
        other.studentResponse == studentResponse &&
        other.isCorrect == isCorrect &&
        other.feedback == feedback &&
        other.respondedAt == respondedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      type,
      prompt,
      Object.hashAll(data.entries),
      studentResponse,
      isCorrect,
      feedback,
      respondedAt,
    );
  }

  @override
  String toString() {
    return 'Interaction(id: $id, type: $type, prompt: $prompt, '
        'isCorrect: $isCorrect)';
  }
}

class LearningPath {
  final List<LearningPathItem> items;
  final int completedToday;
  final int targetToday;

  const LearningPath({
    required this.items,
    required this.completedToday,
    required this.targetToday,
  });

  LearningPath copyWith({
    List<LearningPathItem>? items,
    int? completedToday,
    int? targetToday,
  }) {
    return LearningPath(
      items: items ?? this.items,
      completedToday: completedToday ?? this.completedToday,
      targetToday: targetToday ?? this.targetToday,
    );
  }

  factory LearningPath.fromJson(Map<String, dynamic> json) {
    return LearningPath(
      items: (json['items'] as List<dynamic>)
          .map((e) => LearningPathItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      completedToday: json['completedToday'] as int,
      targetToday: json['targetToday'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'items': items.map((e) => e.toJson()).toList(),
      'completedToday': completedToday,
      'targetToday': targetToday,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LearningPath &&
        listEquals(other.items, items) &&
        other.completedToday == completedToday &&
        other.targetToday == targetToday;
  }

  @override
  int get hashCode {
    return Object.hash(
      Object.hashAll(items),
      completedToday,
      targetToday,
    );
  }

  @override
  String toString() {
    return 'LearningPath(items: ${items.length}, '
        'completedToday: $completedToday, targetToday: $targetToday)';
  }
}

class LearningPathItem {
  final String lessonId;
  final String subject;
  final String topic;
  final String skillId;
  final String type;
  final double? currentMastery;
  final bool isCompleted;
  final int orderIndex;

  const LearningPathItem({
    required this.lessonId,
    required this.subject,
    required this.topic,
    required this.skillId,
    required this.type,
    this.currentMastery,
    required this.isCompleted,
    required this.orderIndex,
  });

  LearningPathItem copyWith({
    String? lessonId,
    String? subject,
    String? topic,
    String? skillId,
    String? type,
    double? Function()? currentMastery,
    bool? isCompleted,
    int? orderIndex,
  }) {
    return LearningPathItem(
      lessonId: lessonId ?? this.lessonId,
      subject: subject ?? this.subject,
      topic: topic ?? this.topic,
      skillId: skillId ?? this.skillId,
      type: type ?? this.type,
      currentMastery:
          currentMastery != null ? currentMastery() : this.currentMastery,
      isCompleted: isCompleted ?? this.isCompleted,
      orderIndex: orderIndex ?? this.orderIndex,
    );
  }

  factory LearningPathItem.fromJson(Map<String, dynamic> json) {
    return LearningPathItem(
      lessonId: json['lessonId'] as String,
      subject: json['subject'] as String,
      topic: json['topic'] as String,
      skillId: json['skillId'] as String,
      type: json['type'] as String,
      currentMastery: json['currentMastery'] != null
          ? (json['currentMastery'] as num).toDouble()
          : null,
      isCompleted: json['isCompleted'] as bool,
      orderIndex: json['orderIndex'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lessonId': lessonId,
      'subject': subject,
      'topic': topic,
      'skillId': skillId,
      'type': type,
      'currentMastery': currentMastery,
      'isCompleted': isCompleted,
      'orderIndex': orderIndex,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LearningPathItem &&
        other.lessonId == lessonId &&
        other.subject == subject &&
        other.topic == topic &&
        other.skillId == skillId &&
        other.type == type &&
        other.currentMastery == currentMastery &&
        other.isCompleted == isCompleted &&
        other.orderIndex == orderIndex;
  }

  @override
  int get hashCode {
    return Object.hash(
      lessonId,
      subject,
      topic,
      skillId,
      type,
      currentMastery,
      isCompleted,
      orderIndex,
    );
  }

  @override
  String toString() {
    return 'LearningPathItem(lessonId: $lessonId, subject: $subject, '
        'topic: $topic, type: $type, isCompleted: $isCompleted, '
        'orderIndex: $orderIndex)';
  }
}
