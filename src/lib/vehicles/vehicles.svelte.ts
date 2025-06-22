/*
Valhalla costing:
auto, prioritizes motorways = car, (truck), motorcycle
bicycle, prefer cycleways and bicycle lanes = bicycle
(bikeshare)
truck, prioritizes truck routes = truck
motor_scooter = motor scooter, moped, lkfz
*/
export const VehicleTypes = ["car", "truck", "motorcycle", "bicycle", "motor_scooter"] as const;
export type VehicleType = typeof VehicleTypes[number];
export const FuelTypes = ["petrol", "diesel", "electric"] as const;
export type FuelType = typeof FuelTypes[number];
export const EVConnectors = [
	"Type 2", "CCS", "CHAdeMO", "Tesla Supercharger", "Type 1", "Type 3",
	"SEV 1011 (Type 13)", "SEV 1011 (Type 15)", "SEV 1011 (Type 23)", "SEV 1011 (Type 25)",
	"CEE (red)", "CEE (blue)", "Schuko", "CCS Type 2", "Other"
] as const;
export type EVConnector = typeof EVConnectors[number];
export const PreferredFuels = ["Super", "Super E10", "Diesel", ...EVConnectors] as const;
export type PreferredFuel = typeof PreferredFuels[number];
export type Vehicle = {
	name: string;
	legalMaxSpeed: number;
	actualMaxSpeed: number;
	type: VehicleType;
	weight?: number;
	width?: number;
	axisLoad?: number;
	height?: number;
	length?: number;
	emissionClass: string;
	fuelType: FuelType;
	preferredFuel: PreferredFuel;
};

export const DefaultVehicle: Vehicle = {
	name: "Default Vehicle",
	legalMaxSpeed: 45,
	actualMaxSpeed: 45,
	type: "motor_scooter",
	emissionClass: "Euro 4",
	fuelType: "diesel",
	preferredFuel: "Diesel"
}

type StateValue<T> = {v: T};
export const vehicles: Vehicle[] = $state(localStorage.getItem("vehicles") ? JSON.parse(localStorage.getItem("vehicles")!) : []);
export const selectedVehicleIdx: StateValue<number | null> = $state({
	v: localStorage.getItem("selectedVehicle") ? parseInt(localStorage.getItem("selectedVehicle")!) : null
});
export const selectedVehicle: () => Vehicle | null = () => {
	return vehicles[selectedVehicleIdx.v !== null ? selectedVehicleIdx.v : 0] || null
};

export function setVehicles(_vehicles: Vehicle[]) {
	// vehicles = _vehicles;
	// Hack to update without reassigning the array
	vehicles.length = 0;
	_vehicles.forEach(vehicle => vehicles.push(vehicle));
	localStorage.setItem("vehicles", JSON.stringify(vehicles));
}

export function selectVehicle(vehicle: Vehicle | null) {
	if(vehicle == null) {
		selectedVehicleIdx.v = null;
	} else {
		selectedVehicleIdx.v = vehicles.findIndex(v => v.name === vehicle.name);
		if(selectedVehicleIdx.v === -1) {
			selectedVehicleIdx.v = null;
		}
	}
	localStorage.setItem("selectedVehicle", selectedVehicleIdx.v !== null ? selectedVehicleIdx.v.toString() : "");
}

/**
 * Check if the vehicle uses the correct preferred fuel type
 */
export function isValidFuel(vehicle: Vehicle): boolean {
	if(vehicle.fuelType == "petrol") {
		return vehicle.preferredFuel == "Super" || vehicle.preferredFuel == "Super E10";
	}
	if(vehicle.fuelType == "diesel") {
		return vehicle.preferredFuel == "Diesel";
	}
	if(vehicle.fuelType == "electric") {
		return EVConnectors.includes(vehicle.preferredFuel as EVConnector);
	}
	return false;
}
