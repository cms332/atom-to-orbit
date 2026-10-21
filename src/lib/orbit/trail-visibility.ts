import type { Vec3 } from '$lib/utils/orbit-model';

// A readability treatment for the physical Earth close-up, not a change in its path.
// End-on paths become unreliable visual cues below about 1–7 degrees to the sightline.
export function trailVisibility(
	positions: Vec3[],
	index: number,
	times: number[] | undefined,
	eye: Vec3
): number {
	const p = positions[index];
	const before = positions[Math.max(0, index - 1)];
	const after = positions[Math.min(positions.length - 1, index + 1)];
	let left = 1,
		right = 1;
	if (times && index > 0 && index < positions.length - 1) {
		const previousStep = times[index] - times[index - 1];
		const nextStep = times[index + 1] - times[index];
		// Quadratic derivative on unequal sample intervals; adaptive samples must not
		// introduce brightness seams where the history grid changes density.
		if (previousStep > 0 && nextStep > 0) {
			left = nextStep / previousStep;
			right = previousStep / nextStep;
		}
	}
	const tx = (p[0] - before[0]) * left + (after[0] - p[0]) * right;
	const ty = (p[1] - before[1]) * left + (after[1] - p[1]) * right;
	const tz = (p[2] - before[2]) * left + (after[2] - p[2]) * right;
	const rx = p[0] - eye[0],
		ry = p[1] - eye[1],
		rz = p[2] - eye[2];
	const norm = Math.hypot(tx, ty, tz) * Math.hypot(rx, ry, rz);
	if (norm === 0) return 1;
	const sine = Math.hypot(ty * rz - tz * ry, tz * rx - tx * rz, tx * ry - ty * rx) / norm;
	const u = Math.max(0, Math.min(1, (sine - 0.02) / 0.1));
	return u * u * (3 - 2 * u);
}
