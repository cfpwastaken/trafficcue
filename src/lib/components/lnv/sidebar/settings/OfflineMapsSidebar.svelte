<script lang="ts">
	import { downloadPMTiles, getRemoteList } from "$lib/services/OfflineTiles";
	import { DownloadCloudIcon } from "@lucide/svelte";
	import SettingsButton from "./SettingsButton.svelte";
	import SidebarHeader from "../SidebarHeader.svelte";

	let progresses: {[key: string]: number} = $state({});
</script>

<SidebarHeader>
	Offline Maps
</SidebarHeader>

{#await getRemoteList()}
	<p>Loading...</p>
{:then list}
	<div style="display: flex; flex-direction: column; gap: 0.5rem;">
		{#if list.length === 0}
			<p>No offline maps available.</p>
		{/if}
		
		{#if !window.__TAURI__}
			<p>Offline maps are only available on mobile.</p>
		{/if}

		{#each list as item, _index (item.file)}
			<SettingsButton disabled={!window.__TAURI__} icon={DownloadCloudIcon} text={item.name} progress={progresses[item.file] ?? -1} onclick={async () => {
				await downloadPMTiles("https://trafficcue-tiles.picoscratch.de/" + item.file, item.name.includes("World") ? "world": "tiles", (progress, total) => {
					progresses[item.file] = (progress / total) * 100;
				});
				alert(`Downloaded ${item.name}`);
				location.reload();
			}} />
		{/each}
	</div>
{/await}