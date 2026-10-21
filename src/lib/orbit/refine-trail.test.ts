import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { orbitPlanets } from '../data/orbits';
import { physicalRadiiAU } from '../data/orbit-body-sizes';
import { eclipticPosition, eclipticToWorld, scenePosition, type Vec3 } from '../utils/orbit-model';
import { createTrackingTrail } from './tracking-trail';
import { refineTrail, type TrailProjection } from './refine-trail';

const earth = orbitPlanets.find((planet) => planet.id === 'earth')!;

function closeProjection(year: number, width: number, height: number): TrailProjection {
	const camera = new THREE.PerspectiveCamera(43, width / height, 0.00001, 12000);
	const target = new THREE.Vector3(...eclipticToWorld(eclipticPosition(earth, year)));
	const direction = new THREE.Vector3(...eclipticToWorld([0.2, -0.35, 1])).normalize();
	const right = new THREE.Vector3()
		.crossVectors(new THREE.Vector3(...eclipticToWorld([0, 1, 0])), direction)
		.normalize();
	const baseRight = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
	const baseUp = new THREE.Vector3().crossVectors(direction, baseRight).normalize();
	const roll = Math.atan2(right.dot(baseUp), right.dot(baseRight)) - 0.12;
	const focal = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
	const radius = Math.min(145, Math.min(width, height) * 0.28);
	const distance = (physicalRadiiAU.earth * focal) / radius;
	camera.near = Math.max(physicalRadiiAU.earth * 0.02, (distance - physicalRadiiAU.earth) * 0.25);
	camera.position.copy(target).addScaledVector(direction, distance);
	camera.lookAt(target);
	camera.rotateZ(roll);
	camera.updateMatrixWorld();
	return {
		project(position) {
			const point = new THREE.Vector3(...position).applyMatrix4(camera.matrixWorldInverse);
			const depth = -point.z;
			const scale = focal / Math.max(camera.near, depth);
			return [width / 2 + point.x * scale, height / 2 - point.y * scale, depth];
		},
		near: camera.near,
		left: 0,
		top: 0,
		width,
		height
	};
}

function denseError(points: Vec3[], times: number[], year: number, view: TrailProjection) {
	let maximum = 0;
	for (let index = 0; index < points.length - 1; index++) {
		const a = view.project(points[index]);
		const b = view.project(points[index + 1]);
		if (Math.min(a[2], b[2]) < view.near) continue;
		for (let sample = 1; sample < 8; sample++) {
			const t = times[index] + ((times[index + 1] - times[index]) * sample) / 8;
			const p = view.project(scenePosition(earth, t, year, 'galactic', 0.05));
			if (p[2] < view.near || p[0] < 0 || p[0] > view.width || p[1] < 0 || p[1] > view.height)
				continue;
			const dx = b[0] - a[0],
				dy = b[1] - a[1];
			const u = Math.max(
				0,
				Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))
			);
			maximum = Math.max(maximum, Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy));
		}
	}
	return maximum;
}

describe('projected astronomical trail refinement', () => {
	it('removes close-up chord distortion at sample boundaries using exact Kepler positions', () => {
		let worstBefore = 0,
			worstAfter = 0,
			modelError = 0,
			ordered = true;
		for (const [width, height, limit] of [
			[1903, 447, 2048],
			[390, 370, 1024]
		]) {
			const coarse = createTrackingTrail(earth);
			const adaptive = createTrackingTrail(earth);
			for (let phase = 0; phase < 24; phase++) {
				const year = 8.37 + phase * 0.0010137;
				const view = closeProjection(year, width, height);
				const before = coarse(year, 4, 'galactic', 0.05, limit);
				const coarseError = denseError(
					before,
					coarse.fractions.map((f) => year - 4 + f * 4),
					year,
					view
				);
				if (coarseError > worstBefore) {
					worstBefore = coarseError;
				}
				const points = adaptive(year, 4, 'galactic', 0.05, limit, view);
				const times = adaptive.fractions.map((f) => year - 4 + f * 4);
				worstAfter = Math.max(worstAfter, denseError(points, times, year, view));
				expect(adaptive.quality.budgetLimited).toBe(false);
				expect(points.length).toBeLessThanOrEqual(limit + 1);
				for (let index = 0; index < points.length; index++) {
					const exact = scenePosition(earth, times[index], year, 'galactic', 0.05);
					for (let axis = 0; axis < 3; axis++)
						modelError = Math.max(modelError, Math.abs(points[index][axis] - exact[axis]));
					if (index && times[index] <= times[index - 1]) ordered = false;
				}
				expect(points.at(-1)).toEqual(scenePosition(earth, year, year, 'galactic', 0.05));
			}
		}
		// Legacy chords miss the model by 21.43px near J2000 + 8.3852055 years.
		expect(worstBefore).toBeGreaterThan(10);
		expect(worstAfter).toBeLessThan(0.5);
		expect(modelError).toBeLessThan(1e-12);
		expect(ordered).toBe(true);
	});
	it('subdivides a curved camera-plane crossing without spending an unbounded budget', () => {
		const at = (t: number): Vec3 => [200 + 100 * t, 200, 0.1 + (t - 0.5) ** 2];
		const view: TrailProjection = {
			project: (p) => p,
			near: 0.2,
			left: 0,
			top: 0,
			width: 400,
			height: 400
		};
		const nodes = [0, 1].map((time) => ({ time, position: at(time) }));
		const refined = refineTrail(nodes, at, view, 64);
		expect(refined.added).toBeGreaterThan(0);
		expect(refined.nodes.length).toBeLessThanOrEqual(64);
		for (const node of refined.nodes) expect(node.position).toEqual(at(node.time));
		const bounded = refineTrail(nodes, at, view, 3);
		expect(bounded.nodes).toHaveLength(3);
		expect(bounded.budgetLimited).toBe(true);
	});
	it('keeps straight and fully hidden intervals simple', () => {
		const at = (t: number): Vec3 => [t * 300, t * 300, 1];
		const nodes = [0, 1].map((time) => ({ time, position: at(time) }));
		const view: TrailProjection = {
			project: (p) => p,
			near: 0.2,
			left: 0,
			top: 0,
			width: 400,
			height: 400
		};
		expect(refineTrail(nodes, at, view, 64).added).toBe(0);
		const hidden = (t: number): Vec3 => [t * 300, t * t * 300, -1];
		expect(
			refineTrail(
				[0, 1].map((time) => ({ time, position: hidden(time) })),
				hidden,
				view,
				64
			).added
		).toBe(0);
	});
});
