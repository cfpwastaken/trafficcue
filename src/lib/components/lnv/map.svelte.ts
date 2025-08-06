import { routing } from "$lib/services/navigation/routing.svelte";
import { view } from "./view.svelte";

// export const geolocate = $state({
// 	currentLocation: null as WorldLocation | null,
// })

export const map = $state({
	value: undefined as maplibregl.Map | undefined,
	zoom: 0,
	updateMapPadding: () => {
		if (document.querySelector<HTMLDivElement>("#sidebar") == null) {
			map._setPadding({
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			});
			return;
		}
		console.log("Updating map padding");
		if (window.innerWidth < 768 || routing.currentTrip) {
			const calculatedSidebarHeight = document
				.querySelector<HTMLDivElement>("#sidebar")!
				.getBoundingClientRect().height;
			map._setPadding({
				top: routing.currentTrip ? 64 : 0,
				right: 0,
				bottom: calculatedSidebarHeight,
				left: 0,
			});
			return;
		}
		const calculatedSidebarWidth = document
			.querySelector<HTMLDivElement>("#sidebar")!
			.getBoundingClientRect().width;
		map._setPadding({
			top: 0,
			right: 0,
			bottom: 0,
			left: calculatedSidebarWidth,
		});
	},
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	_setPadding: (_padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	}) => {
		map.padding = _padding;
		if (map.value) {
			map.value.setPadding(map.padding);
		}
	},
});

export const pin = $state({
	isDropped: false,
	lat: 0,
	lng: 0,
	dropPin: (lat: number, lng: number) => {
		pin.isDropped = true;
		pin.lat = lat;
		pin.lng = lng;
	},
	liftPin: () => {
		pin.isDropped = false;
		pin.lat = 0;
		pin.lng = 0;
	},
	showInfo: async () => {
		if (!pin.isDropped) return;
		// const res = await reverseGeocode({ lat: pin.lat, lon: pin.lng });
		// if(res.length > 0) {
		// const feature = res[0];
		// view.switch("info", { feature });
		// }
		view.switch("info", { lat: pin.lat, lng: pin.lng });
	},
});
