<script lang="ts">
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import {
		BikeIcon,
		CarIcon,
		SaveIcon,
		TractorIcon,
		TruckIcon,
		XIcon,
	} from "@lucide/svelte";
	import Button, { buttonVariants } from "../ui/button/button.svelte";
	import {
		isValidFuel,
		selectVehicle,
		setVehicles,
		vehicles,
		type Vehicle,
		type VehicleType,
	} from "$lib/vehicles/vehicles.svelte";
	import type { Snippet } from "svelte";
	import * as Select from "../ui/select";
	import Input from "../ui/input/input.svelte";
	import EvConnectorSelect from "./EVConnectorSelect.svelte";
	import { m } from "$lang/messages";

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
		preferredFuel: "Diesel",
	});
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger
		class={buttonVariants({ variant: "secondary", class: "w-full p-5" })}
	>
		{@render children()}
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>{m["vehicles.selector.add"]()}</Drawer.Title>
		</Drawer.Header>
		<div class="p-4 pt-0 flex flex-col gap-2">
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={vehicle.type}>
					<Select.Trigger class="w-[180px]">
						{@const Icon = getVehicleIcon(vehicle.type)}
						<Icon />
						{vehicle.type === "car"
							? m["vehicles.types.car"]()
							: vehicle.type === "motor_scooter"
								? m["vehicles.types.moped"]()
								: "?"}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="car">
							<CarIcon />
							{m["vehicles.types.car"]()}
						</Select.Item>
						<Select.Item value="motor_scooter">
							<TractorIcon />
							{m["vehicles.types.moped"]()}
						</Select.Item>
					</Select.Content>
				</Select.Root>

				<Input
					type="text"
					placeholder={m["vehicles.add.name"]()}
					bind:value={vehicle.name}
					class="w-full"
					aria-label={m["vehicles.add.name"]()}
					aria-required="true"
				/>
			</div>

			<div class="flex justify-around mt-4">
				<span>{m["vehicles.add.legal-speed"]()}</span>
				<span>/</span>
				<span>{m["vehicles.add.actual-speed"]()}</span>
			</div>
			<div class="flex gap-2">
				<Input
					type="number"
					placeholder={m["vehicles.add.legal-speed"]()}
					bind:value={vehicle.legalMaxSpeed}
					class="w-full text-center"
					aria-label={m["vehicles.add.legal-speed"]()}
					aria-required="true"
				/>
				<Input
					type="number"
					placeholder={m["vehicles.add.actual-speed"]()}
					bind:value={vehicle.actualMaxSpeed}
					class="w-full text-center"
					aria-label={m["vehicles.add.actual-speed"]()}
					aria-required="true"
				/>
			</div>

			<div class="flex justify-around mt-4">
				<span>{m["vehicles.add.fuel"]()}</span>
				<span>/</span>
				<span>{m["vehicles.add.preferred-fuel"]()}</span>
			</div>
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={vehicle.fuelType}>
					<Select.Trigger class="w-full">
						{vehicle.fuelType === "diesel"
							? m["vehicles.add.diesel"]()
							: vehicle.fuelType === "petrol"
								? m["vehicles.add.petrol"]()
								: m["vehicles.add.electric"]()}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="diesel">{m["vehicles.add.diesel"]()}</Select.Item>
						<Select.Item value="petrol">{m["vehicles.add.petrol"]()}</Select.Item>
						<Select.Item value="electric">{m["vehicles.add.electric"]()}</Select.Item>
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
			<Button
				onclick={() => {
					open = false;
					if (vehicle.name.trim() === "") {
						alert(m["vehicles.add.errors.enter-name"]());
						return;
					}
					if (vehicle.legalMaxSpeed <= 0 || vehicle.actualMaxSpeed <= 0) {
						alert(m["vehicles.add.errors.enter-speeds"]());
						return;
					}
					if (!isValidFuel(vehicle)) {
						alert(m["vehicles.add.errors.select-fuel"]());
						return;
					}
					setVehicles([...vehicles, vehicle]);
					selectVehicle(vehicle);
					location.reload(); // TODO
				}}
			>
				<SaveIcon />
				{m.save()}
			</Button>
			<Button
				variant="secondary"
				onclick={() => {
					open = false;
				}}
			>
				<XIcon />
				{m.cancel()}
			</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
