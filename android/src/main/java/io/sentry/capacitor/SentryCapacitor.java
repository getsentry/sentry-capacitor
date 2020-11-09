package io.sentry.capacitor;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import io.sentry.android.core.SentryAndroid;

@NativePlugin
public class SentryCapacitor extends Plugin {

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }

    @PluginMethod
    public void init(PluginCall call) {
        String dsn = call.getString("dsn");

        SentryAndroid.init(this.getContext(), options -> {
            options.setDsn(dsn);
        })
    }
}
