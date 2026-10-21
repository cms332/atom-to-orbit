import { SATURN_DIAMETER_METERS } from '../data/science-planets';

/** Ring radii use the same metre-to-SVG scale as the 100-unit mean body diameter. */
export function ringRadius(radiusKm: number): number {
	if (!Number.isFinite(radiusKm) || radiusKm <= 0)
		throw new RangeError('positive ring radius required');
	return ((radiusKm * 1_000) / SATURN_DIAMETER_METERS) * 100;
}
export function ringBand(innerKm: number, outerKm: number, front = false): string {
	const inner = ringRadius(innerKm),
		outer = ringRadius(outerKm);
	if (inner >= outer) throw new RangeError('inner ring edge must precede outer edge');
	const yi = inner * 0.255,
		yo = outer * 0.255;
	return front
		? `M${50 - outer} 50A${outer} ${yo} 0 0 0 ${50 + outer} 50L${50 + inner} 50A${inner} ${yi} 0 0 1 ${50 - inner} 50Z`
		: `M${50 - outer} 50A${outer} ${yo} 0 1 0 ${50 + outer} 50A${outer} ${yo} 0 1 0 ${50 - outer} 50Z M${50 - inner} 50A${inner} ${yi} 0 1 0 ${50 + inner} 50A${inner} ${yi} 0 1 0 ${50 - inner} 50Z`;
}
