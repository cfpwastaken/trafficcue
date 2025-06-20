<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { circInOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	import { map, pin } from "../map.svelte";
	import type { Feature } from "$lib/services/Search";
	import SidebarHeader from "./SidebarHeader.svelte";
	import { searchbar } from "../sidebar.svelte";

	let { results, query }: {
		results: Feature[],
		query: string
	} = $props();
</script>

<SidebarHeader onback={() => {
	searchbar.text = "";
}}>
	Search Results
</SidebarHeader>
<div id="results" class="mt-2" in:fly={{ y: 20, duration: 200, easing: circInOut }}>
	{#each results as result}
		<Button variant="secondary" class="flex-1" onclick={() => {
			// view.switch("info", { feature: result });
			pin.dropPin(result.geometry.coordinates[1], result.geometry.coordinates[0]);
			pin.showInfo();
			map.value?.flyTo({
				center: [result.geometry.coordinates[0], result.geometry.coordinates[1]],
				zoom: 19
			});
		}}>
			{result.properties.name}
		</Button>
	{/each}
</div>