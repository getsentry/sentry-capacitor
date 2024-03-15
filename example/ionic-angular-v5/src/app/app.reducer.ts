import { createReducer, on } from '@ngrx/store';
import * as AppActions from './app.actions';
import * as Sentry from '@sentry/capacitor';
export interface AppState {
  counter: number;
}

export const initialState: AppState = {
  counter: 0
};

export const appReducer = createReducer(
  initialState,
  on(AppActions.increment, state => ({ ...state, counter: state.counter + 1 })),
  on(AppActions.decrement, state => ({ ...state, counter: state.counter - 1 })),
  on(AppActions.logError, (state, { error }) => {
    // Dispatch the error to Sentry
    Sentry.captureException(error);
    return state;
  })
);
