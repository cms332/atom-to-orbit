/** Hydrogen 1s, fixed nucleus. x = r/a₀; densities are per unit x. */
export function spatialDensity(x: number): number {
	return Math.exp(-2 * Math.max(0, x));
}

export function radialDensity(x: number): number {
	return x < 0 ? 0 : 4 * x * x * Math.exp(-2 * x);
}

export function radialCdf(x: number): number {
	return x <= 0 ? 0 : 1 - Math.exp(-2 * x) * (1 + 2 * x + 2 * x * x);
}

export function shellProbability(center: number, halfWidth = 0.1): number {
	return radialCdf(center + halfWidth) - radialCdf(Math.max(0, center - halfWidth));
}

/** A logarithmic zoom control; the drawing itself always uses a linear metre axis. */
export function scaleViewSpan(zoom: number, closeUpSpan = 0.04): number {
	return 400 * (closeUpSpan / 400) ** Math.max(0, Math.min(1, zoom));
}

export function modelLengthLabel(meters: number): string {
	return meters < 1
		? `${Number((meters * 100).toPrecision(3))}cm`
		: `${Number(meters.toPrecision(3))}m`;
}
