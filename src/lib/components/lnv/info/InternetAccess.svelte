<script>
	import Badge from "$lib/components/ui/badge/badge.svelte";

	let { tags } = $props();

	const tag = $derived(tags.internet_access);
	const splitter = $derived(tag.split(";"));
</script>

{#if tag != "no"}
	<h3 class="text-lg font-bold mt-2">Internet Access</h3>
	{#each splitter as value, _index (value)}
		<Badge>{value}</Badge>
	{/each}
	{#if tags["internet_access:fee"] && tags["internet_access:fee"] != "no"}
		<Badge>Fee: {tags["internet_access:fee"]}</Badge>
	{/if}
	{#if tags["internet_access:ssid"]}
		<Badge>{tags["internet_access:ssid"]}</Badge>
	{/if}
{/if}