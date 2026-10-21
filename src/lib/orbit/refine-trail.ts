import type { Vec3 } from '$lib/utils/orbit-model';

export interface TrailProjection {
	/** Screen CSS x/y and positive forward camera depth. Clamp projection depth to near. */
	project: (position: Vec3) => Vec3;
	near: number;
	left: number;
	top: number;
	width: number;
	height: number;
	tolerance?: number;
}

export interface TrailNode {
	time: number;
	position: Vec3;
}

/** Subdivide the actual model curve, never interpolate a decorative spline through it. */
export function refineTrail(
	nodes: TrailNode[],
	at: (time: number) => Vec3,
	view: TrailProjection,
	limit: number
) {
	const result: TrailNode[] = [];
	const projected = new Map<number, Vec3>();
	let remaining = Math.max(0, limit - nodes.length);
	let maxError = 0;
	let budgetLimited = false;
	const tolerance = view.tolerance ?? 0.35;
	function screen(node: TrailNode) {
		let value = projected.get(node.time);
		if (!value) {
			value = view.project(node.position);
			projected.set(node.time, value);
		}
		return value;
	}
	function error(a: Vec3, m: Vec3, b: Vec3) {
		if (Math.max(a[2], m[2], b[2]) < view.near) return 0;
		// Entirely offscreen intervals do not spend the close-up's finite vertex budget.
		if (
			Math.max(a[0], m[0], b[0]) < view.left - 2 ||
			Math.min(a[0], m[0], b[0]) > view.left + view.width + 2 ||
			Math.max(a[1], m[1], b[1]) < view.top - 2 ||
			Math.min(a[1], m[1], b[1]) > view.top + view.height + 2
		)
			return 0;
		if (Math.min(a[2], m[2], b[2]) < view.near) return Infinity;
		const dx = b[0] - a[0],
			dy = b[1] - a[1];
		const t = Math.max(
			0,
			Math.min(1, ((m[0] - a[0]) * dx + (m[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))
		);
		return Math.hypot(m[0] - a[0] - t * dx, m[1] - a[1] - t * dy);
	}
	function interval(a: TrailNode, b: TrailNode, depth: number) {
		const time = (a.time + b.time) / 2;
		const middle = { time, position: at(time) };
		const deviation = error(screen(a), screen(middle), screen(b));
		if (deviation > tolerance && remaining > 0 && depth < 16) {
			remaining--;
			// Recent intervals get first access to the budget near the followed Earth.
			interval(middle, b, depth + 1);
			interval(a, middle, depth + 1);
		} else {
			if (Number.isFinite(deviation)) maxError = Math.max(maxError, deviation);
			if (deviation > tolerance && remaining === 0) budgetLimited = true;
			result.push(a);
		}
	}
	if (nodes.length) result.push(nodes[nodes.length - 1]);
	for (let index = nodes.length - 2; index >= 0; index--)
		interval(nodes[index], nodes[index + 1], 0);
	result.reverse();
	return { nodes: result, maxError, budgetLimited, added: result.length - nodes.length };
}
