<script lang="ts">
	import { BriefcaseIcon, HomeIcon } from "@lucide/svelte";
	import { Button } from "../../ui/button";
	import { Input } from "../../ui/input";
	import { fly } from "svelte/transition";
	import { circInOut } from "svelte/easing";
	import { search, type Feature } from "$lib/services/Search";
	import { view } from "../sidebar.svelte";
	import { map, pin } from "../map.svelte";

	function debounce<T>(getter: () => T, delay: number): () => T | undefined {
		let value = $state<T>();
		let timer: NodeJS.Timeout;
		$effect(() => {
			const newValue = getter(); // read here to subscribe to it
			clearTimeout(timer);
			timer = setTimeout(() => value = newValue, delay);
			return () => clearTimeout(timer);
		});
		return () => value;
	}

	let typedText = $state("");
	let loading = $state(false);

	let searchText = $derived.by(debounce(() => typedText, 300));
	let searchResults: Feature[] = $state([]);

	$effect(() => {
		if(!searchText) {
			searchResults = [];
			return;
		}
		if (searchText.length > 0) {
			loading = true;
			search(searchText, 0, 0).then(results => {
				searchResults = results;
				loading = false;
			});
		} else {
			searchResults = [];
		}
	});

	$inspect("searchText", searchText);
</script>

<div id="search-progress" style="min-height: calc(3px + 3px); width: 100%; min-height: 3ch;">
	{#if loading}
		LOADING
	{/if}
</div>
<Input placeholder="Search..." bind:value={typedText} class="mb-2" />
{#if searchResults.length == 0}
	<div id="saved" in:fly={{ y: 20, duration: 200, easing: circInOut }}>
		<Button variant="secondary" class="flex-1" onclick={() => {
			const home = localStorage.getItem("saved.home");
			if(!home) {
				alert("No home location saved.");
				return;
			}
			const {lat, lon} = JSON.parse(home);
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19
			});
		}}>
			<HomeIcon />
			Home
		</Button>
		<Button variant="secondary" class="flex-1" onclick={() => {
			const work = localStorage.getItem("saved.work");
			if(!work) {
				alert("No home location saved.");
				return;
			}
			const {lat, lon} = JSON.parse(work);
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19
			});
		}}>
			<BriefcaseIcon />
			Work
		</Button>
	</div>
{:else}
	<div id="results" in:fly={{ y: 20, duration: 200, easing: circInOut }}>
		{#each searchResults as result}
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
{/if}

<style>
	#saved {
		display: flex;
		gap: 0.5rem;
		/* justify-content: space-evenly; */
		width: 100%;
		max-width: 100%;
	}
</style>
