<script>
	import { m } from "$lang/messages";
	import { getLocale, locales, setLocale } from "$lang/runtime";
	import { CheckIcon, LanguagesIcon } from "@lucide/svelte";
	import SidebarHeader from "../SidebarHeader.svelte";
	import SettingsButton from "./SettingsButton.svelte";
</script>

<SidebarHeader>
	{m["sidebar.language.header"]()}
</SidebarHeader>

<div id="languages">
	{#each locales as locale, _index (locale)}
		{#if locale == getLocale()}
			<SettingsButton text={m.language()} icon={CheckIcon} disabled />
		{:else}
			<SettingsButton
				text={m.language({}, { locale })}
				icon={LanguagesIcon}
				onclick={() => {
					setLocale(locale);
				}}
			/>
		{/if}
	{/each}
</div>

<style>
	#languages {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
