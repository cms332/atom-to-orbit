import { MAX_ORBIT_YEARS, type OrbitPlanet } from '$lib/data/orbits';
import { refineTrail, type TrailProjection } from './refine-trail';
import {
	orbitPeriod,
	solarAUPerYear,
	worldPosition,
	type OrbitFrame,
	type Vec3
} from '$lib/utils/orbit-model';

/** Fixed historical times, with live endpoints and per-frame Sun rebasing.
 * Reuse past orbital calculations and output vectors while the camera follows a body.
 */
export function createTrackingTrail(planet?: OrbitPlanet) {
	const history = new Map<number, Vec3>();
	const points: Vec3[] = [];
	const times: number[] = [];
	const fractions: number[] = [];
	const refinedHistory = new Map<number, Vec3>();
	const quality = { maxError: 0, budgetLimited: false, added: 0 };
	const period = planet ? orbitPeriod(planet) : 1;
	let key = '';
	let previousTime = -Infinity;
	let step = 1;
	function sample(
		now: number,
		span: number,
		frame: OrbitFrame,
		speedFactor: number,
		maxPoints = 2048,
		projection?: TrailProjection
	): Vec3[] {
		if (
			!Number.isFinite(now) ||
			now < 0 ||
			now > MAX_ORBIT_YEARS ||
			!Number.isFinite(span) ||
			span <= 0 ||
			!Number.isInteger(maxPoints) ||
			maxPoints < 2 ||
			!Number.isFinite(speedFactor)
		)
			throw new RangeError('Valid model time, positive span and bounded sample count required');
		const nextKey = `${span}|${frame}|${speedFactor}|${maxPoints}|${Boolean(projection)}`;
		if (nextKey !== key || now < previousTime) {
			history.clear();
			refinedHistory.clear();
			// Leave room for both live boundaries, including a fractional final segment.
			const coarseLimit = projection ? Math.max(1, Math.floor((maxPoints - 1) / 2)) : maxPoints - 1;
			const count = Math.min(coarseLimit, Math.max(64, Math.ceil((span / period) * 96)));
			step = span / count;
			key = nextKey;
		}
		previousTime = now;
		const start = Math.max(0, now - span);
		const first = Math.floor(start / step) + 1;
		const last = Math.ceil(now / step) - 1;
		for (const index of history.keys()) if (index < first || index > last) history.delete(index);
		const offset = frame === 'galactic' ? solarAUPerYear(speedFactor) * now : 0;
		let used = 0;
		function append(position: Vec3, time: number) {
			const point = points[used] ?? (points[used] = [0, 0, 0]);
			point[0] = position[0];
			point[1] = position[1];
			point[2] = position[2] + offset;
			times[used] = time;
			used++;
		}
		append(worldPosition(planet, start, frame, speedFactor), start);
		for (let index = first; index <= last; index++) {
			let position = history.get(index);
			if (!position) {
				position = worldPosition(planet, index * step, frame, speedFactor);
				history.set(index, position);
			}
			append(position, index * step);
		}
		if (now > start) append(worldPosition(planet, now, frame, speedFactor), now);
		points.length = used;
		quality.maxError = 0;
		quality.budgetLimited = false;
		quality.added = 0;
		if (projection && used > 1) {
			for (const time of refinedHistory.keys())
				if (time <= start || time >= now) refinedHistory.delete(time);
			function at(time: number): Vec3 {
				let position = refinedHistory.get(time);
				if (!position) {
					position = worldPosition(planet, time, frame, speedFactor);
					if (refinedHistory.size >= maxPoints * 2)
						refinedHistory.delete(refinedHistory.keys().next().value!);
					refinedHistory.set(time, position);
				}
				return [position[0], position[1], position[2] + offset];
			}
			const refined = refineTrail(
				points.map((position, index) => ({ time: times[index], position: [...position] as Vec3 })),
				at,
				projection,
				maxPoints + 1
			);
			quality.maxError = refined.maxError;
			quality.budgetLimited = refined.budgetLimited;
			quality.added = refined.added;
			used = 0;
			for (const node of refined.nodes) {
				const point = points[used] ?? (points[used] = [0, 0, 0]);
				point[0] = node.position[0];
				point[1] = node.position[1];
				point[2] = node.position[2];
				times[used++] = node.time;
			}
			points.length = used;
		}
		fractions.length = used;
		for (let index = 0; index < used; index++)
			fractions[index] = now > start ? (times[index] - start) / (now - start) : 0;
		return points;
	}
	return Object.assign(sample, { fractions, quality });
}
