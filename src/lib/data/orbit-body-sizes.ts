import { objects, sourceById } from './science';
import { AU_METERS, orbitPlanets } from './orbits';

// Use the atlas's source-backed volume-mean body diameters, in the same AU as orbital distances.
export const orbitBodySizes = ['sun', ...orbitPlanets.map((planet) => planet.id)].map((id) => {
	const object = objects.find((item) => item.id === id);
	if (!object || object.dimensionKind !== 'diameter' || object.approximation !== 'mean')
		throw new Error(`Missing mean body diameter: ${id}`);
	return {
		id,
		diameterMeters: object.meters,
		radiusAU: object.meters / (2 * AU_METERS),
		source: sourceById(object.sourceId)
	};
});

export const physicalRadiiAU: Readonly<Record<string, number>> = Object.fromEntries(
	orbitBodySizes.map((body) => [body.id, body.radiusAU])
);
