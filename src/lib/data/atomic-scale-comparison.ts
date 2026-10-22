import { objects } from './science';

function measurement(id: string) {
	const item = objects.find((object) => object.id === id);
	if (!item) throw new Error(`Missing sourced scale measurement: ${id}`);
	return item;
}

// Reuse the existing source-linked SI measurements without changing the explorer.
export const atomReference = measurement('atom');
export const tableTennisBall = measurement('ball');
export const moonReference = measurement('moon');
export const MODEL_ATOM_LENGTH_METERS = 0.01;
export const ATOM_BALL_LENGTH_RATIO = tableTennisBall.meters / atomReference.meters;
export const ATOM_MODEL_FACTOR = MODEL_ATOM_LENGTH_METERS / atomReference.meters;
export const ENLARGED_BALL_METERS = tableTennisBall.meters * ATOM_MODEL_FACTOR;
export const MOON_TO_ENLARGED_BALL_RATIO = moonReference.meters / ENLARGED_BALL_METERS;
