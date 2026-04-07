/// Configuration for assessment engagement breaks.
///
/// Controls how often breaks are shown during a baseline assessment and
/// which break activity types are offered.
class BreakConfig {
  const BreakConfig({
    this.frequencyQuestions = 8,
    this.preferredTypes = const ['breathing', 'music', 'puzzle', 'game'],
    this.adaptiveBreaks = true,
  });

  /// Show a break after every [frequencyQuestions] answered questions.
  final int frequencyQuestions;

  /// Ordered list of break activity types to rotate through.
  final List<String> preferredTypes;

  /// When true, trigger an early calming break after consecutive wrong answers.
  final bool adaptiveBreaks;

  factory BreakConfig.fromJson(Map<String, dynamic> json) {
    return BreakConfig(
      frequencyQuestions: json['frequencyQuestions'] as int? ?? 8,
      preferredTypes: (json['preferredTypes'] as List<dynamic>?)
              ?.cast<String>() ??
          const ['breathing', 'music', 'puzzle', 'game'],
      adaptiveBreaks: json['adaptiveBreaks'] as bool? ?? true,
    );
  }

  /// Default configuration used when no API config is available.
  factory BreakConfig.defaults() => const BreakConfig();

  Map<String, dynamic> toJson() => {
        'frequencyQuestions': frequencyQuestions,
        'preferredTypes': preferredTypes,
        'adaptiveBreaks': adaptiveBreaks,
      };
}
