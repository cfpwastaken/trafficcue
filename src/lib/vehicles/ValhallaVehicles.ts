import type {
	ValhallaCosting,
	ValhallaCostingOptions,
	ValhallaRequest,
} from "$lib/services/navigation/ValhallaRequest";
import type { Vehicle } from "./vehicles.svelte";

function getVehicleCosting(vehicle: Vehicle): ValhallaCosting {
	switch (vehicle.type) {
		case "car":
		case "motorcycle":
			return "auto";
		case "truck":
			return "truck";
		case "bicycle":
			return "bicycle";
		case "motor_scooter":
			return "motor_scooter";
		default:
			throw new Error("Invalid vehicle type");
	}
}

export function createValhallaRequest(
	vehicle: Vehicle,
	locations: WorldLocation[],
): ValhallaRequest {
	const costing = getVehicleCosting(vehicle);
	const costingOptions: ValhallaCostingOptions =
		costing == "auto"
			? {
					auto: {
						top_speed: vehicle.legalMaxSpeed,
						fixed_speed: vehicle.actualMaxSpeed,
					},
				}
			: costing == "motor_scooter"
				? {
						motor_scooter: {
							top_speed: vehicle.legalMaxSpeed,
							fixed_speed: vehicle.actualMaxSpeed,
						},
					}
				: costing == "truck"
					? {
							truck: {
								top_speed: vehicle.legalMaxSpeed,
								fixed_speed: vehicle.actualMaxSpeed,
								length: vehicle.length,
								weight: vehicle.weight,
								axle_load: vehicle.axisLoad,
							},
						}
					: costing == "bicycle"
						? {
								bicycle: {
									cycling_speed: vehicle.actualMaxSpeed,
								},
							}
						: {};
	return {
		locations,
		costing,
		units: "kilometers",
		alternates: 2,
		language: "de-DE",
		costing_options: costingOptions,
		turn_lanes: true,
	};
}
