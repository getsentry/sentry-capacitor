package io.sentry.capacitor;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.gson.Gson;

import io.sentry.Breadcrumb;
import io.sentry.Integration;
import io.sentry.Sentry;
import io.sentry.SentryLevel;
import io.sentry.SentryOptions;
import io.sentry.UncaughtExceptionHandlerIntegration;
import io.sentry.android.core.AnrIntegration;
import io.sentry.android.core.NdkIntegration;
import io.sentry.android.core.SentryAndroid;
import io.sentry.protocol.SdkVersion;
import io.sentry.protocol.User;

import java.io.File;
import java.io.FileOutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.UUID;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.util.Log;

@NativePlugin
public class SentryCapacitor extends Plugin {

    final static Logger logger = Logger.getLogger("capacitor-sentry");
    private SentryOptions sentryOptions;
    private Context context;
    private static PackageInfo packageInfo;

    @Override
    public void load() {
        super.load();

        if (this.context == null) {
            this.context = this.bridge.getContext();
        }

        try {
            this.packageInfo = this.context.getPackageManager().getPackageInfo(this.getContext().getPackageName(), 0);
        } catch (Exception e) {
            logger.info("Error getting package info.");
        }
    }

    @PluginMethod
    public void startWithOptions(final PluginCall capOptions) {
        SentryAndroid.init(
            this.getContext(),
            options -> {
                String dsn = capOptions.getString("dsn") != null ? capOptions.getString("dsn") : "";
                logger.info(String.format("Starting with DSN: '%s'", dsn));
                options.setDsn(dsn);

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

        JSObject resp = new JSObject();
        resp.put("value", true);
        capOptions.resolve(resp);
    }

    @PluginMethod
    public void setLogLevel(PluginCall call) {
        int level = call.getInt("level", 2);
        try {
            logger.setLevel(this.logLevel(level));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private Level logLevel(int level) {
        switch (level) {
            case 1:
                return Level.SEVERE;
            case 2:
                return Level.INFO;
            case 3:
                return Level.ALL;
            default:
                return Level.OFF;
        }
    }

    @PluginMethod
    public void setUser(PluginCall call) {
        Sentry.configureScope(scope -> {
            if (!call.getData().has("user") && !call.getData().has("otherUserKeys")) {
                scope.setUser(null);
            } else {
                User userInstance = new User();

                if (call.getData().has("user")) {
                    JSObject user = call.getObject("user");
                    if (user.has("email")) {
                        userInstance.setEmail(user.getString("email"));
                    }

                    if (user.has("id")) {
                        userInstance.setId(user.getString("id"));
                    }

                    if (user.has("username")) {
                        userInstance.setUsername(user.getString("username"));
                    }

                    if (user.has("ip_address")) {
                        userInstance.setIpAddress(user.getString("ip_address"));
                    }
                }

                if (call.getData().has("otherUserKeys")) {
                    Map<String, String> otherUserKeysMap = (Map<String, String>) call.getObject("otherUserKeys");

                    for (Map.Entry<String, String> entry: otherUserKeysMap.entrySet()) {
                        String key = entry.getKey();
                        String value = entry.getValue();
                        otherUserKeysMap.put(key, value);
                    }

                    userInstance.setOthers(otherUserKeysMap);
                }

                scope.setUser(userInstance);
            }
        });
    }

    @PluginMethod
    public void crash() {
        throw new RuntimeException("TEST - Sentry Client Crash (only works in release mode)");
    }

    @PluginMethod
    public void fetchRelease(PluginCall call) {
        JSObject release = new JSObject();
        release.put("id", this.packageInfo.packageName);
        release.put("version", this.packageInfo.versionName);
        release.put("build", String.valueOf(this.packageInfo.versionCode));
        call.resolve(release);
    }

    @PluginMethod
    public void captureEnvelope(PluginCall call) {
        String envelope = call.getString("envelope");
        try {
            File installation =  new File(sentryOptions.getOutboxPath(), UUID.randomUUID().toString());
            try (FileOutputStream out = new FileOutputStream(installation)) {
                out.write(envelope.getBytes(Charset.forName("UTF-8")));
                logger.info("Successfully captured envelope.");

                JSObject resp = new JSObject();
                resp.put("value", envelope);
                call.resolve(resp);

            } catch (Exception e) {
                logger.info("Error writing envelope.");
                call.reject(String.valueOf(e));
                return;
            }
        }
        catch (Exception e) {
            logger.info("Error reading envelope.");
            call.reject(String.valueOf(e));
            return;
        }
    }
    
    @PluginMethod
    public void getStringBytesLength(PluginCall call) {
        if (call.getData().has("string")) {
            String payload = call.getString("string");
            try {
                JSObject resp = new JSObject();
                resp.put("value", payload.getBytes("UTF-8").length);
                call.resolve(resp);
            } catch (UnsupportedEncodingException e) {
                call.reject(String.valueOf(e));
            }
        } else {
            call.reject("Could not calculate string length.");
        }
    }

    @PluginMethod
    public void addBreadcrumb(final PluginCall breadcrumb) {
        Sentry.configureScope(scope -> {
            Breadcrumb breadcrumbInstance = new Breadcrumb();

            if (breadcrumb.getData().has("message")) {
                breadcrumbInstance.setMessage(breadcrumb.getString("message"));
            }

            if (breadcrumb.getData().has("type")) {
                breadcrumbInstance.setType(breadcrumb.getString("type"));
            }

            if (breadcrumb.getData().has("category")) {
                breadcrumbInstance.setCategory(breadcrumb.getString("category"));
            }

            if (breadcrumb.getData().has("level")) {
                switch (breadcrumb.getString("level")) {
                    case "fatal":
                        breadcrumbInstance.setLevel(SentryLevel.FATAL);
                        break;
                    case "warning":
                        breadcrumbInstance.setLevel(SentryLevel.WARNING);
                        break;
                    case "info":
                        breadcrumbInstance.setLevel(SentryLevel.INFO);
                        break;
                    case "debug":
                        breadcrumbInstance.setLevel(SentryLevel.DEBUG);
                        break;
                    case "error":
                        breadcrumbInstance.setLevel(SentryLevel.ERROR);
                        break;
                    default:
                        breadcrumbInstance.setLevel(SentryLevel.ERROR);
                        break;
                }
            }

            if (breadcrumb.getData().has("data")) {
                JSObject data = breadcrumb.getObject("data");
                HashMap<String, String> mappedData = new Gson().fromJson(data.toString(), HashMap.class);

                for ( HashMap.Entry<String, String> entry: mappedData.entrySet()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    breadcrumbInstance.setData(key, value);
                }
            }

            scope.addBreadcrumb(breadcrumbInstance);
        });
        breadcrumb.resolve();
    }

    @PluginMethod
    public void clearBreadcrumbs() {
        Sentry.configureScope(scope -> {
            scope.clearBreadcrumbs();
        });
    }

    @PluginMethod
    public void setExtra(PluginCall call) {
        if (call.getData().has("key") && call.getData().has("extra")) {
            Sentry.configureScope(scope -> {
                String key = call.getString("key");
                String extra = call.getString("extra");
                scope.setExtra(key, extra);
            });            
        }
        call.resolve();
    }

    @PluginMethod
    public void setTag(PluginCall call) {
        if (call.getData().has("key") && call.getData().has("value")) {
            Sentry.configureScope(scope -> {
                String key = call.getString("key");
                String value = call.getString("value");
                scope.setTag(key, value);
            });
        }
        call.resolve();
    }
}
