import { EARTH_MOON_METERS, objects } from './science';
import { lightSpeed } from './earth-moon-sources';

function diameter(id: string) {
	const object = objects.find((item) => item.id === id);
	if (!object || object.dimensionKind !== 'diameter') {
		throw new Error(`Missing sourced diameter: ${id}`);
	}
	return object;
}

export const earthReference = diameter('earth');
export const moonReference = diameter('moon');
export const earthMoonDistance = {
	meters: EARTH_MOON_METERS,
	dimensionKind: 'distance',
	approximation: 'mean',
	sourceId: 'earth-facts',
	definition: 'Representative Earth–Moon centre-to-centre distance, not a live measurement'
} as const;

// A chosen classroom model, not a claim that every basketball has this diameter.
export const MODEL_EARTH_DIAMETER = 0.24;
export const MODEL_FACTOR = MODEL_EARTH_DIAMETER / earthReference.meters;
export const MODEL_MOON_DIAMETER = moonReference.meters * MODEL_FACTOR;
export const MODEL_CENTER_DISTANCE = earthMoonDistance.meters * MODEL_FACTOR;
export const CENTER_DISTANCE_IN_EARTHS = earthMoonDistance.meters / earthReference.meters;
export const SURFACE_GAP_METERS =
	earthMoonDistance.meters - (earthReference.meters + moonReference.meters) / 2;
export const SURFACE_GAP_IN_EARTHS = SURFACE_GAP_METERS / earthReference.meters;
export const MOONLIGHT_SECONDS = earthMoonDistance.meters / lightSpeed.metersPerSecond;
