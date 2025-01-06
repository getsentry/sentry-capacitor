import * as SentryCore from '@sentry/core';

import { enableSyncToNative } from '../../src/scopeSync';
import { convertToNormalizedObject } from '../../src/utils/normalize';
import { getDefaultTestClientOptions, TestClient } from '../mocks/client';

describe('normalize', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('convertToNormalizedObject', () => {
    test('output equals input for normalized objects', () => {
      const actualResult = convertToNormalizedObject({ foo: 'bar' });
      expect(actualResult).toEqual({ foo: 'bar' });
    });

    test('converted output is normalized', () => {
      const actualResult = convertToNormalizedObject({ foo: NaN });
      expect(actualResult).toEqual({ foo: '[NaN]' });
    });

    test('converts a value to an object', () => {
      const actualResult = convertToNormalizedObject('foo');
      expect(actualResult).toEqual({ value: 'foo' });
    });

    test('converts null to an object', () => {
      const actualResult = convertToNormalizedObject(null);
      expect(actualResult).toEqual({ value: null });
    });

    test('converts array to an object', () => {
      const actualResult = convertToNormalizedObject([]);
      expect(actualResult).toEqual([]);
    });

    test('converts custom class to an object', () => {
      class TestClass {
        test: string = 'foo';
      }
      const actualResult = convertToNormalizedObject(new TestClass());
      expect(actualResult).toEqual({ test: 'foo' });
    });

    test('respect normalizeDepth and normalizeMaxBreadth when set', () => {
      SentryCore.setCurrentClient(new TestClient(getDefaultTestClientOptions({ normalizeDepth: 2, normalizeMaxBreadth: 3})));
      enableSyncToNative(SentryCore.getIsolationScope());

      const obj = {
        key1: '1',
        keyparent: {
          child1: '1',
          childparent2: {
            child1: '1'
          },
          child2: '2',
          child3: '3'
        },
        key2: '2',
        key3: '3',
      };
      const expectedObj = {
        key1: '1',
        keyparent: {
          child1: '1',
          childparent2: '[Object]',
          child2: '2',
          child3: '[MaxProperties ~]'
        },
        key2: '2',
        key3: '[MaxProperties ~]',
      }

      const actualResult = convertToNormalizedObject(obj);
      expect((actualResult)).toStrictEqual(expectedObj);
    });
  });
});
