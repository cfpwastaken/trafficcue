<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import {
		BikeIcon,
		CarIcon,
		PlusCircleIcon,
		TractorIcon,
		TruckIcon,
	} from "@lucide/svelte";
	import Button, { buttonVariants } from "../ui/button/button.svelte";
	import {
		DefaultVehicle,
		selectedVehicle,
		selectVehicle,
		vehicles,
		type VehicleType,
	} from "$lib/vehicles/vehicles.svelte";
	import AddVehicleDrawer from "./AddVehicleDrawer.svelte";
	import { m } from "$lang/messages";

	let open = $state(false);

	function getVehicleIcon(type: VehicleType) {
		switch (type) {
			case "car":
				return CarIcon;
			case "motor_scooter":
				return TractorIcon;
			case "bicycle":
				return BikeIcon;
			case "motorcycle":
				return BikeIcon;
			case "truck":
				return TruckIcon;
			default:
				return TractorIcon; // Default icon if no match
		}
	}
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger
		class={buttonVariants({ variant: "secondary", class: "w-full p-5" })}
	>
		{@const vehicle = selectedVehicle() ?? DefaultVehicle}
		{@const Icon = getVehicleIcon(vehicle.type)}
		<Icon />
		{vehicle.name}
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>{m["vehicles.selector.title"]()}</Drawer.Title>
			<Drawer.Description
				>{m["vehicles.selector.description"]()}</Drawer.Description
			>
		</Drawer.Header>
		<div class="p-4 pt-0 flex flex-col gap-2">
			{#each vehicles as vehicle (vehicle.name)}
				<Button
					variant={selectedVehicle() === vehicle ? "default" : "secondary"}
					class="w-full p-5"
					onclick={() => {
						selectVehicle(vehicle);
						open = false;
					}}
				>
					{@const Icon = getVehicleIcon(vehicle.type)}
					<Icon />
					{vehicle.name}
				</Button>
			{/each}

			<AddVehicleDrawer>
				<Button variant="secondary" class="w-full p-5">
					<PlusCircleIcon />
					{m["vehicles.selector.add"]()}
				</Button>
			</AddVehicleDrawer>
		</div>
	</Drawer.Content>
</Drawer.Root>
