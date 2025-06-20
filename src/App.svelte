<script lang="ts">
	import "./app.css";
	import { GeolocateControl, Hash, MapLibre } from "svelte-maplibre-gl";
	import Sidebar from "./lib/components/lnv/Sidebar.svelte";
	import { onMount } from "svelte";
	import Map from "$lib/components/lnv/Map.svelte";
	import { routing } from "$lib/services/navigation/routing.svelte";
	import LanesDisplay from "$lib/services/navigation/LanesDisplay.svelte";
	import { checkWebGL } from "$lib/webgl";

	onMount(() => {
		if(!checkWebGL()) {
			alert("WebGL is not supported in your browser. Please try a different browser.");
			return;
		}
	});
</script>

{#if !routing.currentTrip}
	<Sidebar></Sidebar>
{:else}
	<div class="fixed top-4 left-4 z-50 w-3/4 h-10 bg-background text-white">
		{routing.currentTripInfo.currentManeuver?.instruction}
		<LanesDisplay
			lanes={routing.currentTripInfo.currentManeuver?.lanes}
		/>
	</div>
{/if}
<Map></Map>