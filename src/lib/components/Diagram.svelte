<script lang="ts">
	let { kind = 'earth', dark = false }: { kind?: string; dark?: boolean } = $props();
</script>

<svg
	viewBox="0 0 440 250"
	role="img"
	aria-label={kind === 'atom'
		? '원자 규모를 나타낸 상징적 기준 길이 도식. 실제 궤도나 크기 비례가 아님.'
		: kind === 'cosmos'
			? '천체와 눈금의 상징적 도식. 실제 궤도나 크기 비례가 아님.'
			: '대상을 나타낸 상징적 계측 도식. 실제 크기 비례가 아님.'}
	class:dark
>
	{#if kind === 'atom' || kind === 'cosmos'}
		<g fill="none" class="orbit"
			><ellipse cx="220" cy="125" rx="131" ry="42" transform="rotate(-26 220 125)" /><ellipse
				cx="220"
				cy="125"
				rx="107"
				ry="69"
				transform="rotate(38 220 125)"
			/><circle cx="220" cy="125" r="61" stroke-dasharray="2 6" /></g
		>
		<circle cx="220" cy="125" r="18" fill="#D6A16A" /><circle
			cx="104"
			cy="172"
			r="4"
			fill="#78A9A5"
		/><circle cx="324" cy="71" r="4" fill="#D6A16A" />
	{:else if kind === 'table'}
		<g fill="none" stroke={dark ? '#91B8B1' : '#397987'} stroke-width="1.5"
			><path d="M113 83H327V166H113zM220 83v83M106 125h228M125 179v17h190v-17" /><path
				d="M113 166v28M327 166v28"
			/></g
		>
	{:else if kind === 'ball' || kind === 'moon' || kind === 'jupiter' || kind === 'sun'}
		<circle
			cx="220"
			cy="125"
			r="66"
			fill={kind === 'sun'
				? '#D6A16A'
				: kind === 'moon'
					? '#A8B5B1'
					: kind === 'jupiter'
						? '#B59878'
						: 'none'}
			stroke={dark ? '#B6D1CB' : '#397987'}
		/>
		{#if kind === 'moon'}<g fill="#839793"
				><circle cx="197" cy="102" r="12" /><circle cx="239" cy="142" r="16" /><circle
					cx="220"
					cy="84"
					r="7"
				/></g
			>{/if}
		{#if kind === 'jupiter'}<g stroke="#6F7267" fill="none"
				><path
					d="M159 100q61-12 122 0M156 114q64-10 128 0M156 141q64 10 128 0M168 163q52 10 104 0"
				/><ellipse cx="244" cy="143" rx="13" ry="6" /></g
			>{/if}
		<path d="M145 208h150M145 201v14M295 201v14" fill="none" stroke="#D6A16A" />
	{:else}
		<circle cx="220" cy="125" r="69" fill={dark ? '#2F6571' : '#397987'} stroke="#87ADAB" />
		<g fill="none" stroke="#91B8B1" stroke-width="0.8" opacity="0.75"
			><ellipse cx="220" cy="125" rx="32" ry="69" /><ellipse
				cx="220"
				cy="125"
				rx="69"
				ry="25"
			/><path d="M151 125h138M220 56v138" /></g
		>
		<g fill="#8EB4A0" opacity="0.8"
			><path
				d="m185 83 25-15 22 14-9 22-24 6-12 25-25-13 8-22zM227 139l26-6 17 18-14 27-18-6z"
			/></g
		>
	{/if}
	{#if !dark}<text class="labels" x="220" y="235" text-anchor="middle" font-size="11"
			>상징적 도식 · 실제 크기 비례 아님</text
		>{/if}
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.orbit {
		stroke: #5c9296;
	}
	.labels {
		fill: #526e73;
		font-family: var(--font-sans);
	}
	.dark .orbit {
		stroke: #8db5b2;
	}
</style>
