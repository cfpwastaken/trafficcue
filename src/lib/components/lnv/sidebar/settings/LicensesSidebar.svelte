<script lang="ts">
	import { onMount } from "svelte";
	import SidebarHeader from "../SidebarHeader.svelte";
	import { m } from "$lang/messages";

	let licenses: License[] = $state([]);
	let loading = $state(true);

	interface License {
		name: string;
		licenseType: string;
		link: string;
		installedFrom?: string;
		remoteVersion: string;
		installedVersion: string;
		definedVersion: string;
		latestRemoteVersion?: string;
		latestRemoteModified?: string;
		author: string;
	}

	onMount(async () => {
		const res = await fetch("/licenses.json");
		licenses = await res.json();
		loading = false;
	});
</script>

<SidebarHeader>{m["sidebar.about.licenses"]()}</SidebarHeader>

{#if loading}
	<p>Loading...</p>
{:else if licenses.length == 0}
	<p>No licenses found.</p>
{:else}
	<ul
		style="display: flex; flex-direction: column; gap: 1em; padding: 0; list-style: none;"
	>
		{#each licenses as license (license.name)}
			<li>
				<strong>{license.name}</strong> - {license.installedVersion}
				<p
					style="white-space: pre-wrap; background: #0e0e0e; padding: 1em; border-radius: 0.5em; overflow-x: scroll;"
				>
					{#await fetch("/licenses/" + license.name + ".LICENSE.txt").then( (res) => res.text(), ) then text}
						{text.startsWith("<!doctype html>") ? license.licenseType : text}
					{:catch _error}
						{license.licenseType}
					{/await}
				</p>
			</li>
		{/each}
	</ul>
{/if}
