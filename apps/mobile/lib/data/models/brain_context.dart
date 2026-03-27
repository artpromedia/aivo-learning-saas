/// Brain context models representing learner cognitive profiles,
/// mastery levels, and IEP goals for the AIVO Learning mobile app.

import 'package:flutter/foundation.dart';

class BrainContext {
  final String brainStateId;
  final String learnerId;
  final String functioningLevel;
  final List<String> diagnoses;
  final Map<String, dynamic> accommodations;
  final Map<String, MasteryLevel> masteryLevels;
  final Map<String, dynamic> learningPreferences;
  final List<String> strengths;
  final List<String> challenges;
  final List<BrainGoal> currentGoals;
  final List<IepGoal> iepGoals;
  final double overallProgress;
  final DateTime lastUpdated;

  const BrainContext({
    required this.brainStateId,
    required this.learnerId,
    required this.functioningLevel,
    required this.diagnoses,
    required this.accommodations,
    required this.masteryLevels,
    required this.learningPreferences,
    required this.strengths,
    required this.challenges,
    required this.currentGoals,
    required this.iepGoals,
    required this.overallProgress,
    required this.lastUpdated,
  });

  BrainContext copyWith({
    String? brainStateId,
    String? learnerId,
    String? functioningLevel,
    List<String>? diagnoses,
    Map<String, dynamic>? accommodations,
    Map<String, MasteryLevel>? masteryLevels,
    Map<String, dynamic>? learningPreferences,
    List<String>? strengths,
    List<String>? challenges,
    List<BrainGoal>? currentGoals,
    List<IepGoal>? iepGoals,
    double? overallProgress,
    DateTime? lastUpdated,
  }) {
    return BrainContext(
      brainStateId: brainStateId ?? this.brainStateId,
      learnerId: learnerId ?? this.learnerId,
      functioningLevel: functioningLevel ?? this.functioningLevel,
      diagnoses: diagnoses ?? this.diagnoses,
      accommodations: accommodations ?? this.accommodations,
      masteryLevels: masteryLevels ?? this.masteryLevels,
      learningPreferences: learningPreferences ?? this.learningPreferences,
      strengths: strengths ?? this.strengths,
      challenges: challenges ?? this.challenges,
      currentGoals: currentGoals ?? this.currentGoals,
      iepGoals: iepGoals ?? this.iepGoals,
      overallProgress: overallProgress ?? this.overallProgress,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  factory BrainContext.fromJson(Map<String, dynamic> json) {
    return BrainContext(
      brainStateId: json['brainStateId'] as String,
      learnerId: json['learnerId'] as String,
      functioningLevel: json['functioningLevel'] as String,
      diagnoses: (json['diagnoses'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      accommodations: json['accommodations'] as Map<String, dynamic>,
      masteryLevels: (json['masteryLevels'] as Map<String, dynamic>).map(
        (key, value) =>
            MapEntry(key, MasteryLevel.fromJson(value as Map<String, dynamic>)),
      ),
      learningPreferences:
          json['learningPreferences'] as Map<String, dynamic>,
      strengths: (json['strengths'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      challenges: (json['challenges'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      currentGoals: (json['currentGoals'] as List<dynamic>)
          .map((e) => BrainGoal.fromJson(e as Map<String, dynamic>))
          .toList(),
      iepGoals: (json['iepGoals'] as List<dynamic>)
          .map((e) => IepGoal.fromJson(e as Map<String, dynamic>))
          .toList(),
      overallProgress: (json['overallProgress'] as num).toDouble(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'brainStateId': brainStateId,
      'learnerId': learnerId,
      'functioningLevel': functioningLevel,
      'diagnoses': diagnoses,
      'accommodations': accommodations,
      'masteryLevels':
          masteryLevels.map((key, value) => MapEntry(key, value.toJson())),
      'learningPreferences': learningPreferences,
      'strengths': strengths,
      'challenges': challenges,
      'currentGoals': currentGoals.map((e) => e.toJson()).toList(),
      'iepGoals': iepGoals.map((e) => e.toJson()).toList(),
      'overallProgress': overallProgress,
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BrainContext &&
        other.brainStateId == brainStateId &&
        other.learnerId == learnerId &&
        other.functioningLevel == functioningLevel &&
        listEquals(other.diagnoses, diagnoses) &&
        mapEquals(other.accommodations, accommodations) &&
        mapEquals(other.masteryLevels, masteryLevels) &&
        mapEquals(other.learningPreferences, learningPreferences) &&
        listEquals(other.strengths, strengths) &&
        listEquals(other.challenges, challenges) &&
        listEquals(other.currentGoals, currentGoals) &&
        listEquals(other.iepGoals, iepGoals) &&
        other.overallProgress == overallProgress &&
        other.lastUpdated == lastUpdated;
  }

  @override
  int get hashCode {
    return Object.hash(
      brainStateId,
      learnerId,
      functioningLevel,
      Object.hashAll(diagnoses),
      Object.hashAll(accommodations.entries),
      Object.hashAll(masteryLevels.entries),
      Object.hashAll(learningPreferences.entries),
      Object.hashAll(strengths),
      Object.hashAll(challenges),
      Object.hashAll(currentGoals),
      Object.hashAll(iepGoals),
      overallProgress,
      lastUpdated,
    );
  }

  @override
  String toString() {
    return 'BrainContext(brainStateId: $brainStateId, learnerId: $learnerId, '
        'functioningLevel: $functioningLevel, diagnoses: $diagnoses, '
        'overallProgress: $overallProgress, lastUpdated: $lastUpdated)';
  }
}

class MasteryLevel {
  final String skillId;
  final String subject;
  final double level;
  final int totalAttempts;
  final int correctAttempts;
  final DateTime? lastPracticedAt;
  final DateTime? nextReviewAt;

  const MasteryLevel({
    required this.skillId,
    required this.subject,
    required this.level,
    required this.totalAttempts,
    required this.correctAttempts,
    this.lastPracticedAt,
    this.nextReviewAt,
  });

  MasteryLevel copyWith({
    String? skillId,
    String? subject,
    double? level,
    int? totalAttempts,
    int? correctAttempts,
    DateTime? Function()? lastPracticedAt,
    DateTime? Function()? nextReviewAt,
  }) {
    return MasteryLevel(
      skillId: skillId ?? this.skillId,
      subject: subject ?? this.subject,
      level: level ?? this.level,
      totalAttempts: totalAttempts ?? this.totalAttempts,
      correctAttempts: correctAttempts ?? this.correctAttempts,
      lastPracticedAt:
          lastPracticedAt != null ? lastPracticedAt() : this.lastPracticedAt,
      nextReviewAt:
          nextReviewAt != null ? nextReviewAt() : this.nextReviewAt,
    );
  }

  factory MasteryLevel.fromJson(Map<String, dynamic> json) {
    return MasteryLevel(
      skillId: json['skillId'] as String,
      subject: json['subject'] as String,
      level: (json['level'] as num).toDouble(),
      totalAttempts: json['totalAttempts'] as int,
      correctAttempts: json['correctAttempts'] as int,
      lastPracticedAt: json['lastPracticedAt'] != null
          ? DateTime.parse(json['lastPracticedAt'] as String)
          : null,
      nextReviewAt: json['nextReviewAt'] != null
          ? DateTime.parse(json['nextReviewAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'skillId': skillId,
      'subject': subject,
      'level': level,
      'totalAttempts': totalAttempts,
      'correctAttempts': correctAttempts,
      'lastPracticedAt': lastPracticedAt?.toIso8601String(),
      'nextReviewAt': nextReviewAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MasteryLevel &&
        other.skillId == skillId &&
        other.subject == subject &&
        other.level == level &&
        other.totalAttempts == totalAttempts &&
        other.correctAttempts == correctAttempts &&
        other.lastPracticedAt == lastPracticedAt &&
        other.nextReviewAt == nextReviewAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      skillId,
      subject,
      level,
      totalAttempts,
      correctAttempts,
      lastPracticedAt,
      nextReviewAt,
    );
  }

  @override
  String toString() {
    return 'MasteryLevel(skillId: $skillId, subject: $subject, '
        'level: $level, totalAttempts: $totalAttempts, '
        'correctAttempts: $correctAttempts)';
  }
}

class BrainGoal {
  final String id;
  final String title;
  final String description;
  final double progress;
  final String status;

  const BrainGoal({
    required this.id,
    required this.title,
    required this.description,
    required this.progress,
    required this.status,
  });

  BrainGoal copyWith({
    String? id,
    String? title,
    String? description,
    double? progress,
    String? status,
  }) {
    return BrainGoal(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      progress: progress ?? this.progress,
      status: status ?? this.status,
    );
  }

  factory BrainGoal.fromJson(Map<String, dynamic> json) {
    return BrainGoal(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      progress: (json['progress'] as num).toDouble(),
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'progress': progress,
      'status': status,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BrainGoal &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.progress == progress &&
        other.status == status;
  }

  @override
  int get hashCode => Object.hash(id, title, description, progress, status);

  @override
  String toString() {
    return 'BrainGoal(id: $id, title: $title, progress: $progress, '
        'status: $status)';
  }
}

class IepGoal {
  final String id;
  final String goalText;
  final String area;
  final double progress;
  final String status;
  final DateTime? targetDate;

  const IepGoal({
    required this.id,
    required this.goalText,
    required this.area,
    required this.progress,
    required this.status,
    this.targetDate,
  });

  IepGoal copyWith({
    String? id,
    String? goalText,
    String? area,
    double? progress,
    String? status,
    DateTime? Function()? targetDate,
  }) {
    return IepGoal(
      id: id ?? this.id,
      goalText: goalText ?? this.goalText,
      area: area ?? this.area,
      progress: progress ?? this.progress,
      status: status ?? this.status,
      targetDate: targetDate != null ? targetDate() : this.targetDate,
    );
  }

  factory IepGoal.fromJson(Map<String, dynamic> json) {
    return IepGoal(
      id: json['id'] as String,
      goalText: json['goalText'] as String,
      area: json['area'] as String,
      progress: (json['progress'] as num).toDouble(),
      status: json['status'] as String,
      targetDate: json['targetDate'] != null
          ? DateTime.parse(json['targetDate'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'goalText': goalText,
      'area': area,
      'progress': progress,
      'status': status,
      'targetDate': targetDate?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is IepGoal &&
        other.id == id &&
        other.goalText == goalText &&
        other.area == area &&
        other.progress == progress &&
        other.status == status &&
        other.targetDate == targetDate;
  }

  @override
  int get hashCode {
    return Object.hash(id, goalText, area, progress, status, targetDate);
  }

  @override
  String toString() {
    return 'IepGoal(id: $id, goalText: $goalText, area: $area, '
        'progress: $progress, status: $status, targetDate: $targetDate)';
  }
}
