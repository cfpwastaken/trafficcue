<script lang="ts">
	import { BriefcaseIcon, HomeIcon } from "@lucide/svelte";
	import { Button } from "../../ui/button";
	import { fly } from "svelte/transition";
	import { circInOut } from "svelte/easing";
	import { map, pin } from "../map.svelte";
	import VehicleSelector from "../VehicleSelector.svelte";
	import Post from "../Post.svelte";
	import RequiresCapability from "../RequiresCapability.svelte";
</script>

<div
	id="saved"
	class="mt-2 mb-2"
	in:fly={{ y: 20, duration: 200, easing: circInOut }}
>
	<Button
		variant="secondary"
		class="flex-1"
		onclick={() => {
			const home = localStorage.getItem("saved.home");
			if (!home) {
				alert("No home location saved.");
				return;
			}
			const { lat, lon } = JSON.parse(home);
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19,
			});
		}}
	>
		<HomeIcon />
		Home
	</Button>
	<Button
		variant="secondary"
		class="flex-1"
		onclick={() => {
			const work = localStorage.getItem("saved.work");
			if (!work) {
				alert("No work location saved.");
				return;
			}
			const { lat, lon } = JSON.parse(work);
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19,
			});
		}}
	>
		<BriefcaseIcon />
		Work
	</Button>
</div>

<VehicleSelector />

<RequiresCapability capability="post">
	<div>
		<h2>In your area</h2>

		<Post />
	</div>
</RequiresCapability>

<style>
	#saved {
		display: flex;
		gap: 0.5rem;
		/* justify-content: space-evenly; */
		width: 100%;
		max-width: 100%;
	}
</style>
