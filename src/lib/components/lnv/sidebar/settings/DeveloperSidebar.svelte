<script>
	import { MapIcon, SpeechIcon, ToggleLeftIcon } from "@lucide/svelte";
	import SidebarHeader from "../SidebarHeader.svelte";
	import SettingsButton from "./SettingsButton.svelte";
	import say from "$lib/services/navigation/TTS";
	import { downloadPMTiles } from "$lib/services/OfflineTiles";
	import { getDeveloperToggle } from "./developer.svelte";
	import { view } from "../../view.svelte";

	const dev = getDeveloperToggle();
</script>

<SidebarHeader>
	Developer Settings
</SidebarHeader>

<div id="sections">
	<section>
		<h2>Test</h2>
		<SettingsButton icon={SpeechIcon} text="Test TTS" onclick={async () => {
			await say("Test")
		}} />
		<SettingsButton icon={MapIcon} text="Download tiles from URL" onclick={async () => {
			const name = prompt("Name?");
			if(!name) return;
			const url = prompt("URL?");
			if(!url) return;
			await downloadPMTiles(url, name);
		}} />
	</section>

	<section>
		<h2>Other</h2>
		<SettingsButton icon={ToggleLeftIcon} text="Disable Developer Options" onclick={async () => {
			dev.current = "false";
			view.back();
		}} />
	</section>
</div>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	#sections {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>