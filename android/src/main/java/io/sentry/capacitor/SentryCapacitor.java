package io.sentry.capacitor;

import android.content.Context;
import android.content.pm.PackageInfo;

import io.sentry.ILogger;
import io.sentry.ScopesAdapter;
import io.sentry.SentryOptions;
import io.sentry.android.core.AndroidLogger;
import io.sentry.android.core.SentryAndroidOptions;
import io.sentry.vendor.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

import io.sentry.Breadcrumb;
import io.sentry.IScope;
import io.sentry.Integration;
import io.sentry.Sentry;
import io.sentry.SentryEvent;
import io.sentry.SentryLevel;
import io.sentry.UncaughtExceptionHandlerIntegration;
import io.sentry.android.core.BuildConfig;
import io.sentry.android.core.AnrIntegration;
import io.sentry.android.core.InternalSentrySdk;
import io.sentry.android.core.NdkIntegration;
import io.sentry.android.core.SentryAndroid;
import io.sentry.protocol.SdkVersion;
import io.sentry.protocol.SentryPackage;
import io.sentry.protocol.User;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CapacitorPlugin
public class SentryCapacitor extends Plugin {

    private static final String NATIVE_SDK_NAME = "sentry.native.android.capacitor";
    private static final String ANDROID_SDK_NAME = "sentry.java.android.capacitor";

    static final ILogger logger = new AndroidLogger("capacitor-sentry");
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
            logger.log(SentryLevel.ERROR, "Error getting package info.");
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
                }

                options.setSentryClientName(sdkVersion.getName() + "/" + sdkVersion.getVersion());
                options.setNativeSdkName(NATIVE_SDK_NAME);
                options.setSdkVersion(sdkVersion);

              String dsn = capOptions.getString("dsn") != null ? capOptions.getString("dsn") : "";
                logger.log(SentryLevel.INFO, String.format("Starting with DSN: '%s'", dsn));
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

                if (capOptions.has("sidecarUrl")) {
                    options.setEnableSpotlight(true);
                    options.setSpotlightConnectionUrl(capOptions.getString("sidecarUrl"));
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

                // In case some user enable Android Replay by accident,
                // it will not work with JavaScript replay, so we enforce this to disable Android replay.
                // If you are interested on being able to use native replay, please open a Github issue
                // on the following repo: https://github.com/getsentry/sentry-capacitor.
                var controller = options.getSessionReplay();
                controller.setSessionSampleRate(null);
                controller.setOnErrorSampleRate(null);

                options.getLogs().setEnabled(Boolean.TRUE.equals(capOptions.getBoolean("enableLogs", false)));

                logger.log(SentryLevel.INFO, String.format("Native Integrations '%s'", options.getIntegrations()));
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
        call.resolve(new JSObject());
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
    public void fetchNativeSdkInfo(PluginCall call) {
        JSObject sdkInfo = new JSObject();
        sdkInfo.put("name", ANDROID_SDK_NAME);
        sdkInfo.put("version", BuildConfig.VERSION_NAME);
        call.resolve(sdkInfo);
    }

    @PluginMethod
    public void captureEnvelope(PluginCall call) {
        String rawBytes = call.getString("envelope");
        if  (rawBytes == null) {
            String  errorMsg = "Can't send envelope due to empty data.";
            logger.log(SentryLevel.ERROR,  errorMsg);
            call.reject( errorMsg);
            return;
        }
        byte[] bytes = Base64.decode(rawBytes, Base64.DEFAULT);

        try {
            InternalSentrySdk.captureEnvelope(bytes, false);
        } catch (Throwable e) { // NOPMD - We don't want to crash in any case
            String  errorMsg = "Error while capturing envelope";
            logger.log(SentryLevel.ERROR, errorMsg);
            call.reject(errorMsg);
            return;
        }
        // Resolve with empty object to avoid Capacitor logging "undefined" to Logcat
        // See: https://github.com/ionic-team/capacitor/issues/4986
        call.resolve(new JSObject());
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

            JSObject breadcrumbData = breadcrumb.getData();

            if (breadcrumbData.has("message")) {
                breadcrumbInstance.setMessage(breadcrumb.getString("message"));
            }

            if (breadcrumbData.has("type")) {
                breadcrumbInstance.setType(breadcrumb.getString("type"));
            }

            if (breadcrumbData.has("category")) {
                breadcrumbInstance.setCategory(breadcrumb.getString("category"));
            }

            if (breadcrumbData.has("origin")) {
                breadcrumbInstance.setOrigin(breadcrumbData.getString("origin"));
              } else {
                breadcrumbInstance.setOrigin("capacitor");
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
        // Resolve with empty object to avoid Capacitor logging "undefined" to Logcat
        // This method is called frequently (for every console breadcrumb) so the spam is significant
        breadcrumb.resolve(new JSObject());
    }

    @PluginMethod
    public void clearBreadcrumbs(PluginCall call) {
        Sentry.configureScope(IScope::clearBreadcrumbs);
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void closeNativeSdk(PluginCall call) {
        Sentry.close();
        call.resolve(new JSObject());
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
        call.resolve(new JSObject());
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
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void fetchNativeDeviceContexts(PluginCall call) {
      final SentryOptions options = ScopesAdapter.getInstance().getOptions();
      final IScope currentScope = InternalSentrySdk.getCurrentScope();


      JSObject callData = call.getData();
      if (options == null || currentScope == null) {
        call.resolve();
        return;
      }
      final Map<String, Object> serialized =
        InternalSentrySdk.serializeScope(context, (SentryAndroidOptions) options, currentScope);

      // Filter out breadcrumbs with origin "capacitor" from the serialized data before conversion
      if (serialized.containsKey("breadcrumbs")) {
        Object breadcrumbsObj = serialized.get("breadcrumbs");
        if (breadcrumbsObj instanceof List) {
          List<?> breadcrumbs = (List<?>) breadcrumbsObj;
          List<Object> filteredBreadcrumbs = new ArrayList<>();
          for (Object breadcrumbObj : breadcrumbs) {
            if (breadcrumbObj instanceof Map) {
              Map<?, ?> breadcrumb = (Map<?, ?>) breadcrumbObj;
              Object origin = breadcrumb.get("origin");
              if (!"capacitor".equals(origin)) {
                filteredBreadcrumbs.add(breadcrumb);
              }
            } else {
              // If it's not a Map, keep it as-is
              filteredBreadcrumbs.add(breadcrumbObj);
            }
          }
          serialized.put("breadcrumbs", filteredBreadcrumbs);
        }
      }

      final Object deviceContext = CapSentryMapConverter.convertToWritable(serialized);

      if (deviceContext instanceof JSObject) {
        call.resolve((JSObject) deviceContext);
      }
      else {
        call.resolve();
      }
    }

    @PluginMethod
    public void fetchNativeLogAttributes(PluginCall call) {
        final SentryOptions options = ScopesAdapter.getInstance().getOptions();
        final IScope currentScope = InternalSentrySdk.getCurrentScope();

        if (options == null || currentScope == null) {
            call.resolve();
            return;
        }

        final Map<String, Object> serialized =
            InternalSentrySdk.serializeScope(context, (SentryAndroidOptions) options, currentScope);

        JSObject result = new JSObject();
        JSObject contexts = new JSObject();

        // Extract device context
        if (serialized.containsKey("contexts")) {
            Object contextsObj = serialized.get("contexts");
            if (contextsObj instanceof Map) {
                Map<?, ?> contextsMap = (Map<?, ?>) contextsObj;

                // Extract device info
                if (contextsMap.containsKey("device")) {
                    Object deviceObj = contextsMap.get("device");
                    if (deviceObj instanceof Map) {
                        Map<?, ?> deviceMap = (Map<?, ?>) deviceObj;
                        JSObject device = new JSObject();

                        if (deviceMap.containsKey("brand")) {
                            device.put("brand", deviceMap.get("brand"));
                        }
                        if (deviceMap.containsKey("model")) {
                            device.put("model", deviceMap.get("model"));
                        }
                        if (deviceMap.containsKey("family")) {
                            device.put("family", deviceMap.get("family"));
                        }

                        if (device.length() > 0) {
                            contexts.put("device", device);
                        }
                    }
                }

                // Extract OS info
                if (contextsMap.containsKey("os")) {
                    Object osObj = contextsMap.get("os");
                    if (osObj instanceof Map) {
                        Map<?, ?> osMap = (Map<?, ?>) osObj;
                        JSObject os = new JSObject();

                        if (osMap.containsKey("name")) {
                            os.put("name", osMap.get("name"));
                        }
                        if (osMap.containsKey("version")) {
                            os.put("version", osMap.get("version"));
                        }

                        if (os.length() > 0) {
                            contexts.put("os", os);
                        }
                    }
                }
            }
        }

        if (contexts.length() > 0) {
            result.put("contexts", contexts);
        }

        // Extract release
        if (serialized.containsKey("release")) {
            result.put("release", serialized.get("release"));
        }

        call.resolve(result);
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

