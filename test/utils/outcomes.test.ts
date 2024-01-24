import type { Outcome } from '@sentry/types';

import { mergeOutcomes } from '../../src/utils/outcome';

describe('mergeOutcomes', () => {
  test('merge same outcomes into one incrementing the quantity', () => {
    const outcome1: Outcome[] =
      [{
        reason: 'before_send',
        category: 'error',
        quantity: 1,
      }];
    const outcome2: Outcome[] =
      [{
        reason: 'before_send',
        category: 'error',
        quantity: 1,
      }];
    const expectedOutcome: Outcome[] = [{
      reason: 'before_send',
      category: 'error',
      quantity: 2,
    }];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });

  test('merge different outcomes into separated outcomes', () => {
    const outcome1: Outcome[] =
      [{
        reason: 'before_send',
        category: 'error',
        quantity: 1,
      }];
    const outcome2: Outcome[] =
      [{
        reason: 'event_processor',
        category: 'error',
        quantity: 1,
      }];
    const expectedOutcome: Outcome[] = [{
      reason: 'before_send',
      category: 'error',
      quantity: 1,
    },
    {
      reason: 'event_processor',
      category: 'error',
      quantity: 1,
    }];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });

  test('merge outcomes when first outcome is empty', () => {
    const outcome1: Outcome[] = [];
    const outcome2: Outcome[] =
      [{
        reason: 'before_send',
        category: 'error',
        quantity: 1,
      }];
    const expectedOutcome: Outcome[] = [{
      reason: 'before_send',
      category: 'error',
      quantity: 1,
    }];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });

  test('merge outcomes when second outcome is empty', () => {
    const outcome1: Outcome[] =
      [{
        reason: 'event_processor',
        category: 'error',
        quantity: 1,
      }];
    const expectedOutcome: Outcome[] = [{
      reason: 'event_processor',
      category: 'error',
      quantity: 1,
    }];
    const outcome2: Outcome[] = [];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });

  test('empty outcomes return an array of empty outcomes', () => {
    const outcome1: Outcome[] = [];
    const expectedOutcome: Outcome[] = [];
    const outcome2: Outcome[] = [];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });

  test('same outocmes but different category into separated outcomes', () => {
    const outcome1: Outcome[] =
      [{
        reason: 'before_send',
        category: 'error',
        quantity: 1,
      }];
    const outcome2: Outcome[] =
      [{
        reason: 'before_send',
        category: 'default',
        quantity: 1,
      }];
    const expectedOutcome: Outcome[] = [{
      reason: 'before_send',
      category: 'error',
      quantity: 1,
    },
    {
      reason: 'before_send',
      category: 'default',
      quantity: 1,
    }];
    const finalOutcomes = mergeOutcomes(outcome1, outcome2);

    expect(finalOutcomes).toStrictEqual(expectedOutcome);
  });
});
