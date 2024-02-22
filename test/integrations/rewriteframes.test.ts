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

  it('should parse Capacitor errors on Android', async () => {
    const ANDROID_CAPACITOR_NATIVE = {
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
    const exception = await exceptionFromError(ANDROID_CAPACITOR_NATIVE);

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

  it('should parse Capacitor errors on Production', async () => {
    const CAPACITOR_PROD = {
      message: 'Error: test',
      name: 'Error',
      stack:
      'at n.throwUnhandledException (http://localhost/1835.53a456a58b808362.js:1:283)\n' +
      'at http://localhost/1835.53a456a58b808362.js:1:2867\n' +
      'at wg (http://localhost/main.bc0e3714db64c955.js:1:494047)\n' +
      'at a (http://localhost/main.bc0e3714db64c955.js:1:494209)\n' +
      'at _o.<anonymous> (http://localhost/main.bc0e3714db64c955.js:1:5698)\n' +
      'at _o.x (http://localhost/main.bc0e3714db64c955.js:1:151119)\n' +
      'at v.invokeTask (http://localhost/polyfills.931b4c31969683ac.js:1:7233)\n' +
      'at Object.onInvokeTask (http://localhost/main.bc0e3714db64c955.js:1:524207)\n' +
      'at v.invokeTask (http://localhost/polyfills.931b4c31969683ac.js:1:7154)\n' +
      'at M.runTask (http://localhost/polyfills.931b4c31969683ac.js:1:2628)\n' +
      'at m.invokeTask [as invoke] (http://localhost/polyfills.931b4c31969683ac.js:1:8)\n' +
      'at Z (http://localhost/polyfills.931b4c31969683ac.js:1:20899)\n' +
      'at N (http://localhost/polyfills.931b4c31969683ac.js:1:21294)\n' +
      'at _o.F (http://localhost/polyfills.931b4c31969683ac.js:1:21458)',
    };
    const exception = await exceptionFromError(CAPACITOR_PROD);

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
            filename: '/polyfills.931b4c31969683ac.js',
            function: '_o.F',
            lineno: 1,
            colno: 21458,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'N',
            lineno: 1,
            colno: 21294,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'Z',
            lineno: 1,
            colno: 20899,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'm.invokeTask [as invoke]',
            lineno: 1,
            colno: 8,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'M.runTask',
            lineno: 1,
            colno: 2628,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'v.invokeTask',
            lineno: 1,
            colno: 7154,
            in_app: true,
          },
          {
            filename: '/main.bc0e3714db64c955.js',
            function: 'Object.onInvokeTask',
            lineno: 1,
            colno: 524207,
            in_app: true,
          },
          {
            filename: '/polyfills.931b4c31969683ac.js',
            function: 'v.invokeTask',
            lineno: 1,
            colno: 7233,
            in_app: true,
          },
          {
            filename: '/main.bc0e3714db64c955.js',
            function: '_o.x',
            lineno: 1,
            colno: 151119,
            in_app: true,
          },
          {
            filename: '/main.bc0e3714db64c955.js',
            function: '_o.<anonymous>',
            lineno: 1,
            colno: 5698,
            in_app: true,
          },
          {
            filename: '/main.bc0e3714db64c955.js',
            function: 'a',
            lineno: 1,
            colno: 494209,
            in_app: true,
          },
          {
            filename: '/main.bc0e3714db64c955.js',
            function: 'wg',
            lineno: 1,
            colno: 494047,
            in_app: true,
          },
          {
            filename: '/1835.53a456a58b808362.js',
            function: '?',
            lineno: 1,
            colno: 2867,
            in_app: true,
          },
          {
            filename: '/1835.53a456a58b808362.js',
            function: 'n.throwUnhandledException',
            lineno: 1,
            colno: 283,
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

  it('should remove current server url from frame filename', async () => {
    const serverUrl = 'https://sentry.io';
    getCurrentServerUrlSpy.mockImplementation(() => serverUrl);
    const frame = { filename: `${serverUrl}/polyfills.js` };
    const error = { values: [{ stacktrace: { frames: [frame] } }] };
    const event = await processEvent({ exception: error }) as Event;
    const firstFrame = (firstStackTraceFromEvent(event) as Stacktrace).frames?.pop();
    expect(firstFrame?.filename).toBe('/polyfills.js');;
  });

});
