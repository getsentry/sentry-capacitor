import { fillTyped, restorefillTyped } from '../../src/utils/fill';

describe('fill utilities', () => {
  let testObject: { testMethod: () => string; anotherMethod: (arg: string) => string };
  let originalTestMethod: () => string;
  let originalAnotherMethod: (arg: string) => string;

  beforeEach(() => {
    testObject = {
      testMethod: () => 'original',
      anotherMethod: (arg: string) => `original-${arg}`,
    };
    originalTestMethod = testObject.testMethod;
    originalAnotherMethod = testObject.anotherMethod;
  });

  describe('fillTyped', () => {
    it('should replace method with wrapped version', () => {
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `wrapped-${original()}`;
      });

      expect(testObject.testMethod()).toBe('wrapped-original');
      expect(testObject.testMethod).not.toBe(originalTestMethod);
    });

    it('should preserve original method functionality in wrapper', () => {
      fillTyped(testObject, 'anotherMethod', (original) => (arg: string) => {
        return `wrapped-${original(arg)}`;
      });

      expect(testObject.anotherMethod('test')).toBe('wrapped-original-test');
    });

    it('should allow multiple fills on the same method', () => {
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `first-${original()}`;
      });

      fillTyped(testObject, 'testMethod', (original) => () => {
        return `second-${original()}`;
      });

      expect(testObject.testMethod()).toBe('second-first-original');
    });

    it('should maintain proper this context', () => {
      const contextObject = {
        value: 'context-value',
        getValue: function() { return this.value; },
      };

      fillTyped(contextObject, 'getValue', (original) => function(this: typeof contextObject) {
        return `wrapped-${original.call(this)}`;
      });

      expect(contextObject.getValue()).toBe('wrapped-context-value');
    });
  });

  describe('restorefillTyped', () => {
    it('should restore original method after fill', () => {
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `wrapped-${original()}`;
      });

      expect(testObject.testMethod()).toBe('wrapped-original');

      restorefillTyped(testObject, 'testMethod');

      expect(testObject.testMethod()).toBe('original');
      expect(testObject.testMethod).toBe(originalTestMethod);
    });

    it('should restore original method after multiple fills', () => {
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `first-${original()}`;
      });

      fillTyped(testObject, 'testMethod', (original) => () => {
        return `second-${original()}`;
      });

      expect(testObject.testMethod()).toBe('second-first-original');

      // With Sentry's fill, multiple fills create a chain, and getOriginalFunction
      // only gets the immediate previous function, not the root original
      restorefillTyped(testObject, 'testMethod');

      // After one restore, we should get the first wrapped function
      expect(testObject.testMethod()).toBe('first-original');

      // Restore again to get the original
      restorefillTyped(testObject, 'testMethod');
      expect(testObject.testMethod()).toBe('original');
      expect(testObject.testMethod).toBe(originalTestMethod);
    });

    it('should work with methods that have parameters', () => {
      fillTyped(testObject, 'anotherMethod', (original) => (arg: string) => {
        return `wrapped-${original(arg)}`;
      });

      expect(testObject.anotherMethod('test')).toBe('wrapped-original-test');

      restorefillTyped(testObject, 'anotherMethod');

      expect(testObject.anotherMethod('test')).toBe('original-test');
      expect(testObject.anotherMethod).toBe(originalAnotherMethod);
    });

    it('should handle restoring method that was not filled', () => {
      // This should not throw an error
      expect(() => restorefillTyped(testObject, 'testMethod')).not.toThrow();

      // Method should remain unchanged when there's nothing to restore
      expect(testObject.testMethod).toBe(originalTestMethod);
      expect(testObject.testMethod()).toBe('original');
    });

    it('should handle multiple restore calls gracefully', () => {
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `wrapped-${original()}`;
      });

      restorefillTyped(testObject, 'testMethod');
      const restoredMethod = testObject.testMethod;

      // Second restore should not change anything since it's already restored
      restorefillTyped(testObject, 'testMethod');
      expect(testObject.testMethod).toBe(restoredMethod);
    });
  });

  describe('integration tests', () => {
    it('should allow fill after restore', () => {
      // Fill
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `first-${original()}`;
      });
      expect(testObject.testMethod()).toBe('first-original');

      // Restore
      restorefillTyped(testObject, 'testMethod');
      expect(testObject.testMethod()).toBe('original');

      // Fill again
      fillTyped(testObject, 'testMethod', (original) => () => {
        return `second-${original()}`;
      });
      expect(testObject.testMethod()).toBe('second-original');
    });
  });
});
