import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:uuid/uuid.dart';

import 'package:aivo_mobile/core/accessibility/audio_narrator.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/core/api/api_client.dart';
import 'package:aivo_mobile/core/api/endpoints.dart';
import 'package:aivo_mobile/core/connectivity/connectivity_provider.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _tutorSessionProvider = FutureProvider.autoDispose
    .family<TutorSession, String>((ref, tutorId) async {
  final api = ref.watch(apiClientProvider);
  final response = await api.post(
    Endpoints.tutorSessionStart,
    data: {'tutorId': tutorId},
  );
  return TutorSession.fromJson(response.data as Map<String, dynamic>);
});

// ---------------------------------------------------------------------------
// TutorChatScreen
// ---------------------------------------------------------------------------

class TutorChatScreen extends ConsumerStatefulWidget {
  const TutorChatScreen({super.key, required this.tutorId});

  final String tutorId;

  @override
  ConsumerState<TutorChatScreen> createState() => _TutorChatScreenState();
}

class _TutorChatScreenState extends ConsumerState<TutorChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  String? _sessionId;
  String _tutorName = 'Tutor';
  String _tutorAvatar = '';
  bool _isStreaming = false;
  StreamSubscription<List<int>>? _streamSub;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _streamSub?.cancel();
    super.dispose();
  }

  void _initFromSession(TutorSession session) {
    if (_sessionId != null) return;
    _sessionId = session.id;
    _tutorName = session.tutorName;
    _tutorAvatar = session.tutorAvatar;
    if (session.messages.isNotEmpty) {
      _messages.addAll(session.messages);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty || _isStreaming || _sessionId == null) return;

    final userMsg = ChatMessage(
      id: const Uuid().v4(),
      role: 'user',
      content: text.trim(),
      timestamp: DateTime.now(),
      isStreaming: false,
    );

    setState(() {
      _messages.add(userMsg);
      _messageController.clear();
    });
    _scrollToBottom();

    // Start streaming response
    final api = ref.read(apiClientProvider);
    final botMsgId = const Uuid().v4();

    setState(() {
      _isStreaming = true;
      _messages.add(ChatMessage(
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: DateTime.now(),
        isStreaming: true,
      ),);
    });
    _scrollToBottom();

    final buffer = StringBuffer();

    try {
      final response = await api.stream(
        Endpoints.tutorSessionMessage(_sessionId!),
        data: {'message': text.trim()},
      );

      _streamSub = response.data!.stream.listen(
        (bytes) {
          final chunk = utf8.decode(bytes, allowMalformed: true);
          buffer.write(chunk);

          if (mounted) {
            setState(() {
              final idx = _messages.indexWhere((m) => m.id == botMsgId);
              if (idx != -1) {
                _messages[idx] = _messages[idx].copyWith(
                  content: buffer.toString(),
                );
              }
            });
            _scrollToBottom();
          }
        },
        onDone: () {
          if (mounted) {
            setState(() {
              _isStreaming = false;
              final idx = _messages.indexWhere((m) => m.id == botMsgId);
              if (idx != -1) {
                _messages[idx] = _messages[idx].copyWith(
                  content: buffer.toString(),
                  isStreaming: false,
                );
              }
            });
            _scrollToBottom();

            // Auto-narrate for low-verbal users
            final level = ref.read(functioningLevelProvider);
            if (level.index >= FunctioningLevel.lowVerbal.index) {
              final narrator = ref.read(audioNarratorProvider);
              narrator.speak(buffer.toString());
            }
          }
        },
        onError: (error) {
          if (mounted) {
            setState(() {
              _isStreaming = false;
              final idx = _messages.indexWhere((m) => m.id == botMsgId);
              if (idx != -1) {
                _messages[idx] = _messages[idx].copyWith(
                  content: buffer.isEmpty
                      ? 'Sorry, I encountered an error. Please try again.'
                      : buffer.toString(),
                  isStreaming: false,
                );
              }
            });
          }
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _isStreaming = false;
          final idx = _messages.indexWhere((m) => m.id == botMsgId);
          if (idx != -1) {
            _messages[idx] = _messages[idx].copyWith(
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false,
            );
          }
        });
      }
    }
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('End Session'),
        content:
            const Text('Are you sure you want to end this tutoring session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('End Session'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    try {
      final api = ref.read(apiClientProvider);
      if (_sessionId != null) {
        await api.post(Endpoints.tutorSessionEnd(_sessionId!));
      }
    } catch (_) {
      // Best effort
    }

    if (mounted) {
      context.canPop() ? context.pop() : context.go('/learner/tutors');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOnline = ref.watch(isOnlineProvider);
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);

    if (!isOnline) {
      return _buildOfflineFallback(theme);
    }

    final sessionAsync = ref.watch(_tutorSessionProvider(widget.tutorId));

    return sessionAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Loading...')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Tutor Chat')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline,
                    size: 48, color: theme.colorScheme.error,),
                const SizedBox(height: 16),
                Text('Failed to start session',
                    style: theme.textTheme.titleMedium,),
                const SizedBox(height: 8),
                Text(
                  e.toString(),
                  style: theme.textTheme.bodySmall,
                  textAlign: TextAlign.center,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 24),
                Semantics(
                  button: true,
                  label: 'Retry starting session',
                  child: ElevatedButton.icon(
                    onPressed: () => ref
                        .invalidate(_tutorSessionProvider(widget.tutorId)),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      data: (session) {
        _initFromSession(session);
        return _buildChatScreen(theme, isLowVerbal);
      },
    );
  }

  Widget _buildOfflineFallback(ThemeData theme) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tutor Chat')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.cloud_off, size: 64,
                  color: theme.colorScheme.outline,),
              const SizedBox(height: 16),
              Text('Offline — Tutor unavailable',
                  style: theme.textTheme.titleMedium,
                  textAlign: TextAlign.center,),
              const SizedBox(height: 8),
              Text(
                'The AI tutor requires an internet connection. '
                'You can still continue lessons offline.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.outline,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              const _OfflineFaqSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChatScreen(ThemeData theme, bool isLowVerbal) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            if (_tutorAvatar.isNotEmpty)
              CircleAvatar(
                radius: 16,
                backgroundImage: CachedNetworkImageProvider(_tutorAvatar),
              )
            else
              CircleAvatar(
                radius: 16,
                child: Text(_tutorName.isNotEmpty
                    ? _tutorName[0].toUpperCase()
                    : 'T',),
              ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _tutorName,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          Semantics(
            button: true,
            label: 'End tutoring session',
            child: TextButton(
              onPressed: _endSession,
              child: Text('End',
                  style: TextStyle(color: theme.colorScheme.error),),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text(
                        'Say hello to start your tutoring session!',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.outline,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      return _MessageBubble(
                        message: msg,
                        tutorAvatar: _tutorAvatar,
                        tutorName: _tutorName,
                        isLowVerbal: isLowVerbal,
                      );
                    },
                  ),
          ),

          // Quick replies for LOW_VERBAL
          if (isLowVerbal && !_isStreaming && _messages.isNotEmpty)
            _buildQuickReplies(theme),

          // Input area
          Container(
            padding: EdgeInsets.fromLTRB(
                12, 8, 12, MediaQuery.of(context).padding.bottom + 8,),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(
                top: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Semantics(
                    textField: true,
                    label: 'Type a message',
                    child: TextField(
                      controller: _messageController,
                      style: TextStyle(fontSize: isLowVerbal ? 18 : 16),
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10,),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest,
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: _sendMessage,
                      enabled: !_isStreaming,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Semantics(
                  button: true,
                  label: 'Send message',
                  child: IconButton.filled(
                    onPressed: _isStreaming
                        ? null
                        : () => _sendMessage(_messageController.text),
                    icon: const Icon(Icons.send),
                    iconSize: isLowVerbal ? 28 : 24,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickReplies(ThemeData theme) {
    // Check if last tutor message has quick replies
    final lastMsg = _messages.isNotEmpty ? _messages.last : null;
    final List<QuickReply> replies;

    if (lastMsg?.quickReplies != null && lastMsg!.quickReplies!.isNotEmpty) {
      replies = lastMsg.quickReplies!.take(2).toList();
    } else {
      replies = const [
        QuickReply(label: 'Help me', value: 'Can you help me understand?'),
        QuickReply(
            label: 'Example', value: 'Can you show me an example?',),
      ];
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: replies.map((reply) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Semantics(
                button: true,
                label: reply.label,
                child: OutlinedButton(
                  onPressed: () => _sendMessage(reply.value),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 56),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (reply.imageUrl != null &&
                          reply.imageUrl!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: CachedNetworkImage(
                            imageUrl: reply.imageUrl!,
                            width: 40,
                            height: 40,
                            errorWidget: (_, __, ___) =>
                                const SizedBox.shrink(),
                          ),
                        ),
                      Text(reply.label, textAlign: TextAlign.center),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.tutorAvatar,
    required this.tutorName,
    required this.isLowVerbal,
  });

  final ChatMessage message;
  final String tutorAvatar;
  final String tutorName;
  final bool isLowVerbal;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.role == 'user';

    return Semantics(
      label: isUser
          ? 'You said: ${message.content}'
          : '$tutorName said: ${message.content}',
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          mainAxisAlignment:
              isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isUser) ...[
              CircleAvatar(
                radius: 16,
                backgroundImage: tutorAvatar.isNotEmpty
                    ? CachedNetworkImageProvider(tutorAvatar)
                    : null,
                child: tutorAvatar.isEmpty
                    ? Text(
                        tutorName.isNotEmpty
                            ? tutorName[0].toUpperCase()
                            : 'T',
                        style: const TextStyle(fontSize: 12),
                      )
                    : null,
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Container(
                padding: EdgeInsets.all(isLowVerbal ? 16 : 12),
                decoration: BoxDecoration(
                  color: isUser
                      ? theme.colorScheme.primary
                      : theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft:
                        isUser ? const Radius.circular(16) : Radius.zero,
                    bottomRight:
                        isUser ? Radius.zero : const Radius.circular(16),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message.content.isEmpty && message.isStreaming
                          ? '...'
                          : message.content,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: isUser
                            ? theme.colorScheme.onPrimary
                            : theme.colorScheme.onSurface,
                        fontSize: isLowVerbal ? 18 : 16,
                      ),
                    ),
                    if (message.isStreaming) ...[
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 24,
                        height: 12,
                        child: _TypingDots(
                          color: isUser
                              ? theme.colorScheme.onPrimary
                              : theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (isUser) const SizedBox(width: 8),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Typing indicator dots
// ---------------------------------------------------------------------------

class _TypingDots extends StatefulWidget {
  const _TypingDots({required this.color});
  final Color color;

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          children: List.generate(3, (i) {
            final delay = i * 0.2;
            final t = ((_controller.value - delay) % 1.0).clamp(0.0, 1.0);
            final opacity = (1.0 - (t - 0.5).abs() * 2).clamp(0.3, 1.0);
            return Container(
              width: 6,
              height: 6,
              margin: const EdgeInsets.only(right: 3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color.withValues(alpha: opacity),
              ),
            );
          }),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Offline FAQ fallback
// ---------------------------------------------------------------------------

class _OfflineFaqSection extends StatelessWidget {
  const _OfflineFaqSection();

  static const _faqs = [
    (
      q: 'Can I still learn offline?',
      a: 'Yes! Pre-cached lessons are available offline. Your progress '
          'will sync when you reconnect.'
    ),
    (
      q: 'Will I lose my progress?',
      a: 'No. All offline activity is saved locally and synced '
          'automatically when you go back online.'
    ),
    (
      q: 'When will the tutor be available?',
      a: 'The AI tutor will be available as soon as your device '
          'reconnects to the internet.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Frequently Asked Questions',
            style: theme.textTheme.titleSmall,),
        const SizedBox(height: 12),
        ..._faqs.map((faq) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(faq.q,
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(fontWeight: FontWeight.w600),),
                  const SizedBox(height: 4),
                  Text(faq.a,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.outline,
                      ),),
                ],
              ),
            ),),
      ],
    );
  }
}
