<script lang="ts">
	import { hasCapability, type Capabilities } from "$lib/services/lnv";
	import type { Snippet } from "svelte";

	let {
		capability,
		children,
	}: {
		capability: Capabilities[number];
		children: Snippet;
	} = $props();
</script>

{#await hasCapability(capability) then has}
	{#if has}
		{@render children()}
	{/if}
{:catch _error}
	<!-- user is likely offline -->
{/await}
