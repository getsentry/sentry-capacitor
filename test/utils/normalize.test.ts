import { getClient } from '@sentry/core';

jest.mock('@sentry/core', () => ({
  getClient: jest.fn(),
}));
import { convertToNormalizedObject } from '../../src/utils/normalize';

describe('normalize', () => {
  describe('convertToNormalizedObject', () => {
    beforeEach(() => {
      (getClient as jest.Mock).mockReturnValue({
          getOptions: jest.fn().mockReturnValue({
              normalizeDepth: undefined,
              normalizeMaxBreadth: undefined,
          }),
      });
    });

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

    test('respect normalizeDepth and normalizeMaxBreadth when set', () => {
      (getClient as jest.Mock).mockReturnValue({
        getOptions: jest.fn().mockReturnValue({
          normalizeDepth: 2,
          normalizeMaxBreadth: 3,
        })
      });
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
