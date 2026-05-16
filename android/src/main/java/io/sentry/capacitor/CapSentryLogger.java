package io.sentry.capacitor;

import com.getcapacitor.JSObject;
import io.sentry.ILogger;
import io.sentry.SentryLevel;
import io.sentry.android.core.AndroidLogger;
import java.lang.ref.WeakReference;

/**
 * Custom ILogger implementation that wraps AndroidLogger and forwards log messages to JS.
 * This allows native SDK logs to appear in the browser console when debug mode is enabled.
 */
public class CapSentryLogger implements ILogger {
  private static final String TAG = "CapacitorSentry";
  private static final String EVENT_NAME = "SentryNativeLog";

  private final AndroidLogger androidLogger;
  private WeakReference<SentryCapacitor> pluginRef;

  public CapSentryLogger() {
    this.androidLogger = new AndroidLogger(TAG);
  }

  public void setPlugin(SentryCapacitor plugin) {
    this.pluginRef = plugin != null ? new WeakReference<>(plugin) : null;
  }

  @Override
  public void log(SentryLevel level, String message, Object... args) {
    androidLogger.log(level, message, args);

    String formattedMessage =
        (args == null || args.length == 0) ? message : String.format(message, args);
    forwardToJS(level, formattedMessage);
  }

  @Override
  public void log(SentryLevel level, String message, Throwable throwable) {
    androidLogger.log(level, message, throwable);

    String fullMessage = throwable != null ? message + ": " + throwable.getMessage() : message;
    forwardToJS(level, fullMessage);
  }

  @Override
  public void log(SentryLevel level, Throwable throwable, String message, Object... args) {
    androidLogger.log(level, throwable, message, args);

    String formattedMessage =
        (args == null || args.length == 0) ? message : String.format(message, args);
    if (throwable != null) {
      formattedMessage += ": " + throwable.getMessage();
    }
    forwardToJS(level, formattedMessage);
  }

  @Override
  public boolean isEnabled(SentryLevel level) {
    return androidLogger.isEnabled(level);
  }

  private void forwardToJS(SentryLevel level, String message) {
    SentryCapacitor plugin = pluginRef != null ? pluginRef.get() : null;
    if (plugin == null) {
      return;
    }

    try {
      JSObject data = new JSObject();
      data.put("level", level.name().toLowerCase());
      data.put("component", "Sentry");
      data.put("message", message);
      plugin.notifyListeners(EVENT_NAME, data);
    } catch (Exception e) {
      // Silently ignore - don't cause issues if the bridge isn't ready
      androidLogger.log(SentryLevel.DEBUG, "Failed to forward log to JS: " + e.getMessage());
    }
  }
}
