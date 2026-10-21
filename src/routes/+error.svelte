<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head
	><title>{page.status} | A2O — Atom to Orbit</title><meta
		name="robots"
		content="noindex"
	/></svelte:head
>
<div class="wrap page-content">
	<div class="page-intro">
		<div class="error-code">{page.status}</div>
		<h1>이 페이지를 찾을 수 없습니다.</h1>
		<p>주소를 확인하거나 탐험의 시작으로 돌아가세요.</p>
	</div>
	<a class="primary" href="/">홈으로 돌아가기 ↗</a>
</div>
