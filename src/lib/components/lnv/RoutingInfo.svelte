<script>
	import LanesDisplay from "$lib/services/navigation/LanesDisplay.svelte";
	import { routing } from "$lib/services/navigation/routing.svelte";
	import ManeuverIcon from "./ManeuverIcon.svelte";
</script>

<div class="fixed top-4 left-4 z-50 w-3/4 h-10 bg-background text-white">
	<div class="flex gap-2">
		<ManeuverIcon maneuver={routing.currentTripInfo.currentManeuver?.type ?? 0} />
		{routing.currentTripInfo.currentManeuver?.instruction}
	</div>
	<LanesDisplay
		lanes={routing.currentTripInfo.currentManeuver?.lanes}
	/>
</div>