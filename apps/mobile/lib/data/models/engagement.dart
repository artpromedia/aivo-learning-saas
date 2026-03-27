/// Engagement and gamification models including XP, badges, shop items,
/// avatar configuration, leaderboards, and challenges for the AIVO Learning
/// mobile app.

import 'package:flutter/foundation.dart';

class EngagementSummary {
  final int totalXp;
  final int currentLevel;
  final int xpToNextLevel;
  final int xpProgress;
  final int currentStreak;
  final int longestStreak;
  final int aivoCoins;
  final DateTime? streakExpiresAt;
  final DateTime? lastActivityAt;

  const EngagementSummary({
    required this.totalXp,
    required this.currentLevel,
    required this.xpToNextLevel,
    required this.xpProgress,
    required this.currentStreak,
    required this.longestStreak,
    required this.aivoCoins,
    this.streakExpiresAt,
    this.lastActivityAt,
  });

  EngagementSummary copyWith({
    int? totalXp,
    int? currentLevel,
    int? xpToNextLevel,
    int? xpProgress,
    int? currentStreak,
    int? longestStreak,
    int? aivoCoins,
    DateTime? Function()? streakExpiresAt,
    DateTime? Function()? lastActivityAt,
  }) {
    return EngagementSummary(
      totalXp: totalXp ?? this.totalXp,
      currentLevel: currentLevel ?? this.currentLevel,
      xpToNextLevel: xpToNextLevel ?? this.xpToNextLevel,
      xpProgress: xpProgress ?? this.xpProgress,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      aivoCoins: aivoCoins ?? this.aivoCoins,
      streakExpiresAt:
          streakExpiresAt != null ? streakExpiresAt() : this.streakExpiresAt,
      lastActivityAt:
          lastActivityAt != null ? lastActivityAt() : this.lastActivityAt,
    );
  }

  factory EngagementSummary.fromJson(Map<String, dynamic> json) {
    return EngagementSummary(
      totalXp: json['totalXp'] as int,
      currentLevel: json['currentLevel'] as int,
      xpToNextLevel: json['xpToNextLevel'] as int,
      xpProgress: json['xpProgress'] as int,
      currentStreak: json['currentStreak'] as int,
      longestStreak: json['longestStreak'] as int,
      aivoCoins: json['aivoCoins'] as int,
      streakExpiresAt: json['streakExpiresAt'] != null
          ? DateTime.parse(json['streakExpiresAt'] as String)
          : null,
      lastActivityAt: json['lastActivityAt'] != null
          ? DateTime.parse(json['lastActivityAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalXp': totalXp,
      'currentLevel': currentLevel,
      'xpToNextLevel': xpToNextLevel,
      'xpProgress': xpProgress,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'aivoCoins': aivoCoins,
      'streakExpiresAt': streakExpiresAt?.toIso8601String(),
      'lastActivityAt': lastActivityAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is EngagementSummary &&
        other.totalXp == totalXp &&
        other.currentLevel == currentLevel &&
        other.xpToNextLevel == xpToNextLevel &&
        other.xpProgress == xpProgress &&
        other.currentStreak == currentStreak &&
        other.longestStreak == longestStreak &&
        other.aivoCoins == aivoCoins &&
        other.streakExpiresAt == streakExpiresAt &&
        other.lastActivityAt == lastActivityAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      totalXp,
      currentLevel,
      xpToNextLevel,
      xpProgress,
      currentStreak,
      longestStreak,
      aivoCoins,
      streakExpiresAt,
      lastActivityAt,
    );
  }

  @override
  String toString() {
    return 'EngagementSummary(totalXp: $totalXp, currentLevel: $currentLevel, '
        'xpToNextLevel: $xpToNextLevel, xpProgress: $xpProgress, '
        'currentStreak: $currentStreak, aivoCoins: $aivoCoins)';
  }
}

class Badge {
  final String slug;
  final String name;
  final String description;
  final String iconUrl;
  final String rarity;
  final bool isEarned;
  final double progress;
  final DateTime? earnedAt;

  const Badge({
    required this.slug,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.rarity,
    required this.isEarned,
    required this.progress,
    this.earnedAt,
  });

  Badge copyWith({
    String? slug,
    String? name,
    String? description,
    String? iconUrl,
    String? rarity,
    bool? isEarned,
    double? progress,
    DateTime? Function()? earnedAt,
  }) {
    return Badge(
      slug: slug ?? this.slug,
      name: name ?? this.name,
      description: description ?? this.description,
      iconUrl: iconUrl ?? this.iconUrl,
      rarity: rarity ?? this.rarity,
      isEarned: isEarned ?? this.isEarned,
      progress: progress ?? this.progress,
      earnedAt: earnedAt != null ? earnedAt() : this.earnedAt,
    );
  }

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      slug: json['slug'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      iconUrl: json['iconUrl'] as String,
      rarity: json['rarity'] as String,
      isEarned: json['isEarned'] as bool,
      progress: (json['progress'] as num).toDouble(),
      earnedAt: json['earnedAt'] != null
          ? DateTime.parse(json['earnedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'slug': slug,
      'name': name,
      'description': description,
      'iconUrl': iconUrl,
      'rarity': rarity,
      'isEarned': isEarned,
      'progress': progress,
      'earnedAt': earnedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Badge &&
        other.slug == slug &&
        other.name == name &&
        other.description == description &&
        other.iconUrl == iconUrl &&
        other.rarity == rarity &&
        other.isEarned == isEarned &&
        other.progress == progress &&
        other.earnedAt == earnedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      slug,
      name,
      description,
      iconUrl,
      rarity,
      isEarned,
      progress,
      earnedAt,
    );
  }

  @override
  String toString() {
    return 'Badge(slug: $slug, name: $name, rarity: $rarity, '
        'isEarned: $isEarned, progress: $progress)';
  }
}

class ShopItem {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final String category;
  final int price;
  final bool isOwned;
  final bool isEquipped;

  const ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.price,
    required this.isOwned,
    required this.isEquipped,
  });

  ShopItem copyWith({
    String? id,
    String? name,
    String? description,
    String? imageUrl,
    String? category,
    int? price,
    bool? isOwned,
    bool? isEquipped,
  }) {
    return ShopItem(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      price: price ?? this.price,
      isOwned: isOwned ?? this.isOwned,
      isEquipped: isEquipped ?? this.isEquipped,
    );
  }

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      category: json['category'] as String,
      price: json['price'] as int,
      isOwned: json['isOwned'] as bool,
      isEquipped: json['isEquipped'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'category': category,
      'price': price,
      'isOwned': isOwned,
      'isEquipped': isEquipped,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ShopItem &&
        other.id == id &&
        other.name == name &&
        other.description == description &&
        other.imageUrl == imageUrl &&
        other.category == category &&
        other.price == price &&
        other.isOwned == isOwned &&
        other.isEquipped == isEquipped;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      name,
      description,
      imageUrl,
      category,
      price,
      isOwned,
      isEquipped,
    );
  }

  @override
  String toString() {
    return 'ShopItem(id: $id, name: $name, category: $category, '
        'price: $price, isOwned: $isOwned, isEquipped: $isEquipped)';
  }
}

class AvatarConfig {
  final String id;
  final String learnerId;
  final Map<String, String> parts;
  final List<String> equippedItems;

  const AvatarConfig({
    required this.id,
    required this.learnerId,
    required this.parts,
    required this.equippedItems,
  });

  AvatarConfig copyWith({
    String? id,
    String? learnerId,
    Map<String, String>? parts,
    List<String>? equippedItems,
  }) {
    return AvatarConfig(
      id: id ?? this.id,
      learnerId: learnerId ?? this.learnerId,
      parts: parts ?? this.parts,
      equippedItems: equippedItems ?? this.equippedItems,
    );
  }

  factory AvatarConfig.fromJson(Map<String, dynamic> json) {
    return AvatarConfig(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      parts: (json['parts'] as Map<String, dynamic>)
          .map((key, value) => MapEntry(key, value as String)),
      equippedItems: (json['equippedItems'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'learnerId': learnerId,
      'parts': parts,
      'equippedItems': equippedItems,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AvatarConfig &&
        other.id == id &&
        other.learnerId == learnerId &&
        mapEquals(other.parts, parts) &&
        listEquals(other.equippedItems, equippedItems);
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      learnerId,
      Object.hashAll(parts.entries),
      Object.hashAll(equippedItems),
    );
  }

  @override
  String toString() {
    return 'AvatarConfig(id: $id, learnerId: $learnerId, '
        'parts: $parts, equippedItems: $equippedItems)';
  }
}

class LeaderboardEntry {
  final String odometer;
  final String learnerName;
  final String? avatarUrl;
  final int xp;
  final int rank;
  final bool isCurrentUser;

  const LeaderboardEntry({
    required this.odometer,
    required this.learnerName,
    this.avatarUrl,
    required this.xp,
    required this.rank,
    required this.isCurrentUser,
  });

  LeaderboardEntry copyWith({
    String? odometer,
    String? learnerName,
    String? Function()? avatarUrl,
    int? xp,
    int? rank,
    bool? isCurrentUser,
  }) {
    return LeaderboardEntry(
      odometer: odometer ?? this.odometer,
      learnerName: learnerName ?? this.learnerName,
      avatarUrl: avatarUrl != null ? avatarUrl() : this.avatarUrl,
      xp: xp ?? this.xp,
      rank: rank ?? this.rank,
      isCurrentUser: isCurrentUser ?? this.isCurrentUser,
    );
  }

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      odometer: json['odometer'] as String,
      learnerName: json['learnerName'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      xp: json['xp'] as int,
      rank: json['rank'] as int,
      isCurrentUser: json['isCurrentUser'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'odometer': odometer,
      'learnerName': learnerName,
      'avatarUrl': avatarUrl,
      'xp': xp,
      'rank': rank,
      'isCurrentUser': isCurrentUser,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LeaderboardEntry &&
        other.odometer == odometer &&
        other.learnerName == learnerName &&
        other.avatarUrl == avatarUrl &&
        other.xp == xp &&
        other.rank == rank &&
        other.isCurrentUser == isCurrentUser;
  }

  @override
  int get hashCode {
    return Object.hash(odometer, learnerName, avatarUrl, xp, rank, isCurrentUser);
  }

  @override
  String toString() {
    return 'LeaderboardEntry(rank: $rank, learnerName: $learnerName, '
        'xp: $xp, isCurrentUser: $isCurrentUser)';
  }
}

class Challenge {
  final String id;
  final String title;
  final String description;
  final String type;
  final String status;
  final int participantCount;
  final DateTime startsAt;
  final DateTime endsAt;
  final Map<String, dynamic>? result;

  const Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.status,
    required this.participantCount,
    required this.startsAt,
    required this.endsAt,
    this.result,
  });

  Challenge copyWith({
    String? id,
    String? title,
    String? description,
    String? type,
    String? status,
    int? participantCount,
    DateTime? startsAt,
    DateTime? endsAt,
    Map<String, dynamic>? Function()? result,
  }) {
    return Challenge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      participantCount: participantCount ?? this.participantCount,
      startsAt: startsAt ?? this.startsAt,
      endsAt: endsAt ?? this.endsAt,
      result: result != null ? result() : this.result,
    );
  }

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      participantCount: json['participantCount'] as int,
      startsAt: DateTime.parse(json['startsAt'] as String),
      endsAt: DateTime.parse(json['endsAt'] as String),
      result: json['result'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'status': status,
      'participantCount': participantCount,
      'startsAt': startsAt.toIso8601String(),
      'endsAt': endsAt.toIso8601String(),
      'result': result,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Challenge &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.type == type &&
        other.status == status &&
        other.participantCount == participantCount &&
        other.startsAt == startsAt &&
        other.endsAt == endsAt &&
        mapEquals(other.result, result);
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      title,
      description,
      type,
      status,
      participantCount,
      startsAt,
      endsAt,
      result != null ? Object.hashAll(result!.entries) : null,
    );
  }

  @override
  String toString() {
    return 'Challenge(id: $id, title: $title, type: $type, '
        'status: $status, participantCount: $participantCount)';
  }
}

class DailyChallenge {
  final String id;
  final String title;
  final String description;
  final int xpReward;
  final bool isCompleted;
  final double progress;

  const DailyChallenge({
    required this.id,
    required this.title,
    required this.description,
    required this.xpReward,
    required this.isCompleted,
    required this.progress,
  });

  DailyChallenge copyWith({
    String? id,
    String? title,
    String? description,
    int? xpReward,
    bool? isCompleted,
    double? progress,
  }) {
    return DailyChallenge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      xpReward: xpReward ?? this.xpReward,
      isCompleted: isCompleted ?? this.isCompleted,
      progress: progress ?? this.progress,
    );
  }

  factory DailyChallenge.fromJson(Map<String, dynamic> json) {
    return DailyChallenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      xpReward: json['xpReward'] as int,
      isCompleted: json['isCompleted'] as bool,
      progress: (json['progress'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'xpReward': xpReward,
      'isCompleted': isCompleted,
      'progress': progress,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DailyChallenge &&
        other.id == id &&
        other.title == title &&
        other.description == description &&
        other.xpReward == xpReward &&
        other.isCompleted == isCompleted &&
        other.progress == progress;
  }

  @override
  int get hashCode {
    return Object.hash(id, title, description, xpReward, isCompleted, progress);
  }

  @override
  String toString() {
    return 'DailyChallenge(id: $id, title: $title, xpReward: $xpReward, '
        'isCompleted: $isCompleted, progress: $progress)';
  }
}
