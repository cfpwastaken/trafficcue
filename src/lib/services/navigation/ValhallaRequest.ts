export type ValhallaCosting =
	| "auto"
	| "bicycle"
	| "bus"
	| "bikeshare"
	| "truck"
	| "taxi"
	| "motor_scooter"
	| "multimodal"
	| "pedestrian";
export interface ValhallaRequest {
	locations: WorldLocation[];
	costing: ValhallaCosting;
	units: "miles" | "kilometers";
	language: string;
	alternates: number;
	costing_options: ValhallaCostingOptions;
	turn_lanes: boolean;
}
export interface GeneralCostingOptions {
	/**
	 * A penalty applied when transitioning between roads that do not have consistent
	 * naming - in other words, no road names in common. This penalty can be used to
	 * create simpler routes that tend to have fewer maneuvers or narrative guidance
	 * instructions.
	 * @default 5 seconds
	 */
	maneuver_penalty?: number;
	/**
	 * A cost applied when a gate with undefined or private access is encountered.
	 * This cost is added to the estimated time / elapsed time.
	 * @default 30 seconds
	 */
	gate_cost?: number;
	/**
	 * A penalty applied when a gate with no access information is on the road.
	 * @default 300 seconds
	 */
	gate_penalty?: number;
	/**
	 * A penalty applied when entering an road which is only allowed to enter if
	 * necessary to reach the destination.
	 */
	destination_only_penalty?: number;
	/**
	 * A cost applied when encountering an international border. This cost is added to the
	 * estimated and elapsed times.
	 * @default 600 seconds (10 minutes)
	 */
	country_crossing_cost?: number;
	/**
	 * A penalty applied for a country crossing. This penalty can be used to create paths
	 * that avoid spanning country boundaries.
	 * @default 0
	 */
	country_crossing_penalty?: number;
	/**
	 * A penalty applied for transition to generic service road.
	 * @default 0 for trucks, 15 for cars, buses, motor scooters and motorcycles
	 */
	service_penalty?: number;
}
export type AutomobileCostingOptions = {
	/**
	 * A penalty applied when a gate or bollard with access=private is encountered.
	 * @default 450 seconds
	 */
	private_access_penalty?: number;
	/**
	 * A cost applied when a toll booth is encountered. This cost is added to the
	 * estimated and elapsed times.
	 * @default 15 seconds
	 */
	toll_booth_cost?: number;
	/**
	 * A penalty applied to the cost when a toll booth is encountered.
	 * This penalty can be used to create paths that avoid toll roads.
	 * @default 0
	 */
	toll_booth_penalty?: number;
	/**
	 * A cost applied when entering a ferry. This cost is added to the estimated
	 * and elapsed times.
	 * @default 300 seconds (5 minutes)
	 */
	ferry_cost?: number;
	/**
	 * This value indicates the willingness to take ferries. This is a range of values
	 * between 0 and 1. Values near 0 attempt to avoid ferries and values near 1 will
	 * favor ferries. Note that sometimes ferries are required to complete a route
	 * so values of 0 are not guaranteed to avoid ferries entirely.
	 * @default 0.5
	 */
	use_ferry?: number;
	/**
	 * This value indicates the willingness to take highways. This is a range of values
	 * between 0 and 1. Values near 0 attempt to avoid highways and values near 1 will
	 * favor highways. Note that sometimes highways are required to complete a route
	 * so values of 0 are not guaranteed to avoid highways entirely.
	 * @default 1.0
	 */
	use_highways?: number;
	/**
	 * This value indicates the willingness to take roads with tolls. This is a range of
	 * values between 0 and 1. Values near 0 attempt to avoid tolls and values near 1 will
	 * not attempt to avoid them. Note that sometimes roads with tolls are required to
	 * complete a route so values of 0 are not guaranteed to avoid them entirely.
	 * @default 0.5
	 */
	use_tolls?: number;
	/**
	 * This value indicates the willingness to take living streets. This is a range of
	 * values between 0 and 1. Values near 0 attempt to avoid living streets and values
	 * near 1 will favor living streets. Note that sometimes living streets are required
	 * to complete a route so values of 0 are not guaranteed to avoid living streets entirely.
	 * @default 0 for trucks, 0.1 for cars, buses, motor scooters and motorcycles
	 */
	use_living_streets?: number;
	/**
	 * This value indicates the willingness to take track roads. This is a range of values
	 * between 0 and 1. Values near 0 attempt to avoid tracks and values near 1 will favor
	 * tracks a little bit. Note that sometimes tracks are required to complete a route so values
	 * of 0 are not guaranteed to avoid tracks entirely.
	 * @default 0 for autos, 0.5 for motor scooters and motorcycles
	 */
	use_tracks?: number;
	/**
	 * A factor that modifies (multiplies) the cost when generic service roads
	 * are encountered.
	 * @default 1
	 */
	service_factor?: number;
	/**
	 * Changes the metric to quasi-shortest, i.e. purely distance-based costing.
	 * Note, this will disable all other costings & penalties. Also note, shortest will not
	 * disable hierarchy pruning, leading to potentially sub-optimal routes for some costing models.
	 * @default false
	 */
	shortest?: boolean;
	/**
	 * A factor that allows controlling the contribution of distance and time to the route costs.
	 * The value is in range between 0 and 1, where 0 only takes time into account (default)
	 * and 1 only distance. A factor of 0.5 will weight them roughly equally.
	 * Note: this costing is currently only available for auto costing.
	 */
	use_distance?: boolean;
	/**
	 * Disable hierarchies to calculate the actual optimal route.
	 * Note: This could be quite a performance drainer so there is a upper limit of distance.
	 * If the upper limit is exceeded, this option will always be false.
	 * @default false
	 */
	disable_hierarchy_pruning?: boolean;
	/**
	 * Top speed the vehicle can go. Also used to avoid roads with higher speeds than this value.
	 * top_speed must be between 10 and 252 KPH.
	 * @default 120 KPH for truck, 140 KPH for auto and bus, 45 KPH for motor_scooter
	 */
	top_speed?: number;
	/**
	 * Fixed speed the vehicle can go. Used to override the calculated speed.
	 * Can be useful if speed of vehicle is known. fixed_speed must be between 1 and 252 KPH.
	 * The default value is 0 KPH which disables fixed speed and falls back to the standard
	 * calculated speed based on the road attribution.
	 * @default 0
	 */
	fixed_speed?: number;
	/**
	 * If set to true, ignores all closures, marked due to live traffic closures, during routing.
	 * Note: This option cannot be set if location.search_filter.exclude_closures is also specified
	 * in the request and will return an error if it is.
	 * @default false
	 */
	ignore_closures?: boolean;
	/**
	 * A factor that penalizes the cost when traversing a closed edge
	 * (eg: if search_filter.exclude_closures is false for origin and/or destination location
	 * and the route starts/ends on closed edges). Its value can range from 1.0 - don't penalize closed edges,
	 * to 10.0 - apply high cost penalty to closed edges.
	 * Note: This factor is applicable only for motorized modes of transport, i.e auto, motorcycle, motor_scooter, bus, truck & taxi.
	 * @default 9.0
	 */
	closure_factor?: number;
	/**
	 * If set to true, ignores any restrictions (e.g. turn/dimensional/conditional restrictions).
	 * Especially useful for matching GPS traces to the road network regardless of restrictions.
	 * @default false
	 */
	ignore_restrictions?: boolean;
	/**
	 * If set to true, ignores one-way restrictions. Especially useful for matching GPS traces
	 * to the road network ignoring uni-directional traffic rules.
	 * Not included in ignore_restrictions option.
	 * @default false
	 */
	ignore_oneways?: boolean;
	/**
	 * Similar to ignore_restrictions, but will respect restrictions that impact vehicle safety,
	 * such as weight and size restrictions.
	 * @default false
	 */
	ignore_non_vehicular_restrictions?: boolean;
	/**
	 * Will ignore mode-specific access tags. Especially useful for matching GPS traces to the
	 * road network regardless of restrictions.
	 * @default false
	 */
	ignore_access?: boolean;
	/**
	 * Will ignore construction tags. Only works when the include_construction option is set
	 * before building the graph. Useful for planning future routes.
	 * @default false
	 */
	ignore_construction?: boolean;
	/**
	 * Will determine which speed sources are used, if available. A list of strings with the following possible values:
	 * @default ["freeflow", "constrained", "predicted", "current"]
	 */
	speed_types?: ("freeflow" | "constrained" | "predicted" | "current")[];
	/**
	 * Pass custom hierarchy limits along with this request (read more about the tile hierarchy here).
	 * Needs to be an object with mandatory keys 1 and 2, each value is another object containing
	 * numerical values for max_up_transitions and expand_within_distance. The service may either
	 * clamp these values or disallow modifying hierarchy limits via the request parameters entirely.
	 * @todo
	 */
	hierarchy_limits?: void;
} & GeneralCostingOptions;
export interface OtherCostingOptions {
	/**
	 * The height of the vehicle (in meters).
	 * @default 1.9 for car, bus, taxi and 4.11 for truck
	 */
	height?: number;
	/**
	 * The width of the vehicle (in meters).
	 * @default 1.6 for car, bus, taxi and 2.6 for truck
	 */
	width?: number;
	/**
	 * This value indicates whether or not the path may include unpaved roads.
	 * If exclude_unpaved is set to 1 it is allowed to start and end with unpaved roads,
	 * but is not allowed to have them in the middle of the route path, otherwise they are allowed.
	 * @default false
	 */
	exclude_unpaved?: boolean;
	/**
	 * A boolean value which indicates the desire to avoid routes with cash-only tolls.
	 * @default false
	 */
	exclude_cash_only_tolls?: boolean;
	/**
	 * A boolean value which indicates the desire to include HOV roads with a 2-occupant requirement
	 * in the route when advantageous.
	 * @default false
	 */
	include_hov2?: boolean;
	/**
	 * A boolean value which indicates the desire to include HOV roads with a 3-occupant requirement
	 * in the route when advantageous.
	 * @default false
	 */
	include_hov3?: boolean;
	/**
	 * A boolean value which indicates the desire to include tolled HOV roads which require the driver
	 * to pay a toll if the occupant requirement isn't met.
	 * @default false
	 */
	include_hot?: boolean;
}
/**
 * The type of the bicycle.
 * Road: a road-style bicycle with narrow tires that is generally lightweight and designed for speed on paved surfaces.
 * Hybrid or City: a bicycle made mostly for city riding or casual riding on roads and paths with good surfaces.
 * Cross: a cyclo-cross bicycle, which is similar to a road bicycle but with wider tires suitable to rougher surfaces.
 * Mountain: a mountain bicycle suitable for most surfaces but generally heavier and slower on paved surfaces.
 */
export type BicycleType = "Road" | "Hybrid" | "City" | "Mountain";
export interface BicycleCostingOptions {
	/**
	 * @default "Hybrid"
	 */
	bicycle_type?: BicycleType;
	/**
	 * Cycling speed is the average travel speed along smooth, flat roads.
	 * This is meant to be the speed a rider can comfortably maintain over the desired distance of the route.
	 * It can be modified (in the costing method) by surface type in conjunction with bicycle type and (coming soon)
	 * by hilliness of the road section. When no speed is specifically provided, the default speed is determined
	 * by the bicycle type and are as follows: Road = 25 KPH (15.5 MPH), Cross = 20 KPH (13 MPH),
	 * Hybrid/City = 18 KPH (11.5 MPH), and Mountain = 16 KPH (10 MPH).
	 */
	cycling_speed?: number;
	/**
	 * A cyclist's propensity to use roads alongside other vehicles.
	 * This is a range of values from 0 to 1, where 0 attempts to avoid roads
	 * and stay on cycleways and paths, and 1 indicates the rider is more
	 * comfortable riding on roads. Based on the use_roads factor, roads with
	 * certain classifications and higher speeds are penalized in an attempt to
	 * avoid them when finding the best path.
	 * @default 0.5
	 */
	use_roads?: number;
	/**
	 * A cyclist's desire to tackle hills in their routes.
	 * This is a range of values from 0 to 1, where 0 attempts to avoid
	 * hills and steep grades even if it means a longer (time and distance) path,
	 * while 1 indicates the rider does not fear hills and steeper grades.
	 * Based on the use_hills factor, penalties are applied to roads based on
	 * elevation change and grade. These penalties help the path avoid hilly
	 * roads in favor of flatter roads or less steep grades where available.
	 * Note that it is not always possible to find alternate paths to avoid
	 * hills (for example when route locations are in mountainous areas).
	 * @default 0.5
	 */
	use_hills?: number;
	/**
	 * This value indicates the willingness to take ferries.
	 * This is a range of values between 0 and 1.
	 * Values near 0 attempt to avoid ferries and values near 1 will
	 * favor ferries. Note that sometimes ferries are required to complete
	 * a route so values of 0 are not guaranteed to avoid ferries entirely.
	 * @default 0.5
	 */
	use_ferry?: number;
	/**
	 * This value indicates the willingness to take living streets.
	 * This is a range of values between 0 and 1. Values near 0 attempt
	 * to avoid living streets and values from 0.5 to 1 will currently
	 * have no effect on route selection. Note that sometimes living
	 * streets are required to complete a route so values of 0 are not
	 * guaranteed to avoid living streets entirely.
	 * @default 0.5
	 */
	use_living_streets?: number;
	/**
	 * This value is meant to represent how much a cyclist wants to avoid
	 * roads with poor surfaces relative to the bicycle type being used.
	 * This is a range of values between 0 and 1. When the value is 0,
	 * there is no penalization of roads with different surface types;
	 * only bicycle speed on each surface is taken into account. As
	 * the value approaches 1, roads with poor surfaces for the bike are
	 * penalized heavier so that they are only taken if they significantly
	 * improve travel time. When the value is equal to 1, all bad surfaces
	 * are completely disallowed from routing, including start and end points.
	 * @default 0.25
	 */
	avoid_bad_surfaces?: number;
	/**
	 * This value is useful when bikeshare is chosen as travel mode.
	 * It is meant to give the time will be used to return a rental bike.
	 * This value will be displayed in the final directions and used to
	 * calculate the whole duration.
	 * @default 120 seconds
	 */
	bss_return_cost?: number;
	/**
	 * This value is useful when bikeshare is chosen as travel mode.
	 * It is meant to describe the potential effort to return a rental bike.
	 * This value won't be displayed and used only inside of the algorithm.
	 */
	bss_return_penalty?: number;
	/**
	 * Changes the metric to quasi-shortest, i.e. purely distance-based costing.
	 * Note, this will disable all other costings & penalties. Also note, shortest
	 * will not disable hierarchy pruning, leading to potentially sub-optimal routes
	 * for some costing models.
	 * @default false
	 */
	shortest?: boolean;
}
export type BikeshareCostingOptions = unknown; // TODO
export type MotorScooterCostingOptions = {
	/**
	 * A rider's propensity to use primary roads.
	 * This is a range of values from 0 to 1, where 0
	 * attempts to avoid primary roads, and 1 indicates
	 * the rider is more comfortable riding on primary roads.
	 * Based on the use_primary factor, roads with certain
	 * classifications and higher speeds are penalized in an
	 * attempt to avoid them when finding the best path.
	 * @default 0.5
	 */
	use_primary?: boolean;
	/**
	 * A rider's desire to tackle hills in their routes.
	 * This is a range of values from 0 to 1, where 0
	 * attempts to avoid hills and steep grades even if
	 * it means a longer (time and distance) path, while 1
	 * indicates the rider does not fear hills and steeper grades.
	 * Based on the use_hills factor, penalties are applied
	 * to roads based on elevation change and grade. These
	 * penalties help the path avoid hilly roads in favor of flatter
	 * roads or less steep grades where available. Note that it is
	 * not always possible to find alternate paths to avoid hills
	 * (for example when route locations are in mountainous areas).
	 * @default 0.5
	 */
	use_hills?: boolean;
} & AutomobileCostingOptions;
export type MultimodalCostingOptions = unknown; // TODO
export type PedestrianCostingOptions = unknown; // TODO
export interface TruckCostingOptions {
	/**
	 * The length of the truck (in meters).
	 * @default 21.64
	 */
	length?: number;
	/**
	 * The weight of the truck (in metric tons).
	 * @default 21.77
	 */
	weight?: number;
	/**
	 * The axle load of the truck (in metric tons).
	 * @default 9.07
	 */
	axle_load?: number;
	/**
	 * The axle count of the truck.
	 * @default 5
	 */
	axle_count?: number;
	/**
	 * A value indicating if the truck is carrying hazardous materials.
	 * @default false
	 */
	hazmat?: boolean;
	/**
	 * A penalty applied to roads with no HGV/truck access.
	 * If set to a value less than 43200 seconds, HGV will
	 * be allowed on these roads and the penalty applies.
	 * Default 43200, i.e. trucks are not allowed.
	 * @default 43200
	 */
	hgv_no_access_penalty?: number;
	/**
	 * A penalty (in seconds) which is applied when going to residential or service roads.
	 * @default 30 seconds
	 */
	low_class_penalty?: number;
	/**
	 * This value is a range of values from 0 to 1, where 0 indicates a light preference
	 * for streets marked as truck routes, and 1 indicates that streets not marked as truck
	 * routes should be avoided. This information is derived from the hgv=designated tag.
	 * Note that even with values near 1, there is no guarantee the returned route will
	 * include streets marked as truck routes.
	 * @default 0
	 */
	use_truck_route?: boolean;
}
export interface ValhallaCostingOptions {
	auto?: AutomobileCostingOptions & OtherCostingOptions;
	bicycle?: BicycleCostingOptions;
	bus?: AutomobileCostingOptions & OtherCostingOptions;
	bikeshare?: BikeshareCostingOptions;
	truck?: AutomobileCostingOptions & OtherCostingOptions & TruckCostingOptions;
	taxi?: OtherCostingOptions;
	motor_scooter?: MotorScooterCostingOptions;
	multimodal?: MultimodalCostingOptions;
	pedestrian?: PedestrianCostingOptions;
}
