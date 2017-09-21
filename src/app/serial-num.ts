import { ActionReducer, Action } from '@ngrx/store';

export const UPDATE_SERIALNUM = 'UPDATE_SERIALNUM';

export function serialNumReducer (state = [], action) {
	switch(action.type) {
		case UPDATE_SERIALNUM:
			return [
				...state,
				action.payload
			];
		default:
			return state;
	}
}