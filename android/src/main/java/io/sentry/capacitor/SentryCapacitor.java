package io.sentry.capacitor;

import android.content.Context;
import android.content.pm.PackageInfo;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import io.sentry.Breadcrumb;
import io.sentry.IScope;
import io.sentry.Integration;
import io.sentry.ScopesAdapter;
import io.sentry.Sentry;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import io.sentry.UncaughtExceptionHandlerIntegration;
import io.sentry.android.core.BuildConfig;
import io.sentry.android.core.AnrIntegration;
import io.sentry.android.core.NdkIntegration;
import io.sentry.android.core.SentryAndroid;
import io.sentry.protocol.SdkVersion;
import io.sentry.protocol.SentryPackage;
import io.sentry.protocol.User;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@CapacitorPlugin
public class SentryCapacitor extends Plugin {

    private static final String NATIVE_SDK_NAME = "sentry.native.android.capacitor";
    private static final String ANDROID_SDK_NAME = "sentry.java.android.capacitor";

    static final Logger logger = Logger.getLogger("capacitor-sentry");
    private Context context;
    private static PackageInfo packageInfo;

    @Override
    public void load() {
        super.load();

        if (this.context == null) {
            this.context = this.bridge.getContext();
        }

        try {
            String packageName = this.getContext().getPackageName();
            this.packageInfo = this.context.getPackageManager().getPackageInfo(packageName, 0); // Requires API 33 for deprecation change.
        } catch (Exception e) {
            logger.info("Error getting package info.");
        }
    }

    @PluginMethod
    public void initNativeSdk(final PluginCall call) {
      JSObject capOptions = call.getObject("options");

       SentryAndroid.init(
            this.getContext(),
            options -> {
                SdkVersion sdkVersion = options.getSdkVersion();
                if (sdkVersion == null) {
                    sdkVersion = new SdkVersion(ANDROID_SDK_NAME, BuildConfig.VERSION_NAME);
                } else {
                    sdkVersion.setName(ANDROID_SDK_NAME);
                }

              if (capOptions.has("debug") && capOptions.getBool("debug")) {
                    options.setDebug(true);
                    logger.setLevel(Level.INFO);
                }

                options.setSentryClientName(sdkVersion.getName() + "/" + sdkVersion.getVersion());
                options.setNativeSdkName(NATIVE_SDK_NAME);
                options.setSdkVersion(sdkVersion);

              String dsn = capOptions.getString("dsn") != null ? capOptions.getString("dsn") : "";
                logger.info(String.format("Starting with DSN: '%s'", dsn));
                options.setDsn(dsn);

                if (capOptions.has("environment") && capOptions.getString("environment") != null) {
                    options.setEnvironment(capOptions.getString("environment"));
                }

                if (capOptions.has("release") && capOptions.getString("release") != null) {
                    options.setRelease(capOptions.getString("release"));
                }

                if (capOptions.has("dist") && capOptions.getString("dist") != null) {
                    options.setDist(capOptions.getString("dist"));
                }

                if (capOptions.has("enableAutoSessionTracking")) {
                    options.setEnableAutoSessionTracking(capOptions.getBool("enableAutoSessionTracking"));
                }

                if (capOptions.has("sessionTrackingIntervalMillis")) {
                    options.setSessionTrackingIntervalMillis(capOptions.getInteger("sessionTrackingIntervalMillis"));
                }

                if (capOptions.has("enableNdkScopeSync")) {
                    options.setEnableScopeSync(capOptions.getBool("enableNdkScopeSync"));
                }

                if (capOptions.has("attachStacktrace")) {
                    options.setAttachStacktrace(capOptions.getBool("attachStacktrace"));
                }

                if (capOptions.has("attachThreads")) {
                    // JS use top level stacktraces and android attaches Threads which hides them so
                    // by default we hide.
                    options.setAttachThreads(capOptions.getBool("attachThreads"));
                }

                options.setBeforeSend(
                    (event, hint) -> {
                        setEventOriginTag(event);
                        addPackages(event, options.getSdkVersion());

                        return event;
                    }
                );

                if (capOptions.has("enableNativeCrashHandling") && !capOptions.getBool("enableNativeCrashHandling")) {
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

                options.getLogs().setEnabled(Boolean.TRUE.equals(capOptions.getBoolean("enableLogs", false)));

                logger.info(String.format("Native Integrations '%s'", options.getIntegrations().toString()));
            }
        );

        JSObject resp = new JSObject();
        resp.put("value", true);
        call.resolve(resp);
    }

    @PluginMethod
    public void setUser(PluginCall call) {
        Sentry.configureScope(scope -> {
            JSObject defaultUserKeys = call.getObject("defaultUserKeys");
            JSObject otherUserKeys = call.getObject("otherUserKeys");

            if (defaultUserKeys == null && otherUserKeys == null) {
                scope.setUser(null);
            } else {
                User userInstance = new User();

                if (defaultUserKeys != null) {
                    if (defaultUserKeys.has("email")) {
                        userInstance.setEmail(defaultUserKeys.getString("email"));
                    }

                    if (defaultUserKeys.has("id")) {
                        userInstance.setId(defaultUserKeys.getString("id"));
                    }

                    if (defaultUserKeys.has("username")) {
                        userInstance.setUsername(defaultUserKeys.getString("username"));
                    }

                    if (defaultUserKeys.has("ip_address")) {
                        userInstance.setIpAddress(defaultUserKeys.getString("ip_address"));
                    }
                }

                if (otherUserKeys != null) {
                    HashMap<String, String> otherUserKeysMap = new HashMap<>();
                    Iterator<String> it = otherUserKeys.keys();

                    while (it.hasNext()) {
                      String key = it.next();
                      String value = otherUserKeys.getString(key);

                      // other is ConcurrentHashMap and can't have null values
                      if (value != null) {
                        otherUserKeys.put(key, value);
                      }
                    }

                    // Works on the Android SDK but doesn't seems to be supported by the back-end.
                    userInstance.setData(otherUserKeysMap);
                }

                scope.setUser(userInstance);
            }
        });
    }

    @PluginMethod
    public void crash(PluginCall call) {
        throw new RuntimeException("TEST - Sentry Client Crash (only works in release mode)");
    }

    @PluginMethod
    public void fetchNativeRelease(PluginCall call) {
        JSObject release = new JSObject();
        release.put("id", packageInfo.packageName);
        release.put("version", packageInfo.versionName);
        release.put("build", String.valueOf(packageInfo.versionCode)); // Requires API 28
        call.resolve(release);
    }

    @PluginMethod
    public void captureEnvelope(PluginCall call) {
        try {
            JSArray rawIntegers = call.getArray("envelope");
            byte[] bytes = new byte[rawIntegers.length()];
            for (int i = 0; i < bytes.length; i++) {
                bytes[i] = (byte) rawIntegers.getInt(i);
            }

            final String outboxPath = ScopesAdapter.getInstance().getOptions().getOutboxPath();

            if (outboxPath == null || outboxPath.isEmpty()) {
                logger.info("Error when writing envelope, no outbox path is present.");
                call.reject("Missing outboxPath");
                return;
            }

            final File installation = new File(outboxPath, UUID.randomUUID().toString());

            try (FileOutputStream out = new FileOutputStream(installation)) {
                out.write(bytes);
                logger.info("Successfully captured envelope.");
            } catch (Exception e) {
                logger.info("Error writing envelope.");
                call.reject(String.valueOf(e));
                return;
            }
        } catch (Exception e) {
            logger.info("Error reading envelope.");
            call.reject(String.valueOf(e));
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void getStringBytesLength(PluginCall call) {
        if (call.getData().has("string")) {
            String payload = call.getString("string");
            try {
                JSObject resp = new JSObject();
                resp.put("value", payload.getBytes(StandardCharsets.UTF_8).length);
                call.resolve(resp);
            } catch (Exception e) {
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
                    default:
                        breadcrumbInstance.setLevel(SentryLevel.ERROR);
                        break;
                }
            }

            if (breadcrumb.getData().has("data")) {
                JSObject data = breadcrumb.getObject("data");
                Iterator<String> it = data.keys();

                while (it.hasNext()) {
                  String key = it.next();
                  String value = data.getString(key);

                  breadcrumbInstance.setData(key, value);
                }
            }

            scope.addBreadcrumb(breadcrumbInstance);
        });
        breadcrumb.resolve();
    }

    @PluginMethod
    public void clearBreadcrumbs(PluginCall call) {
        Sentry.configureScope(IScope::clearBreadcrumbs);
    }

    @PluginMethod
    public void closeNativeSdk(PluginCall call) {
        Sentry.close();
        call.resolve();
    }

    @PluginMethod
    public void setExtra(PluginCall call) {
        if (call.getData().has("key") && call.getData().has("value")) {
            Sentry.configureScope(scope -> {
                String key = call.getString("key");
                String value = call.getString("value");
                scope.setExtra(key, value);
            });
        }
        call.resolve();
    }

    @PluginMethod
    public void setTag(PluginCall call) {
        if (!call.getData().has("key")) {
           call.reject("Error deserializing tag");
           return;
        }

        if (call.getData().has("value")) {
            Sentry.configureScope(scope -> {
              String key = call.getString("key");
              String value = call.getString("value");
              scope.setTag(key, value);
            });
        } else {
            Sentry.configureScope(scope -> {
              String key = call.getString("key");
              scope.removeTag(key);
            });
        }
        call.resolve();
    }

    public void setEventOriginTag(SentryEvent event) {
        SdkVersion sdk = event.getSdk();
        if (sdk != null) {
            switch (sdk.getName()) {
                // If the event is from capacitor js, it gets set there and we do not handle it here.
                case NATIVE_SDK_NAME:
                    setEventEnvironmentTag(event, "native");
                    break;
                case ANDROID_SDK_NAME:
                    setEventEnvironmentTag(event, "java");
                    break;
                default:
                    break;
            }
        }
    }

    private void setEventEnvironmentTag(SentryEvent event, String environment) {
        event.setTag("event.origin", "android");
        event.setTag("event.environment", environment);
    }

    public void addPackages(SentryEvent event, SdkVersion sdk) {
        SdkVersion eventSdk = event.getSdk();
        if (eventSdk != null && eventSdk.getName().equals("sentry.javascript.capacitor") && sdk != null) {
            Set<SentryPackage> sentryPackages = sdk.getPackageSet();
            for (SentryPackage sentryPackage : sentryPackages) {
                eventSdk.addPackage(sentryPackage.getName(), sentryPackage.getVersion());
            }

            Set<String> integrations = sdk.getIntegrationSet();
            for (String integration : integrations) {
                eventSdk.addIntegration(integration);
            }

            event.setSdk(eventSdk);
        }
    }
}
