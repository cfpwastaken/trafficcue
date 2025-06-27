type Language = "de-DE" | "en-US";
interface WorldLocation {
	lat: number;
	lon: number;
}
type Units = "kilometers" | "miles";

interface RouteResult {
	alternates?: {
		trip: Trip;
	}[];
	trip: Trip;
}

interface Trip {
	language: Language;
	legs: Leg[];
	status: number;
	status_message: string;
	summary: Summary;
	units: Units;
	locations: WorldLocation[];
}

interface Leg {
	maneuvers: Maneuver[];
	shape: string;
	summary: Summary;
	locations: WorldLocation[];
}

interface Summary {
	cost: number;
	has_ferry: boolean;
	has_highway: boolean;
	has_time_restrictions: boolean;
	has_toll: boolean;
	length: number;
	max_lat: number;
	max_lon: number;
	min_lat: number;
	min_lon: number;
	time: number;
}

/**
 * Direction bitmask:
 * 0 = Empty
 * 1 = None
 * 2 = Through/Straight X
 * 4 = SharpLeft        X
 * 8 = Left             X
 * 16 = SlightLeft      X
 * 32 = SlightRight     X
 * 64 = Right           X
 * 128 = SharpRight     X
 * 256 = Reverse/U-turn X
 * 512 = MergeToLeft
 * 1024 = MergeToRight
 */
interface Lane {
	directions: number;
	valid: number;
	active: number;
}

interface Maneuver {
	bearing_after: number;
	begin_shape_index: number;
	cost: number;
	end_shape_index: number;
	instruction: string;
	length: number;
	street_names?: string[];
	time: number;
	travel_mode: string;
	travel_type: string;
	type: number;
	verbal_multi_cue: boolean;
	verbal_post_transition_instruction: string;
	verbal_pre_transition_instruction: string;
	verbal_succinct_transition_instruction: string;
	lanes?: Lane[];
	roundabout_exit_count?: number; // Only for roundabouts
}
