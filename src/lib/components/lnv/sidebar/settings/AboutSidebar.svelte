<script>
	import { m } from "$lang/messages";
	import SidebarHeader from "../SidebarHeader.svelte";
	import { getDeveloperToggle } from "./developer.svelte";

	let count = 5;
	const dev = getDeveloperToggle();
</script>

<SidebarHeader>{m["sidebar.about.header"]()}</SidebarHeader>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<h1
	style="font-size: 2em; font-weight: bold;"
	onclick={() => {
		count--;
		if (count == 0) {
			dev.current = "true";
		}
	}}
>
	TrafficCue
</h1>
<span>{m["sidebar.about.powered-by"]()}:</span>
<ul>
	<li>© OpenStreetMap {m["sidebar.about.contributors"]()}</li>
	<li>Natural Earth</li>
	<li>MapLibre</li>
	<li>OpenMapTiles</li>
	<li>Protomaps</li>
	<li>Valhalla</li>
	<li>Photon</li>
	<li>Overpass</li>
</ul>
