<script lang="ts">
	import { page } from '$app/state';
	let open = $state(false);
	let menuButton: HTMLButtonElement;
	const links = [
		['/scale/', '크기 탐험하기'],
		['/orbit/', '궤도 탐험하기'],
		['/articles/', '과학 이야기 읽기']
	];
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && open) {
			open = false;
			menuButton?.focus();
		}
	}}
/>

<a class="skip" href="#main">본문으로 건너뛰기</a>
<header id="page-top" tabindex="-1">
	<div class="wrap header-inner">
		<a class="wordmark" href="/" translate="no" aria-label="A2O — Atom to Orbit, 홈"
			><svg
				class="brand-logo"
				width="112"
				height="36.378"
				viewBox="124 373 1250 406"
				aria-hidden="true"
				focusable="false"
			>
				<!-- Frame the supplied transparent PNG without altering its artwork. -->
				<image href="/brand/a2o-orbital.png" width="1448" height="1086" />
			</svg><small>ATOM<br />TO ORBIT</small></a
		>
		<nav aria-label="주요 탐색">
			{#each links as [href, label] (href)}<a
					{href}
					aria-current={page.url.pathname.startsWith(href) ? 'page' : undefined}>{label}</a
				>{/each}
		</nav>
		<button
			type="button"
			class="menu pressable"
			bind:this={menuButton}
			aria-expanded={open}
			aria-controls="mobile-nav"
			onclick={() => (open = !open)}>메뉴 <span aria-hidden="true">{open ? '−' : '+'}</span></button
		>
	</div>
</header>
<nav id="mobile-nav" class="mobile-nav" aria-label="모바일 탐색" hidden={!open}>
	{#each links as [href, label] (href)}<a
			{href}
			onclick={() => (open = false)}
			aria-current={page.url.pathname.startsWith(href) ? 'page' : undefined}
			>{label} <span aria-hidden="true">↗</span></a
		>{/each}
</nav>

<style>
	header {
		min-height: 80px;
		border-bottom: 1px solid var(--line);
	}
	.header-inner {
		min-height: 80px;
		padding-block: 12px;
		flex-wrap: wrap;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
	}
	.wordmark {
		display: flex;
		align-items: center;
		min-height: 44px;
		flex-shrink: 0;
		gap: 15px;
		text-decoration: none;
	}
	.brand-logo {
		display: block;
		width: 112px;
		height: auto;
		flex-shrink: 0;
		overflow: hidden;
	}
	.wordmark small {
		padding-left: 14px;
		border-left: 1px solid #bfcdcb;
		font:
			650 10px/1.35 system-ui,
			sans-serif;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	nav {
		display: flex;
		gap: 32px;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		color: var(--muted);
		padding: 12px 0;
	}
	nav a:focus-visible,
	nav a[aria-current='page'] {
		color: var(--teal);
	}
	nav a[aria-current='page'] {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 9px;
	}
	.menu {
		display: none;
	}
	.mobile-nav {
		display: none;
	}
	.skip {
		position: absolute;
		left: 20px;
		top: -100px;
		background: white;
		padding: 15px;
		z-index: 10;
	}
	.skip:focus {
		top: 10px;
	}
	@media (hover: hover) and (pointer: fine) {
		nav a:hover {
			color: var(--teal);
		}
		.menu:hover {
			border-color: var(--teal);
		}
	}
	@media (max-width: 1100px) {
		nav {
			gap: 24px;
		}
	}
	@media (max-width: 767px) {
		header {
			min-height: 64px;
		}
		.header-inner {
			min-height: 64px;
			gap: 12px 20px;
			padding-block: 10px;
		}
		.brand-logo {
			width: 92px;
		}
		.wordmark small {
			font-size: 9px;
		}
		.header-inner nav {
			display: none;
		}
		.menu {
			display: flex;
			gap: 16px;
			align-items: center;
			min-height: 44px;
			padding: 7px 14px;
			border: 1px solid var(--line);
			border-radius: 6px;
			background: none;
			color: var(--ink);
			font-size: 13px;
			font-weight: 650;
		}
		.menu:active {
			background: var(--soft-teal);
		}
		.mobile-nav:not([hidden]) {
			display: grid;
			gap: 0;
			background: white;
			padding: 12px 20px;
			border-bottom: 1px solid var(--line);
		}
		.mobile-nav a {
			display: flex;
			justify-content: space-between;
			min-height: 48px;
		}
	}
</style>
