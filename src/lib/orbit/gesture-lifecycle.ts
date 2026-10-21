/** Keep interrupted or mixed-device gestures out of OrbitControls' pointer history.
 * Use its public dispose/recreate lifecycle, without patching library internals.
 */
export function guardOrbitGestures(element: HTMLElement, recreate: () => void) {
	const pointers = new Map<number, string>();
	const document = element.ownerDocument;
	const window = document.defaultView!;
	function reset(force = false) {
		if (!force && pointers.size === 0) return;
		const ids = [...pointers.keys()];
		pointers.clear();
		recreate();
		for (const id of ids) {
			if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
		}
	}
	function down(event: PointerEvent) {
		if (
			pointers.has(event.pointerId) ||
			(pointers.size > 0 &&
				(event.isPrimary || [...pointers.values()].some((type) => type !== event.pointerType)))
		)
			reset();
		pointers.set(event.pointerId, event.pointerType);
	}
	function up(event: PointerEvent) {
		const tracked = pointers.delete(event.pointerId);
		// A capture-phase UI dismissal may prevent the library receiving this end.
		if (tracked && event.cancelBubble) reset(true);
	}
	function cancel(event: PointerEvent) {
		if (pointers.has(event.pointerId)) reset();
	}
	function lost(event: PointerEvent) {
		// A queued release from an earlier gesture must not cancel a new capture.
		if (pointers.has(event.pointerId) && !element.hasPointerCapture(event.pointerId)) reset();
	}
	function move(event: PointerEvent) {
		if (event.pointerType !== 'touch' && event.buttons === 0 && pointers.has(event.pointerId))
			reset();
	}
	function blur() {
		reset();
	}
	function visibility() {
		if (document.hidden) reset();
	}
	element.addEventListener('pointerdown', down, true);
	element.addEventListener('lostpointercapture', lost);
	window.addEventListener('pointerup', up, true);
	window.addEventListener('pointercancel', cancel, true);
	window.addEventListener('pointermove', move, true);
	window.addEventListener('blur', blur);
	document.addEventListener('visibilitychange', visibility);
	return () => {
		pointers.clear();
		element.removeEventListener('pointerdown', down, true);
		element.removeEventListener('lostpointercapture', lost);
		window.removeEventListener('pointerup', up, true);
		window.removeEventListener('pointercancel', cancel, true);
		window.removeEventListener('pointermove', move, true);
		window.removeEventListener('blur', blur);
		document.removeEventListener('visibilitychange', visibility);
	};
}
