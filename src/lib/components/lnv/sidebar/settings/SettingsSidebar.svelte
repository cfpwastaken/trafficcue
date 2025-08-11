<script>
	import {
		CodeIcon,
		InfoIcon,
		LanguagesIcon,
		MapIcon,
		PaintbrushIcon,
	} from "@lucide/svelte";
	import SidebarHeader from "../SidebarHeader.svelte";
	import SettingsButton from "./SettingsButton.svelte";
	import { getDeveloperToggle } from "./developer.svelte";

	const dev = getDeveloperToggle();
</script>

<SidebarHeader>Settings</SidebarHeader>

<div id="sections">
	<section>
		<h2>General</h2>
		<SettingsButton icon={LanguagesIcon} text="Language" disabled />
	</section>

	<section>
		<h2>Map</h2>
		<SettingsButton icon={MapIcon} text="Offline Maps" view="offline-maps" />
		<SettingsButton icon={PaintbrushIcon} text="Map Style" disabled />
	</section>

	<section>
		<h2>About</h2>
		{#if dev.current == "true"}
			<SettingsButton
				icon={CodeIcon}
				text="Developer Settings"
				view="dev-options"
			/>
		{/if}
		<SettingsButton icon={InfoIcon} text="About" view="about" />
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
