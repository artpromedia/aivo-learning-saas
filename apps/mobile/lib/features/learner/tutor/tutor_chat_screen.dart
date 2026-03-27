import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:uuid/uuid.dart';

import 'package:aivo_mobile/config/theme.dart';
import 'package:aivo_mobile/core/accessibility/functioning_level_provider.dart';
import 'package:aivo_mobile/data/models/tutor_session.dart';
import 'package:aivo_mobile/data/repositories/tutor_repository.dart';
import 'package:aivo_mobile/shared/widgets/error_view.dart';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final _tutorSessionProvider = FutureProvider.autoDispose
    .family<TutorSession, String>((ref, tutorId) async {
  final repo = ref.watch(tutorRepositoryProvider);
  return repo.startSession(tutorId);
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
  StreamSubscription<String>? _streamSub;

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
    final repo = ref.read(tutorRepositoryProvider);
    final botMsgId = const Uuid().v4();

    setState(() {
      _isStreaming = true;
      _messages.add(ChatMessage(
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: DateTime.now(),
        isStreaming: true,
      ));
    });
    _scrollToBottom();

    final buffer = StringBuffer();

    _streamSub = repo.sendMessage(_sessionId!, text.trim()).listen(
      (chunk) {
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
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('End Session'),
        content: const Text('Are you sure you want to end this tutoring session?'),
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
      final repo = ref.read(tutorRepositoryProvider);
      if (_sessionId != null) {
        await repo.endSession(_sessionId!);
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
    final sessionAsync = ref.watch(_tutorSessionProvider(widget.tutorId));
    final theme = Theme.of(context);
    final isLowVerbal = ref.watch(isLowVerbalOrBelowProvider);

    return sessionAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Loading...')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Tutor Chat')),
        body: ErrorView.fullScreen(
          message: 'Failed to start session.\n$e',
          onRetry: () =>
              ref.invalidate(_tutorSessionProvider(widget.tutorId)),
        ),
      ),
      data: (session) {
        _initFromSession(session);
        return _buildChatScreen(theme, isLowVerbal);
      },
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
                    : 'T'),
              ),
            const SizedBox(width: 8),
            Text(_tutorName),
          ],
        ),
        actions: [
          TextButton(
            onPressed: _endSession,
            child: Text('End',
                style: TextStyle(color: theme.colorScheme.error)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isStreaming ? 0 : 0),
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
                12, 8, 12, MediaQuery.of(context).padding.bottom + 8),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(
                top: BorderSide(color: theme.colorScheme.outline.withAlpha(50)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: TextStyle(fontSize: isLowVerbal ? 18 : 16),
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
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
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _isStreaming
                      ? null
                      : () => _sendMessage(_messageController.text),
                  icon: const Icon(Icons.send),
                  iconSize: isLowVerbal ? 28 : 24,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickReplies(ThemeData theme) {
    final quickReplies = [
      const QuickReply(label: 'Help me', value: 'Can you help me understand?'),
      const QuickReply(label: 'Example', value: 'Can you show me an example?'),
    ];

    final lastMsg = _messages.isNotEmpty ? _messages.last : null;
    if (lastMsg?.quickReplies != null && lastMsg!.quickReplies!.isNotEmpty) {
      return _buildQuickReplyButtons(theme, lastMsg.quickReplies!);
    }

    return _buildQuickReplyButtons(theme, quickReplies);
  }

  Widget _buildQuickReplyButtons(ThemeData theme, List<QuickReply> replies) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: replies.take(2).map((reply) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: OutlinedButton(
                onPressed: () => _sendMessage(reply.value),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 56),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (reply.imageUrl != null && reply.imageUrl!.isNotEmpty)
                      CachedNetworkImage(
                        imageUrl: reply.imageUrl!,
                        width: 40,
                        height: 40,
                        errorWidget: (_, __, ___) => const SizedBox.shrink(),
                      ),
                    Text(reply.label, textAlign: TextAlign.center),
                  ],
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

    return Padding(
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
                  ? Text(tutorName.isNotEmpty
                      ? tutorName[0].toUpperCase()
                      : 'T',
                    style: const TextStyle(fontSize: 12))
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
                color: widget.color.withAlpha((opacity * 255).toInt()),
              ),
            );
          }),
        );
      },
    );
  }
}
