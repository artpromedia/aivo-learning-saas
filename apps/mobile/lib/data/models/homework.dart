/// Homework models for photo/PDF upload, OCR processing,
/// and adapted question answering in the AIVO Learning mobile app.

import 'package:flutter/foundation.dart';

class Homework {
  final String id;
  final String learnerId;
  final String? imageUrl;
  final String? pdfUrl;
  final String status;
  final String? detectedSubject;
  final String? extractedText;
  final Map<String, dynamic>? adaptedContent;
  final List<HomeworkQuestion> questions;
  final DateTime createdAt;
  final DateTime? completedAt;

  const Homework({
    required this.id,
    required this.learnerId,
    this.imageUrl,
    this.pdfUrl,
    required this.status,
    this.detectedSubject,
    this.extractedText,
    this.adaptedContent,
    required this.questions,
    required this.createdAt,
    this.completedAt,
  });

  Homework copyWith({
    String? id,
    String? learnerId,
    String? Function()? imageUrl,
    String? Function()? pdfUrl,
    String? status,
    String? Function()? detectedSubject,
    String? Function()? extractedText,
    Map<String, dynamic>? Function()? adaptedContent,
    List<HomeworkQuestion>? questions,
    DateTime? createdAt,
    DateTime? Function()? completedAt,
  }) {
    return Homework(
      id: id ?? this.id,
      learnerId: learnerId ?? this.learnerId,
      imageUrl: imageUrl != null ? imageUrl() : this.imageUrl,
      pdfUrl: pdfUrl != null ? pdfUrl() : this.pdfUrl,
      status: status ?? this.status,
      detectedSubject:
          detectedSubject != null ? detectedSubject() : this.detectedSubject,
      extractedText:
          extractedText != null ? extractedText() : this.extractedText,
      adaptedContent:
          adaptedContent != null ? adaptedContent() : this.adaptedContent,
      questions: questions ?? this.questions,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt != null ? completedAt() : this.completedAt,
    );
  }

  factory Homework.fromJson(Map<String, dynamic> json) {
    return Homework(
      id: json['id'] as String,
      learnerId: json['learnerId'] as String,
      imageUrl: json['imageUrl'] as String?,
      pdfUrl: json['pdfUrl'] as String?,
      status: json['status'] as String,
      detectedSubject: json['detectedSubject'] as String?,
      extractedText: json['extractedText'] as String?,
      adaptedContent: json['adaptedContent'] as Map<String, dynamic>?,
      questions: (json['questions'] as List<dynamic>)
          .map((e) => HomeworkQuestion.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'learnerId': learnerId,
      'imageUrl': imageUrl,
      'pdfUrl': pdfUrl,
      'status': status,
      'detectedSubject': detectedSubject,
      'extractedText': extractedText,
      'adaptedContent': adaptedContent,
      'questions': questions.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Homework &&
        other.id == id &&
        other.learnerId == learnerId &&
        other.imageUrl == imageUrl &&
        other.pdfUrl == pdfUrl &&
        other.status == status &&
        other.detectedSubject == detectedSubject &&
        other.extractedText == extractedText &&
        mapEquals(other.adaptedContent, adaptedContent) &&
        listEquals(other.questions, questions) &&
        other.createdAt == createdAt &&
        other.completedAt == completedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      learnerId,
      imageUrl,
      pdfUrl,
      status,
      detectedSubject,
      extractedText,
      adaptedContent != null
          ? Object.hashAll(adaptedContent!.entries)
          : null,
      Object.hashAll(questions),
      createdAt,
      completedAt,
    );
  }

  @override
  String toString() {
    return 'Homework(id: $id, learnerId: $learnerId, status: $status, '
        'detectedSubject: $detectedSubject, '
        'questions: ${questions.length}, createdAt: $createdAt)';
  }
}

class HomeworkQuestion {
  final String id;
  final String questionText;
  final String? imageUrl;
  final String type;
  final Map<String, dynamic> data;
  final String? studentAnswer;
  final String? feedback;
  final bool? isCorrect;

  const HomeworkQuestion({
    required this.id,
    required this.questionText,
    this.imageUrl,
    required this.type,
    required this.data,
    this.studentAnswer,
    this.feedback,
    this.isCorrect,
  });

  HomeworkQuestion copyWith({
    String? id,
    String? questionText,
    String? Function()? imageUrl,
    String? type,
    Map<String, dynamic>? data,
    String? Function()? studentAnswer,
    String? Function()? feedback,
    bool? Function()? isCorrect,
  }) {
    return HomeworkQuestion(
      id: id ?? this.id,
      questionText: questionText ?? this.questionText,
      imageUrl: imageUrl != null ? imageUrl() : this.imageUrl,
      type: type ?? this.type,
      data: data ?? this.data,
      studentAnswer:
          studentAnswer != null ? studentAnswer() : this.studentAnswer,
      feedback: feedback != null ? feedback() : this.feedback,
      isCorrect: isCorrect != null ? isCorrect() : this.isCorrect,
    );
  }

  factory HomeworkQuestion.fromJson(Map<String, dynamic> json) {
    return HomeworkQuestion(
      id: json['id'] as String,
      questionText: json['questionText'] as String,
      imageUrl: json['imageUrl'] as String?,
      type: json['type'] as String,
      data: json['data'] as Map<String, dynamic>,
      studentAnswer: json['studentAnswer'] as String?,
      feedback: json['feedback'] as String?,
      isCorrect: json['isCorrect'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionText': questionText,
      'imageUrl': imageUrl,
      'type': type,
      'data': data,
      'studentAnswer': studentAnswer,
      'feedback': feedback,
      'isCorrect': isCorrect,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is HomeworkQuestion &&
        other.id == id &&
        other.questionText == questionText &&
        other.imageUrl == imageUrl &&
        other.type == type &&
        mapEquals(other.data, data) &&
        other.studentAnswer == studentAnswer &&
        other.feedback == feedback &&
        other.isCorrect == isCorrect;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      questionText,
      imageUrl,
      type,
      Object.hashAll(data.entries),
      studentAnswer,
      feedback,
      isCorrect,
    );
  }

  @override
  String toString() {
    return 'HomeworkQuestion(id: $id, type: $type, '
        'questionText: ${questionText.length > 50 ? '${questionText.substring(0, 50)}...' : questionText}, '
        'isCorrect: $isCorrect)';
  }
}

class HomeworkUploadProgress {
  final String stage;
  final double progress;
  final String? message;

  const HomeworkUploadProgress({
    required this.stage,
    required this.progress,
    this.message,
  });

  HomeworkUploadProgress copyWith({
    String? stage,
    double? progress,
    String? Function()? message,
  }) {
    return HomeworkUploadProgress(
      stage: stage ?? this.stage,
      progress: progress ?? this.progress,
      message: message != null ? message() : this.message,
    );
  }

  factory HomeworkUploadProgress.fromJson(Map<String, dynamic> json) {
    return HomeworkUploadProgress(
      stage: json['stage'] as String,
      progress: (json['progress'] as num).toDouble(),
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stage': stage,
      'progress': progress,
      'message': message,
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is HomeworkUploadProgress &&
        other.stage == stage &&
        other.progress == progress &&
        other.message == message;
  }

  @override
  int get hashCode => Object.hash(stage, progress, message);

  @override
  String toString() {
    return 'HomeworkUploadProgress(stage: $stage, progress: $progress, '
        'message: $message)';
  }
}
