import { createAction, props as poop } from '@ngrx/store';

export const increment = createAction('[Counter Component] Increment');
export const decrement = createAction('[Counter Component] Decrement');
export const logError = createAction('[Error] Log Error', poop<{ error: any }>());
