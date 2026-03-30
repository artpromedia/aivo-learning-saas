# Flutter
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Gson / JSON serialization
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }

# SQLite / Drift
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }

# flutter_local_notifications
-keep class com.dexterous.** { *; }

# Workmanager
-keep class be.tramckrijte.workmanager.** { *; }

# Sentry
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# Bluetooth
-keep class com.boskokg.flutter_blue_plus.** { *; }
