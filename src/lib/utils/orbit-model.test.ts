import { describe, expect, it } from 'vitest';
import { AU_METERS, MAX_ORBIT_YEARS, orbitPlanets, orbitSources } from '../data/orbits';
import { orbitBodySizes, physicalRadiiAU } from '../data/orbit-body-sizes';
import {
	eclipticPosition,
	eclipticToWorld,
	elementsAt,
	EQUATORIAL_TO_GALACTIC,
	orbitPeriod,
	scenePosition,
	solarAUPerYear,
	solveKepler,
	trailPositions,
	worldPosition
} from './orbit-model';

describe('source-backed independent orbital model', () => {
	it('uses source-backed mean body sizes on the same AU scale as orbital distances', () => {
		expect(orbitBodySizes.map((body) => body.id)).toEqual([
			'sun',
			...orbitPlanets.map((planet) => planet.id)
		]);
		expect(physicalRadiiAU.earth * AU_METERS).toBeCloseTo(6_371_000, 6);
		expect(physicalRadiiAU.sun / physicalRadiiAU.earth).toBeCloseTo(109.2, 1);
		expect(physicalRadiiAU.jupiter / physicalRadiiAU.earth).toBeCloseTo(10.97, 2);
		expect(physicalRadiiAU.venus).toBeLessThan(physicalRadiiAU.earth);
		for (const body of orbitBodySizes) {
			expect(body.radiusAU).toBeGreaterThan(0);
			expect(body.radiusAU * 2 * AU_METERS).toBeCloseTo(body.diameterMeters, 6);
			expect(new URL(body.source.url).protocol).toBe('https:');
		}
	});
	it('contains exactly eight valid elliptic orbits and accessible provenance', () => {
		expect(new Set(orbitPlanets.map((p) => p.id)).size).toBe(8);
		for (const p of orbitPlanets) {
			expect(p.semiMajorAxisMeters / AU_METERS).toBeCloseTo(p.a[0], 12);
			expect(p.sourceId).toBe('jpl-orbits');
			expect(p.a[0]).toBeGreaterThan(0);
			expect(p.e[0]).toBeGreaterThanOrEqual(0);
			expect(p.e[0]).toBeLessThan(1);
		}
		for (const source of orbitSources) expect(new URL(source.url).protocol).toBe('https:');
		expect(AU_METERS).toBe(149597870700);
	});
	it('solves Kepler with small residual, including Mercury eccentricity and negative angles', () => {
		for (const e of [0, 0.0068, 0.0167, 0.2056, 0.8])
			for (const mean of [-3, -1, 0, 1, 3]) {
				const E = solveKepler(mean, e);
				expect(Math.abs(E - e * Math.sin(E) - mean)).toBeLessThan(1e-10);
			}
		expect(() => solveKepler(0, 1)).toThrow();
	});
	it('places J2000 Earth near the expected equinox-referenced position, not arbitrary starting phases', () => {
		const earth = orbitPlanets[2];
		const [x, y, z] = eclipticPosition(earth, 0);
		expect(x).toBeCloseTo(-0.17717, 4);
		expect(y).toBeCloseTo(0.96721, 4);
		expect(z).toBeCloseTo(0, 5);
		expect(orbitPeriod(earth)).toBeCloseTo(1, 3);
		expect(orbitPeriod(orbitPlanets[0])).toBeCloseTo(0.24085, 4);
		expect(orbitPeriod(orbitPlanets[7])).toBeCloseTo(164.79, 1);
	});
	it('has the correct perihelion/aphelion distance at both ends of the supported model interval', () => {
		for (const p of orbitPlanets)
			for (const year of [0, 20, MAX_ORBIT_YEARS]) {
				const el = elementsAt(p, year);
				expect(Math.hypot(...eclipticPosition(p, year, 0))).toBeCloseTo(el.a * (1 - el.e), 10);
				expect(Math.hypot(...eclipticPosition(p, year, Math.PI))).toBeCloseTo(
					el.a * (1 + el.e),
					10
				);
			}
		expect(() => eclipticPosition(orbitPlanets[0], -1)).toThrow();
		expect(() => eclipticPosition(orbitPlanets[0], 41)).toThrow();
	});
	it('rotates orthogonally and puts the ecliptic at about 60 degrees to the Galactic plane', () => {
		for (let a = 0; a < 3; a++)
			for (let b = 0; b < 3; b++)
				expect(
					EQUATORIAL_TO_GALACTIC[a].reduce((sum, v, n) => sum + v * EQUATORIAL_TO_GALACTIC[b][n], 0)
				).toBeCloseTo(a === b ? 1 : 0, 12);
		for (const p of orbitPlanets) {
			const initial = eclipticPosition(p, 4);
			expect(Math.hypot(...eclipticToWorld(initial))).toBeCloseTo(Math.hypot(...initial), 11);
		}
		const normal = eclipticToWorld([0, 0, 1]);
		expect((Math.acos(normal[1]) * 180) / Math.PI).toBeCloseTo(60.19, 1);
		const travelAbovePlane = (Math.asin(Math.abs(normal[2])) * 180) / Math.PI;
		expect(travelAbovePlane).toBeGreaterThan(55);
		expect(travelAbovePlane).toBeLessThan(65);
	});
	it('converts 230 km/s to AU/year and applies visual emphasis only to the common solar translation', () => {
		expect(solarAUPerYear()).toBeCloseTo(48.519, 2);
		expect(solarAUPerYear(0.05)).toBeCloseTo(solarAUPerYear() / 20, 12);
		for (const frame of ['solar', 'galactic'] as const)
			for (const factor of [0.05, 1])
				for (const p of orbitPlanets) {
					const planet = worldPosition(p, 4, frame, factor),
						sun = worldPosition(undefined, 4, frame, factor),
						relative = planet.map((v, n) => v - sun[n]);
					const expected = eclipticToWorld(eclipticPosition(p, 4));
					relative.forEach((v, n) => expect(v).toBeCloseTo(expected[n], 11));
					scenePosition(p, 4, 4, frame, factor).forEach((v, n) =>
						expect(v).toBeCloseTo(expected[n], 11)
					);
				}
	});
	it('constructs past trails in the selected frame, never pre-J2000, and preserves the current endpoint', () => {
		for (const frame of ['solar', 'galactic'] as const)
			for (const p of orbitPlanets) {
				const points = trailPositions(p, 1, 12, frame, 1, 1024);
				expect(points.length).toBeLessThanOrEqual(1025);
				expect(points[0]).toEqual(scenePosition(p, 0, 1, frame, 1));
				expect(points.at(-1)).toEqual(scenePosition(p, 1, 1, frame, 1));
			}
		const solar = trailPositions(undefined, 4, 4, 'galactic', 1);
		expect(solar[0][2]).toBeCloseTo(solarAUPerYear() * 4, 10);
		expect(solar.at(-1)).toEqual([0, 0, 0]);
		const clamped = trailPositions(orbitPlanets[0], 40, 12, 'galactic', 1, 1024);
		expect(clamped.length).toBe(1025);
	});
});
