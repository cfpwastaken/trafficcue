<script>
	import SidebarHeader from "../SidebarHeader.svelte";
	import { getDeveloperToggle } from "./developer.svelte";

	let count = 5;
	const dev = getDeveloperToggle();
</script>

<SidebarHeader>
	About
</SidebarHeader>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<h1 style="font-size: 2em; font-weight: bold;" onclick={() => {
	count--;
	if(count == 0) {
		dev.current = "true";
	}
}}>TrafficCue</h1>
<span>Powered by:</span>
<ul>
	<li>© OpenStreetMap contributors</li>
	<li>Natural Earth</li>
	<li>MapLibre</li>
</ul>
