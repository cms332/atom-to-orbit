export const REFERENCE_PIXELS = 180;
export const REFERENCE_WIDTH_RATIO = 2.6;
export const SCENE_PADDING = 96;
export const SCENE_HEADROOM = 64;

/** One camera scale for every subject; leave room for Saturn's rings on narrow screens. */
export function sceneReference(width: number): number {
	if (!Number.isFinite(width) || width <= 0)
		throw new RangeError('positive viewport width required');
	return Math.min(REFERENCE_PIXELS, width / REFERENCE_WIDTH_RATIO);
}

/** A decade of camera travel divides every object's rendered length by ten. */
export function sceneLength(
	meters: number,
	exponent: number,
	referencePixels = REFERENCE_PIXELS
): number {
	if (
		!Number.isFinite(meters) ||
		meters <= 0 ||
		!Number.isFinite(exponent) ||
		!Number.isFinite(referencePixels) ||
		referencePixels <= 0
	)
		throw new RangeError('positive length and finite exponent required');
	return referencePixels * 10 ** (Math.log10(meters) - exponent);
}

/** Visible lower surface of a circle larger than the viewport, without huge SVG coordinates. */
export function circleSurface(
	radius: number,
	centerX: number,
	baseline: number,
	width: number
): string {
	const points = Array.from({ length: 49 }, (_, i) => {
		const x = width * (1 - i / 48);
		const dx = x - centerX;
		// Rationalized form avoids subtracting nearly equal values at atomic camera scales.
		const y = baseline - (dx * dx) / (radius + Math.sqrt(Math.max(0, radius * radius - dx * dx)));
		return `${x},${y}`;
	});
	return `M0,0H${width}L${points.join('L')}Z`;
}
