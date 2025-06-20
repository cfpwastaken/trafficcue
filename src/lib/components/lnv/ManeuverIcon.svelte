<script lang="ts">
	import { maneuverTypes } from "$lib/services/navigation/Maneuver";

	let { maneuver }: { maneuver: number } = $props();

	let name = $derived(maneuverTypes[maneuver] || "none");
</script>

<img src="/img/maneuver/{name}.svg" alt={name}>

<style>
	img {
		/* the images are black, recolor them white */
		filter: invert(1);
		width: 24px;
		height: 24px;
	}
</style>
