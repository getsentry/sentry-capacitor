jest.mock('../../src/utils/webViewUrl');

import type { Exception } from '@sentry/browser';
import { defaultStackParser, eventFromException } from '@sentry/browser';
import type { Client, Event, EventHint, StackFrame, Stacktrace } from '@sentry/types';

import { createCapacitorRewriteFrames } from '../../src/integrations/rewriteframes';
import * as webViewUrl from '../../src/utils/webViewUrl';

describe('RewriteFrames', () => {
  const HINT = {};
  const ATTACH_STACKTRACE = true;
  const getCurrentServerUrlSpy = jest.spyOn(webViewUrl, 'getCurrentServerUrl');
  getCurrentServerUrlSpy.mockImplementation(() => undefined);


  const exceptionFromError = async (options: {
    message: string;
    name: string;
    stack: string;
  }): Promise<Exception | undefined> => {
    const error = new Error(options.message);
    error.stack = options.stack;
    const event = await eventFromException(defaultStackParser, error, HINT, ATTACH_STACKTRACE);
    await createCapacitorRewriteFrames().processEvent?.(event, {} as EventHint, {} as Client);
    const exception = event.exception?.values?.[0];
    return exception;
  };

  const processEvent = (event: Event): Event | undefined | null | PromiseLike<Event | null> => {
    return createCapacitorRewriteFrames().processEvent?.(event, {} as EventHint, {} as Client);
  };

  const firstStackTraceFromEvent = (event: Event): Stacktrace | undefined => {
    if (event?.exception?.values) {
      return event.exception.values[0].stacktrace;
    }
    return undefined;
  }


  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not change cocoa frames', async () => {
    const EXPECTED_SENTRY_COCOA_EXCEPTION = {
      type: 'Error',
      value: 'Objective-c error message.',
      stacktrace: {
        frames: [
          {
            platform: 'cocoa',
            package: 'CoreFoundation',
            function: '__exceptionPreprocess',
            instruction_addr: '0000000180437330',
          },
          {
            platform: 'cocoa',
            package: 'libobjc.A.dylib',
            function: 'objc_exception_throw',
            instruction_addr: '0000000180051274',
          },
          {
            platform: 'cocoa',
            package: 'CapTester',
            function: '-[RCTSampleTurboModule getObjectThrows:]',
            instruction_addr: '0000000103535900',
          },
        ],
      },
    };

    const SENTRY_COCOA_EXCEPTION_EVENT: Event = {
      exception: {
        values: [JSON.parse(JSON.stringify(EXPECTED_SENTRY_COCOA_EXCEPTION))],
      },
    };

    const event = processEvent(SENTRY_COCOA_EXCEPTION_EVENT) as Event;
    expect(event.exception?.values?.[0]).toEqual(EXPECTED_SENTRY_COCOA_EXCEPTION);
  });

  it('should not change jvm frames', async () => {
    const EXPECTED_SENTRY_JVM_EXCEPTION = {
      type: 'java.lang.RuntimeException',
      value: 'Java error message.',
      stacktrace: {
        frames: [
          {
            platform: 'java',
            module: 'com.example.modules.Crash',
            filename: 'Crash.kt',
            lineno: 10,
            function: 'getDataCrash',
          },
          {
            platform: 'java',
            module: 'com.facebook.jni.NativeRunnable',
            filename: 'NativeRunnable.java',
            lineno: 2,
            function: 'run',
          },
        ],
      },
    };

    const SENTRY_JVM_EXCEPTION_EVENT: Event = {
      exception: {
        values: [JSON.parse(JSON.stringify(EXPECTED_SENTRY_JVM_EXCEPTION))],
      },
    };

    const event = processEvent(SENTRY_JVM_EXCEPTION_EVENT) as Event;
    expect(event.exception?.values?.[0]).toEqual(EXPECTED_SENTRY_JVM_EXCEPTION);
  });


  it('should parse Capacitor errors on Android', async () => {
    const ANDROID_capacitor_NATIVE = {
      message: 'Error: test',
      name: 'Error',
      stack:
        'Error: test\n' +
        'at render(/home/username/sample-workspace/sampleapp.collect.capacitor/src/components/GpsMonitorScene.js:78:24)\n' +
        'at _renderValidatedComponentWithoutOwnerOrContext(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js:1050:29)\n' +
        'at _renderValidatedComponent(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js:1075:15)\n' +
        'at renderedElement(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js:484:29)\n' +
        'at _currentElement(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js:346:40)\n' +
        'at child(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorReconciler.js:68:25)\n' +
        'at children(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorMultiChild.js:264:10)\n' +
        'at this(/home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/native/capacitorNativeBaseComponent.js:74:41)\n',
    };
    const exception = await exceptionFromError(ANDROID_capacitor_NATIVE);

    expect(exception).toEqual({
      value: 'Error: test',
      type: 'Error',
      mechanism: {
        handled: true,
        type: 'generic',
      },
      stacktrace: {
        frames: [
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/native/capacitorNativeBaseComponent.js',
            function: 'this',
            lineno: 74,
            colno: 41,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorMultiChild.js',
            function: 'children',
            lineno: 264,
            colno: 10,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorReconciler.js',
            function: 'child',
            lineno: 68,
            colno: 25,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js',
            function: '_currentElement',
            lineno: 346,
            colno: 40,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js',
            function: 'renderedElement',
            lineno: 484,
            colno: 29,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js',
            function: '_renderValidatedComponent',
            lineno: 1075,
            colno: 15,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/node_modules/capacitor/Libraries/Renderer/src/renderers/shared/stack/reconciler/capacitorCompositeComponent.js',
            function: '_renderValidatedComponentWithoutOwnerOrContext',
            lineno: 1050,
            colno: 29,
            in_app: true,
          },
          {
            filename: 'app:///home/username/sample-workspace/sampleapp.collect.capacitor/src/components/GpsMonitorScene.js',
            function: 'render',
            lineno: 78,
            colno: 24,
            in_app: true,
          },
        ],
      },
    });
  });

  it('should parse Capacitor errors on Android Production', async () => {
    const ANDROID_CAPACITOR_PROD = {
      message: 'Error: test',
      name: 'Error',
      stack:
        'value@index.android.bundle:12:1917\n' +
        'onPress@index.android.bundle:12:2336\n' +
        'touchableHandlePress@index.android.bundle:258:1497\n' +
        '[native code]\n' +
        '_performSideEffectsForTransition@index.android.bundle:252:8508\n' +
        '[native code]\n' +
        '_receiveSignal@index.android.bundle:252:7291\n' +
        '[native code]\n' +
        'touchableHandleResponderRelease@index.android.bundle:252:4735\n' +
        '[native code]\n' +
        'u@index.android.bundle:79:142\n' +
        'invokeGuardedCallback@index.android.bundle:79:459\n' +
        'invokeGuardedCallbackAndCatchFirstError@index.android.bundle:79:580\n' +
        'c@index.android.bundle:95:365\n' +
        'a@index.android.bundle:95:567\n' +
        'v@index.android.bundle:146:501\n' +
        'g@index.android.bundle:146:604\n' +
        'forEach@[native code]\n' +
        'i@index.android.bundle:149:80\n' +
        'processEventQueue@index.android.bundle:146:1432\n' +
        's@index.android.bundle:157:88\n' +
        'handleTopLevel@index.android.bundle:157:174\n' +
        'index.android.bundle:156:572\n' +
        'a@index.android.bundle:93:276\n' +
        'c@index.android.bundle:93:60\n' +
        'perform@index.android.bundle:177:596\n' +
        'batchedUpdates@index.android.bundle:188:464\n' +
        'i@index.android.bundle:176:358\n' +
        'i@index.android.bundle:93:90\n' +
        'u@index.android.bundle:93:150\n' +
        '_receiveRootNodeIDEvent@index.android.bundle:156:544\n' +
        'receiveTouches@index.android.bundle:156:918\n' +
        'value@index.android.bundle:29:3016\n' +
        'index.android.bundle:29:955\n' +
        'value@index.android.bundle:29:2417\n' +
        'value@index.android.bundle:29:927\n' +
        '[native code]',
    };
    const exception = await exceptionFromError(ANDROID_CAPACITOR_PROD);

    expect(exception).toEqual({
      value: 'Error: test',
      type: 'Error',
      mechanism: {
        handled: true,
        type: 'generic',
      },
      stacktrace: {
        frames: [
          { filename: '[native code]', function: '?', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: 'value',
            lineno: 29,
            colno: 927,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'value',
            lineno: 29,
            colno: 2417,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: '?',
            lineno: 29,
            colno: 955,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'value',
            lineno: 29,
            colno: 3016,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'receiveTouches',
            lineno: 156,
            colno: 918,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: '_receiveRootNodeIDEvent',
            lineno: 156,
            colno: 544,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'u',
            lineno: 93,
            colno: 150,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'i',
            lineno: 93,
            colno: 90,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'i',
            lineno: 176,
            colno: 358,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'batchedUpdates',
            lineno: 188,
            colno: 464,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'perform',
            lineno: 177,
            colno: 596,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'c',
            lineno: 93,
            colno: 60,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'a',
            lineno: 93,
            colno: 276,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: '?',
            lineno: 156,
            colno: 572,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'handleTopLevel',
            lineno: 157,
            colno: 174,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 's',
            lineno: 157,
            colno: 88,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'processEventQueue',
            lineno: 146,
            colno: 1432,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'i',
            lineno: 149,
            colno: 80,
            in_app: true,
          },
          { filename: '[native code]', function: 'forEach', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: 'g',
            lineno: 146,
            colno: 604,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'v',
            lineno: 146,
            colno: 501,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'a',
            lineno: 95,
            colno: 567,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'c',
            lineno: 95,
            colno: 365,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'invokeGuardedCallbackAndCatchFirstError',
            lineno: 79,
            colno: 580,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'invokeGuardedCallback',
            lineno: 79,
            colno: 459,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'u',
            lineno: 79,
            colno: 142,
            in_app: true,
          },
          { filename: '[native code]', function: '?', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: 'touchableHandleResponderRelease',
            lineno: 252,
            colno: 4735,
            in_app: true,
          },
          { filename: '[native code]', function: '?', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: '_receiveSignal',
            lineno: 252,
            colno: 7291,
            in_app: true,
          },
          { filename: '[native code]', function: '?', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: '_performSideEffectsForTransition',
            lineno: 252,
            colno: 8508,
            in_app: true,
          },
          { filename: '[native code]', function: '?', in_app: false },
          {
            filename: 'app:///index.android.bundle',
            function: 'touchableHandlePress',
            lineno: 258,
            colno: 1497,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'onPress',
            lineno: 12,
            colno: 2336,
            in_app: true,
          },
          {
            filename: 'app:///index.android.bundle',
            function: 'value',
            lineno: 12,
            colno: 1917,
            in_app: true,
          },
        ],
      },
    });
  });

  it.each(
    [[
      'format localhost',
      { filename: 'http://localhost/file.js' },
      {
        filename: '/file.js',
        in_app: true
      } as StackFrame
    ],
    [
      'format secure localhost',
      { filename: 'https://localhost/file.js' },
      {
        filename: '/file.js',
        in_app: true
      }
    ],
    [
      'format localhost with port',
      { filename: 'https://localhost:8080/file.js' },
      {
        filename: '/file.js',
        in_app: true
      }
    ],
    [
      'format ip address',
      { filename: 'https://127.0.0.1/file.js' },
      {
        filename: 'https://127.0.0.1/file.js',
        in_app: true
      }
    ],
    [
      'format ng url',
      { filename: 'ng://file.js' },
      {
        filename: 'app:///file.js',
        in_app: true
      }
    ],
    [
      'format capacitor',
      { filename: 'capacitor://localhost:8080/file.js' },
      {
        filename: 'app:///file.js',
        in_app: true
      }
    ],
    [
      'format native code',
      { filename: '[native code]' },
      {
        filename: '[native code]',
        in_app: false
      }
    ],
    [
      'in_app if js has polyfills',
      { filename: 'http://localhost/polyfills.js' },
      {
        filename: '/polyfills.js',
        in_app: true
      }
    ],
    [
      'in_app if js has minified polyfills',
      { filename: 'http://localhost/polyfills.be636cf4b87265b8f6d0.js' },
      {
        filename: '/polyfills.be636cf4b87265b8f6d0.js',
        in_app: true
      }
    ]])
    ('should parse Angular, Capacitor and Native errors %s', async (_, frame, expectedFrame) => {

      const error = { values: [{ stacktrace: { frames: [frame] } }] };
      const event = await processEvent({ exception: error }) as Event;
      const firstFrame = (firstStackTraceFromEvent(event) as Stacktrace).frames?.pop();
      expect(firstFrame).toMatchObject(expectedFrame);;
    });

  it('should do something with the mocked url', async () => {
    const serverUrl = 'https://sentry.io';
    getCurrentServerUrlSpy.mockImplementation(() => serverUrl);
    const frame = { filename: `${serverUrl}/polyfills.js` };
    const error = { values: [{ stacktrace: { frames: [frame] } }] };
    const event = await processEvent({ exception: error }) as Event;
    const firstFrame = (firstStackTraceFromEvent(event) as Stacktrace).frames?.pop();
    expect(firstFrame?.filename).toBe('/polyfills.js');;
  });

});
