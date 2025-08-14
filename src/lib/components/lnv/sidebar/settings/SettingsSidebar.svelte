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
	import { m } from "$lang/messages";

	const dev = getDeveloperToggle();
</script>

<SidebarHeader>{m["sidebar.settings.header"]()}</SidebarHeader>

<div id="sections">
	<section>
		<h2>{m["sidebar.settings.general"]()}</h2>
		<SettingsButton icon={LanguagesIcon} text={m["sidebar.language.header"]()} disabled />
	</section>

	<section>
		<h2>{m["sidebar.settings.map"]()}</h2>
		<SettingsButton icon={MapIcon} text={m["sidebar.offline-maps.header"]()} view="offline-maps" />
		<SettingsButton icon={PaintbrushIcon} text={m["sidebar.map-style.header"]()} disabled />
	</section>

	<section>
		<h2>{m["sidebar.about.header"]()}</h2>
		{#if dev.current == "true"}
			<SettingsButton
				icon={CodeIcon}
				text={m["sidebar.developer.header"]()}
				view="dev-options"
			/>
		{/if}
		<SettingsButton icon={InfoIcon} text={m["sidebar.about.header"]()} view="about" />
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
