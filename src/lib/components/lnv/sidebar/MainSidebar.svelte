<script lang="ts">
	import { BriefcaseIcon, HomeIcon, SchoolIcon } from "@lucide/svelte";
	import { Button } from "../../ui/button";
	import { fly } from "svelte/transition";
	import { circInOut } from "svelte/easing";
	import { map, pin } from "../map.svelte";
	import VehicleSelector from "../VehicleSelector.svelte";
	import Post from "../Post.svelte";
	import RequiresCapability from "../RequiresCapability.svelte";
	import { saved } from "$lib/saved.svelte";
	import { m } from "$lang/messages";
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
			const loc = saved.home;
			if (!loc) {
				alert(m["saved.no-location"](m["saved.home"]));
				return;
			}
			const { lat, lon } = loc;
			if (!lat || !lon) {
				alert(m["saved.no-location"](m["saved.home"]));
				return;
			}
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19,
			});
		}}
	>
		<HomeIcon />
		{m["saved.home"]()}
	</Button>
	<Button
		variant="secondary"
		class="flex-1"
		onclick={() => {
			console.log(saved);
			const loc = saved.school;
			if (!loc) {
				alert(m["saved.no-location"](m["saved.school"]));
				return;
			}
			const { lat, lon } = loc;
			if (!lat || !lon) {
				alert(m["saved.no-location"](m["saved.school"]));
				return;
			}
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19,
			});
		}}
	>
		<SchoolIcon />
		{m["saved.school"]()}
	</Button>
	<Button
		variant="secondary"
		class="flex-1"
		onclick={() => {
			const loc = saved.work;
			if (!loc) {
				alert(m["saved.no-location"](m["saved.work"]));
				return;
			}
			const { lat, lon } = loc;
			if (!lat || !lon) {
				alert(m["saved.no-location"](m["saved.work"]));
				return;
			}
			pin.dropPin(lat, lon);
			pin.showInfo();
			map.value?.flyTo({
				center: [lon, lat],
				zoom: 19,
			});
		}}
	>
		<BriefcaseIcon />
		{m["saved.work"]()}
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
