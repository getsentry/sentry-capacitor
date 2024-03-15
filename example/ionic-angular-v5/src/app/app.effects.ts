// app.effects.ts
import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as AppActions from './app.actions';
import * as Sentry from '@sentry/capacitor'

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions) {}
  exampleEffect$ =
  createEffect(
    () => this.actions$.pipe(
      ofType('[Example] Load Data'),
      tap(() => {
        console.log('Action One Dispatched');
        throw new Error('Example unhandled error');
      })
    ),
    { dispatch: false }
    // FeatureActions.actionOne is not dispatched
  );



    createEffect(() =>
    this.actions$.pipe(
      ofType('[Example] Load Data'),
      map(() => {
        // Simulate an error
        throw new Error('Example error');
        return
      }))//,
      catchError(error => {

        // Dispatch the error to Sentry
        return of(AppActions.logError({ error }));
      })
    )
  );

}
