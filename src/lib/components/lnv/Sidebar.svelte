<script lang="ts">
	import { type Component } from "svelte";
	import { searchbar, view } from "./view.svelte";
	import { map } from "./map.svelte";
	import Input from "../ui/input/input.svelte";
	import {
		EllipsisIcon,
		HomeIcon,
		SettingsIcon,
		UserIcon,
	} from "@lucide/svelte";
	import Button from "../ui/button/button.svelte";
	import { search, type Feature } from "$lib/services/Search";
	import RequiresCapability from "./RequiresCapability.svelte";
	import {
		advertiseRemoteLocation,
		location,
		remoteLocation,
	} from "./location.svelte";
	import * as Popover from "../ui/popover";
	import { routing } from "$lib/services/navigation/routing.svelte";
	import InRouteSidebar from "./sidebar/InRouteSidebar.svelte";
	import { m } from "$lang/messages";

	import LoadingSidebar from "./sidebar/LoadingSidebar.svelte";

	const views: Record<string, string> = {
		main: "MainSidebar",
		info: "InfoSidebar",
		route: "RouteSidebar",
		trip: "TripSidebar",
		search: "SearchSidebar",
		user: "UserSidebar",
		settings: "settings/SettingsSidebar",
		about: "settings/AboutSidebar",
		"offline-maps": "settings/OfflineMapsSidebar",
		"dev-options": "settings/DeveloperSidebar",
		language: "settings/LanguageSidebar",
		onboarding: "onboarding/OnboardingSidebar",
		"onboarding-vehicles": "onboarding/OnboardingVehiclesSidebar",
	};

	let isDragging = false;
	let startY = 0;
	let startHeight = 0;
	let sidebarHeight = $state(200);

	let CurrentView: Component = $state(LoadingSidebar);
	const modules = import.meta.glob("./sidebar/**/*.svelte");
	$effect(() => {
		const path = modules[`./sidebar/${views[view.current.type] || "InvalidSidebar"}.svelte`];
		if (!path) {
			// Invalid view
			import("./sidebar/InvalidSidebar.svelte").then((m) => {
				CurrentView = m.default;
			});
			return;
		}
		path().then((m) => {
			CurrentView = (m as { default: Component }).default;
		});
	});

	function debounce<T>(getter: () => T, delay: number): () => T | undefined {
		let value = $state<T>();
		let timer: NodeJS.Timeout;
		$effect(() => {
			const newValue = getter(); // read here to subscribe to it
			clearTimeout(timer);
			timer = setTimeout(() => (value = newValue), delay);
			return () => clearTimeout(timer);
		});
		return () => value;
	}

	// TODO: implement loading state
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let loading = $state(false);

	let searchText = $derived.by(debounce(() => searchbar.text, 300));
	let searchResults: Feature[] = $state([]);
	let mobileView = $derived(window.innerWidth < 768 || routing.currentTrip);

	$effect(() => {
		if (!searchText) {
			searchResults = [];
			if (view.current.type == "search") view.switch("main");
			return;
		}
		if (searchText.length > 0) {
			loading = true;
			search(searchText, 0, 0).then((results) => {
				searchResults = results;
				loading = false;
				view.switch("search", {
					results: searchResults,
					query: searchText,
				});
			});
		} else {
			searchResults = [];
		}
	});
</script>

{#if !routing.currentTrip}
	<div id="floating-search" class={mobileView ? "mobileView" : ""}>
		<Input class="h-10" placeholder="Search..." bind:value={searchbar.text} />
	</div>
{/if}
<div
	id="sidebar"
	class={mobileView ? "mobileView" : ""}
	style={(mobileView ? `height: ${sidebarHeight}px;` : "") +
		(routing.currentTrip ? "bottom: 0 !important;" : "")}
>
	{#if mobileView}
		<div
			role="button"
			id="grabber"
			style="height: 10px; cursor: grab; display: flex; justify-content: center; align-items: center; touch-action: none;"
			ontouchstart={(e) => {
				isDragging = true;
				startY = e.touches[0].clientY;
				startHeight = sidebarHeight;
			}}
			ontouchmove={(e) => {
				if (!isDragging) return;
				e.preventDefault();
				const deltaY = e.touches[0].clientY - startY;
				let newHeight = Math.max(100, startHeight - deltaY);

				const snapPoint = 200;
				const snapThreshold = 20;
				if (Math.abs(newHeight - snapPoint) < snapThreshold) {
					newHeight = snapPoint;
				}
				sidebarHeight = newHeight;

				map.updateMapPadding();
			}}
			ontouchend={() => {
				if (!isDragging) return;
				isDragging = false;
			}}
		>
			<div
				style="height: 8px; background-color: #acacac; width: 40%; border-radius: 15px;"
			></div>
		</div>
	{/if}

	{#if routing.currentTrip}
		<InRouteSidebar />
	{:else}
		<CurrentView {...view.current.props}></CurrentView>
	{/if}
</div>
{#if !routing.currentTrip}
	<div id="navigation" class={mobileView ? "mobileView" : ""}>
		<button onclick={() => view.switch("main")}>
			<HomeIcon />
		</button>
		<RequiresCapability capability="auth">
			<button
				onclick={async () => {
					view.switch("user");
				}}
			>
				<UserIcon />
			</button>
		</RequiresCapability>
		<button
			onclick={() => {
				view.switch("settings");
			}}
		>
			<SettingsIcon />
		</button>
		<!-- <button onclick={() => {
			location.toggleLock();
		}}>
			L
		</button> -->
		<Popover.Root>
			<Popover.Trigger>
				<button>
					<EllipsisIcon />
				</button>
			</Popover.Trigger>
			<Popover.Content>
				<div class="flex flex-col gap-2">
					<Button
						variant="outline"
						onclick={() => {
							location.toggleLock();
						}}
					>
						{location.locked ? m["location.unlock"]() : m["location.unlock"]()}
					</Button>
					{#if location.code}
						<span>{m["location.code"]()}: {location.code}</span>
					{/if}
					<Button
						variant="outline"
						onclick={() => {
							advertiseRemoteLocation();
						}}
					>
						{m["location.start"]()}
					</Button>
					<Button
						variant="outline"
						onclick={() => {
							remoteLocation(prompt("Code?") || "");
						}}
					>
						{m["location.join"]()}
					</Button>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>
{/if}

<style>
	#sidebar {
		background-color: hsla(0, 0%, 5%, 0.6);
		backdrop-filter: blur(5px);
		color: white;
		padding: 15px;
		width: calc(25% - 20px);
		max-width: calc(25% - 20px);
		overflow-y: scroll;
		height: calc(100vh - 20px - 40px - 10px - 50px);
		max-height: calc(100vh - 20px);

		position: fixed;
		top: calc(40px + 10px);
		left: 0;
		z-index: 10;
		margin: 10px;
		border-radius: 15px;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	#floating-search {
		position: fixed;
		margin: 10px;
		margin-top: calc(10px + env(safe-area-inset-top));
		top: 0;
		left: 0;
		z-index: 20;
		width: calc(25% - 20px);
		background-color: hsla(0, 0%, 5%, 0.6);
		backdrop-filter: blur(5px);
		border-radius: 10px;
	}

	#navigation {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 50;
		background-color: hsla(0, 0%, 5%, 0.9);
		backdrop-filter: blur(5px);
		margin-bottom: 0;
		padding: 10px;
		padding-bottom: calc(10px + env(safe-area-inset-bottom));
		margin: 10px;
		width: calc(25% - 20px);
		/* border-top-left-radius: 15px;
		border-top-right-radius: 15px; */
		height: 50px;
		border-bottom-left-radius: 15px;
		border-bottom-right-radius: 15px;

		display: flex;
		justify-content: space-around;
	}

	/* mobile view */
	#sidebar.mobileView {
		position: fixed;
		top: unset;
		bottom: calc(50px + env(safe-area-inset-bottom));
		left: 0;
		/* min-width: calc(100% - 20px);
		max-width: calc(100% - 20px); */
		min-width: calc(100%);
		max-width: calc(100%);
		width: calc(100% - 20px);
		height: 200px;
		margin: unset;
		/* margin-left: 10px;
		margin-right: 10px; */
		border-radius: 0;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
		padding-top: 5px; /* for the grabber */
	}

	#floating-search.mobileView {
		width: calc(100% - 20px);
	}

	#navigation.mobileView {
		margin: 0;
		width: calc(100%);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding-bottom: calc(40px + env(safe-area-inset-bottom));
	}
</style>
