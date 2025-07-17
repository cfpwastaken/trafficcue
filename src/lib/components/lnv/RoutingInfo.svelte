<script lang="ts">
	import LanesDisplay from "$lib/services/navigation/LanesDisplay.svelte";
	import {
		decodePolyline,
		routing,
	} from "$lib/services/navigation/routing.svelte";
	import { location } from "./location.svelte";
	import ManeuverIcon from "./ManeuverIcon.svelte";

	// Helper: Haversine distance in meters
	function haversine(
		a: { lat: number; lon: number },
		b: { lat: number; lon: number },
	) {
		const R = 6371000;
		const toRad = (d: number) => (d * Math.PI) / 180;
		const dLat = toRad(b.lat - a.lat);
		const dLon = toRad(b.lon - a.lon);
		const lat1 = toRad(a.lat);
		const lat2 = toRad(b.lat);

		const aVal =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
		return 2 * R * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
	}

	// Helper: Project point onto segment AB, return projected point and distance along segment
	function projectPointToSegment(
		p: WorldLocation,
		a: WorldLocation,
		b: WorldLocation,
	) {
		const toRad = (deg: number) => (deg * Math.PI) / 180;
		const toDeg = (rad: number) => (rad * 180) / Math.PI;

		const lat1 = toRad(a.lat),
			lon1 = toRad(a.lon);
		const lat2 = toRad(b.lat),
			lon2 = toRad(b.lon);
		const lat3 = toRad(p.lat),
			lon3 = toRad(p.lon);

		const dLon = lon2 - lon1;
		const dLat = lat2 - lat1;

		const t =
			((lat3 - lat1) * dLat + (lon3 - lon1) * dLon) /
			(dLat * dLat + dLon * dLon);

		// Clamp to [0,1]
		const clampedT = Math.max(0, Math.min(1, t));

		const latProj = lat1 + clampedT * dLat;
		const lonProj = lon1 + clampedT * dLon;

		return {
			lat: toDeg(latProj),
			lon: toDeg(lonProj),
			t: clampedT,
			distToUser: haversine(p, { lat: toDeg(latProj), lon: toDeg(lonProj) }),
		};
	}

	// const point = $derived(decodePolyline(routing.currentTrip?.legs[0].shape || "")[routing.currentTripInfo.currentManeuver?.end_shape_index || 0]);
	// const distance = $derived(Math.sqrt(Math.pow(point.lat - location.lat, 2) + Math.pow(point.lon - location.lng, 2)) * 111000); // Approximate conversion to meters
	const shape = $derived(
		decodePolyline(routing.currentTrip?.legs[0].shape || ""),
	);
	const maneuver = $derived(routing.currentTripInfo.currentManeuver);

	const distance = $derived.by(() => {
		const lat = location.lat;
		const lon = location.lng;
		if (!shape || shape.length === 0 || !maneuver) return 0;
		const start = shape[maneuver.begin_shape_index];
		const end = shape[maneuver.end_shape_index];
		if (!start || !end) return 0;
		const projected = projectPointToSegment({ lat, lon }, start, end);
		return projected.distToUser;
	});

	const roundDistance = $derived.by(() => {
		const dist = Math.round(distance);
		if (dist < 100) {
			return Math.round(dist / 5) * 5;
		} else if (dist < 1000) {
			return Math.round(dist / 50) * 50;
		} else if (dist < 10000) {
			return Math.round(dist / 100) * 100;
		} else if (dist < 100000) {
			return Math.round(dist / 1000) * 1000;
		} else {
			return Math.round(dist / 5000) * 5000;
		}
	});

	const distanceText = $derived.by(() => {
		const dist = roundDistance;
		if (dist < 1000) return `${dist} m`;
		return `${dist / 1000} km`;
	});
</script>

<div
	class="fixed top-4 left-4 z-50 w-[calc(100%-32px)] bg-background/60 text-white rounded-lg overflow-hidden"
	style="backdrop-filter: blur(5px);"
>
	<div class="p-2 flex gap-2">
		{#if routing.currentTripInfo.currentManeuver?.type === 26 || routing.currentTripInfo.currentManeuver?.type === 27}
			{@const exit =
				routing.currentTripInfo.currentManeuver?.type === 26
					? routing.currentTripInfo.currentManeuver?.roundabout_exit_count
					: routing.currentTrip?.legs[0].maneuvers[
							routing.currentTripInfo.maneuverIdx - 1
						].roundabout_exit_count}
			<span
				class="border-white border-4 rounded-full text-3xl flex items-center justify-center w-12 h-12 min-w-12"
			>
				{exit}
			</span>
		{:else}
			<ManeuverIcon
				maneuver={routing.currentTripInfo.currentManeuver?.type ?? 0}
			/>
		{/if}
		<div class="flex gap-1 flex-col">
			<span class="text-xl font-bold">{distanceText}</span>
			<span>{routing.currentTripInfo.currentManeuver?.instruction}</span>
		</div>
	</div>
	<LanesDisplay lanes={routing.currentTripInfo.currentManeuver?.lanes} />
</div>
