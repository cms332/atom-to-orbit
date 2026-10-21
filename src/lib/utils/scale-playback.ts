export const OBJECT_HOLD_MS = 1500;
const MIN_TRAVEL_MS = 700;
const MS_PER_DECADE = 1300;

export interface PlaybackLeg {
	from: number;
	to: number;
	start: number;
	arrival: number;
	end: number;
}

/** Time belongs to the tour; the camera still uses the exact scientific exponent. */
export function playbackPlan(
	from: number,
	stops: readonly number[],
	reducedMotion = false
): PlaybackLeg[] {
	if (
		!Number.isFinite(from) ||
		!stops.length ||
		stops.some((stop, i) => !Number.isFinite(stop) || (i > 0 && stop <= stops[i - 1]))
	)
		throw new RangeError('finite cursor and strictly increasing stops required');
	let elapsed = 0;
	let cursor = from;
	// Playback is explicitly requested. Reduce its speed rather than jumping the camera.
	const durationFactor = reducedMotion ? 1.5 : 1;
	return stops
		.filter((stop) => stop >= from - 1e-10)
		.map((to) => {
			const duration =
				Math.abs(to - cursor) < 1e-10
					? 0
					: Math.round(Math.max(MIN_TRAVEL_MS, (to - cursor) * MS_PER_DECADE) * durationFactor);
			const leg = {
				from: cursor,
				to,
				start: elapsed,
				arrival: elapsed + duration,
				end: elapsed + duration + OBJECT_HOLD_MS
			};
			elapsed = leg.end;
			cursor = to;
			return leg;
		});
}

export function playbackFrame(
	plan: readonly PlaybackLeg[],
	elapsed: number
): { exponent: number; done: boolean } {
	if (!plan.length || !Number.isFinite(elapsed))
		throw new RangeError('plan and finite elapsed time required');
	const last = plan[plan.length - 1];
	if (elapsed >= last.end) return { exponent: last.to, done: true };
	const leg = plan.find((item) => elapsed < item.end)!;
	if (elapsed >= leg.arrival) return { exponent: leg.to, done: false };
	const t = Math.max(0, (elapsed - leg.start) / (leg.arrival - leg.start));
	const eased = t * t * (3 - 2 * t);
	return { exponent: leg.from + (leg.to - leg.from) * eased, done: false };
}
