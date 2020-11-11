package io.sentry.capacitor;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import io.sentry.Integration;
import io.sentry.SentryOptions;
import io.sentry.UncaughtExceptionHandlerIntegration;

import io.sentry.android.core.AnrIntegration;
import io.sentry.android.core.NdkIntegration;
import io.sentry.android.core.SentryAndroid;

import io.sentry.protocol.SdkVersion;
import io.sentry.protocol.SentryException;

import java.util.List;
import java.util.logging.Logger;

@NativePlugin
public class SentryCapacitor extends Plugin {

    static final Logger logger = Logger.getLogger("capacitory-sentry");
    private SentryOptions sentryOptions;

    @PluginMethod
    public boolean nativeClientAvailable() {
        return true;
    }

    // @PluginMethod
    // public void echo(PluginCall call) {
    //     String value = call.getString("value");

    //     JSObject ret = new JSObject();
    //     ret.put("value", value);
    //     call.success(ret);
    // }

    @PluginMethod
    public void init(final PluginCall capOptions) {
        SentryAndroid.init(
            this.getContext(),
            options -> {
                if (capOptions.getData().has("dsn")) {
                    String dsn = capOptions.getString("dsn") != null ? capOptions.getString("dsn") : "";
                    logger.info(String.format("Starting with DSN: '%s'", dsn));
                    options.setDsn(dsn);
                }

                if (capOptions.getData().has("debug")) {
                    options.setDebug(capOptions.getBoolean("debug"));
                }

                if (capOptions.getData().has("environment") && capOptions.getString("environment") != null) {
                    options.setEnvironment(capOptions.getString("environment"));
                }

                if (capOptions.getData().has("enableAutoSessionTracking")) {
                    options.setEnableSessionTracking(capOptions.getBoolean("enableAutoSessionTracking"));
                }

                if (capOptions.getData().has("sessionTrackingIntervalMillis")) {
                    options.setSessionTrackingIntervalMillis(capOptions.getInt("sessionTrackingIntervalMillis"));
                }

                if (capOptions.getData().has("enableNdkScopeSync")) {
                    options.setEnableScopeSync(capOptions.getBoolean("enableNdkScopeSync"));
                }

                if (capOptions.getData().has("attachStacktrace")) {
                    options.setAttachStacktrace(capOptions.getBoolean("attachStacktrace"));
                }

                if (capOptions.getData().has("attachThreads")) {
                    // JS use top level stacktraces and android attaches Threads which hides them so
                    // by default we hide.
                    options.setAttachThreads(capOptions.getBoolean("attachThreads"));
                }

                options.setBeforeSend(
                    (event, hint) -> {
                        // TODO Need to look into whether this is needed for Capacitor
                        // React native internally throws a JavascriptException
                        // Since we catch it before that, we don't want to send this one
                        // because we would send it twice
                        try {
                            SentryException ex = event.getExceptions().get(0);
                            if (null != ex && ex.getType().contains("JavascriptException")) {
                                return null;
                            }
                        } catch (Exception e) {
                            // We do nothing
                        }

                        // Add on the correct event.origin tag.
                        // it needs to be here so we can determine where it originated from.
                        SdkVersion sdkVersion = event.getSdk();
                        if (sdkVersion != null) {
                            String sdkName = sdkVersion.getName();
                            if (sdkName != null) {
                                if (sdkName.equals("sentry.javascript.capacitor")) {
                                    event.setTag("event.origin", "javascript");
                                } else if (sdkName.equals("sentry.java.android") || sdkName.equals("sentry.native")) {
                                    event.setTag("event.origin", "android");

                                    if (sdkName.equals("sentry.native")) {
                                        event.setTag("event.environment", "native");
                                    } else {
                                        event.setTag("event.environment", "java");
                                    }
                                }
                            }
                        }

                        return event;
                    }
                );

                if (capOptions.getData().has("enableNativeCrashHandling") && !capOptions.getBoolean("enableNativeCrashHandling")) {
                    final List<Integration> integrations = options.getIntegrations();
                    for (final Integration integration : integrations) {
                        if (
                            integration instanceof UncaughtExceptionHandlerIntegration ||
                            integration instanceof AnrIntegration ||
                            integration instanceof NdkIntegration
                        ) {
                            integrations.remove(integration);
                        }
                    }
                }

                logger.info(String.format("Native Integrations '%s'", options.getIntegrations().toString()));
                sentryOptions = options;
            }
        );

        capOptions.resolve();
    }
}
