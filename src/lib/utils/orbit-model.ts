import {
	AU_METERS,
	YEAR_SECONDS,
	SOLAR_SPEED_KM_S,
	MAX_ORBIT_YEARS,
	type OrbitPlanet
} from '$lib/data/orbits';

export type Vec3 = [number, number, number];
export type OrbitFrame = 'solar' | 'galactic';
export const RAD = Math.PI / 180;
/** Conventional ICRS -> Galactic rotation (ERFA/Hipparcos), rounded constants.
 * Source and full license: /licenses/erfa-icrs2g.txt.
 */
export const EQUATORIAL_TO_GALACTIC = [
	[-0.0548755604162154, -0.873437090234885, -0.483835015548713],
	[0.494109427875584, -0.444829629960011, 0.746982244497219],
	[-0.867666149019005, -0.198076373431202, 0.455983776175067]
] as const;

export function solveKepler(mean: number, eccentricity: number): number {
	if (
		!Number.isFinite(mean) ||
		!Number.isFinite(eccentricity) ||
		eccentricity < 0 ||
		eccentricity >= 1
	)
		throw new RangeError('elliptic elements required');
	const m = ((((mean + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
	let e = m;
	for (let n = 0; n < 16; n++) {
		const delta = (e - eccentricity * Math.sin(e) - m) / (1 - eccentricity * Math.cos(e));
		e -= delta;
		if (Math.abs(delta) < 1e-12) break;
	}
	return e;
}

export function elementsAt(planet: OrbitPlanet, years: number) {
	if (!Number.isFinite(years) || years < 0 || years > MAX_ORBIT_YEARS)
		throw new RangeError('J2000 + 0–40 years required');
	const t = years / 100;
	const value = (pair: readonly [number, number]) => pair[0] + pair[1] * t;
	return {
		a: planet.semiMajorAxisMeters / AU_METERS + planet.a[1] * t,
		e: value(planet.e),
		i: value(planet.i) * RAD,
		l: value(planet.l) * RAD,
		peri: value(planet.peri) * RAD,
		node: value(planet.node) * RAD
	};
}

/** Position in J2000 ecliptic AU. Optional E traces the osculating ellipse. */
export function eclipticPosition(
	planet: OrbitPlanet,
	years: number,
	eccentricAnomaly?: number
): Vec3 {
	const el = elementsAt(planet, years);
	const E = eccentricAnomaly ?? solveKepler(el.l - el.peri, el.e);
	const x = el.a * (Math.cos(E) - el.e);
	const y = el.a * Math.sqrt(1 - el.e ** 2) * Math.sin(E);
	const w = el.peri - el.node;
	const cw = Math.cos(w),
		sw = Math.sin(w),
		cn = Math.cos(el.node),
		sn = Math.sin(el.node),
		ci = Math.cos(el.i),
		si = Math.sin(el.i);
	return [
		(cw * cn - sw * sn * ci) * x + (-sw * cn - cw * sn * ci) * y,
		(cw * sn + sw * cn * ci) * x + (-sw * sn + cw * cn * ci) * y,
		sw * si * x + cw * si * y
	];
}

/** Right-handed rendering axes: X = l0, Y = Galactic north, Z = -l90. */
export function eclipticToWorld([x, y, z]: Vec3): Vec3 {
	const eps = 23.43928 * RAD;
	const equatorial = [
		x,
		y * Math.cos(eps) - z * Math.sin(eps),
		y * Math.sin(eps) + z * Math.cos(eps)
	];
	const galactic = EQUATORIAL_TO_GALACTIC.map((row) =>
		row.reduce((sum, v, index) => sum + v * equatorial[index], 0)
	);
	return [galactic[0], galactic[2], -galactic[1]];
}

export function solarAUPerYear(speedFactor = 1): number {
	return ((SOLAR_SPEED_KM_S * 1000 * YEAR_SECONDS) / AU_METERS) * speedFactor;
}

/** Physical position in the local fixed frame; origin is the Sun at J2000. */
export function worldPosition(
	planet: OrbitPlanet | undefined,
	years: number,
	frame: OrbitFrame,
	speedFactor: number
): Vec3 {
	const position: Vec3 = planet ? eclipticToWorld(eclipticPosition(planet, years)) : [0, 0, 0];
	if (frame === 'galactic') position[2] -= solarAUPerYear(speedFactor) * years;
	return position;
}

/** Render rebasing follows today's model Sun, without rotating or bending paths. */
export function scenePosition(
	planet: OrbitPlanet | undefined,
	years: number,
	now: number,
	frame: OrbitFrame,
	speedFactor: number
): Vec3 {
	const position = worldPosition(planet, years, frame, speedFactor);
	if (frame === 'galactic') position[2] += solarAUPerYear(speedFactor) * now;
	return position;
}

export function orbitPeriod(planet: OrbitPlanet): number {
	// Sidereal period from inertial mean longitude, not the anomalistic period.
	return 36000 / planet.l[1];
}

export function trailPositions(
	planet: OrbitPlanet | undefined,
	now: number,
	span: number,
	frame: OrbitFrame,
	speedFactor: number,
	maxPoints = 2048
): Vec3[] {
	const duration = Math.min(span, now);
	const period = planet ? orbitPeriod(planet) : 1;
	// At least 64 samples per revolution of the fastest planets; bounded for mobile.
	const count = Math.min(maxPoints, Math.max(64, Math.ceil((duration / period) * 96)));
	return Array.from({ length: count + 1 }, (_, n) =>
		scenePosition(planet, now - duration + (duration * n) / count, now, frame, speedFactor)
	);
}
