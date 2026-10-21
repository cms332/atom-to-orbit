// The website ID is public. Credentials belong only to the analytics server.
export const ANALYTICS_ORIGIN = 'https://stats.a2o.kr';
export const ANALYTICS_WEBSITE = '7f85f813-47a4-4490-9c09-98b794433b93';
type EventName =
	| 'orbit_story_start'
	| 'orbit_story_complete'
	| 'orbit_mode_change'
	| 'orbit_target_select'
	| 'scale_target_select'
	| 'article_explorer_open';
type Properties = Record<string, string | number>;
type Payload = Record<string, unknown>;
type Tracker = { track: (transform: (properties: Payload) => Payload) => Promise<unknown> | void };
declare global {
	interface Window {
		umami?: Tracker;
	}
}

export function eligible(
	host: string,
	development: boolean,
	automated: boolean,
	disabled: boolean
) {
	return !development && !automated && !disabled && ['a2o.kr', 'www.a2o.kr'].includes(host);
}
export function cleanReferrer(referrer: string) {
	try {
		const url = new URL(referrer);
		return ['http:', 'https:'].includes(url.protocol) ? url.origin + url.pathname : '';
	} catch {
		return '';
	}
}
function enabled() {
	if (typeof window === 'undefined') return false;
	try {
		return eligible(
			location.hostname,
			import.meta.env.DEV,
			navigator.webdriver,
			localStorage.getItem('umami.disabled') === '1'
		);
	} catch {
		return false;
	}
}
let pending: Array<() => void> = [];
export function flushAnalytics() {
	if (!enabled() || !window.umami) {
		pending = [];
		return;
	}
	const batch = pending;
	pending = [];
	for (const send of batch) send();
}
function send(path: string, name?: EventName, data?: Properties) {
	if (!enabled()) return;
	const referrer = cleanReferrer(document.referrer);
	const deliver = () => {
		if (!enabled()) return;
		try {
			void Promise.resolve(
				window.umami?.track((props) => ({
					...props,
					url: path,
					referrer,
					...(name ? { name, data } : {})
				}))
			).catch(() => {});
		} catch {
			/* Analytics must never interrupt the explorer. */
		}
	};
	if (window.umami) deliver();
	else if (pending.length < 20) pending.push(deliver);
}
export function trackEvent(name: EventName, data: Properties = {}) {
	if (typeof location !== 'undefined') send(location.pathname, name, data);
}
export function trackPage(path: string) {
	send(path);
}
export function startAnalytics() {
	if (!enabled()) return () => {};
	const script = document.createElement('script');
	script.src = `${ANALYTICS_ORIGIN}/script.js`;
	script.async = true;
	script.dataset.websiteId = ANALYTICS_WEBSITE;
	script.dataset.autoTrack = 'false';
	script.onload = flushAnalytics;
	script.onerror = () => {
		pending = [];
	};
	document.head.append(script);
	const click = (event: MouseEvent) => {
		const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
		if (!(anchor instanceof HTMLAnchorElement) || !location.pathname.startsWith('/articles/'))
			return;
		const target = new URL(anchor.href);
		if (target.origin === location.origin && ['/orbit/', '/scale/'].includes(target.pathname))
			trackEvent('article_explorer_open', {
				article: location.pathname,
				explorer: target.pathname
			});
	};
	document.addEventListener('click', click, true);
	return () => {
		script.remove();
		document.removeEventListener('click', click, true);
		pending = [];
	};
}
