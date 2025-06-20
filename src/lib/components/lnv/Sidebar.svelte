<script lang="ts">
	import { onMount, type Component } from "svelte";
	import InvalidSidebar from "./sidebar/InvalidSidebar.svelte";
	import { searchbar, view } from "./sidebar.svelte";
	import MainSidebar from "./sidebar/MainSidebar.svelte";
	import InfoSidebar from "./sidebar/InfoSidebar.svelte";
	import RouteSidebar from "./sidebar/RouteSidebar.svelte";
	import { map } from "./map.svelte";
	import TripSidebar from "./sidebar/TripSidebar.svelte";
	import Input from "../ui/input/input.svelte";
	import { HomeIcon, SettingsIcon, UserIcon } from "@lucide/svelte";
	import Button from "../ui/button/button.svelte";
	import { search, type Feature } from "$lib/services/Search";
	import SearchSidebar from "./sidebar/SearchSidebar.svelte";

	const views: {[key: string]: Component<any>} = {
		main: MainSidebar,
		info: InfoSidebar,
		route: RouteSidebar,
		trip: TripSidebar,
		search: SearchSidebar
	};

	let isDragging = false;
	let startY = 0;
	let startHeight = 0;
	let sidebarHeight = $state(200);

	let CurrentView = $derived(views[view.current.type] || InvalidSidebar);

	function debounce<T>(getter: () => T, delay: number): () => T | undefined {
		let value = $state<T>();
		let timer: NodeJS.Timeout;
		$effect(() => {
			const newValue = getter(); // read here to subscribe to it
			clearTimeout(timer);
			timer = setTimeout(() => value = newValue, delay);
			return () => clearTimeout(timer);
		});
		return () => value;
	}

	let loading = $state(false);

	let searchText = $derived.by(debounce(() => searchbar.text, 300));
	let searchResults: Feature[] = $state([]);

	$effect(() => {
		if(!searchText) {
			searchResults = [];
			if(view.current.type == "search") view.switch("main");
			return;
		}
		if (searchText.length > 0) {
			loading = true;
			search(searchText, 0, 0).then(results => {
				searchResults = results;
				loading = false;
				view.switch("search", {
					results: searchResults,
					query: searchText
				})
			});
		} else {
			searchResults = [];
		}
	});
</script>

<div id="floating-search">
	<Input class="h-10"
		placeholder="Search..." bind:value={searchbar.text} />
</div>
<div id="sidebar" style={window.innerWidth < 768 ? `height: ${sidebarHeight}px` : ""}>
	{#if window.innerWidth < 768}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div role="button" id="grabber" style="height: 10px; cursor: grab; display: flex; justify-content: center; align-items: center; touch-action: none;" ontouchstart={(e) => {
			isDragging = true;
			startY = e.touches[0].clientY;
			startHeight = sidebarHeight;
		}} ontouchmove={(e) => {
			if(!isDragging) return;
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
		}} ontouchend={() => {
			if(!isDragging) return;
			isDragging = false;
		}}>
			<div style="height: 8px; background-color: #acacac; width: 40%; border-radius: 15px;"></div>
		</div>
	{/if}
	<CurrentView {...view.current.props}></CurrentView>
</div>
<div id="navigation">
	<button>
		<HomeIcon />
	</button>
	<button>
		<UserIcon />
	</button>
	<button>
		<SettingsIcon />
	</button>
</div>

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

	@media (max-width: 768px) {
		#sidebar {
			position: fixed;
			top: unset;
			bottom: 50px;
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

		#floating-search {
			width: calc(100% - 20px);
		}

		#navigation {
			margin: 0;
			width: calc(100%);
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
	}
</style>