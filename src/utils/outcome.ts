import type { Outcome } from '@sentry/types';

/**
 * Merges buffer with new outcomes.
 */
export function mergeOutcomes(...merge: Outcome[][]): Outcome[] {
  let counter = 0;
  const map = new Map<string, number>();
  const outcomes: Outcome[] = [];

  const process = (outcome: Outcome): void => {
    const key = `${outcome.reason}:${outcome.category}`;
    const index = map.get(key);
    if (typeof(index) !== "undefined") {
      outcomes[index].quantity += outcome.quantity;
    } else {
      map.set(key, counter++);
      outcomes.push(outcome);
    }
  };

  merge.forEach(outcomes => outcomes.forEach(process));
  return outcomes;
}
