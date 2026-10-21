import { orbitPlanets, EMPHASIZED_SPEED } from '$lib/data/orbits';
import { orbitPeriod, worldPosition, type OrbitFrame, type Vec3 } from './orbit-model';

const earth = orbitPlanets.find((planet) => planet.id === 'earth')!;
export const MOTION_START_YEAR = 8;
export const MOTION_DURATION = orbitPeriod(earth);
export const MOTION_DISPLAY_FACTOR = EMPHASIZED_SPEED;

/** The galactic diagram has one fixed origin: the Sun at the start of the interval. */
export function motionPositions(phase: number, frame: OrbitFrame) {
	if (!Number.isFinite(phase) || phase < 0 || phase > 1) throw new RangeError('phase 0–1 required');
	const year = MOTION_START_YEAR + phase * MOTION_DURATION;
	const origin = worldPosition(undefined, MOTION_START_YEAR, frame, MOTION_DISPLAY_FACTOR);
	const relative = (position: Vec3): Vec3 => position.map((v, i) => v - origin[i]) as Vec3;
	return {
		year,
		sun: relative(worldPosition(undefined, year, frame, MOTION_DISPLAY_FACTOR)),
		earth: relative(worldPosition(earth, year, frame, MOTION_DISPLAY_FACTOR))
	};
}

type Point = readonly [number, number];
const rawProjection = ([x, y, z]: Vec3): Point => [-z, 0.8 * x + 0.6 * y];
const frames: OrbitFrame[] = ['solar', 'galactic'];
const samples = Object.fromEntries(
	frames.map((frame) => [
		frame,
		Array.from({ length: 181 }, (_, i) => motionPositions(i / 180, frame))
	])
) as Record<OrbitFrame, ReturnType<typeof motionPositions>[]>;
const bounds = Object.fromEntries(
	frames.map((frame) => {
		const points = samples[frame].flatMap((sample) => [
			rawProjection(sample.earth),
			rawProjection(sample.sun)
		]);
		const xs = points.map(([x]) => x),
			ys = points.map(([, y]) => y);
		return [
			frame,
			{ minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
		];
	})
) as Record<OrbitFrame, { minX: number; maxX: number; minY: number; maxY: number }>;
// Both views have the same orthographic direction and the same length scale.
const scale = Math.min(
	...frames.flatMap((frame) => [
		560 / (bounds[frame].maxX - bounds[frame].minX),
		220 / (bounds[frame].maxY - bounds[frame].minY)
	])
);

export function motionScene(frame: OrbitFrame, phase: number) {
	const current = motionPositions(phase, frame);
	const b = bounds[frame];
	const project = (position: Vec3): Point => {
		const [x, y] = rawProjection(position);
		return [320 + (x - (b.minX + b.maxX) / 2) * scale, 155 - (y - (b.minY + b.maxY) / 2) * scale];
	};
	const path = (points: Point[]) =>
		points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(3)},${y.toFixed(3)}`).join(' ');
	const history = samples[frame]
		.filter((_, i) => i / 180 < phase)
		.map((sample) => project(sample.earth));
	return {
		current,
		earth: project(current.earth),
		sun: project(current.sun),
		start: project(samples[frame][0].earth),
		fullPath: path(samples[frame].map((sample) => project(sample.earth))),
		pastPath: path([...history, project(current.earth)]),
		sunPath: path([project(samples[frame][0].sun), project(samples[frame][180].sun)])
	};
}
