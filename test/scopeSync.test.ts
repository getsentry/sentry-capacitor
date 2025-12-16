jest.mock('../src/wrapper', () => jest.requireActual('./mockWrapper'));
import type { Breadcrumb } from '@sentry/core';
import { Scope } from '@sentry/core';
import { disableSyncToNative, enableSyncToNative } from '../src/scopeSync';
import { NATIVE } from './mockWrapper';

jest.mock('../src/wrapper');

describe('ScopeSync', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('scope apis', () => {
    let scope: Scope;

    beforeEach(() => {
      scope = new Scope();
      enableSyncToNative(scope);
    });

    describe('addBreadcrumb', () => {
      it('it only syncs once per scope', () => {
        enableSyncToNative(scope);
        enableSyncToNative(scope);

        scope.addBreadcrumb({ message: 'test' });

        expect(NATIVE.addBreadcrumb).toHaveBeenCalledTimes(1);
      });

      it('adds default level if no level specified', () => {
        const breadcrumb = {
          message: 'test',
          timestamp: 1234,
        };
        scope.addBreadcrumb(breadcrumb);
        expect(scope.getLastBreadcrumb()).toEqual({
          message: 'test',
          timestamp: 1234,
          level: 'info',
        });
      });

      it('adds timestamp to breadcrumb without timestamp', () => {
        const breadcrumb = {
          message: 'test',
        };
        scope.addBreadcrumb(breadcrumb);
        expect(scope.getLastBreadcrumb()).toEqual(
          expect.objectContaining(<Breadcrumb>{ timestamp: expect.any(Number) }),
        );
      });

      it('passes breadcrumb with timestamp to native', () => {
        const breadcrumb = {
          message: 'test',
        };
        scope.addBreadcrumb(breadcrumb);
        expect(NATIVE.addBreadcrumb).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        );
      });

      test('undefined breadcrumb data is not normalized when passing to the native layer', () => {
        const breadcrumb: Breadcrumb = {
          data: undefined,
        };
        scope.addBreadcrumb(breadcrumb);
        expect(NATIVE.addBreadcrumb).toHaveBeenCalledWith(
          expect.objectContaining({
            data: undefined,
          }),
        );
      });

      test('object is normalized when passing to the native layer', () => {
        const breadcrumb: Breadcrumb = {
          data: {
            foo: NaN,
          },
        };
        scope.addBreadcrumb(breadcrumb);
        expect(NATIVE.addBreadcrumb).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { foo: '[NaN]' },
          }),
        );
      });

      test('not object data is converted to object', () => {
        const breadcrumb: Breadcrumb = {
          data: 'foo' as unknown as object,
        };
        scope.addBreadcrumb(breadcrumb);
        expect(NATIVE.addBreadcrumb).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { value: 'foo' },
          }),
        );
      });
    });
  });


  describe('disableSyncToNative', () => {
    let scope: Scope;

    beforeEach(() => {
      scope = new Scope();
    });

    it('should restore original functions after disabling sync', () => {
      const originalSetUser = scope.setUser;
      const originalSetTag = scope.setTag;
      const originalSetTags = scope.setTags;
      const originalSetExtra = scope.setExtra;
      const originalSetExtras = scope.setExtras;
      const originalAddBreadcrumb = scope.addBreadcrumb;
      const originalClearBreadcrumbs = scope.clearBreadcrumbs;
      const originalSetContext = scope.setContext;

      // Enable sync (functions should be wrapped)
      enableSyncToNative(scope);
      expect(scope.setUser).not.toBe(originalSetUser);
      expect(scope.setTag).not.toBe(originalSetTag);
      expect(scope.setTags).not.toBe(originalSetTags);
      expect(scope.setExtra).not.toBe(originalSetExtra);
      expect(scope.setExtras).not.toBe(originalSetExtras);
      expect(scope.addBreadcrumb).not.toBe(originalAddBreadcrumb);
      expect(scope.clearBreadcrumbs).not.toBe(originalClearBreadcrumbs);
      expect(scope.setContext).not.toBe(originalSetContext);

      // Disable sync (functions should be restored)
      disableSyncToNative(scope);
      expect(scope.setUser).toBe(originalSetUser);
      expect(scope.setTag).toBe(originalSetTag);
      expect(scope.setTags).toBe(originalSetTags);
      expect(scope.setExtra).toBe(originalSetExtra);
      expect(scope.setExtras).toBe(originalSetExtras);
      expect(scope.addBreadcrumb).toBe(originalAddBreadcrumb);
      expect(scope.clearBreadcrumbs).toBe(originalClearBreadcrumbs);
      expect(scope.setContext).toBe(originalSetContext);
    });

    it('should not call native methods after disabling sync', () => {
      enableSyncToNative(scope);
      disableSyncToNative(scope);

      // Clear any calls made during sync setup
      jest.clearAllMocks();

      scope.setUser({ id: '123' });
      scope.setTag('key', 'value');
      scope.setTags({ key1: 'value1', key2: 'value2' });
      scope.setExtra('key', 'value');
      scope.setExtras({ key1: 'value1', key2: 'value2' });
      scope.addBreadcrumb({ message: 'test' });
      scope.clearBreadcrumbs();
      scope.setContext('key', { data: 'value' });

      expect(NATIVE.setUser).not.toHaveBeenCalled();
      expect(NATIVE.setTag).not.toHaveBeenCalled();
      expect(NATIVE.setExtra).not.toHaveBeenCalled();
      expect(NATIVE.addBreadcrumb).not.toHaveBeenCalled();
      expect(NATIVE.clearBreadcrumbs).not.toHaveBeenCalled();
      expect(NATIVE.setContext).not.toHaveBeenCalled();
    });

    it('should do nothing if scope was not previously synced', () => {
      const newScope = new Scope();
      const originalSetUser = newScope.setUser;

      // Should not throw and should not change anything
      expect(() => disableSyncToNative(newScope)).not.toThrow();
      expect(newScope.setUser).toBe(originalSetUser);
    });

    it('should handle multiple disable calls gracefully', () => {
      enableSyncToNative(scope);

      disableSyncToNative(scope);
      const restoredSetUser = scope.setUser;

      // Second disable should not change anything
      disableSyncToNative(scope);
      expect(scope.setUser).toBe(restoredSetUser);
    });
  });
});
