<script lang="ts">
	import "./app.css";
	import { GeolocateControl, Hash, MapLibre } from "svelte-maplibre-gl";
	import Sidebar from "./lib/components/lnv/Sidebar.svelte";
	import { onMount } from "svelte";
	import Map from "$lib/components/lnv/Map.svelte";
	import { routing } from "$lib/services/navigation/routing.svelte";
	import { checkWebGL } from "$lib/webgl";
	import RoutingInfo from "$lib/components/lnv/RoutingInfo.svelte";

	onMount(() => {
		if(!checkWebGL()) {
			alert("WebGL is not supported in your browser. Please try a different browser.");
			return;
		}
	});
</script>

{#if routing.currentTrip}
	<RoutingInfo />
{/if}
<Sidebar></Sidebar>
<Map></Map>