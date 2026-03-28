import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/homework.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';

/// Repository for homework photo/PDF upload, analysis, and guided sessions.
///
/// [uploadHomework] uses multipart upload with progress tracking and yields
/// [HomeworkUploadProgress] events so the UI can display a progress indicator.
class HomeworkRepository {
  const HomeworkRepository({
    required ApiClient apiClient,
  }) : _api = apiClient;

  final ApiClient _api;

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  /// Uploads a homework file (photo or PDF) and yields progress events.
  ///
  /// When [isCamera] is `true` the file is tagged as a camera capture so the
  /// backend can apply appropriate OCR settings.
  Stream<HomeworkUploadProgress> uploadHomework(
    String filePath, {
    bool isCamera = false,
  }) async* {
    final controller = StreamController<HomeworkUploadProgress>();

    // Emit initial uploading state.
    yield const HomeworkUploadProgress(
      stage: 'uploading',
      progress: 0.0,
      message: 'Preparing upload...',
    );

    try {
      final response = await _api.upload<Map<String, dynamic>>(
        Endpoints.tutorHomeworkUpload,
        filePath: filePath,
        fieldName: 'file',
        fields: {'isCamera': isCamera.toString()},
        onSendProgress: (sent, total) {
          final progress = total > 0 ? sent / total : 0.0;
          controller.add(HomeworkUploadProgress(
            stage: 'uploading',
            progress: progress,
            message: 'Uploading... ${(progress * 100).toStringAsFixed(0)}%',
          ));
        },
      );

      yield HomeworkUploadProgress(
        stage: 'processing',
        progress: 1.0,
        message: 'Processing...',
      );

      final data = response.data!;
      final homework = data.containsKey('homework')
          ? Homework.fromJson(data['homework'] as Map<String, dynamic>)
          : Homework.fromJson(data);

      yield HomeworkUploadProgress(
        stage: 'complete',
        progress: 1.0,
        message: 'Upload complete',
      );
    } catch (e) {
      yield HomeworkUploadProgress(
        stage: 'error',
        progress: 0.0,
        message: 'Upload failed: ${e.toString()}',
      );
    } finally {
      controller.close();
    }
  }

  // ---------------------------------------------------------------------------
  // Homework detail
  // ---------------------------------------------------------------------------

  /// Fetches homework details by ID.
  Future<Homework> getHomework(String id) async {
    final response = await _api.get(Endpoints.tutorHomeworkDetail(id));
    final data = response.data as Map<String, dynamic>;
    return data.containsKey('homework')
        ? Homework.fromJson(data['homework'] as Map<String, dynamic>)
        : Homework.fromJson(data);
  }

  // ---------------------------------------------------------------------------
  // Homework session
  // ---------------------------------------------------------------------------

  /// Starts a guided tutoring session for a piece of homework.
  Future<TutorSession> startHomeworkSession(String homeworkId) async {
    final response = await _api.post(
      Endpoints.tutorHomeworkSessionStart(homeworkId),
    );
    return TutorSession.fromJson(response.data as Map<String, dynamic>);
  }

  /// Sends a message within a homework tutoring session and returns a stream
  /// of incremental text chunks from the AI tutor.
  Stream<String> sendHomeworkMessage(
      String homeworkId, String message) async* {
    final streamResponse = await _api.stream(
      Endpoints.tutorHomeworkSessionMessage(homeworkId),
      data: {'message': message},
    );

    final responseBody = streamResponse.data!;
    await for (final chunk in responseBody.stream) {
      final decoded = utf8.decode(chunk, allowMalformed: true);
      if (decoded.isNotEmpty) {
        for (final line in decoded.split('\n')) {
          if (line.startsWith('data: ')) {
            final payload = line.substring(6).trim();
            if (payload == '[DONE]') return;
            try {
              final json = jsonDecode(payload) as Map<String, dynamic>;
              final content = json['content'] as String? ??
                  json['text'] as String? ??
                  json['delta'] as String? ??
                  '';
              if (content.isNotEmpty) yield content;
            } catch (_) {
              if (payload.isNotEmpty) yield payload;
            }
          }
        }
      }
    }
  }

  /// Ends a homework tutoring session.
  Future<void> endHomeworkSession(String homeworkId) async {
    await _api.post(Endpoints.tutorHomeworkSessionEnd(homeworkId));
  }
}

/// Riverpod provider for [HomeworkRepository].
final homeworkRepositoryProvider = Provider<HomeworkRepository>((ref) {
  return HomeworkRepository(
    apiClient: ref.watch(apiClientProvider),
  );
});
