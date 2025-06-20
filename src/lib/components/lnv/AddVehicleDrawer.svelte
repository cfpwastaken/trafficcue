<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { BikeIcon, CarIcon, PlusCircleIcon, SaveIcon, TractorIcon, TruckIcon, XIcon } from "@lucide/svelte";
	import Button, { buttonVariants } from "../ui/button/button.svelte";
	import { DefaultVehicle, isValidFuel, selectVehicle, setVehicles, vehicles, type Vehicle, type VehicleType } from "$lib/vehicles/vehicles.svelte";
	import type { Snippet } from "svelte";
	import * as Select from "../ui/select";
	import Input from "../ui/input/input.svelte";
	import EvConnectorSelect from "./EVConnectorSelect.svelte";

	let open = $state(false);

	let { children }: { children: Snippet } = $props();

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

	let vehicle: Vehicle = $state({
		name: "",
		type: "motor_scooter",
		legalMaxSpeed: 45,
		actualMaxSpeed: 45,
		emissionClass: "euro_5",
		fuelType: "diesel",
		preferredFuel: "Diesel"
	});
</script>
 
<Drawer.Root bind:open={open}>
  <Drawer.Trigger class={buttonVariants({ variant: "secondary", class: "w-full p-5" })}>
		{@render children()}
	</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Add Vehicle</Drawer.Title>
    </Drawer.Header>
		<div class="p-4 pt-0 flex flex-col gap-2">
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={vehicle.type}>
					<Select.Trigger class="w-[180px]">
						{@const Icon = getVehicleIcon(vehicle.type)}
						<Icon />
						{vehicle.type === "car" ? "Car" : vehicle.type === "motor_scooter" ? "Moped" : "?"}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="car">
							<CarIcon />
							Car
						</Select.Item>
						<Select.Item value="motor_scooter">
							<TractorIcon />
							Moped
						</Select.Item>
					</Select.Content>
				</Select.Root>

				<Input
					type="text"
					placeholder="Vehicle Name"
					bind:value={vehicle.name}
					class="w-full"
					aria-label="Vehicle Name"
					aria-required="true"
				/>
			</div>

			<div class="flex justify-around mt-4">
				<span>Legal Speed</span>
				<span>/</span>
				<span>Actual Speed</span>
			</div>
			<div class="flex gap-2">
				<Input
					type="number"
					placeholder="Legal Speed"
					bind:value={vehicle.legalMaxSpeed}
					class="w-full text-center"
					aria-label="Legal Max Speed"
					aria-required="true"
				/>
				<Input
					type="number"
					placeholder="Actual Speed"
					bind:value={vehicle.actualMaxSpeed}
					class="w-full text-center"
					aria-label="Actual Max Speed"
					aria-required="true"
				/>
			</div>

			<div class="flex justify-around mt-4">
				<span>Fuel Type</span>
				<span>/</span>
				<span>Preferred Fuel</span>
			</div>
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={vehicle.fuelType}>
					<Select.Trigger class="w-full">
						{vehicle.fuelType === "diesel" ? "Diesel" : vehicle.fuelType === "petrol" ? "Petrol" : "Electric"}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="diesel">Diesel</Select.Item>
						<Select.Item value="petrol">Petrol</Select.Item>
						<Select.Item value="electric">Electric</Select.Item>
					</Select.Content>
				</Select.Root>

				<Select.Root type="single" bind:value={vehicle.preferredFuel}>
					<Select.Trigger class="w-full">
						{vehicle.preferredFuel}
					</Select.Trigger>
					<Select.Content>
						{#if vehicle.fuelType === "diesel"}
							<Select.Item value="Diesel">Diesel</Select.Item>
						{:else if vehicle.fuelType === "petrol"}
							<Select.Item value="Super">Super</Select.Item>
							<Select.Item value="Super E10">Super E10</Select.Item>
						{:else if vehicle.fuelType === "electric"}
							<EvConnectorSelect />
						{/if}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<Drawer.Footer>
			<Button onclick={() => {
				open = false;
				if (vehicle.name.trim() === "") {
					alert("Please enter a vehicle name.");
					return;
				}
				if (vehicle.legalMaxSpeed <= 0 || vehicle.actualMaxSpeed <= 0) {
					alert("Please enter valid speeds.");
					return;
				}
				if(!isValidFuel(vehicle)) {
					alert("Please select a valid fuel type and preferred fuel.");
					return;
				}
				setVehicles([...vehicles, vehicle]);
				selectVehicle(vehicle);
				location.reload(); // TODO
			}}>
				<SaveIcon />
				Save
			</Button>
			<Button variant="secondary" onclick={() => {
				open = false;
			}}>
				<XIcon />
				Cancel
			</Button>
		</Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>