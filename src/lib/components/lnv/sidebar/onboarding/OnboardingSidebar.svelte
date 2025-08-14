<script>
	import { m } from "$lang/messages";
	import { getLocale, locales, setLocale } from "$lang/runtime";
	import { LanguagesIcon } from "@lucide/svelte";
	import SettingsButton from "../settings/SettingsButton.svelte";
	import { view } from "../../view.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
</script>

<h1 style="font-size: 2em; font-weight: bold;">{m["sidebar.onboarding.welcome"]()}</h1>
<h2>{m["sidebar.onboarding.choose-lang"]()}</h2>

<div id="languages">
	{#each locales as locale, _index (locale)}
		<SettingsButton
			text={m.language({}, { locale })}
			icon={LanguagesIcon}
			onclick={() => {
				if(locale != getLocale()) {
					setLocale(locale);
				}
				view.switch("onboarding-vehicles")
			}}
		/>
	{/each}
</div>

<Button variant="link" onclick={() => {
	view.switch("main");
	view.history = [];
}}>{m["sidebar.onboarding.skip"]()}</Button>

<style>
	#languages {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
