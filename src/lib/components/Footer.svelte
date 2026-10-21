<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let scrollY = $state<number>();
	let viewportHeight = $state(0);
	let footerNote: HTMLParagraphElement;
	let noteBottom = $state(Infinity);
	let pageHeight = $state(0);
	let analyticsDisabled = $state(false);
	function toggleAnalytics() {
		analyticsDisabled = !analyticsDisabled;
		if (analyticsDisabled) localStorage.setItem('umami.disabled', '1');
		else localStorage.removeItem('umami.disabled');
		location.reload();
	}
	const scrollRange = $derived(Math.max(0, pageHeight - viewportHeight));
	const revealAt = $derived(
		Math.min(Math.max(320, Math.min(640, viewportHeight * 0.75)), scrollRange / 2)
	);
	const visible = $derived(scrollRange > 0 && (scrollY ?? 0) > 0 && (scrollY ?? 0) >= revealAt);
	const footerStop = $derived(Math.max(0, (scrollY ?? 0) + viewportHeight - noteBottom));

	function measureStop() {
		if (!footerNote) return;
		noteBottom = footerNote.getBoundingClientRect().bottom + window.scrollY;
		pageHeight = document.documentElement.scrollHeight;
	}

	onMount(() => {
		try {
			analyticsDisabled = localStorage.getItem('umami.disabled') === '1';
		} catch {
			analyticsDisabled = true;
		}
		measureStop();
		const observer = new ResizeObserver(measureStop);
		observer.observe(document.body);
		observer.observe(footerNote);
		mounted = true;
		return () => observer.disconnect();
	});
</script>

<svelte:window bind:scrollY bind:innerHeight={viewportHeight} onresize={measureStop} />

<footer>
	<div class="wrap">
		<div class="footer-top">
			<div>
				<a class="footer-logo" href="/" translate="no" aria-label="A2O 홈"
					><svg
						width="112"
						height="36.378"
						viewBox="124 373 1250 406"
						aria-hidden="true"
						focusable="false"
					>
						<image href="/brand/a2o-orbital.png" width="1448" height="1086" />
					</svg></a
				>
				<p class="footer-sub">ATOM TO ORBIT — INDEPENDENT SCIENCE ATLAS</p>
			</div>
			<p class="footer-note" bind:this={footerNote}>
				원자에서 궤도까지.<br />눈금으로 이해하는 세상의 크기.
			</p>
		</div>
		<a
			class="back-to-top"
			class:floating={mounted}
			style:--footer-stop={`${footerStop}px`}
			hidden={mounted && !visible}
			href="#page-top"
			aria-label="맨 위로 이동"
			title="맨 위로"
		>
			<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path
					d="M12 20V4m-7 7 7-7 7 7"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
		<div class="footer-bottom">
			<span>© 2026 A2O — Atom to Orbit</span>
			<details class="analytics-notice">
				<summary>방문 통계 안내</summary>
				<p>
					사이트 개선을 위해 자체 서버에서 방문 경로·기기·국가와 탐험기 이용 통계를 수집합니다.
					이름이나 이메일을 수집하거나 화면을 녹화하지 않습니다. 방문 기록은 180일, 백업은 14일
					보관합니다.
				</p>
				<button type="button" onclick={toggleAnalytics}
					>{analyticsDisabled
						? '이 브라우저의 통계 수집 허용'
						: '이 브라우저의 통계 수집 중지'}</button
				>
			</details>
		</div>
	</div>
</footer>

<style>
	footer {
		background: var(--deep);
		color: var(--on-deep);
		padding: 48px 0 28px;
	}
	.footer-top {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: 40px;
	}
	.footer-logo {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		text-decoration: none;
	}
	.footer-logo svg {
		display: block;
		width: 112px;
		height: auto;
		overflow: hidden;
		filter: brightness(0) invert(1);
	}
	.footer-sub {
		font:
			10px system-ui,
			sans-serif;
		color: var(--on-deep-muted);
		margin: 12px 0 0;
		line-height: 1.6;
	}
	.footer-note {
		font-size: 16px;
		font-weight: 500;
		line-height: 1.7;
		color: var(--on-deep-muted);
		margin: 0;
		padding-right: 64px;
	}
	.back-to-top {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border: 1px solid #6b878e;
		border-radius: 50%;
		color: var(--on-deep);
		text-decoration: none;
		margin: 24px 0 0 auto;
	}
	.back-to-top[hidden] {
		display: none;
	}
	.back-to-top.floating {
		position: fixed;
		right: max(20px, env(safe-area-inset-right));
		bottom: max(20px, env(safe-area-inset-bottom), var(--footer-stop));
		z-index: 20;
		margin: 0;
		background: var(--deep);
		box-shadow: 0 2px 12px #10283226;
	}
	.back-to-top:active,
	.back-to-top.floating:active {
		background: #183944;
	}
	@media (hover: hover) and (pointer: fine) {
		.back-to-top:hover {
			border-color: #e6bb82;
			color: #e6bb82;
		}
	}
	.footer-bottom {
		border-top: 1px solid #31515b;
		margin-top: 37px;
		padding-top: 21px;
		color: #a6c1c3;
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font:
			10px system-ui,
			sans-serif;
	}
	.analytics-notice {
		max-width: 440px;
		font-size: 12px;
		line-height: 1.7;
		color: var(--on-deep-muted);
		border: 0;
		padding: 0;
		margin: 0;
	}
	.analytics-notice summary {
		cursor: pointer;
		min-height: 44px;
	}
	.analytics-notice p {
		margin: 0 0 12px;
		color: var(--on-deep-muted);
	}
	.analytics-notice button {
		color: var(--on-deep);
		background: transparent;
		border: 1px solid #6b878e;
		border-radius: 4px;
		min-height: 44px;
		padding: 8px 12px;
	}
	@media (max-width: 767px) {
		.footer-logo svg {
			width: 92px;
		}
		.footer-top {
			grid-template-columns: minmax(0, 1fr);
			gap: 28px 20px;
		}
		.footer-top > div {
			grid-column: 1 / -1;
		}
		.footer-note {
			font-size: clamp(14px, 3.9vw, 16px);
		}
		.footer-bottom {
			display: grid;
			line-height: 1.8;
		}
	}
</style>
