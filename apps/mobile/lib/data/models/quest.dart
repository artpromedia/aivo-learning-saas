/// Quest world models for gamified learning journeys including worlds,
/// chapters, stages, and progress tracking in the AIVO Learning mobile app.
library;

import 'package:flutter/foundation.dart';

class QuestWorld {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String subject;
  final List<QuestChapter> chapters;
  final double progress;
  final bool isUnlocked;

  const QuestWorld({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.subject,
    required this.chapters,
    required this.progress,
    required this.isUnlocked,
  });

  QuestWorld copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    String? subject,
    List<QuestChapter>? chapters,
    double? progress,
    bool? isUnlocked,
  }) {
    return QuestWorld(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      subject: subject ?? this.subject,
      chapters: chapters ?? this.chapters,
      progress: progress ?? this.progress,
      isUnlocked: isUnlocked ?? this.isUnlocked,
    );
  }

  factory QuestWorld.fromJson(Map<String, dynamic> json) {
    return QuestWorld(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      subject: json['subject'] as String,
      chapters: (json['chapters'] as List<dynamic>)
          .map((e) => QuestChapter.fromJson(e as Map<String, dynamic>))
          .toList(),
      progress: (json['progress'] as num).toDouble(),
      isUnlocked: json['isUnlocked'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'subject': subject,
      'chapters': chapters.map((e) => e.toJson()).toList(),
      'progress': progress,
      'isUnlocked': isUnlocked,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuestWorld &&
        other.id == id &&
        other.name == name &&
        other.description == description &&
        other.imageUrl == imageUrl &&
        other.subject == subject &&
        listEquals(other.chapters, chapters) &&
        other.progress == progress &&
        other.isUnlocked == isUnlocked;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      description,
      imageUrl,
      subject,
      Object.hashAll(chapters),
      progress,
      isUnlocked,
    );
  }

  @override
  String toString() {
    return 'QuestWorld(id: $id, name: $name, subject: $subject, '
        'progress: $progress, isUnlocked: $isUnlocked, '
        'chapters: ${chapters.length})';
  }
}

class QuestChapter {
  final String id;
  final String worldId;
  final String title;
  final String description;
  final int orderIndex;
  final String status;
  final List<QuestStage> stages;
  final bool isBoss;

  const QuestChapter({
    required this.id,
    required this.worldId,
    required this.title,
    required this.description,
    required this.orderIndex,
    required this.status,
    required this.stages,
    required this.isBoss,
  });

  QuestChapter copyWith({
    String? id,
    String? worldId,
    String? title,
    String? description,
    int? orderIndex,
    String? status,
    List<QuestStage>? stages,
    bool? isBoss,
  }) {
    return QuestChapter(
      id: id ?? this.id,
      worldId: worldId ?? this.worldId,
      title: title ?? this.title,
      description: description ?? this.description,
      orderIndex: orderIndex ?? this.orderIndex,
      status: status ?? this.status,
      stages: stages ?? this.stages,
      isBoss: isBoss ?? this.isBoss,
    );
  }

  factory QuestChapter.fromJson(Map<String, dynamic> json) {
    return QuestChapter(
      id: json['id'] as String,
      worldId: json['worldId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      orderIndex: json['orderIndex'] as int,
      status: json['status'] as String,
      stages: (json['stages'] as List<dynamic>)
          .map((e) => QuestStage.fromJson(e as Map<String, dynamic>))
          .toList(),
      isBoss: json['isBoss'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'worldId': worldId,
      'title': title,
      'description': description,
      'orderIndex': orderIndex,
      'status': status,
      'stages': stages.map((e) => e.toJson()).toList(),
      'isBoss': isBoss,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuestChapter &&
        other.id == id &&
        other.worldId == worldId &&
        other.title == title &&
        other.description == description &&
        other.orderIndex == orderIndex &&
        other.status == status &&
        listEquals(other.stages, stages) &&
        other.isBoss == isBoss;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      worldId,
      title,
      description,
      orderIndex,
      status,
      Object.hashAll(stages),
      isBoss,
    );
  }

  @override
  String toString() {
    return 'QuestChapter(id: $id, worldId: $worldId, title: $title, '
        'orderIndex: $orderIndex, status: $status, isBoss: $isBoss, '
        'stages: ${stages.length})';
  }
}

class QuestStage {
  final String id;
  final String type;
  final String title;
  final bool isCompleted;
  final int xpReward;

  const QuestStage({
    required this.id,
    required this.type,
    required this.title,
    required this.isCompleted,
    required this.xpReward,
  });

  QuestStage copyWith({
    String? id,
    String? type,
    String? title,
    bool? isCompleted,
    int? xpReward,
  }) {
    return QuestStage(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      isCompleted: isCompleted ?? this.isCompleted,
      xpReward: xpReward ?? this.xpReward,
    );
  }

  factory QuestStage.fromJson(Map<String, dynamic> json) {
    return QuestStage(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      isCompleted: json['isCompleted'] as bool,
      xpReward: json['xpReward'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'isCompleted': isCompleted,
      'xpReward': xpReward,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuestStage &&
        other.id == id &&
        other.type == type &&
        other.title == title &&
        other.isCompleted == isCompleted &&
        other.xpReward == xpReward;
  }

  @override
  int get hashCode => Object.hash(id, type, title, isCompleted, xpReward);

  @override
  String toString() {
    return 'QuestStage(id: $id, type: $type, title: $title, '
        'isCompleted: $isCompleted, xpReward: $xpReward)';
  }
}

class QuestProgress {
  final int worldsCompleted;
  final int totalWorlds;
  final int chaptersCompleted;
  final int totalChapters;
  final int totalXpEarned;
  final String currentWorldId;
  final String currentChapterId;

  const QuestProgress({
    required this.worldsCompleted,
    required this.totalWorlds,
    required this.chaptersCompleted,
    required this.totalChapters,
    required this.totalXpEarned,
    required this.currentWorldId,
    required this.currentChapterId,
  });

  QuestProgress copyWith({
    int? worldsCompleted,
    int? totalWorlds,
    int? chaptersCompleted,
    int? totalChapters,
    int? totalXpEarned,
    String? currentWorldId,
    String? currentChapterId,
  }) {
    return QuestProgress(
      worldsCompleted: worldsCompleted ?? this.worldsCompleted,
      totalWorlds: totalWorlds ?? this.totalWorlds,
      chaptersCompleted: chaptersCompleted ?? this.chaptersCompleted,
      totalChapters: totalChapters ?? this.totalChapters,
      totalXpEarned: totalXpEarned ?? this.totalXpEarned,
      currentWorldId: currentWorldId ?? this.currentWorldId,
      currentChapterId: currentChapterId ?? this.currentChapterId,
    );
  }

  factory QuestProgress.fromJson(Map<String, dynamic> json) {
    return QuestProgress(
      worldsCompleted: json['worldsCompleted'] as int,
      totalWorlds: json['totalWorlds'] as int,
      chaptersCompleted: json['chaptersCompleted'] as int,
      totalChapters: json['totalChapters'] as int,
      totalXpEarned: json['totalXpEarned'] as int,
      currentWorldId: json['currentWorldId'] as String,
      currentChapterId: json['currentChapterId'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'worldsCompleted': worldsCompleted,
      'totalWorlds': totalWorlds,
      'chaptersCompleted': chaptersCompleted,
      'totalChapters': totalChapters,
      'totalXpEarned': totalXpEarned,
      'currentWorldId': currentWorldId,
      'currentChapterId': currentChapterId,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is QuestProgress &&
        other.worldsCompleted == worldsCompleted &&
        other.totalWorlds == totalWorlds &&
        other.chaptersCompleted == chaptersCompleted &&
        other.totalChapters == totalChapters &&
        other.totalXpEarned == totalXpEarned &&
        other.currentWorldId == currentWorldId &&
        other.currentChapterId == currentChapterId;
  }

  @override
  int get hashCode {
    return Object.hash(
      worldsCompleted,
      totalWorlds,
      chaptersCompleted,
      totalChapters,
      totalXpEarned,
      currentWorldId,
      currentChapterId,
    );
  }

  @override
  String toString() {
    return 'QuestProgress(worldsCompleted: $worldsCompleted/$totalWorlds, '
        'chaptersCompleted: $chaptersCompleted/$totalChapters, '
        'totalXpEarned: $totalXpEarned)';
  }
}
