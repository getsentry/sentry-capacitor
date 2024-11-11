package io.sentry.capacitor;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import org.json.JSONArray;
import org.json.JSONException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;

import io.sentry.ILogger;
import io.sentry.SentryLevel;
import io.sentry.android.core.AndroidLogger;

public class CapSentryMapConverter {
  public static final String NAME = "CapSentry.MapConverter";

  private static final ILogger logger = new AndroidLogger(NAME);

  public static Object convertToWritable(Object serialized) {
    if (serialized instanceof Map) {
      JSObject writable = new JSObject();
      for (Map.Entry<?, ?> entry : ((Map<?, ?>) serialized).entrySet()) {
        Object key = entry.getKey();
        Object value = entry.getValue();

        if (key instanceof String) {
          addValueToWritableMap(writable, (String) key, convertToWritable(value));
        } else {
          logger.log(SentryLevel.ERROR, "Only String keys are supported in Map.", key);
        }
      }
      return writable;
    } else if (serialized instanceof List) {
      JSArray writable = new JSArray();
      for (Object item : (List<?>) serialized) {
        addValueToWritableArray(writable, convertToWritable(item));
      }
      return writable;
    }
    else if (serialized instanceof Byte) {
      return Integer.valueOf((Byte) serialized);
    } else if (serialized instanceof Short) {
      return Integer.valueOf((Short) serialized);
    } else if (serialized instanceof Float) {
      return Double.valueOf((Float) serialized);
    } else if (serialized instanceof Long) {
      return Double.valueOf((Long) serialized);
    } else if (serialized instanceof BigInteger) {
      return ((BigInteger) serialized).doubleValue();
    } else if (serialized instanceof BigDecimal) {
      return ((BigDecimal) serialized).doubleValue();
    } else if (serialized instanceof Integer
      || serialized instanceof Double
      || serialized instanceof Boolean
      || serialized == null
      || serialized instanceof String) {
      return serialized;
    } else {
      logger.log(SentryLevel.ERROR, "Supplied serialized value could not be converted." + serialized);
      return null;
    }
  }

  private static void addValueToWritableArray(JSArray writableArray, Object value) {
    if (value == null) {
      writableArray.put(null);
    } else if (value instanceof Boolean) {
      writableArray.put((Boolean) value);
    } else if (value instanceof Double) {
      writableArray.put((Double) value);
    } else if (value instanceof Float) {
      final double doubleValue = ((Float) value).doubleValue();
      writableArray.put(Double.valueOf(doubleValue));
    } else if (value instanceof Integer) {
      writableArray.put((Integer) value);
    } else if (value instanceof Short) {
      writableArray.put(((Short) value).intValue());
    } else if (value instanceof Byte) {
      writableArray.put(((Byte) value).intValue());
    } else if (value instanceof Long) {
      final double doubleValue = ((Long) value).doubleValue();
      writableArray.put(Double.valueOf(doubleValue));
    } else if (value instanceof BigInteger) {
      final double doubleValue = ((BigDecimal) value).doubleValue();
      writableArray.put(Double.valueOf(doubleValue));
    } else if (value instanceof BigDecimal) {
      final double doubleValue = ((BigDecimal) value).doubleValue();
      writableArray.put(Double.valueOf(doubleValue));
    } else if (value instanceof String) {
      writableArray.put((String) value);
    }
    else if (value instanceof JSObject) {
      writableArray.put((JSObject) value);
    } else if (value instanceof JSArray) {
      writableArray.put((JSArray) value);
    } else {
      logger.log(SentryLevel.ERROR,
        "Could not convert object: " + value);
    }
  }

  private static void addValueToWritableMap(JSObject writableMap, String key, Object value) {
    if (value == null) {
      writableMap.put(key, null);
    } else if (value instanceof Boolean) {
      writableMap.put(key, (Boolean) value);
    } else if (value instanceof Double) {
      writableMap.put(key, (Double) value);
    } else if (value instanceof Float) {
      writableMap.put(key, ((Float) value).doubleValue());
    } else if (value instanceof Integer) {
      writableMap.put(key, (Integer) value);
    } else if (value instanceof Short) {
      writableMap.put(key, ((Short) value).intValue());
    } else if (value instanceof Byte) {
      writableMap.put(key, ((Byte) value).intValue());
    } else if (value instanceof Long) {
      writableMap.put(key, ((Long) value).doubleValue());
    } else if (value instanceof BigInteger) {
      writableMap.put(key, ((BigInteger) value).doubleValue());
    } else if (value instanceof BigDecimal) {
      writableMap.put(key, ((BigDecimal) value).doubleValue());
    } else if (value instanceof String) {
      writableMap.put(key, (String) value);
    } else if (value instanceof JSArray) {
      writableMap.put(key, (JSArray) value);
    } else if (value instanceof JSObject) {
      writableMap.put(key, (JSObject) value);
    } else {
      logger.log(SentryLevel.ERROR,
        "Could not convert object" + value);
    }
  }
}
