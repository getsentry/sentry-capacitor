// import { getCurrentHub } from '@sentry/core';
// import { Integration, Severity } from '@sentry/types';
// import { logger } from '@sentry/utils';

// import { CapacitorClient } from '../client';

// /**
//  * CapacitorErrorHandlers Options
//  */
// interface CapacitorErrorHandlersOptions {
//   onerror: boolean;
//   onunhandledrejection: boolean;
// }

// declare const global: any;

// /**
//  * CapacitorErrorHandlers Integration
//  */
// export class CapacitorErrorHandlers implements Integration {
//   /**
//    * @inheritDoc
//    */
//   public static id: string = 'CapacitorErrorHandlers';

//   /**
//    * @inheritDoc
//    */
//   public name: string = CapacitorErrorHandlers.id;

//   /**
//    * CapacitorOptions
//    */
//   private readonly _options: CapacitorErrorHandlersOptions;

//   public constructor(options?: CapacitorErrorHandlersOptions) {
//     this._options = {
//       onerror: true,
//       onunhandledrejection: true,
//       ...options,
//     };
//   }

//   /**
//    * @inheritDoc
//    */
//   public setupOnce(): void {
//     this._handleUnhandledRejections();
//     this._handleOnError();
//   }

//   /**
//    * Handle Promises
//    */
//   private _handleUnhandledRejections(): void {
//     if (this._options.onunhandledrejection) {
//       const tracking: {
//         disable: () => void;
//         enable: (arg: unknown) => void;
//       } = require('promise/setimmediate/rejection-tracking');
//       tracking.disable();
//       tracking.enable({
//         allRejections: true,
//         onHandled: () => {
//           // We do nothing
//         },
//         onUnhandled: (id: any, error: any) => {
//           if (global.__DEV__) {
//             // eslint-disable-next-line no-console
//             console.warn(id, error);
//           }

//           getCurrentHub().captureException(error, {
//             data: { id },
//             originalException: error,
//           });
//         },
//       });
//     }
//   }

//   /**
//    * Handle erros
//    */
//   private _handleOnError(): void {
//     if (this._options.onerror) {
//       let handlingFatal = false;

//       const defaultHandler =
//         global.ErrorUtils.getGlobalHandler &&
//         global.ErrorUtils.getGlobalHandler();

//       global.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
//         // We want to handle fatals, but only in production mode.
//         const shouldHandleFatal = isFatal && !global.__DEV__;
//         if (shouldHandleFatal) {
//           if (handlingFatal) {
//             logger.log(
//               'Encountered multiple fatals in a row. The latest:',
//               error,
//             );
//             return;
//           }
//           handlingFatal = true;
//         }

//         getCurrentHub().withScope(scope => {
//           if (isFatal) {
//             scope.setLevel(Severity.Fatal);
//           }
//           getCurrentHub().captureException(error, {
//             originalException: error,
//           });
//         });

//         const client = getCurrentHub().getClient<CapacitorClient>();
//         // If in dev, we call the default handler anyway and hope the error will be sent
//         // Just for a better dev experience
//         if (client && !global.__DEV__) {
//           void client
//             .flush(client.getOptions().shutdownTimeout || 2000)
//             .then(() => {
//               defaultHandler(error, isFatal);
//             });
//         } else {
//           // If there is no client something is fishy, anyway we call the default handler
//           defaultHandler(error, isFatal);
//         }
//       });
//     }
//   }
// }
