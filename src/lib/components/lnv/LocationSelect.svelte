<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { m } from "$lang/messages";
	import { BriefcaseIcon, HomeIcon, LocateIcon, MapPinIcon, SchoolIcon } from "@lucide/svelte";
	import { geocode } from "$lib/saved.svelte";
	import { reverseGeocode, search, type Feature } from "$lib/services/Search";

	const locations = [
		{
			value: "current",
			label: m["location-selector.current"](),
			icon: LocateIcon
		},
		{
			value: "home",
			label: m["saved.home"](),
			subtext: geocode("home"),
			icon: HomeIcon
		},
		{
			value: "school",
			label: m["saved.school"](),
			subtext: geocode("school"),
			icon: SchoolIcon
		},
		{
			value: "work",
			label: m["saved.work"](),
			subtext: geocode("work"),
			icon: BriefcaseIcon
		}
	];

	let open = $state(false);
	let { value = $bindable() } = $props();
	let triggerRef = $state<HTMLButtonElement>(null!);
	let searchbarText = $state("");
	let searchText = $derived.by(debounce(() => searchbarText, 300));
	let searching = $state(false);
	let searchResults: Feature[] = $state([]);

	async function getCoordLabel(value: `${number},${number}`) {
		const splitter = value.split(",");
		const res = await reverseGeocode({ lat: parseFloat(splitter[0]), lon: parseFloat(splitter[1]) })
		if(res.length == 0) return "<unknown>";
		const feature = res[0];
		return feature.properties.name;
	}

	const selectedValue = $derived(
		new Promise(async r => { r(locations.find((f) => f.value === value)?.label || await getCoordLabel(value)) })
	);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

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

	$effect(() => {
		if (!searchText) {
			searchResults = [];
			return;
		}
		if (searchText.length > 0) {
			searching = true;
			search(searchText, 0, 0).then((results) => {
				searchResults = results;
				searching = false;
			});
		} else {
			searchResults = [];
		}
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				{...props}
				role="combobox"
				aria-expanded={open}
				style="width: 100%; flex-shrink: unset; justify-content: space-between;"
			>
				{#await selectedValue then selected}
					{selected || "Select..."}
				{/await}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search..." bind:value={searchbarText} />
			<Command.List>
				<Command.Empty>
					{#if searching}
						{m["location-selector.searching"]()}
					{:else}
						{m["location-selector.no-results"]()}
					{/if}
				</Command.Empty>
				<Command.Group>
					{#if searchbarText == ""}
						{#each locations as location}
							<Command.Item
								value={location.value}
								onSelect={() => {
									value = location.value;
									closeAndFocusTrigger();
								}}
								style="flex-direction: column; align-items: start;"
							>
								<div style="display: flex; align-items: center; gap: 5px; width: 100%;">
									<location.icon
										class={cn(
											"mr-2 size-4"
										)}
									/>
									{location.label}
									<CheckIcon
										class={cn(
											"mr-2 size-4 ml-auto",
											value !== location.value && "text-transparent"
										)}
									/>
								</div>
								{#await location.subtext then subtext}
									{#if subtext}
										<span>{subtext}</span>
									{/if}
								{/await}
							</Command.Item>
						{/each}
					{/if}

					{#each searchResults as result}
						{@const resultValue = result.geometry.coordinates[1] + "," + result.geometry.coordinates[0]}
						<Command.Item
							value={resultValue}
							onSelect={() => {
								value = resultValue;
								closeAndFocusTrigger();
							}}
							style="flex-direction: column; align-items: start;"
						>
							<div style="display: flex; align-items: center; gap: 5px; width: 100%;">
								<MapPinIcon
									class={cn(
										"mr-2 size-4"
									)}
								/>
								{result.properties.name}
								<CheckIcon
									class={cn(
										"mr-2 size-4 ml-auto",
										value !== resultValue && "text-transparent"
									)}
								/>
							</div>
							<span>{result.properties.street}{result.properties.housenumber ? " " + result.properties.housenumber : ""}, {result.properties.city}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
