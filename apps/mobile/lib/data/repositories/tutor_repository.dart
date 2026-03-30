import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';

/// Repository for AI tutor catalog, subscriptions, and streaming chat sessions.
///
/// The [sendMessage] method uses the ApiClient's SSE streaming support to
/// return incremental text chunks as a [Stream<String>].
class TutorRepository {
  const TutorRepository({
    required ApiClient apiClient,
  }) : _api = apiClient;

  final ApiClient _api;

  // ---------------------------------------------------------------------------
  // Catalog & subscriptions
  // ---------------------------------------------------------------------------

  /// Returns the full tutor catalog.
  Future<List<TutorCatalogItem>> getTutorCatalog() async {
    final response = await _api.get(Endpoints.tutorCatalog);
    final data = response.data as Map<String, dynamic>;
    return (data['tutors'] as List<dynamic>?)
            ?.map(
                (e) => TutorCatalogItem.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }

  /// Returns the learner's active tutor subscriptions.
  Future<List<TutorCatalogItem>> getSubscriptions() async {
    final response = await _api.get(Endpoints.tutorSubscriptions);
    final data = response.data as Map<String, dynamic>;
    return (data['subscriptions'] as List<dynamic>?)
            ?.map(
                (e) => TutorCatalogItem.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }

  /// Subscribes the learner to a tutor.
  Future<void> subscribe(String tutorId) async {
    await _api.post(
      Endpoints.tutorSubscriptions,
      data: {'tutorId': tutorId},
    );
  }

  /// Cancels a tutor subscription.
  Future<void> cancelSubscription(String subscriptionId) async {
    await _api.delete('${Endpoints.tutorSubscriptions}/$subscriptionId');
  }

  // ---------------------------------------------------------------------------
  // Sessions
  // ---------------------------------------------------------------------------

  /// Starts a new tutoring session and returns the session metadata.
  Future<TutorSession> startSession(String tutorId, {String? subject}) async {
    final response = await _api.post(
      Endpoints.tutorSessionStart,
      data: {
        'tutorId': tutorId,
        if (subject != null) 'subject': subject,
      },
    );
    return TutorSession.fromJson(response.data as Map<String, dynamic>);
  }

  /// Sends a message within a tutoring session and returns a stream of
  /// incremental text chunks from the AI tutor.
  ///
  /// The stream completes when the server finishes its response.  Consumers
  /// should concatenate chunks to build the full reply.
  Stream<String> sendMessage(String sessionId, String message) async* {
    final streamResponse = await _api.stream(
      Endpoints.tutorSessionMessage(sessionId),
      data: {'message': message},
    );

    final responseBody = streamResponse.data!;
    await for (final chunk in responseBody.stream) {
      final decoded = utf8.decode(chunk, allowMalformed: true);
      if (decoded.isNotEmpty) {
        // SSE format: lines starting with "data: "
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
              // Non-JSON payload — yield raw text.
              if (payload.isNotEmpty) yield payload;
            }
          }
        }
      }
    }
  }

  /// Ends a tutoring session.
  Future<void> endSession(String sessionId) async {
    await _api.post(Endpoints.tutorSessionEnd(sessionId));
  }

  /// Returns the learner's tutor session history.
  Future<List<TutorSession>> getSessionHistory() async {
    final response = await _api.get(Endpoints.tutorSessionHistory);
    final data = response.data as Map<String, dynamic>;
    return (data['sessions'] as List<dynamic>?)
            ?.map(
                (e) => TutorSession.fromJson(e as Map<String, dynamic>),)
            .toList() ??
        [];
  }
}

/// Riverpod provider for [TutorRepository].
final tutorRepositoryProvider = Provider<TutorRepository>((ref) {
  return TutorRepository(
    apiClient: ref.watch(apiClientProvider),
  );
});
