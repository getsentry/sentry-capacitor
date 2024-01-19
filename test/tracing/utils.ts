import type { TransactionContext, TransactionSource } from '@sentry/types';

export const defaultTransactionSource: TransactionSource = 'component';
export const customTransactionSource: TransactionSource = 'custom';

export const getBlankTransactionContext = (name: string): TransactionContext => {
  return {
    name: 'Route Change',
    op: 'navigation',
    tags: {
      'routing.instrumentation': name,
    },
    data: {},
    metadata: {
      source: defaultTransactionSource,
    },
  };
};
